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

from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.tff_backend.bizz.authentication import Scopes
from plugins.tff_backend.bizz.flow_statistics import list_flow_runs, list_distinct_flows, get_flow_run, flow_run_stats


@rest('/flow-statistics/flows', 'get', Scopes.BACKEND_READONLY, silent_result=True)
@returns([unicode])
@arguments()
def api_list_distinct_flows():
    return list_distinct_flows()


@rest('/flow-statistics', 'get', Scopes.BACKEND_READONLY, silent_result=True)
@returns(dict)
@arguments(flow_name=unicode, min_date=unicode, page_size=(int, long), cursor=unicode)
def api_list_flow_runs(flow_name=None, min_date=None, cursor=None, page_size=50):
    results, cursor, more = list_flow_runs(cursor, page_size, flow_name, min_date)
    return {
        'cursor': cursor and cursor.to_websafe_string(),
        'more': more,
        'results': [r.to_dict(exclude={'steps'}) for r in results]
    }


@rest('/flow-statistics/details/<flow_run_id:[^/]+>', 'get', Scopes.BACKEND_READONLY, silent_result=True)
@returns(dict)
@arguments(flow_run_id=unicode)
def api_get_flow_run(flow_run_id):
    return get_flow_run(flow_run_id).to_dict()


@rest('/flow-statistics/stats', 'get', Scopes.BACKEND_READONLY, silent_result=True)
@returns([dict])
@arguments(start_date=unicode)
def api_get_flow_run(start_date):
    return flow_run_stats(start_date)
