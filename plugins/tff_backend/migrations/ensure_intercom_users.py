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
import re

from framework.bizz.job import run_job
from framework.models.session import Session
from plugins.its_you_online_auth.models import Profile
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.tff_backend.bizz.user import populate_intercom_user
from plugins.tff_backend.utils.app import get_app_user_tuple_by_email


def _is_guid(val):
    return bool(re.findall('[a-z0-9]{32}', val))


def ensure_intercom_users():
    run_job(_get_users, [], _ensure_intercom_user, [])


def _get_users():
    return Session.query()


def _ensure_intercom_user(session_key):
    session_key_value = session_key.id()
    if not _is_guid(session_key_value):
        # session_key_value == username
        profile = Profile.create_key(session_key_value).get()
        user_details = None
        if profile and profile.app_email:
            user, app_id = get_app_user_tuple_by_email(profile.app_email)
            user_details = UserDetailsTO(email=user.email(), app_id=app_id)
        populate_intercom_user(session_key, user_details)
