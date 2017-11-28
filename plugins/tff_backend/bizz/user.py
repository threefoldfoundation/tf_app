# -*- coding: utf-8 -*-
# Copyright 2017 GIG Technology NV
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# @@license_version:1.3@@

import datetime
import hashlib
import json
import logging
import os
import time

import jinja2
from google.appengine.api import users
from google.appengine.ext import deferred, ndb
from google.appengine.ext.deferred.deferred import PermanentTaskFailure

from framework.bizz.session import create_session
from framework.i18n_utils import DEFAULT_LANGUAGE
from framework.models.session import Session
from framework.plugin_loader import get_config, get_plugin
from framework.utils.jinja_extensions import TranslateExtension
from mcfw.consts import MISSING
from mcfw.exceptions import HttpNotFoundException, HttpBadRequestException
from mcfw.rpc import returns, arguments
from onfido import Applicant
from plugins.intercom_support.intercom_support_plugin import IntercomSupportPlugin
from plugins.intercom_support.rogerthat_callbacks import start_or_get_chat
from plugins.its_you_online_auth.bizz.authentication import create_jwt, decode_jwt_cached, get_itsyouonline_client, \
    has_access_to_organization
from plugins.its_you_online_auth.bizz.profile import get_profile, index_profile
from plugins.its_you_online_auth.models import Profile
from plugins.its_you_online_auth.plugin_consts import NAMESPACE as IYO_AUTH_NAMESPACE
from plugins.rogerthat_api.api import system, messaging
from plugins.rogerthat_api.exceptions import BusinessException
from plugins.rogerthat_api.to import UserDetailsTO, MemberTO
from plugins.rogerthat_api.to.friends import REGISTRATION_ORIGIN_QR, REGISTRATION_ORIGIN_OAUTH
from plugins.rogerthat_api.to.messaging.service_callback_results import FlowMemberResultCallbackResultTO
from plugins.rogerthat_api.to.system import RoleTO
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.bizz.authentication import Organization, Roles
from plugins.tff_backend.bizz.intercom_helpers import upsert_intercom_user, tag_intercom_users, IntercomTags
from plugins.tff_backend.bizz.iyo.keystore import create_keystore_key, get_keystore
from plugins.tff_backend.bizz.iyo.user import get_user, invite_user_to_organization
from plugins.tff_backend.bizz.iyo.utils import get_iyo_organization_id, get_iyo_username
from plugins.tff_backend.bizz.kyc.onfido_bizz import create_check, update_applicant, deserialize, list_checks, serialize
from plugins.tff_backend.bizz.rogerthat import create_error_message
from plugins.tff_backend.bizz.service import add_user_to_role, get_main_branding_hash
from plugins.tff_backend.consts.kyc import kyc_steps, DEFAULT_KYC_STEPS, REQUIRED_DOCUMENT_TYPES
from plugins.tff_backend.models.hoster import PublicKeyMapping
from plugins.tff_backend.models.user import ProfilePointer, TffProfile, KYCInformation, KYCStatus
from plugins.tff_backend.plugin_consts import NAMESPACE, KEY_NAME, KEY_ALGORITHM, KYC_FLOW_PART_1, KYC_FLOW_PART_1_TAG
from plugins.tff_backend.to.iyo.keystore import IYOKeyStoreKey, IYOKeyStoreKeyData
from plugins.tff_backend.to.user import SetKYCPayloadTO
from plugins.tff_backend.utils.app import create_app_user_by_email, get_app_user_tuple

FLOWS_JINJA_ENVIRONMENT = jinja2.Environment(
    trim_blocks=True,
    extensions=['jinja2.ext.autoescape', TranslateExtension],
    autoescape=True,
    loader=jinja2.FileSystemLoader([os.path.join(os.path.dirname(__file__), 'flows')]))


def convert_to_str(v):
    if v is None:
        return None
    if isinstance(v, unicode):
        return v.encode('utf-8')
    return v


@returns()
@arguments(user_detail=UserDetailsTO, origin=unicode, data=unicode)
def user_registered(user_detail, origin, data):
    logging.info('User %s:%s registered', user_detail.email, user_detail.app_id)
    data = json.loads(data)

    required_scopes = get_config(IYO_AUTH_NAMESPACE).required_scopes.split(',')
    if origin == REGISTRATION_ORIGIN_QR:
        qr_type = data.get('qr_type', None)
        qr_content = data.get('qr_content', None)

        if not qr_type or not qr_content:
            logging.warn('No qr_type/qr_content in %s', data)
            return

        if qr_type != 'jwt':
            logging.warn('Unsupported qr_type %s', qr_type)
            return

        jwt = qr_content
        decoded_jwt = decode_jwt_cached(jwt)
        username = decoded_jwt.get('username', None)
        if not username:
            logging.warn('Could not find username in jwt.')
            return

        missing_scopes = [s for s in required_scopes if s and s not in decoded_jwt['scope']]
        if missing_scopes:
            logging.warn('Access token is missing required scopes %s', missing_scopes)

    elif origin == REGISTRATION_ORIGIN_OAUTH:
        access_token_data = data.get('result', {})
        access_token = access_token_data.get('access_token')
        username = access_token_data.get('info', {}).get('username')

        if not access_token or not username:
            logging.warn('No access_token/username in %s', data)
            return

        scopes = [s for s in access_token_data.get('scope', '').split(',') if s]
        missing_scopes = [s for s in required_scopes if s and s not in scopes]
        if missing_scopes:
            logging.warn('Access token is missing required scopes %s', missing_scopes)
        scopes.append('offline_access')
        logging.debug('Creating JWT with scopes %s', scopes)
        jwt = create_jwt(access_token, scope=','.join(scopes))
        decoded_jwt = decode_jwt_cached(jwt)

    else:
        return

    logging.debug('Decoded JWT: %s', decoded_jwt)
    scopes = decoded_jwt['scope']
    # Creation session such that the JWT is automatically up to date
    _, session = create_session(username, scopes, jwt, secret=username)

    deferred.defer(invite_user_to_organization, username, Organization.PUBLIC)
    deferred.defer(add_user_to_public_role, user_detail)
    deferred.defer(populate_intercom_user, session.key, user_detail)


def populate_intercom_user(session_key, user_detail=None):
    """
    Creates or updates an intercom user with information from itsyou.online
    Args:
        session_key (ndb.Key): key of the Session for this user
        user_detail (UserDetailsTO): key of the Session for this user
    """
    intercom_plugin = get_plugin('intercom_support')
    if intercom_plugin:
        session = session_key.get()
        if not session:
            return
        assert isinstance(session, Session)
        assert isinstance(intercom_plugin, IntercomSupportPlugin)
        data = get_user(session.user_id, session.jwt)
        intercom_user = upsert_intercom_user(data.username, data)
        tag_intercom_users(IntercomTags.APP_REGISTER, [data.username])
        if user_detail:
            message = """Welcome to the ThreeFold Foundation app.
If you have questions you can get in touch with us through this chat.
Our team is at your service during these hours:

Sunday: 07:00 - 15:00 GMT +1
Monday - Friday: 09:00 - 17:00 GMT +1

Of course you can always ask your questions outside these hours, we will then get back to you the next business day."""
            chat_id = start_or_get_chat(get_config(NAMESPACE).rogerthat.api_key, '+default+', user_detail.email,
                                        user_detail.app_id, intercom_user, message)
            deferred.defer(store_chat_id_in_user_data, chat_id, user_detail)


@arguments(rogerthat_chat_id=unicode, user_detail=UserDetailsTO)
def store_chat_id_in_user_data(rogerthat_chat_id, user_detail):
    user_data = {
        'support_chat_id': rogerthat_chat_id
    }

    api_key = get_rogerthat_api_key()
    system.put_user_data(api_key, user_detail.email, user_detail.app_id, user_data)


@returns(unicode)
@arguments(username=unicode)
def user_code(username):
    digester = hashlib.sha256()
    digester.update(convert_to_str(username))
    key = digester.hexdigest()
    return unicode(key[:5])


@returns()
@arguments(username=unicode, user_detail=UserDetailsTO)
def store_info_in_userdata(username, user_detail):
    deferred.defer(store_invitation_code_in_userdata, username, user_detail)
    deferred.defer(store_iyo_info_in_userdata, username, user_detail)


@returns()
@arguments(username=unicode, user_detail=UserDetailsTO)
def store_invitation_code_in_userdata(username, user_detail):
    def trans():
        profile_key = TffProfile.create_key(username)
        profile = profile_key.get()
        if not profile:
            profile = TffProfile(key=profile_key,
                                 app_user=create_app_user_by_email(user_detail.email, user_detail.app_id))

            pp_key = ProfilePointer.create_key(username)
            pp = pp_key.get()
            if pp:
                logging.error("Failed to save invitation code of user '%s', we have a duplicate", user_detail.email)
                deferred.defer(store_invitation_code_in_userdata, username,
                               user_detail, _countdown=10 * 60, _transactional=True)
                return False

            profile.put()

            pp = ProfilePointer(key=pp_key, username=username)
            pp.put()

        return True

    if not ndb.transaction(trans, xg=True):
        return

    user_data = {
        'invitation_code': user_code(username)
    }

    api_key = get_rogerthat_api_key()
    system.put_user_data(api_key, user_detail.email, user_detail.app_id, user_data)


@returns()
@arguments(username=unicode, user_detail=UserDetailsTO)
def store_iyo_info_in_userdata(username, user_detail):
    logging.info('Getting the user\'s info from IYO')
    iyo_user = get_user(username)

    api_key = get_rogerthat_api_key()
    user_data_keys = ['name', 'email', 'phone', 'address']
    current_user_data = system.get_user_data(api_key, user_detail.email, user_detail.app_id, user_data_keys)

    user_data = dict()
    if not current_user_data.get('name') and iyo_user.firstname and iyo_user.lastname:
        user_data['name'] = '%s %s' % (iyo_user.firstname, iyo_user.lastname)

    if not current_user_data.get('email') and iyo_user.validatedemailaddresses:
        user_data['email'] = iyo_user.validatedemailaddresses[0].emailaddress

    if not current_user_data.get('phone') and iyo_user.validatedphonenumbers:
        user_data['phone'] = iyo_user.validatedphonenumbers[0].phonenumber

    if not current_user_data.get('address') and iyo_user.addresses:
        user_data['address'] = '%s %s' % (iyo_user.addresses[0].street, iyo_user.addresses[0].nr)
        user_data['address'] += '\n%s %s' % (iyo_user.addresses[0].postalcode, iyo_user.addresses[0].city)
        user_data['address'] += '\n%s' % iyo_user.addresses[0].country
        if iyo_user.addresses[0].other:
            user_data['address'] += '\n\n%s' % iyo_user.addresses[0].other

    if user_data:
        system.put_user_data(api_key, user_detail.email, user_detail.app_id, user_data)


@returns()
@arguments(user_detail=UserDetailsTO)
def store_public_key(user_detail):
    # type: (UserDetailsTO) -> None
    logging.info('Storing %s key in IYO for user %s:%s', KEY_NAME, user_detail.email, user_detail.app_id)

    for rt_key in user_detail.public_keys:
        if rt_key.name == KEY_NAME and rt_key.algorithm == KEY_ALGORITHM:
            break
    else:
        raise PermanentTaskFailure('No key with name "%s" and algorithm "%s" in %s'
                                   % (KEY_NAME, KEY_ALGORITHM, repr(user_detail)))

    username = get_iyo_username(user_detail)
    keys = get_keystore(username)
    if any(True for iyo_key in keys if iyo_key.key == rt_key.public_key):
        logging.info('No new key to store starting with name "%s" and algorithm "%s" in %s',
                     KEY_NAME, KEY_ALGORITHM, repr(user_detail))
        return

    used_labels = [key.label for key in keys]
    label = KEY_NAME
    suffix = 2
    while label in used_labels:
        label = u'%s %d' % (KEY_NAME, suffix)
        suffix += 1
    organization_id = get_iyo_organization_id()
    key = IYOKeyStoreKey(key=rt_key.public_key, username=username, globalid=organization_id, label=label)
    key.keydata = IYOKeyStoreKeyData(comment=u'ThreeFold app', algorithm=rt_key.algorithm)
    key.keydata.timestamp = MISSING  # Must be missing, else we get bad request since it can't be null
    result = create_keystore_key(username, key)
    # We cache the public key - label mapping here so we don't have to go to itsyou.online every time
    mapping_key = PublicKeyMapping.create_key(result.key, user_detail.email)
    mapping = PublicKeyMapping(key=mapping_key)
    mapping.label = result.label
    mapping.put()


@returns([(int, long)])
@arguments(user_detail=UserDetailsTO, roles=[RoleTO])
def is_user_in_roles(user_detail, roles):
    client = get_itsyouonline_client()
    username = get_iyo_username(user_detail)
    result = []
    for role in roles:
        organization_id = Organization.get_by_role_name(role.name)
        if not organization_id:
            continue
        if has_access_to_organization(client, organization_id, username):
            result.append(role.id)
    return result


@returns()
@arguments(user_detail=UserDetailsTO)
def add_user_to_public_role(user_detail):
    client = get_itsyouonline_client()
    username = get_iyo_username(user_detail)
    organization_id = Organization.get_by_role_name(Roles.MEMBERS)
    if has_access_to_organization(client, organization_id, username):
        logging.info('User is already in members role, not adding to public role')
    else:
        add_user_to_role(user_detail, Roles.PUBLIC)


def get_tff_profile(username):
    # type: (unicode) -> TffProfile
    profile = TffProfile.create_key(username).get()
    if not profile:
        raise HttpNotFoundException('tff_profile_not_found', {'username': username})
    if not profile.kyc:
        profile.kyc = KYCInformation(status=KYCStatus.UNVERIFIED.value,
                                     updates=[],
                                     applicant_id=None)
    return profile


def can_change_kyc_status(current_status, new_status):
    statuses = {
        KYCStatus.DENIED: [],
        KYCStatus.UNVERIFIED: [KYCStatus.PENDING_SUBMIT],
        KYCStatus.PENDING_SUBMIT: [KYCStatus.PENDING_SUBMIT],
        KYCStatus.SUBMITTED: [KYCStatus.PENDING_APPROVAL],
        # KYCStatus.SUBMITTED: [KYCStatus.INFO_SET],
        # KYCStatus.INFO_SET: [KYCStatus.PENDING_APPROVAL],
        KYCStatus.PENDING_APPROVAL: [KYCStatus.VERIFIED, KYCStatus.DENIED, KYCStatus.PENDING_SUBMIT],
        KYCStatus.VERIFIED: [],
    }
    return new_status in statuses.get(current_status)


@returns(TffProfile)
@arguments(username=unicode, payload=SetKYCPayloadTO, current_user_id=unicode)
def set_kyc_status(username, payload, current_user_id):
    # type: (unicode, SetKYCPayloadTO, unicode) -> TffProfile
    logging.debug('Updating KYC status to %s', KYCStatus(payload.status))
    profile = get_tff_profile(username)
    if not can_change_kyc_status(profile.kyc.status, payload.status):
        raise HttpBadRequestException('invalid_status')
    comment = payload.comment if payload.comment is not MISSING else None
    profile.kyc.set_status(payload.status, current_user_id, comment=comment)
    if payload.status == KYCStatus.PENDING_SUBMIT:
        deferred.defer(send_kyc_flow, profile.app_user)
    if payload.status == KYCStatus.INFO_SET:
        update_applicant(profile.kyc.applicant_id, deserialize(payload.data, Applicant))
    elif payload.status == KYCStatus.PENDING_APPROVAL:
        check_result = create_check(profile.kyc.applicant_id)
        logging.info('Check result from Onfido: %s', check_result)
    deferred.defer(store_kyc_in_user_data, profile.app_user)
    deferred.defer(index_profile, Profile.create_key(username))
    profile.put()
    return profile


def send_kyc_flow(app_user):
    # Flow with 1 step, only asks for nationality of the user
    email, app_id = get_app_user_tuple(app_user)
    member = MemberTO(member=email.email(), app_id=app_id, alert_flags=0)
    push_message = u'KYC procedure has been initiated'  # for iOS only
    messaging.start_local_flow(get_rogerthat_api_key(), None, [member], tag=KYC_FLOW_PART_1_TAG, flow=KYC_FLOW_PART_1,
                               push_message=push_message, flow_params=json.dumps({'vibrate': True}))


def generate_kyc_flow(country_code, iyo_username):
    logging.info('Generating KYC flow for user %s and country %s', iyo_username, country_code)
    flow_params = {'nationality': country_code}
    properties = DEFAULT_KYC_STEPS.union(_get_extra_properties(country_code))
    try:
        known_information = _get_known_information(iyo_username)
        known_information['address_country'] = country_code
    except HttpNotFoundException:
        logging.error('No profile found for user %s!', iyo_username)
        return create_error_message(FlowMemberResultCallbackResultTO())

    steps = []
    branding_key = get_main_branding_hash()
    for prop in properties:
        step_info = _get_step_info(prop)
        if not step_info:
            raise BusinessException('Unsupported step type: %s' % prop)
        value = known_information.get(prop)
        steps.append({
            'reference': 'message_%s' % prop,
            'positive_reference': None,
            'positive_caption': step_info.get('positive_caption', 'Continue'),
            'negative_reference': 'end_premature_end',
            'negative_caption': step_info.get('negative_caption', 'Cancel'),
            'keyboard_type': step_info.get('keyboard_type', 'DEFAULT'),
            'type': step_info.get('widget', 'TextLineWidget'),
            'value': value or step_info.get('value') or '',
            'choices': step_info.get('choices', []),
            'message': step_info['message'],
            'branding_key': branding_key,
            'order': step_info['order']
        })
    sorted_steps = sorted(steps, key=lambda k: k['order'])
    for i, step in enumerate(sorted_steps):
        if len(sorted_steps) > i + 1:
            step['positive_reference'] = sorted_steps[i + 1]['reference']
        else:
            step['positive_reference'] = 'flush_results'
    template_params = {
        'start_reference': sorted_steps[0]['reference'],
        'steps': sorted_steps,
        'language': DEFAULT_LANGUAGE
    }
    return FLOWS_JINJA_ENVIRONMENT.get_template('kyc_part_2.xml').render(template_params), flow_params


def _get_extra_properties(country_code):
    return REQUIRED_DOCUMENT_TYPES[country_code]


def _get_step_info(property):
    results = filter(lambda step: step['type'] == property, kyc_steps)
    return results[0] if results else None


def _get_known_information(username):
    date_of_birth = datetime.datetime.now()
    date_of_birth = date_of_birth.replace(year=date_of_birth.year - 18, hour=0, minute=0, second=0, microsecond=0)
    known_information = {
        'first_name': None,
        'last_name': None,
        'email': None,
        'telephone': None,
        'address_building_number': None,
        'address_street': None,
        'address_town': None,
        'address_postcode': None,
        'dob': long(time.mktime(date_of_birth.timetuple())),
    }
    profile = get_profile(username)
    if profile.info:
        if profile.info.firstname:
            known_information['first_name'] = profile.info.firstname
        if profile.info.lastname:
            known_information['last_name'] = profile.info.lastname
        if profile.info.validatedphonenumbers:
            known_information['telephone'] = profile.info.validatedphonenumbers[0].phonenumber
        elif profile.info.phonenumbers:
            known_information['telephone'] = profile.info.phonenumbers[0].phonenumber
        if profile.info.validatedemailaddresses:
            known_information['email'] = profile.info.validatedemailaddresses[0].emailaddress
        elif profile.info.emailaddresses:
            known_information['email'] = profile.info.emailaddresses[0].emailaddress
        if profile.info.addresses:
            known_information['address_street'] = profile.info.addresses[0].street
            known_information['address_building_number'] = profile.info.addresses[0].nr
            known_information['address_town'] = profile.info.addresses[0].city
            known_information['address_postcode'] = profile.info.addresses[0].postalcode
    return known_information


@arguments(app_user=users.User)
def store_kyc_in_user_data(app_user):
    username = get_iyo_username(app_user)
    profile = get_tff_profile(username)
    user_data = {
        'kyc': {
            'status': profile.kyc.status,
            'verified': profile.kyc.status == KYCStatus.VERIFIED
        }
    }
    email, app_id = get_app_user_tuple(app_user)
    api_key = get_rogerthat_api_key()
    return system.put_user_data(api_key, email.email(), app_id, user_data)


@returns([dict])
@arguments(username=unicode)
def list_kyc_checks(username):
    profile = get_tff_profile(username)
    if not profile.kyc.applicant_id:
        return []
    return serialize(list_checks(profile.kyc.applicant_id))
