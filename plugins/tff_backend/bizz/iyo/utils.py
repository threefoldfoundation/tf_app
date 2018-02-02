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

from google.appengine.api import users
from google.appengine.ext import ndb

from framework.bizz.authentication import get_current_session
from framework.models.session import Session
from framework.plugin_loader import get_config, get_plugin
from mcfw.rpc import returns, arguments
from plugins.its_you_online_auth.bizz.authentication import get_itsyouonline_client_from_jwt
from plugins.its_you_online_auth.its_you_online_auth_plugin import ItsYouOnlineAuthPlugin
from plugins.its_you_online_auth.plugin_consts import NAMESPACE as IYO_AUTH_NAMESPACE
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.tff_backend.utils.app import create_app_user_by_email


@returns(unicode)
@arguments()
def get_iyo_organization_id():
    config = get_config(IYO_AUTH_NAMESPACE)
    return config.root_organization.name


@ndb.non_transactional()
@returns(unicode)
@arguments(app_user_or_user_details=(users.User, UserDetailsTO))
def get_iyo_username(app_user_or_user_details):
    if isinstance(app_user_or_user_details, UserDetailsTO):
        app_user = create_app_user_by_email(app_user_or_user_details.email, app_user_or_user_details.app_id)
    else:
        app_user = app_user_or_user_details
    return get_iyo_plugin().get_username_from_rogerthat_email(app_user.email())


@returns(dict)
@arguments(app_emails=[unicode])
def get_iyo_usernames(app_emails):
    return get_iyo_plugin().get_usernames_from_rogerthat_emails(app_emails)


@returns(users.User)
@arguments(username=unicode)
def get_app_user_from_iyo_username(username):
    email = get_iyo_plugin().get_rogerthat_email_from_username(username)
    return email and users.User(email)


@ndb.non_transactional()
def get_itsyouonline_client_from_username(username):
    session = get_current_session()
    if not session or session.user_id != username:
        session = Session.create_key(username).get()
    if not session:
        raise Exception('No session found for %s' % username)
    jwt = session.jwt
    client = get_itsyouonline_client_from_jwt(jwt)
    return client


@returns(ItsYouOnlineAuthPlugin)
def get_iyo_plugin():
    # type: () -> ItsYouOnlineAuthPlugin
    return get_plugin(IYO_AUTH_NAMESPACE)
