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
USERS_REGEX = re.compile('^user:memberof:%s.(public|hosters|members|investors|ambassadors)$' % ROOT_ORGANIZATION)


class Roles(object):
    ADMINS = 'admins'
    PAYMENT_ADMINS = 'payment-admin'
    PUBLIC = 'public'
    HOSTERS = 'hosters'
    MEMBERS = 'members'
    INVESTOR = 'investors'
    AMBASSADORS = 'ambassadors'


class PluginRoles(object):
    ADMINS = 'tff-admins'
    PAYMENT_ADMINS = 'tff-payment-admin'
    PUBLIC = 'tff-public'
    HOSTERS = 'tff-hosters'
    MEMBERS = 'tff-members'
    INVESTOR = 'tff-investors'
    AMBASSADORS = 'tff-ambassadors'


class Organization(object):
    ADMINS = '%s.admins' % ROOT_ORGANIZATION
    PAYMENT_ADMINS = '%s.%s' % (ROOT_ORGANIZATION, Roles.PAYMENT_ADMINS)
    PUBLIC = '%s.%s' % (ROOT_ORGANIZATION, Roles.PUBLIC)
    HOSTERS = '%s.%s' % (ROOT_ORGANIZATION, Roles.HOSTERS)
    MEMBERS = '%s.%s' % (ROOT_ORGANIZATION, Roles.MEMBERS)
    INVESTORS = '%s.%s' % (ROOT_ORGANIZATION, Roles.INVESTOR)
    AMBASSADORS = '%s.%s' % (ROOT_ORGANIZATION, Roles.AMBASSADORS)

    ROLES = {
        Roles.ADMINS: ADMINS,
        Roles.PAYMENT_ADMINS: PAYMENT_ADMINS,
        Roles.PUBLIC: PUBLIC,
        Roles.HOSTERS: HOSTERS,
        Roles.MEMBERS: MEMBERS,
        Roles.INVESTOR: INVESTORS,
        Roles.AMBASSADORS: AMBASSADORS,
    }

    @staticmethod
    def get_by_role_name(role_name):
        return Organization.ROLES.get(role_name, None)


class Scope(object):
    _memberof = 'user:memberof:%s'
    ROOT_ADMINS = _memberof % ROOT_ORGANIZATION
    ADMINS = _memberof % Organization.ADMINS
    PAYMENT_ADMINS = _memberof % Organization.PAYMENT_ADMINS
    PUBLIC = _memberof % Organization.PUBLIC
    HOSTERS = _memberof % Organization.HOSTERS
    MEMBERS = _memberof % Organization.MEMBERS
    INVESTORS = _memberof % Organization.INVESTORS
    AMBASSADORS = _memberof % Organization.AMBASSADORS


class Scopes(object):
    ADMINS = [Scope.ADMINS, Scope.ROOT_ADMINS]
    PAYMENT_ADMIN = [Scope.ROOT_ADMINS, Scope.PAYMENT_ADMINS]
    PUBLIC = ADMINS + [Scope.PUBLIC]
    HOSTERS = PUBLIC + [Scope.HOSTERS]
    MEMBERS = PUBLIC + [Scope.MEMBERS]
    INVESTORS = PUBLIC + [Scope.INVESTORS]
    AMBASSADORS = PUBLIC + [Scope.AMBASSADORS]


class UserPermissions(object):
    users = []  # type: list of unicode
    admin = False
    payment_admin = False

    def __init__(self, admin, payment_admin, users):
        """
        Args:
            admin (boolean)
            payment_admin (boolean)
            users (list of unicode)
        """
        self.admin = admin
        self.payment_admin = payment_admin
        self.users = users


def get_permissions_from_scopes(scopes):
    admin = False
    payment_admin = False
    users = []
    for scope in scopes:
        if scope == Scope.ADMINS or scope == Scope.ROOT_ADMINS:
            admin = True
            continue
        if scope == Scope.PAYMENT_ADMINS:
            payment_admin = True
        users_re = USERS_REGEX.match(scope)
        # e.g. {root_org}.hosters
        if users_re:
            groups = users_re.groups()
            users.append(groups[0])
            continue
    return UserPermissions(admin, payment_admin, users)


def get_permission_strings(scopes):
    perms = []
    permissions = get_permissions_from_scopes(scopes)
    if permissions.admin:
        perms.append(PluginRoles.ADMINS)
    if permissions.payment_admin:
        perms.append(PluginRoles.PAYMENT_ADMINS)
    for perm in permissions.users:
        perms.append('tff-%s' % perm)
    return perms
