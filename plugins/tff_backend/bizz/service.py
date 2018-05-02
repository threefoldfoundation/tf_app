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

from mcfw.cache import cached
from mcfw.rpc import returns, arguments
from plugins.rogerthat_api.api import system
from plugins.rogerthat_api.to import BaseMemberTO, UserDetailsTO
from plugins.rogerthat_api.to.system import RoleTO
from plugins.tff_backend.bizz import get_rogerthat_api_key


@cached(version=1, lifetime=86400, request=True, memcache=True)
@returns(unicode)
@arguments()
def get_main_branding_hash():
    api_key = get_rogerthat_api_key()
    si = system.get_identity(api_key)
    return si.description_branding


@returns()
@arguments(user_detail=UserDetailsTO, role_name=unicode)
def add_user_to_role(user_detail, role_name):
    logging.info('Adding user %s to role "%s"', user_detail.email, role_name)
    api_key = get_rogerthat_api_key()
    role_id = get_role_id_by_name(api_key, role_name)
    member = BaseMemberTO()
    member.member = user_detail.email
    member.app_id = user_detail.app_id
    system.add_role_member(api_key, role_id, member)


@returns()
@arguments(user_detail=UserDetailsTO, role_name=unicode)
def remove_user_from_role(user_detail, role_name):
    logging.info('Deleting user %s from role "%s"', user_detail.email, role_name)
    api_key = get_rogerthat_api_key()
    role_id = get_role_id_by_name(api_key, role_name)
    member = BaseMemberTO()
    member.member = user_detail.email
    member.app_id = user_detail.app_id
    system.delete_role_member(api_key, role_id, member)


@cached(version=1, lifetime=86400, request=True, memcache=True)
@returns(long)
@arguments(api_key=unicode, role_name=unicode)
def get_role_id_by_name(api_key, role_name):
    for role in system.list_roles(api_key):
        if role.name == role_name:
            return role.id

    logging.debug('Role "%s" not found. Creating...', role_name)
    return system.put_role(api_key, role_name, RoleTO.TYPE_MANAGED)
