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

import webapp2
from google.appengine.ext import deferred

from plugins.rogerthat_api.api import friends
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.bizz.payment import sync_transactions, sync_wallets


class RebuildSyncedRolesHandler(webapp2.RequestHandler):
    def get(self):
        api_key = get_rogerthat_api_key()
        friends.rebuild_synced_roles(api_key, members=[], service_identities=[])


class PaymentSyncHandler(webapp2.RequestHandler):
    def get(self):
        deferred.defer(sync_transactions)
        deferred.defer(sync_wallets)
