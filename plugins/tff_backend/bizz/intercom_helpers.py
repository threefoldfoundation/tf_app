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
import logging
from types import NoneType

from enum import Enum
from framework.plugin_loader import get_plugin, get_config
from intercom import ResourceNotFound, BadRequestError
from intercom.tag import Tag
from intercom.user import User
from mcfw.rpc import arguments, returns
from plugins.intercom_support.intercom_support_plugin import IntercomSupportPlugin
from plugins.intercom_support.plugin_consts import NAMESPACE as INTERCOM_NAMESPACE
from plugins.its_you_online_auth.libs.itsyouonline.userview import userview
from plugins.tff_backend.bizz.iyo.user import get_user
from plugins.tff_backend.plugin_consts import NAMESPACE


class IntercomTags(Enum):
    HOSTER = 'Hoster'
    ITFT_PURCHASER = 'iTFT Purchaser'
    TFT_PURCHASER = 'TFT Purchaser'
    ITO_INVESTOR = 'ITO Investor'
    APP_REGISTER = 'appregister'
    BETTERTOKEN_CONTRACT = 'Bettertoken contract'
    GREENITGLOBE_CONTRACT = 'GreenITGlobe contract'


def get_intercom_plugin():
    intercom_plugin = get_plugin(INTERCOM_NAMESPACE)  # type: IntercomSupportPlugin
    if intercom_plugin:
        assert isinstance(intercom_plugin, IntercomSupportPlugin)
    return intercom_plugin


@returns(User)
@arguments(iyo_username=unicode, iyo_user_info=(userview, NoneType))
def upsert_intercom_user(iyo_username, iyo_user_info=None):
    # type: (unicode, userview) -> User
    intercom_plugin = get_intercom_plugin()

    def _upsert(iyo_username, iyo_user_info):
        # type: (unicode, userview) -> User
        name = None
        email = None
        phone = None
        if iyo_user_info.firstname and iyo_user_info.lastname:
            name = '%s %s' % (iyo_user_info.firstname, iyo_user_info.lastname)
        if iyo_user_info.validatedemailaddresses:
            email = iyo_user_info.validatedemailaddresses[0].emailaddress
        if iyo_user_info.validatedphonenumbers:
            phone = iyo_user_info.validatedphonenumbers[0].phonenumber
        return intercom_plugin.upsert_user(iyo_username, name, email, phone)

    if iyo_user_info:
        return _upsert(iyo_username, iyo_user_info)
    else:
        try:
            return intercom_plugin.get_user(user_id=iyo_username)
        except ResourceNotFound:
            return _upsert(iyo_username, get_user(iyo_username))


def send_intercom_email(iyo_username, subject, message):
    intercom_plugin = get_intercom_plugin()
    if intercom_plugin:
        from_ = {'type': 'admin', 'id': get_config(NAMESPACE).intercom_admin_id}
        to_user = upsert_intercom_user(iyo_username)
        to = {'type': 'user', 'id': to_user.id}
        try:
            return intercom_plugin.send_message(from_, message, message_type='email', subject=subject, to=to)
        except BadRequestError as e:
            # Could be that the user is unsubscribed to emails
            logging.warn('Could not send intercom email')
            logging.info(e.message)
            logging.info(e.context)
    logging.debug('Not sending email with subject "%s" via intercom because intercom plugin was not found', subject)
    return None


@returns(Tag)
@arguments(tag=(IntercomTags, unicode), iyo_usernames=[unicode])
def tag_intercom_users(tag, iyo_usernames):
    if isinstance(tag, IntercomTags):
        tag = tag.value
    users = [{'user_id': username} for username in iyo_usernames]
    return get_intercom_plugin().tag_users(tag, users)
