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

from google.appengine.ext import deferred

from framework.bizz.job import run_job
from framework.models.session import Session
from plugins.its_you_online_auth.bizz.authentication import decode_jwt_cached
from plugins.tff_backend.bizz.authentication import ROOT_ORGANIZATION, Grants
from plugins.tff_backend.bizz.iyo.user import add_grant


def migrate():
    public_org = 'user:memberof:%s.public' % ROOT_ORGANIZATION
    members_org = 'user:memberof:%s.members' % ROOT_ORGANIZATION
    run_job(_get_users, [], _ensure_grants, [public_org, members_org])


def _get_users():
    return Session.query()


def _ensure_grants(session_key, public_org, members_org):
    session = session_key.get()
    if session and session.jwt:
        decoded_jwt = decode_jwt_cached(session.jwt)
        scopes = decoded_jwt['scope']
        if members_org in scopes:
            deferred.defer(add_grant, session.user_id, Grants.MEMBERS)
        elif public_org in scopes:
            deferred.defer(add_grant, session.user_id, Grants.PUBLIC)
