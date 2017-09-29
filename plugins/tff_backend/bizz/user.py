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

import hashlib
import json
import logging

from google.appengine.ext import deferred, ndb
from google.appengine.ext.deferred.deferred import PermanentTaskFailure

from framework.bizz.session import create_session
from framework.plugin_loader import get_config, get_plugin
from mcfw.consts import MISSING
from mcfw.rpc import returns, arguments
from plugins.intercom_support.intercom_support_plugin import IntercomSupportPlugin
from plugins.its_you_online_auth.bizz.authentication import create_jwt, decode_jwt_cached, get_itsyouonline_client, \
    has_access_to_organization
from plugins.its_you_online_auth.libs.itsyouonline import Client
from plugins.its_you_online_auth.libs.itsyouonline.userview import userview
from plugins.its_you_online_auth.plugin_consts import NAMESPACE as IYO_AUTH_NAMESPACE
from plugins.rogerthat_api.api import system
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.rogerthat_api.to.friends import REGISTRATION_ORIGIN_QR, REGISTRATION_ORIGIN_OAUTH
from plugins.rogerthat_api.to.system import RoleTO
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.bizz.authentication import Organization, Roles
from plugins.tff_backend.bizz.iyo.keystore import create_keystore_key, get_keystore
from plugins.tff_backend.bizz.iyo.user import get_user, invite_user_to_organization
from plugins.tff_backend.bizz.iyo.utils import get_iyo_organization_id, get_iyo_username
from plugins.tff_backend.bizz.service import add_user_to_role
from plugins.tff_backend.models.hoster import PublicKeyMapping
from plugins.tff_backend.models.user import ProfilePointer, TffProfile
from plugins.tff_backend.plugin_consts import KEY_NAME, KEY_ALGORITHM
from plugins.tff_backend.to.iyo.keystore import IYOKeyStoreKey, IYOKeyStoreKeyData
from plugins.tff_backend.utils.app import create_app_user_by_email


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
    create_session(username, scopes, jwt, secret=username)

    deferred.defer(invite_user_to_organization, username, Organization.PUBLIC)
    deferred.defer(add_user_to_role, user_detail, Roles.PUBLIC)
    deferred.defer(popuplate_intercom_user, username, jwt)


def popuplate_intercom_user(username, jwt):
    """
    Creates or updates an intercom user with information from itsyou.online
    Args:
        username (unicode): itsyou.online username
        jwt (unicode): itsyou.online JWT
    """
    intercom_plugin = get_plugin('intercom_support')
    if intercom_plugin:
        assert isinstance(intercom_plugin, IntercomSupportPlugin)
        client = Client()
        client.oauth.session.headers['Authorization'] = 'bearer %s' % jwt
        data = client.api.users.GetUserInformation(username).json()
        # Fix IYO bug where organizations aren't being set
        if data.get('organizations') is None:
            data['organizations'] = []
        response_data = userview(data)
        name = None
        email = None
        phone = None
        if response_data.firstname and response_data.lastname:
            name = '%s %s' % (response_data.firstname, response_data.lastname)
        if response_data.validatedemailaddresses:
            email = response_data.validatedemailaddresses[0].emailaddress
        if response_data.validatedphonenumbers:
            phone = response_data.validatedphonenumbers[0].phonenumber
        intercom_plugin.create_user(username, name, email, phone)


@returns(unicode)
@arguments(username=unicode)
def user_code(username):
    digester = hashlib.sha256()
    digester.update(str(username))
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
        user_data['name'] = u'%s %s' % (iyo_user.firstname, iyo_user.lastname)

    if not current_user_data.get('email') and iyo_user.validatedemailaddresses:
        user_data['email'] = iyo_user.validatedemailaddresses[0].emailaddress

    if not current_user_data.get('phone') and iyo_user.validatedphonenumbers:
        user_data['phone'] = iyo_user.validatedphonenumbers[0].phonenumber

    if not current_user_data.get('address') and iyo_user.addresses:
        user_data['address'] = u'%s %s' % (iyo_user.addresses[0].street, iyo_user.addresses[0].nr)
        user_data['address'] += u'\n%s %s' % (iyo_user.addresses[0].postalcode, iyo_user.addresses[0].city)
        user_data['address'] += u'\n%s' % iyo_user.addresses[0].country
        if iyo_user.addresses[0].other:
            user_data['address'] += u'\n\n%s' % iyo_user.addresses[0].other

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
    key = IYOKeyStoreKey()
    key.key = rt_key.public_key
    key.globalid = organization_id
    key.username = username
    key.label = label
    key.keydata = IYOKeyStoreKeyData()
    key.keydata.timestamp = MISSING
    key.keydata.comment = u'ThreeFold app'
    key.keydata.algorithm = rt_key.algorithm
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
