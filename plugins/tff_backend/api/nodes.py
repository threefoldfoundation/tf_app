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
from plugins.tff_backend.bizz.hoster import put_node_order, create_node_order
from plugins.tff_backend.dal.node_orders import search_node_orders, get_node_order
from plugins.tff_backend.to.nodes import NodeOrderTO, NodeOrderListTO, CreateNodeOrderTO, NodeOrderDetailTO
from plugins.tff_backend.utils.search import sanitise_search_query


@rest('/orders', 'get', Scopes.BACKEND_READONLY, silent_result=True)
@returns(NodeOrderListTO)
@arguments(page_size=(int, long), cursor=unicode, query=unicode, status=(int, long))
def api_get_node_orders(page_size=20, cursor=None, query=None, status=None):
    page_size = min(page_size, MAXIMUM_DOCUMENTS_RETURNED_PER_SEARCH)
    filters = {'status': status}
    return NodeOrderListTO.from_search(*search_node_orders(sanitise_search_query(query, filters), page_size, cursor))


@rest('/orders/<order_id:[^/]+>', 'get', Scopes.BACKEND_READONLY)
@returns(NodeOrderDetailTO)
@arguments(order_id=(int, long))
def api_get_node_order(order_id):
    return NodeOrderDetailTO.from_dict(get_node_order(order_id).to_dict(['username']))


@rest('/orders', 'post', Scopes.BACKEND_ADMIN)
@returns(NodeOrderDetailTO)
@arguments(data=CreateNodeOrderTO)
def api_create_node_order(data):
    return NodeOrderDetailTO.from_dict(create_node_order(data).to_dict(['username']))


@audit(AuditLogType.UPDATE_NODE_ORDER, 'order_id')
@rest('/orders/<order_id:[^/]+>', 'put', Scopes.BACKEND_ADMIN)
@returns(NodeOrderDetailTO)
@arguments(order_id=(int, long), data=NodeOrderTO)
def api_put_node_order(order_id, data):
    return NodeOrderDetailTO.from_dict(put_node_order(order_id, data).to_dict(['username']))
