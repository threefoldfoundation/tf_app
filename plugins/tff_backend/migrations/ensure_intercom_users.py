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


from framework.bizz.job import run_job
from plugins.tff_backend.bizz.user import populate_intercom_user
from plugins.tff_backend.models.user import TffProfile


def ensure_intercom_users():
    run_job(_get_profiles, [], _ensure_intercom_user, [])


def _get_profiles():
    return TffProfile.query()


def _ensure_intercom_user(profile_key):
    populate_intercom_user(profile_key.get())
