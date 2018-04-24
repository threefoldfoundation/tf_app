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
import logging

from google.appengine.api import search

from framework.bizz.authentication import get_current_session
from framework.plugin_loader import get_plugin, BrandingPlugin
from framework.utils.plugins import Handler, Module
from mcfw.consts import AUTHENTICATED, NOT_AUTHENTICATED
from mcfw.restapi import rest_functions, register_postcall_hook
from mcfw.rpc import parse_complex_value
from plugins.rogerthat_api.rogerthat_api_plugin import RogerthatApiPlugin
from plugins.tff_backend import rogerthat_callbacks
from plugins.tff_backend.api import investor, payment, nodes, global_stats, users, audit, agenda, flow_statistics, \
    installations, nodes_unauthenticated
from plugins.tff_backend.bizz.authentication import get_permissions_from_scopes, get_permission_strings, Roles
from plugins.tff_backend.bizz.statistics import log_restapi_call_result
from plugins.tff_backend.configuration import TffConfiguration
from plugins.tff_backend.handlers.cron import RebuildSyncedRolesHandler, PaymentSyncHandler, UpdateGlobalStatsHandler, \
    SaveNodeStatusesHandler, BackupHandler, CheckNodesOnlineHandler, ExpiredEventsHandler, RebuildFirebaseHandler, \
    CheckOfflineNodesHandler
from plugins.tff_backend.handlers.flow_statistics import CheckStuckFlowsHandler
from plugins.tff_backend.handlers.index import IndexPageHandler
from plugins.tff_backend.handlers.testing import AgreementsTestingPageHandler
from plugins.tff_backend.handlers.unauthenticated import RefreshCallbackHandler, RefreshHandler
from plugins.tff_backend.models.user import TffProfile, KYCStatus
from plugins.tff_backend.patch_onfido_lib import patch_onfido_lib


class TffBackendPlugin(BrandingPlugin):

    def __init__(self, configuration):
        super(TffBackendPlugin, self).__init__(configuration)
        self.configuration = parse_complex_value(TffConfiguration, configuration, False)  # type: TffConfiguration

        rogerthat_api_plugin = get_plugin('rogerthat_api')
        assert (isinstance(rogerthat_api_plugin, RogerthatApiPlugin))
        rogerthat_api_plugin.subscribe('app.installation_progress', rogerthat_callbacks.installation_progress)
        rogerthat_api_plugin.subscribe('messaging.flow_member_result', rogerthat_callbacks.flow_member_result)
        rogerthat_api_plugin.subscribe('messaging.form_update', rogerthat_callbacks.form_update)
        rogerthat_api_plugin.subscribe('messaging.update', rogerthat_callbacks.messaging_update)
        rogerthat_api_plugin.subscribe('messaging.poke', rogerthat_callbacks.messaging_poke)
        rogerthat_api_plugin.subscribe('friend.is_in_roles', rogerthat_callbacks.friend_is_in_roles)
        rogerthat_api_plugin.subscribe('friend.update', rogerthat_callbacks.friend_update)
        rogerthat_api_plugin.subscribe('friend.invited', rogerthat_callbacks.friend_invited)
        rogerthat_api_plugin.subscribe('friend.register', rogerthat_callbacks.friend_register, trigger_only=True)
        rogerthat_api_plugin.subscribe('friend.invite_result', rogerthat_callbacks.friend_invite_result,
                                       trigger_only=True)
        rogerthat_api_plugin.subscribe('system.api_call', rogerthat_callbacks.system_api_call)
        patch_onfido_lib()
        register_postcall_hook(log_restapi_call_result)

    def get_handlers(self, auth):
        yield Handler(url='/', handler=IndexPageHandler)
        yield Handler(url='/testing/agreements', handler=AgreementsTestingPageHandler)
        yield Handler(url='/refresh', handler=RefreshHandler)
        yield Handler(url='/refresh/callback', handler=RefreshCallbackHandler)
        authenticated_handlers = [nodes, investor, global_stats, users, audit, agenda, flow_statistics, installations]
        for _module in authenticated_handlers:
            for url, handler in rest_functions(_module, authentication=AUTHENTICATED):
                yield Handler(url=url, handler=handler)
        not_authenticated_handlers = [payment, nodes_unauthenticated]
        for _module in not_authenticated_handlers:
            for url, handler in rest_functions(_module, authentication=NOT_AUTHENTICATED):
                yield Handler(url=url, handler=handler)
        if auth == Handler.AUTH_ADMIN:
            yield Handler(url='/admin/cron/tff_backend/payment/sync', handler=PaymentSyncHandler)
            yield Handler(url='/admin/cron/tff_backend/backup', handler=BackupHandler)
            yield Handler(url='/admin/cron/tff_backend/rebuild_synced_roles', handler=RebuildSyncedRolesHandler)
            yield Handler(url='/admin/cron/tff_backend/global_stats', handler=UpdateGlobalStatsHandler)
            yield Handler(url='/admin/cron/tff_backend/check_nodes_online', handler=CheckNodesOnlineHandler)
            yield Handler(url='/admin/cron/tff_backend/check_offline_nodes', handler=CheckOfflineNodesHandler)
            yield Handler(url='/admin/cron/tff_backend/save_node_statuses', handler=SaveNodeStatusesHandler)
            yield Handler(url='/admin/cron/tff_backend/events/expired', handler=ExpiredEventsHandler)
            yield Handler(url='/admin/cron/tff_backend/check_stuck_flows', handler=CheckStuckFlowsHandler)
            yield Handler(url='/admin/cron/tff_backend/rebuild_firebase', handler=RebuildFirebaseHandler)

    def get_client_routes(self):
        return ['/orders<route:.*>', '/node-orders<route:.*>', '/investment-agreements<route:.*>',
                '/global-stats<route:.*>', '/users<route:.*>', '/agenda<route:.*>', '/flow-statistics<route:.*>',
                '/installations<route:.*>', '/dashboard<route:.*>', '/nodes<route:.*>']

    def get_modules(self):
        perms = get_permissions_from_scopes(get_current_session().scopes)
        is_admin = Roles.BACKEND_ADMIN in perms or Roles.BACKEND in perms
        yield Module(u'tff_dashboard', [], 0)
        if is_admin or Roles.BACKEND_READONLY in perms:
            yield Module(u'tff_orders', [], 1)
            yield Module(u'tff_global_stats', [], 3)
            yield Module(u'tff_users', [], 4)
            yield Module(u'tff_agenda', [], 5)
            yield Module(u'tff_flow_statistics', [], 6)
            yield Module(u'tff_installations', [], 7)
        for role in [Roles.BACKEND_READONLY, Roles.NODES, Roles.NODES_READONLY , Roles.NODES_ADMIN]:
            if is_admin or role in perms:
                yield Module(u'tff_nodes', [], 8)
                break
        if is_admin:
            yield Module(u'tff_investment_agreements', [], 2)

    def get_permissions(self):
        return get_permission_strings(get_current_session().scopes)

    def get_extra_profile_fields(self, profile):
        tff_profile = TffProfile.create_key(profile.username).get()  # type: TffProfile
        if not tff_profile:
            logging.debug('No TffProfile found for profile %s', profile)
            return []
        kyc_status = (tff_profile.kyc and tff_profile.kyc.status) or KYCStatus.UNVERIFIED.value
        return [search.NumberField('kyc_status', kyc_status),
                search.TextField('app_email', tff_profile.app_user.email().lower())]
