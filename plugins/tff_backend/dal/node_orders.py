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
from datetime import datetime

from google.appengine.api import search
from google.appengine.api.search import SortExpression
from google.appengine.ext import ndb

from framework.bizz.job import run_job, MODE_BATCH
from mcfw.exceptions import HttpNotFoundException
from mcfw.rpc import returns, arguments
from plugins.tff_backend.consts.hoster import NODE_ORDER_SEARCH_INDEX
from plugins.tff_backend.models.hoster import NodeOrder
from plugins.tff_backend.plugin_consts import NAMESPACE

NODE_ORDER_INDEX = search.Index(NODE_ORDER_SEARCH_INDEX, namespace=NAMESPACE)


@returns(NodeOrder)
@arguments(order_id=(int, long))
def get_node_order(order_id):
    # type: (int) -> NodeOrder
    order = NodeOrder.get_by_id(order_id)
    if not order:
        raise HttpNotFoundException('order_not_found')
    return order


def index_all_node_orders():
    run_job(_get_all_node_orders, [], multi_index_node_order, [], mode=MODE_BATCH, batch_size=200)


def _get_all_node_orders():
    return NodeOrder.query()


def index_node_order(order):
    # type: (NodeOrder) -> list[search.PutResult]
    logging.info('Indexing node order %s', order.id)
    document = create_node_order_document(order)
    return NODE_ORDER_INDEX.put(document)


def multi_index_node_order(order_keys):
    logging.info('Indexing %s node orders', len(order_keys))
    orders = ndb.get_multi(order_keys)
    return NODE_ORDER_INDEX.put([create_node_order_document(order) for order in orders])


def create_node_order_document(order):
    order_id_str = '%s' % order.id
    return search.Document(
        doc_id=order_id_str,
        fields=[
            search.AtomField(name='id', value=order_id_str),
            search.AtomField(name='socket', value=order.socket),
            search.NumberField(name='so', value=order.odoo_sale_order_id or -1),
            search.NumberField(name='status', value=order.status),
            search.DateField(name='order_time', value=datetime.utcfromtimestamp(order.order_time)),
            search.TextField(name='username', value=order.iyo_username),
            search.TextField(name='shipping_name', value=order.shipping_info.name),
            search.TextField(name='shipping_email', value=order.shipping_info.email),
            search.TextField(name='shipping_phone', value=order.shipping_info.phone),
            search.TextField(name='shipping_address', value=order.shipping_info.address),
            search.TextField(name='billing_name', value=order.billing_info.name),
            search.TextField(name='billing_email', value=order.billing_info.email),
            search.TextField(name='billing_phone', value=order.billing_info.phone),
            search.TextField(name='billing_address', value=order.billing_info.address),
        ])


def search_node_orders(query=None, per_page=20, cursor=None):
    # type: (unicode, int, unicode) -> tuple[list[NodeOrder], search.Cursor, bool]
    options = search.QueryOptions(limit=per_page,
                                  cursor=search.Cursor(cursor),
                                  ids_only=True,
                                  sort_options=search.SortOptions(
                                      expressions=[SortExpression(expression='order_time',
                                                                  direction=SortExpression.DESCENDING)]))
    search_results = NODE_ORDER_INDEX.search(search.Query(query, options=options))  # type: search.SearchResults
    results = search_results.results  # type: list[search.ScoredDocument]
    node_orders = ndb.get_multi([NodeOrder.create_key(long(result.doc_id)) for result in results])
    return node_orders, search_results.cursor, search_results.cursor is not None
