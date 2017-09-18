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
from google.appengine.api import taskqueue
from google.appengine.ext import deferred

from plugins.rogerthat_api.api import friends
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.bizz.global_stats import update_currencies
from plugins.tff_backend.bizz.payment import sync_transactions, sync_wallets


class PaymentSyncHandler(webapp2.RequestHandler):
    def get(self):
        deferred.defer(sync_transactions)
        deferred.defer(sync_wallets)


class BackupHandler(webapp2.RequestHandler):
    def get(self):
        models_to_backup = []

        # intercom_support
        models_to_backup.extend(['IntercomConversation',
                                 'RogerthatConversation'])

        # its_tyo_online_auth
        models_to_backup.extend(['Profile',
                                 'Session'])

        # tff_backend
        models_to_backup.extend(['GlobalStats',
                                 'NodeOrder',
                                 'ProfilePointer',
                                 'InvestmentAgreement',
                                 'TffProfile',
                                 'ThreeFoldBlockHeight',
                                 'ThreeFoldWallet',
                                 'ThreeFoldTransaction',
                                 'ThreeFoldPendingTransaction'
                                 ])

        for model_to_backup in models_to_backup:
            taskqueue.add(
                url='/_ah/datastore_admin/backup.create',
                method='GET',
                queue_name="data-backup",
                params={
                    'filesystem': 'gs',
                    'gs_bucket_name': 'tff-backend-backups',
                    'name': model_to_backup,
                    'kind': [model_to_backup]
                }
            )


class RebuildSyncedRolesHandler(webapp2.RequestHandler):
    def get(self):
        api_key = get_rogerthat_api_key()
        friends.rebuild_synced_roles(api_key, members=[], service_identities=[])


class UpdateGlobalStatsHandler(webapp2.RequestHandler):
    def get(self):
        deferred.defer(update_currencies)
