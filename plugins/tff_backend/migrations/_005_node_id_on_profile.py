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

from framework.bizz.job import run_job
from plugins.tff_backend.bizz.iyo.utils import get_username
from plugins.tff_backend.bizz.nodes.stats import assign_nodes_to_user
from plugins.tff_backend.bizz.odoo import get_nodes_from_odoo
from plugins.tff_backend.models.hoster import NodeOrder, NodeOrderStatus


def migrate(dry_run=False):
    run_job(_get_orders, [NodeOrderStatus.ARRIVED], _set_node_id, [])
    run_job(_get_orders, [NodeOrderStatus.PAID], _set_node_id, [])
    run_job(_get_orders, [NodeOrderStatus.SENT], _set_node_id, [])


def _get_orders(status):
    return NodeOrder.list_by_status(status)


def _set_node_id(order_key):
    order = order_key.get()  # type: NodeOrder
    nodes = get_nodes_from_odoo(order.odoo_sale_order_id)
    if nodes:
        assign_nodes_to_user(order.username, nodes)
        logging.info('Saved node_id %s for user %s', nodes, order.username)
