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

import httplib
import logging

from mcfw.rpc import returns, arguments
from plugins.its_you_online_auth.bizz.authentication import get_itsyouonline_client
from plugins.its_you_online_auth.libs.itsyouonline.AddOrganizationMemberReqBody import AddOrganizationMemberReqBody
from plugins.tff_backend.bizz.iyo.utils import get_itsyouonline_client_from_username
from plugins.tff_backend.to.iyo.user import IYOUser
from requests.exceptions import HTTPError


def get_user(username):
    client = get_itsyouonline_client_from_username(username)
    result = client.api.users.GetUserInformation(username)
    logging.debug('get_user %s %s', result.status_code, result.text)
    return IYOUser(**result.json())


@returns()
@arguments(username=unicode, organization_id=unicode)
def invite_user_to_organization(username, organization_id):
    logging.info('Inviting user %s to IYO organization %s', username, organization_id)
    client = get_itsyouonline_client()
    try:
        client.api.organizations.AddOrganizationMember(AddOrganizationMemberReqBody.create(username),
                                                       organization_id)
    except HTTPError as e:
        if e.response.status_code != httplib.CONFLICT:
            raise e


@returns()
@arguments(username=unicode, organization_id=unicode)
def remove_user_from_organization(username, organization_id):
    logging.info('Removing user %s from IYO organization %s', username, organization_id)
    client = get_itsyouonline_client()
    client.api.organizations.RemoveOrganizationMember(username, organization_id)
