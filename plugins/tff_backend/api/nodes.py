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
from google.appengine.api.search import MAXIMUM_DOCUMENTS_RETURNED_PER_SEARCH

from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.tff_backend.bizz.audit.audit import audit
from plugins.tff_backend.bizz.audit.mapping import AuditLogType
from plugins.tff_backend.bizz.authentication import Scopes
from plugins.tff_backend.bizz.hoster import put_node_order, get_node_order_details
from plugins.tff_backend.dal.node_orders import search_node_orders
from plugins.tff_backend.to.nodes import NodeOrderTO, NodeOrderListTO, NodeOrderDetailsTO
from plugins.tff_backend.utils.search import sanitise_search_query


@rest('/orders', 'get', Scopes.TEAM)
@returns(NodeOrderListTO)
@arguments(page_size=(int, long), cursor=unicode, query=unicode, status=(int, long))
def api_get_node_orders(page_size=20, cursor=None, query=None, status=None):
    page_size = min(page_size, MAXIMUM_DOCUMENTS_RETURNED_PER_SEARCH)
    filters = {'status': status}
    return NodeOrderListTO.from_search(*search_node_orders(sanitise_search_query(query, filters), page_size, cursor))


@rest('/orders/<order_id:[^/]+>', 'get', Scopes.TEAM)
@returns(NodeOrderDetailsTO)
@arguments(order_id=(int, long))
def api_get_node_order(order_id):
    return get_node_order_details(order_id)


@audit(AuditLogType.UPDATE_NODE_ORDER, 'order_id')
@rest('/orders/<order_id:[^/]+>', 'put', Scopes.ADMINS)
@returns(NodeOrderTO)
@arguments(order_id=(int, long), data=NodeOrderTO)
def api_put_node_order(order_id, data):
    return NodeOrderTO.from_model(put_node_order(order_id, data))
