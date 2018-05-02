# -*- coding: utf-8 -*-
# Copyright 2018 GIG Technology NV
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
# @@license_version:1.4@@

from framework.bizz.job import run_job
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.tff_backend.bizz.authentication import RogerthatRoles
from plugins.tff_backend.bizz.service import add_user_to_role, remove_user_from_role
from plugins.tff_backend.models.user import TffProfile
from plugins.tff_backend.utils.app import get_app_user_tuple


def migrate():
    run_job(_get_users, [], _ensure_role, [])


def _get_users():
    return TffProfile.query()


def _ensure_role(profile_key):
    profile = profile_key.get()  # type: TffProfile
    user, app_id = get_app_user_tuple(profile.app_user)
    user_detail = UserDetailsTO(email=user.email(), app_id=app_id)
    add_user_to_role(user_detail, RogerthatRoles.MEMBERS)
    remove_user_from_role(user_detail, u'public')
