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
from plugins.tff_backend.bizz.user import popuplate_intercom_user

_is_guid = lambda x: bool(re.findall('[a-z0-9]{32}', x))


def ensure_intercom_users():
    run_job(_get_users, [], _ensure_intercom_user, [])


def _get_users():
    return Session.query()


def _ensure_intercom_user(session_key):
    session = session_key.get()
    if not session:
        return
    if not _is_guid(session.key.id()):
        popuplate_intercom_user(session.user_id, session.jwt)
