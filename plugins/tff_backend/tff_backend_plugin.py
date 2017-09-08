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

from framework.bizz.authentication import get_current_session
from framework.plugin_loader import get_plugin, BrandingPlugin
from framework.utils.plugins import Handler, Module
from mcfw.consts import AUTHENTICATED, NOT_AUTHENTICATED
from mcfw.restapi import rest_functions
from mcfw.rpc import parse_complex_value
from plugins.rogerthat_api.rogerthat_api_plugin import RogerthatApiPlugin
from plugins.tff_backend import rogerthat_callbacks
from plugins.tff_backend.api import investor, payment, nodes, global_stats
from plugins.tff_backend.bizz.authentication import get_permissions_from_scopes, get_permission_strings
from plugins.tff_backend.configuration import TffConfiguration
from plugins.tff_backend.handlers.cron import RebuildSyncedRolesHandler, PaymentSyncHandler
from plugins.tff_backend.handlers.index import IndexPageHandler


class TffBackendPlugin(BrandingPlugin):
    def __init__(self, configuration):
        super(TffBackendPlugin, self).__init__(configuration)
        self.configuration = parse_complex_value(TffConfiguration, configuration, False)

        rogerthat_api_plugin = get_plugin('rogerthat_api')
        assert (isinstance(rogerthat_api_plugin, RogerthatApiPlugin))
        rogerthat_api_plugin.subscribe('messaging.flow_member_result', rogerthat_callbacks.flow_member_result)
        rogerthat_api_plugin.subscribe('messaging.form_update', rogerthat_callbacks.form_update)
        rogerthat_api_plugin.subscribe('friend.is_in_roles', rogerthat_callbacks.friend_is_in_roles)
        rogerthat_api_plugin.subscribe('friend.update', rogerthat_callbacks.friend_update)
        rogerthat_api_plugin.subscribe('friend.invite', rogerthat_callbacks.friend_invited)
        rogerthat_api_plugin.subscribe('friend.register', rogerthat_callbacks.friend_register, trigger_only=True)
        rogerthat_api_plugin.subscribe('friend.invite_result', rogerthat_callbacks.friend_invite_result,
                                       trigger_only=True)
        rogerthat_api_plugin.subscribe('system.api_call', rogerthat_callbacks.system_api_call)

    def get_handlers(self, auth):
        yield Handler('/', IndexPageHandler)
        authenticated_handlers = [nodes, investor, global_stats]
        for _module in authenticated_handlers:
            for url, handler in rest_functions(_module, authentication=AUTHENTICATED):
                yield Handler(url=url, handler=handler)
        for url, handler in rest_functions(payment, authentication=NOT_AUTHENTICATED):
            yield Handler(url=url, handler=handler)
        if auth == Handler.AUTH_ADMIN:
            yield Handler(url='/admin/cron/tff_backend/rebuild_synced_roles', handler=RebuildSyncedRolesHandler)
            yield Handler(url='/admin/cron/tff_backend/payment/sync', handler=PaymentSyncHandler)

    def get_client_routes(self):
        return ['/orders<route:.*>', '/investment-agreements<route:.*>', '/global-stats<route:.*>']

    def get_modules(self):
        perms = get_permissions_from_scopes(get_current_session().scopes)
        if perms.admin or perms.payment_admin:
            yield Module(u'tff_orders', [], 1)
            yield Module(u'tff_investment_agreements', [], 2)
            yield Module(u'tff_global_stats', [], 3)

    def get_permissions(self):
        return get_permission_strings(get_current_session().scopes)
