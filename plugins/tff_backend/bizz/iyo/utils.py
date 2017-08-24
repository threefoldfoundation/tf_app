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

from framework.plugin_loader import get_config
from mcfw.rpc import returns, arguments
from plugins.its_you_online_auth.plugin_consts import NAMESPACE as IYO_AUTH_NAMESPACE
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.tff_backend.utils.app import get_human_user_from_app_user


@returns(unicode)
@arguments()
def get_iyo_organization_id():
    config = get_config(IYO_AUTH_NAMESPACE)
    return config.root_organization.name


@returns(unicode)
@arguments(user=(users.User, UserDetailsTO))
def get_iyo_username(user):
    if isinstance(user, users.User):
        email = get_human_user_from_app_user(user).email()
    else:
        email = user.email

    return email.split('@')[0]
