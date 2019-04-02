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
import base64
import datetime
import hashlib
import json
import logging
import os
import time

import jinja2
from google.appengine.api import users, urlfetch
from google.appengine.api.search import search
from google.appengine.ext import deferred, ndb
from google.appengine.ext.deferred.deferred import PermanentTaskFailure

import intercom
from framework.bizz.job import run_job, MODE_BATCH
from framework.i18n_utils import DEFAULT_LANGUAGE, translate
from framework.plugin_loader import get_config
from framework.utils import try_or_defer
from framework.utils.jinja_extensions import TranslateExtension
from mcfw.consts import MISSING, DEBUG
from mcfw.exceptions import HttpNotFoundException, HttpBadRequestException
from mcfw.rpc import returns, arguments
from onfido import Applicant
from plugins.intercom_support.rogerthat_callbacks import start_or_get_chat
from plugins.its_you_online_auth.bizz.profile import search_profiles
from plugins.rogerthat_api.api import messaging
from plugins.rogerthat_api.exceptions import BusinessException
from plugins.rogerthat_api.to import UserDetailsTO, MemberTO
from plugins.rogerthat_api.to.messaging import AnswerTO, Message
from plugins.rogerthat_api.to.system import RoleTO
from plugins.tff_backend.bizz import get_tf_token_api_key, get_mazraa_api_key
from plugins.tff_backend.bizz.intercom_helpers import upsert_intercom_user, tag_intercom_users, IntercomTags, \
    get_intercom_plugin
from plugins.tff_backend.bizz.iyo.utils import get_username
from plugins.tff_backend.bizz.kyc.onfido_bizz import create_check, update_applicant, deserialize, list_checks, serialize
from plugins.tff_backend.bizz.messages import send_message_and_email
from plugins.tff_backend.bizz.rogerthat import create_error_message, send_rogerthat_message, put_user_data
from plugins.tff_backend.bizz.service import get_main_branding_hash
from plugins.tff_backend.consts.kyc import kyc_steps, DEFAULT_KYC_STEPS, REQUIRED_DOCUMENT_TYPES
from plugins.tff_backend.models.user import ProfilePointer, TffProfile, KYCInformation, KYCStatus, TffProfileInfo
from plugins.tff_backend.plugin_consts import NAMESPACE, KYC_FLOW_PART_1, KYC_FLOW_PART_1_TAG, \
    BUY_TOKENS_TAG
from plugins.tff_backend.to.user import SetKYCPayloadTO
from plugins.tff_backend.utils import convert_to_str
from plugins.tff_backend.utils.app import create_app_user_by_email, get_app_user_tuple
from plugins.tff_backend.utils.search import sanitise_search_query, remove_all_from_index
from transliterate import slugify

FLOWS_JINJA_ENVIRONMENT = jinja2.Environment(
    trim_blocks=True,
    extensions=['jinja2.ext.autoescape', TranslateExtension],
    autoescape=True,
    loader=jinja2.FileSystemLoader([os.path.join(os.path.dirname(__file__), 'flows')]))

TFF_PROFILE_INDEX = search.Index('tff_profile', namespace=NAMESPACE)


def create_tff_profile(user_details):
    # type: (UserDetailsTO) -> TffProfile
    # Try TffProfile
    user_email = user_details.email
    profile = TffProfile.list_by_email(user_email).get()
    if profile:
        logging.debug('TffProfile for email %s already exists (%s)', user_email, profile.username)
        return upsert_tff_profile(profile.username, user_details)
    # Try searching old (itsyou.online based) profiles
    profiles, cursor, more = search_profiles(sanitise_search_query('', {'validatedemailaddresses': user_email}))
    if profiles:
        logging.debug('Creating TffProfile from old itsyou.online profile')
        return upsert_tff_profile(profiles[0].username, user_details)
    # Try intercom
    intercom_plugin = get_intercom_plugin()
    if intercom_plugin:
        try:
            user = intercom_plugin.get_user(email=user_email)
            if user.user_id:
                logging.debug('Creating TffProfile based on intercom account %s (%s)', user_email, user.user_id)
                return upsert_tff_profile(user.user_id, user_details)
        except intercom.ResourceNotFound:
            pass
    # Didn't find an old user. Use email as username.
    logging.debug('Creating new TffProfile with email as username %s', user_email)
    return upsert_tff_profile(user_email, user_details)


@ndb.transactional()
def update_tff_profile(username, user_details):
    # type: (unicode, UserDetailsTO) -> TffProfile
    profile = get_tff_profile(username)
    profile.info = TffProfileInfo(name=user_details.name,
                                  language=user_details.language,
                                  avatar_url=user_details.avatar_url)
    profile.put()
    index_tff_profile(profile)
    return profile


def populate_intercom_user(profile):
    """
    Creates or updates an intercom user with information from TffProfile (from UserDetails)
    """
    intercom_plugin = get_intercom_plugin()
    if not intercom_plugin:
        return
    intercom_user = upsert_intercom_user(profile.username, profile)
    tag_intercom_users(IntercomTags.APP_REGISTER, [profile.username])
    return
    message = """Welcome to the ThreeFold Foundation app.
If you have questions you can get in touch with us through this chat.
Our team is at your service during these hours:

Sunday: 07:00 - 15:00 GMT +1
Monday - Friday: 09:00 - 17:00 GMT +1

Of course you can always ask your questions outside these hours, we will then get back to you the next business day."""
    email, app_id = get_app_user_tuple(profile.app_user)
    chat_id = start_or_get_chat(get_tf_token_api_key(), '+default+', email.email(), app_id,
                                intercom_user, message)
    try_or_defer(store_chat_id_in_user_data, chat_id, email.email(), app_id)


@arguments(rogerthat_chat_id=unicode, email=unicode, app_id=unicode)
def store_chat_id_in_user_data(rogerthat_chat_id, email, app_id):
    user_data = {
        'support_chat_id': rogerthat_chat_id
    }
    put_user_data(get_tf_token_api_key(), email, app_id, user_data)


@returns(unicode)
@arguments(username=unicode)
def user_code(username):
    digester = hashlib.sha256()
    digester.update(convert_to_str(username))
    key = digester.hexdigest()
    return unicode(key[:5])


def store_referral_in_user_data(profile_key):
    profile = profile_key.get()
    user_data = {
        'has_referrer': profile.referrer_user is not None
    }
    email, app_id = get_app_user_tuple(profile.app_user)
    put_user_data(get_tf_token_api_key(), email.email(), app_id, user_data)


def notify_new_referral(my_username, app_user):
    # username is username from user who used referral code of app_user
    profile = get_tff_profile(my_username)

    subject = u'%s just used your invitation code' % profile.info.name
    message = u'Hi!\n' \
              u'Good news, %s has used your invitation code.' % profile.info.name

    send_message_and_email(app_user, message, subject, get_tf_token_api_key())


@returns([(int, long)])
@arguments(user_detail=UserDetailsTO, roles=[RoleTO])
def is_user_in_roles(user_detail, roles):
    return []


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


@ndb.transactional(xg=True)
def upsert_tff_profile(username, user_details):
    # type: (unicode, UserDetailsTO) -> TffProfile
    key = TffProfile.create_key(username)
    profile = key.get()
    to_put = []
    if not profile:
        profile = TffProfile(key=key,
                             kyc=KYCInformation(status=KYCStatus.UNVERIFIED.value,
                                                updates=[],
                                                applicant_id=None))
        pp_key = ProfilePointer.create_key(username)
        profile_pointer = pp_key.get()
        if profile_pointer:
            raise Exception('Failed to save invitation code of user %s, we have a duplicate. %s' % (username,
                                                                                                    user_details))
        profile_pointer = ProfilePointer(key=pp_key, username=username)
        to_put.append(profile_pointer)
        user_data = {
            'invitation_code': profile_pointer.user_code
        }
        deferred.defer(put_user_data, get_tf_token_api_key(), user_details.email, user_details.app_id, user_data,
                       _transactional=True)
    profile.app_user = create_app_user_by_email(user_details.email, user_details.app_id)
    profile.info = TffProfileInfo(name=user_details.name,
                                  language=user_details.language,
                                  avatar_url=user_details.avatar_url)
    if 'itsyou.online' not in user_details.email:
        profile.info.email = user_details.email
    to_put.append(profile)
    ndb.put_multi(to_put)
    index_tff_profile(profile)
    return profile


def can_change_kyc_status(current_status, new_status):
    if DEBUG:
        return True
    statuses = {
        KYCStatus.DENIED: [],
        KYCStatus.UNVERIFIED: [KYCStatus.PENDING_SUBMIT],
        KYCStatus.PENDING_SUBMIT: [KYCStatus.PENDING_SUBMIT],
        KYCStatus.SUBMITTED: [KYCStatus.PENDING_APPROVAL],
        # KYCStatus.SUBMITTED: [KYCStatus.INFO_SET],
        # KYCStatus.INFO_SET: [KYCStatus.PENDING_APPROVAL],
        KYCStatus.PENDING_APPROVAL: [KYCStatus.VERIFIED, KYCStatus.DENIED, KYCStatus.PENDING_SUBMIT],
        KYCStatus.VERIFIED: [KYCStatus.PENDING_SUBMIT],
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
        deferred.defer(send_kyc_flow, profile.app_user, payload.comment, _countdown=5)  # after user_data update
    if payload.status == KYCStatus.INFO_SET:
        update_applicant(profile.kyc.applicant_id, deserialize(payload.data, Applicant))
    elif payload.status == KYCStatus.PENDING_APPROVAL:
        deferred.defer(_create_check, profile.kyc.applicant_id)
    elif payload.status == KYCStatus.VERIFIED:
        deferred.defer(_send_kyc_approved_message, profile.key)
    profile.put()
    deferred.defer(store_kyc_in_user_data, profile.app_user, _countdown=2)
    deferred.defer(index_tff_profile, TffProfile.create_key(username), _countdown=2)
    return profile


@ndb.transactional()
def set_utility_bill_verified(username):
    # type: (unicode) -> TffProfile
    from plugins.tff_backend.bizz.investor import send_signed_investments_messages, send_hoster_reminder
    profile = get_tff_profile(username)
    profile.kyc.utility_bill_verified = True
    profile.put()
    deferred.defer(send_signed_investments_messages, profile.app_user, _transactional=True)
    deferred.defer(send_hoster_reminder, profile.username, _countdown=1, _transactional=True)
    return profile


def _create_check(applicant_id):
    # This can take a bit of time
    urlfetch.set_default_fetch_deadline(300)
    try:
        create_check(applicant_id)
    except Exception as e:
        logging.exception(e.message)
        raise PermanentTaskFailure(e)


def send_kyc_flow(app_user, message=None):
    email, app_id = get_app_user_tuple(app_user)
    member = MemberTO(member=email.email(), app_id=app_id, alert_flags=0)
    push_message = u'KYC procedure has been initiated'  # for iOS only
    messaging.start_local_flow(get_tf_token_api_key(), None, [member], tag=KYC_FLOW_PART_1_TAG, flow=KYC_FLOW_PART_1,
                               push_message=push_message, flow_params=json.dumps({'message': message}))


def generate_kyc_flow(nationality, country, iyo_username):
    logging.info('Generating KYC flow for user %s and country %s', iyo_username, nationality)
    flow_params = {'nationality': nationality, 'country': country}
    properties = DEFAULT_KYC_STEPS.union(_get_extra_properties(country))
    try:
        known_information = _get_known_information(iyo_username)
        known_information['address_country'] = country
    except HttpNotFoundException:
        logging.error('No profile found for user %s!', iyo_username)
        return create_error_message()

    steps = []
    branding_key = get_main_branding_hash()
    must_ask_passport = 'passport' not in REQUIRED_DOCUMENT_TYPES[country]
    must_ask_passport = False
    for prop in properties:
        step_info = _get_step_info(prop)
        if not step_info:
            raise BusinessException('Unsupported step type: %s' % prop)
        value = known_information.get(prop)
        reference = 'message_%s' % prop
        # If yes, go to passport step. If no, go to national identity step
        if prop in ('national_identity_card', 'national_identity_card_front') and must_ask_passport:
            steps.append({
                'reference': 'message_has_passport',
                'message': """Are you in the possession of a valid passport?

Note: If you do not have a passport (and only a national id), you will only be able to wire the funds to our UAE Mashreq bank account.""",
                'type': None,
                'order': step_info['order'] - 0.5,
                'answers': [{
                    'id': 'yes',
                    'caption': 'Yes',
                    'reference': 'message_passport'
                }, {
                    'id': 'no',
                    'caption': 'No',
                    'reference': 'message_national_identity_card' if 'national_identity_card' in properties else 'message_national_identity_card_front'
                }]
            })
        steps.append({
            'reference': reference,
            'positive_reference': None,
            'positive_caption': step_info.get('positive_caption', 'Continue'),
            'negative_reference': 'flush_monitoring_end_canceled',
            'negative_caption': step_info.get('negative_caption', 'Cancel'),
            'keyboard_type': step_info.get('keyboard_type', 'DEFAULT'),
            'type': step_info.get('widget', 'TextLineWidget'),
            'value': value or step_info.get('value') or '',
            'choices': step_info.get('choices', []),
            'message': step_info['message'],
            'branding_key': branding_key,
            'order': step_info['order'],
            'max_chars': step_info.get('max_chars', 100)
        })
    sorted_steps = sorted(steps, key=lambda k: k['order'])
    has_passport_step = False
    for i, step in enumerate(sorted_steps):
        if len(sorted_steps) > i + 1:
            if 'positive_reference' in step:
                if step['reference'] == 'message_passport':
                    sorted_steps[i - 1]['positive_reference'] = 'flowcode_check_skip_passport'
                    has_passport_step = True
                step['positive_reference'] = sorted_steps[i + 1]['reference']
        else:
            step['positive_reference'] = 'flush_results'
    template_params = {
        'start_reference': sorted_steps[0]['reference'],
        'steps': sorted_steps,
        'language': DEFAULT_LANGUAGE,
        'branding_key': branding_key,
        'has_passport_step': has_passport_step
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
    profile = get_tff_profile(username)
    first_name, last_name = profile.info.name.split(' ', 1)
    known_information = {
        'first_name': first_name,
        'last_name': last_name,
        'email': profile.info.email,
        'telephone': None,
        'address_building_number': None,
        'address_street': None,
        'address_town': None,
        'address_postcode': None,
        'dob': long(time.mktime(date_of_birth.timetuple())),
    }
    return known_information


def get_kyc_user_data(profile):
    # type: (TffProfile) -> dict
    return {
        'kyc': {
            'status': profile.kyc.status,
            'verified': profile.kyc.status == KYCStatus.VERIFIED,
            'has_utility_bill': profile.kyc.utility_bill_url is not None
        }
    }


@arguments(app_user=users.User)
def store_kyc_in_user_data(app_user):
    username = get_username(app_user)
    profile = get_tff_profile(username)
    email, app_id = get_app_user_tuple(app_user)
    return put_user_data(get_mazraa_api_key(), email.email(), app_id, get_kyc_user_data(profile))


@returns([dict])
@arguments(username=unicode)
def list_kyc_checks(username):
    profile = get_tff_profile(username)
    if not profile.kyc.applicant_id:
        return []
    return serialize(list_checks(profile.kyc.applicant_id))


def _send_kyc_approved_message(profile_key):
    profile = profile_key.get()  # type: TffProfile
    email, app_id = get_app_user_tuple(profile.app_user)
    message = translate(DEFAULT_LANGUAGE, 'tff', 'you_have_been_kyc_approved')
    answers = [AnswerTO(type=u'button',
                        action='smi://%s' % BUY_TOKENS_TAG,
                        id=u'purchase',
                        caption=translate(DEFAULT_LANGUAGE, 'tff', 'purchase_itokens'),
                        ui_flags=0,
                        color=None),
               AnswerTO(type=u'button',
                        action=None,
                        id=u'close',
                        caption=translate(DEFAULT_LANGUAGE, 'tff', 'close'),
                        ui_flags=0,
                        color=None)]
    send_rogerthat_message(MemberTO(member=email.email(), app_id=app_id, alert_flags=Message.ALERT_FLAG_VIBRATE),
                           message, answers, 0, get_tf_token_api_key())


def index_tff_profile(profile_or_key):
    # type: (ndb.Key) -> list[search.PutResult]
    profile = profile_or_key.get() if isinstance(profile_or_key, ndb.Key) else profile_or_key
    document = create_tff_profile_document(profile)
    return TFF_PROFILE_INDEX.put(document)


def index_all_profiles():
    remove_all_from_index(TFF_PROFILE_INDEX)
    run_job(_get_all_profiles, [], multi_index_tff_profile, [], mode=MODE_BATCH, batch_size=200)


def multi_index_tff_profile(tff_profile_keys):
    # type: (list[ndb.Key]) -> object
    logging.info('Indexing %s TffProfiles', len(tff_profile_keys))
    profiles = ndb.get_multi(tff_profile_keys)
    good_profiles = []
    for profile in profiles:
        if profile.info:
            good_profiles.append(profile)
        else:
            logging.info('Profile has no info: %s', profile)
    return TFF_PROFILE_INDEX.put([create_tff_profile_document(profile) for profile in good_profiles])


def _get_all_profiles():
    return TffProfile.query()


def _encode_doc_id(profile):
    # type: (TffProfile) -> unicode
    # doc id must be ascii, base64 encode it
    return base64.b64encode(profile.username.encode('utf-8'))


def _decode_doc_id(doc_id):
    # type: (unicode) -> unicode
    return base64.b64decode(doc_id)


def _add_slug_fields(key, value):
    if not value:
        return []
    value = value.lower().strip()
    return [
        search.TextField(name=key, value=value),
        search.TextField(name='%s_slug' % key, value=slugify(value) or value)
    ]


def create_tff_profile_document(profile):
    # type: (TffProfile) -> search.Document
    fields = [search.AtomField(name='username', value=profile.username),
              search.TextField(name='email', value=profile.info.email),
              search.NumberField('kyc_status', profile.kyc.status if profile.kyc else KYCStatus.UNVERIFIED.value),
              search.TextField('app_email', profile.app_user.email().lower())]
    fields.extend(_add_slug_fields('name', profile.info.name))
    return search.Document(_encode_doc_id(profile), fields)


def search_tff_profiles(query='', page_size=20, cursor=None):
    # type: (unicode, int, unicode) -> tuple[list[TffProfile], search.Cursor, bool]
    sort_expressions = [search.SortExpression(expression='name_slug', direction=search.SortExpression.ASCENDING),
                        search.SortExpression(expression='username', direction=search.SortExpression.ASCENDING)]
    options = search.QueryOptions(limit=page_size,
                                  cursor=search.Cursor(cursor),
                                  sort_options=search.SortOptions(expressions=sort_expressions),
                                  ids_only=True)
    search_results = TFF_PROFILE_INDEX.search(search.Query(query, options=options))  # type: search.SearchResults
    results = search_results.results  # type: list[search.ScoredDocument]
    keys = [TffProfile.create_key(_decode_doc_id(result.doc_id)) for result in results]
    profiles = ndb.get_multi(keys) if keys else []
    return profiles, search_results.cursor, search_results.cursor is not None
