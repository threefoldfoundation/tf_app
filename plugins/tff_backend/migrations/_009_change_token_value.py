# -*- coding: utf-8 -*-
# Copyright 2018 GIG Technology NV
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
# @@license_version:1.4@@
from mcfw.consts import DEBUG
from plugins.rogerthat_api.api import system
from plugins.tff_backend.bizz import get_tf_token_api_key
from plugins.tff_backend.bizz.global_stats import _get_currency_conversions
from plugins.tff_backend.models.global_stats import GlobalStats
from plugins.tff_backend.plugin_consts import BUY_TOKENS_TAG, BUY_TOKENS_FLOW_V5


def migrate():
    for stats_model in GlobalStats.query():  # type: GlobalStats
        new_value = stats_model.value / 100
        currencies = _get_currency_conversions(stats_model.currencies, new_value)
        stats_model.populate(currencies=currencies, value=new_value)
        stats_model.put()
    coords = [2, 1, 0]
    icon_name = 'fa-suitcase'
    label = 'Purchase iTokens'
    flow = BUY_TOKENS_FLOW_V5
    api_key = get_tf_token_api_key()
    roles = system.list_roles(api_key)
    menu_item_roles = []
    for role in roles:
        if role.name in ('invited', 'members'):
            menu_item_roles.append(role.id)
    system.put_menu_item(api_key, icon_name, BUY_TOKENS_TAG, coords, None, label, static_flow=flow,
                         roles=[] if DEBUG else menu_item_roles, fall_through=True)
    system.publish_changes(api_key)
