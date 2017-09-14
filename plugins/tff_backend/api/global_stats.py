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
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.tff_backend.bizz.authentication import Scopes
from plugins.tff_backend.bizz.global_stats import list_global_stats, get_global_stats, put_global_stats
from plugins.tff_backend.to.global_stats import GlobalStatsTO


@rest('/global-stats', 'get', Scopes.ADMINS)
@returns([GlobalStatsTO])
@arguments()
def api_list_global_stats():
    return [GlobalStatsTO.from_model(model) for model in list_global_stats()]


@rest('/global-stats/<stats_id:[^/]+>', 'get', Scopes.ADMINS)
@returns(GlobalStatsTO)
@arguments(stats_id=unicode)
def api_get_global_stat(stats_id):
    return GlobalStatsTO.from_model(get_global_stats(stats_id))


@rest('/global-stats/<stats_id:[^/]+>', 'put', Scopes.ADMINS)
@returns(GlobalStatsTO)
@arguments(stats_id=unicode, data=GlobalStatsTO)
def api_put_global_stats(stats_id, data):
    return GlobalStatsTO.from_model(put_global_stats(stats_id, data))
