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

from framework.bizz.authentication import get_current_session
from framework.models.session import Session
from framework.plugin_loader import get_config
from mcfw.rpc import returns, arguments
from plugins.its_you_online_auth.bizz.authentication import get_itsyouonline_client_from_jwt
from plugins.its_you_online_auth.plugin_consts import NAMESPACE as IYO_AUTH_NAMESPACE
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.tff_backend.plugin_consts import NAMESPACE
from plugins.tff_backend.utils.app import get_human_user_from_app_user, create_app_user_by_email


@returns(unicode)
@arguments()
def get_iyo_organization_id():
    config = get_config(IYO_AUTH_NAMESPACE)
    return config.root_organization.name


@returns(unicode)
@arguments(user=(users.User, UserDetailsTO, unicode))
def get_iyo_username(user):
    if isinstance(user, users.User):
        email = get_human_user_from_app_user(user).email()
    elif isinstance(user, UserDetailsTO):
        email = user.email
    else:
        email = user

    return email.split('@')[0]


@returns(users.User)
@arguments(username=unicode)
def get_app_user_from_iyo_username(username):
    iyo_domain = get_config(IYO_AUTH_NAMESPACE).api_domain
    app_id = get_config(NAMESPACE).rogerthat.app_id
    return create_app_user_by_email('%s@%s' % (username, iyo_domain), app_id)


def get_itsyouonline_client_from_username(username):
    session = get_current_session()
    if not session:
        session = Session.create_key(username).get()
    if not session:
        raise Exception('No session found for %s' % username)
    jwt = session.jwt
    client = get_itsyouonline_client_from_jwt(jwt)
    return client
