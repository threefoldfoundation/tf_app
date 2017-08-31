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
from plugins.tff_backend.bizz.hoster import get_node_order, get_node_orders, put_node_order
from plugins.tff_backend.to.nodes import NodeOrderTO, NodeOrderListTO


@rest('/orders', 'get', Scopes.ADMIN)
@returns(NodeOrderListTO)
@arguments(cursor=unicode, status=(int, long))
def api_get_node_orders(cursor=None, status=None):
    return NodeOrderListTO.from_query(*get_node_orders(cursor, status))


@rest('/orders/<order_id:[^/]+>', 'get', Scopes.ADMIN)
@returns(NodeOrderTO)
@arguments(order_id=unicode)
def api_get_node_order(order_id):
    return NodeOrderTO.from_model(get_node_order(long(order_id)))


@rest('/orders/<order_id:[^/]+>', 'put', Scopes.ADMIN)
@returns(NodeOrderTO)
@arguments(order_id=unicode, data=NodeOrderTO)
def api_put_node_order(order_id, data):
    return NodeOrderTO.from_model(put_node_order(long(order_id), data))
