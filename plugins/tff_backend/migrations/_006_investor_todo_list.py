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
from google.appengine.ext.deferred import deferred

from plugins.tff_backend.bizz.investor import INVESTMENT_TODO_MAPPING
from plugins.tff_backend.bizz.todo import update_investor_progress
from plugins.tff_backend.models.investor import InvestmentAgreement
from plugins.tff_backend.utils.app import get_app_user_tuple


def migrate(dry_run=False):
    investments = InvestmentAgreement.query().fetch(1000)  # type: list[InvestmentAgreement]
    updates = {}
    for investment in investments:
        new_status = INVESTMENT_TODO_MAPPING[investment.status]
        if investment.app_user not in updates or updates[investment.app_user] < new_status:
            updates[investment.app_user] = INVESTMENT_TODO_MAPPING[investment.status]
    if dry_run:
        return updates
    for app_user, step in updates.iteritems():
        email, app_id = get_app_user_tuple(app_user)
        deferred.defer(update_investor_progress, email.email(), app_id, step)
