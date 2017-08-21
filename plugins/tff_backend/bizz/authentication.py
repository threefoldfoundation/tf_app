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

from __future__ import unicode_literals

import re

from framework.plugin_loader import get_config
from plugins.its_you_online_auth.plugin_consts import NAMESPACE as IYO_NAMESPACE

config = get_config(IYO_NAMESPACE)
ROOT_ORGANIZATION = config.root_organization.name
USERS_REGEX = re.compile('^user:memberof:%s.users.(default|hosters|investors|ambassadors)$' % ROOT_ORGANIZATION)


class Roles(object):
    ADMINS = 'admins'
    DEFAULT = 'default'
    HOSTER = 'hosters'
    INVESTOR = 'investors'
    AMBASSADORS = 'ambassadors'


class PermissionType(object):
    USERS = 'users'


class Organization(object):
    ADMIN = '%s.admins' % ROOT_ORGANIZATION
    DEFAULT_USER = '%s.users.%s' % (ROOT_ORGANIZATION, Roles.DEFAULT)
    HOSTER = '%s.users.%s' % (ROOT_ORGANIZATION, Roles.HOSTER)
    INVESTOR = '%s.users.%s' % (ROOT_ORGANIZATION, Roles.INVESTOR)
    AMBASSADOR = '%s.users.%s' % (ROOT_ORGANIZATION, Roles.AMBASSADORS)


class Scope(object):
    _memberof = 'user:memberof:%s'
    ROOT_ADMIN = _memberof % ROOT_ORGANIZATION
    ADMIN = _memberof % Organization.ADMIN
    DEFAULT_USER = _memberof % Organization.DEFAULT_USER
    HOSTER = _memberof % Organization.HOSTER
    INVESTOR = _memberof % Organization.INVESTOR
    AMBASSADOR = _memberof % Organization.AMBASSADOR


class Scopes(object):
    ADMIN = [Scope.ADMIN, Scope.ROOT_ADMIN]
    DEFAULT_USER = [Scope.DEFAULT_USER]
    HOSTER = DEFAULT_USER + [Scope.HOSTER]
    INVESTOR = DEFAULT_USER + [Scope.INVESTOR]
    AMBASSADOR = DEFAULT_USER + [Scope.AMBASSADOR]


SCOPE_ROLES = {
    PermissionType.USERS: [Roles.DEFAULT, Roles.HOSTER, Roles.INVESTOR, Roles.AMBASSADORS]
}


class RoleScope(object):
    value = None
    role = None

    def __init__(self, value, role):
        self.value = value
        self.role = role


class UserPermissions(object):
    users = []  # type: list of RoleScope
    admin = False

    def __init__(self, admin, users):
        """
        Args:
            admin (boolean)
            users (list of RoleScope)
        """
        self.admin = admin
        self.users = users


def get_permissions_from_scopes(scopes):
    admin = False
    users = []
    for scope in scopes:
        if scope == Scope.ADMIN or scope == Scope.ROOT_ADMIN:
            admin = True
            continue
        users_re = USERS_REGEX.match(scope)
        # e.g. {root_org}.users.hosters
        if users_re:
            groups = users_re.groups()
            users.append(RoleScope(groups[1], groups[2]))
            continue
    return UserPermissions(admin, users)
