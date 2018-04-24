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
import datetime
import httplib
import json
import logging

import webapp2
from google.appengine.api import urlfetch
from google.appengine.api.app_identity import app_identity
from google.appengine.ext import deferred

from framework.plugin_loader import get_config
from mcfw.consts import MISSING
from plugins.rogerthat_api.api import friends
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.bizz.agenda import update_expired_events
from plugins.tff_backend.bizz.dashboard import rebuild_firebase_data
from plugins.tff_backend.bizz.global_stats import update_currencies
from plugins.tff_backend.bizz.nodes.stats import save_node_statuses, check_online_nodes, check_offline_nodes
from plugins.tff_backend.bizz.payment import sync_transactions, sync_wallets
from plugins.tff_backend.configuration import TffConfiguration
from plugins.tff_backend.plugin_consts import NAMESPACE


class PaymentSyncHandler(webapp2.RequestHandler):

    def get(self):
        deferred.defer(sync_transactions)
        deferred.defer(sync_wallets)


class BackupHandler(webapp2.RequestHandler):
    def get(self):
        config = get_config(NAMESPACE)
        assert isinstance(config, TffConfiguration)
        if config.backup_bucket is MISSING or not config.backup_bucket:
            logging.debug('Backup is disabled')
            return
        access_token, _ = app_identity.get_access_token('https://www.googleapis.com/auth/datastore')
        app_id = app_identity.get_application_id()
        timestamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
        output_url_prefix = 'gs://%s' % config.backup_bucket
        if '/' not in output_url_prefix[5:]:
            # Only a bucket name has been provided - no prefix or trailing slash
            output_url_prefix += '/' + timestamp
        else:
            output_url_prefix += timestamp

        entity_filter = {
            'kinds': self.request.get_all('kind'),
            'namespace_ids': self.request.get_all('namespace_id')
        }
        request = {
            'project_id': app_id,
            'output_url_prefix': output_url_prefix,
            'entity_filter': entity_filter
        }
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token
        }
        url = 'https://datastore.googleapis.com/v1/projects/%s:export' % app_id
        try:
            result = urlfetch.fetch(url=url,
                                    payload=json.dumps(request),
                                    method=urlfetch.POST,
                                    deadline=60,
                                    headers=headers)  # type: urlfetch._URLFetchResult
            if result.status_code == httplib.OK:
                logging.info(result.content)
            else:
                logging.error(result.content)
            self.response.status_int = result.status_code
        except urlfetch.Error:
            logging.exception('Failed to initiate export.')
            self.response.status_int = httplib.INTERNAL_SERVER_ERROR


class RebuildSyncedRolesHandler(webapp2.RequestHandler):

    def get(self):
        api_key = get_rogerthat_api_key()
        friends.rebuild_synced_roles(api_key, members=[], service_identities=[])


class UpdateGlobalStatsHandler(webapp2.RequestHandler):

    def get(self):
        deferred.defer(update_currencies)


class CheckNodesOnlineHandler(webapp2.RequestHandler):

    def get(self):
        deferred.defer(check_online_nodes)


class CheckOfflineNodesHandler(webapp2.RequestHandler):

    def get(self):
        check_offline_nodes()


class SaveNodeStatusesHandler(webapp2.RequestHandler):

    def get(self):
        save_node_statuses()


class ExpiredEventsHandler(webapp2.RequestHandler):

    def get(self):
        deferred.defer(update_expired_events)


class RebuildFirebaseHandler(webapp2.RequestHandler):

    def get(self):
        deferred.defer(rebuild_firebase_data)
