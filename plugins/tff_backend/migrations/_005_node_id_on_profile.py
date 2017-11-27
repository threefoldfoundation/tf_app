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
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
from plugins.tff_backend.bizz.odoo import get_odoo_serial_number
from plugins.tff_backend.models.hoster import NodeOrder, NodeOrderStatus
from plugins.tff_backend.models.user import TffProfile


def migrate(dry_run=False):
    run_job(_get_orders, [NodeOrderStatus.ARRIVED], _set_node_id, [])
    run_job(_get_orders, [NodeOrderStatus.PAID], _set_node_id, [])
    run_job(_get_orders, [NodeOrderStatus.SENT], _set_node_id, [])


def _get_orders(status):
    return NodeOrder.list_by_status(status)


def _set_node_id(order_key):
    order = order_key.get()  # type: NodeOrder
    serial_number = get_odoo_serial_number(order.id)
    if serial_number:
        username = get_iyo_username(order.app_user)
        profile = TffProfile.create_key(username).get()  # type: TffProfile
        profile.node_id = serial_number
        profile.put()
        logging.info('Saved node_id %s for user %s', serial_number, username)
