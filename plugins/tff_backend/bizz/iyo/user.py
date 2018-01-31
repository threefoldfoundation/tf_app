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

from plugins.its_you_online_auth.bizz.authentication import get_itsyouonline_client, get_itsyouonline_client_from_jwt
from plugins.its_you_online_auth.libs import itsyouonline
from plugins.its_you_online_auth.libs.itsyouonline.CreateGrantBody import CreateGrantBody
from plugins.its_you_online_auth.libs.itsyouonline.UpdateGrantBody import UpdateGrantBody
from plugins.its_you_online_auth.libs.itsyouonline.userview import userview
from plugins.tff_backend.bizz.iyo.utils import get_itsyouonline_client_from_username, \
    get_iyo_organization_id
from plugins.tff_backend.utils import convert_to_str


def get_user(username, jwt=None):
    if jwt:
        client = get_itsyouonline_client_from_jwt(jwt)
    else:
        client = get_itsyouonline_client_from_username(username)
    result = client.users.GetUserInformation(convert_to_str(username))
    return userview(convert_to_str(result.json()))


def has_grant(client, username, grant):
    assert isinstance(client, itsyouonline.Client)
    grants = client.organizations.GetUserGrants(convert_to_str(username), get_iyo_organization_id()).json()
    return grants and grant in grants


def list_grants(username):
    client = get_itsyouonline_client()
    return client.organizations.GetUserGrants(convert_to_str(username), get_iyo_organization_id())


def list_all_users_with_grant(grant):
    client = get_itsyouonline_client()
    return client.organizations.ListUsersWithGrant(grant, get_iyo_organization_id())


def add_grant(username, grant):
    client = get_itsyouonline_client()
    data = CreateGrantBody(username=convert_to_str(username), grant=grant)
    return client.organizations.CreateUserGrant(data, get_iyo_organization_id())


def update_grant(username, oldgrant, newgrant):
    client = get_itsyouonline_client()
    data = UpdateGrantBody(username=convert_to_str(username), oldgrant=oldgrant, newgrant=newgrant)
    return client.organizations.UpdateUserGrant(data, get_iyo_organization_id())


def remove_grant(username, grant):
    client = get_itsyouonline_client()
    return client.organizations.DeleteUserGrant(grant, convert_to_str(username), get_iyo_organization_id())


def remove_all_grants(username):
    client = get_itsyouonline_client()
    return client.organizations.DeleteAllUserGrants(convert_to_str(username), get_iyo_organization_id())
