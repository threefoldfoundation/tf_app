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

import json
import logging

from google.appengine.api import urlfetch
from google.appengine.ext import ndb
from google.appengine.ext.deferred import deferred

from framework.bizz.job import run_job
from framework.plugin_loader import get_config
from framework.utils import now
from plugins.its_you_online_auth.bizz.authentication import refresh_jwt
from plugins.rogerthat_api.exceptions import BusinessException
from plugins.tff_backend.bizz.odoo import get_odoo_serial_number
from plugins.tff_backend.bizz.todo import HosterSteps, update_hoster_progress
from plugins.tff_backend.models.hoster import NodeOrder, NodeOrderStatus
from plugins.tff_backend.plugin_consts import NAMESPACE
from plugins.tff_backend.utils.app import get_app_user_tuple


def get_node_status(node_id):
    cfg = get_config(NAMESPACE)
    jwt = refresh_jwt(cfg.orchestator.jwt, 3600)

    headers = {'Authorization': u"Bearer %s" % jwt}
    result = urlfetch.fetch(url=u"https://orc.threefoldtoken.com/nodes/%s" % node_id, headers=headers, deadline=10)
    status = result.status_code  # type: int
    content = result.content  # type: unicode

    if status == 404:
        return u'not_found'

    if status != 200:
        if 400 <= status < 500:
            exception_class = deferred.PermanentTaskFailure
        else:
            exception_class = Exception
        msg = 'get_node_status returned status code %s for node_id %s\nContent: %s' % (status, node_id, content)
        raise exception_class(msg)

    return json.loads(content)['status']


def check_online_nodes():
    run_job(_get_node_orders, [], check_if_node_comes_online, [])


def _get_node_orders():
    return NodeOrder.list_check_online()


@ndb.transactional()
def check_if_node_comes_online(order_key):
    order = order_key.get()  # type: NodeOrder
    order_id = order.id
    if not order.odoo_sale_order_id:
        raise BusinessException('Cannot check status of node order without odoo_sale_order_id')
    serial_number = get_odoo_serial_number(order.odoo_sale_order_id)
    if not serial_number:
        raise BusinessException('Could not find node serial number for order %s on odoo' % order_id)

    status = get_node_status(serial_number)
    if status == u'running':
        logging.info('Marking node from node order %s as arrived', order_id)
        human_user, app_id = get_app_user_tuple(order.app_user)
        order.populate(arrival_time=now(),
                       status=NodeOrderStatus.ARRIVED)
        order.put()
        deferred.defer(update_hoster_progress, human_user.email(), app_id, HosterSteps.NODE_POWERED,
                       _transactional=True)
    else:
        logging.info('Node from order %s is not online yet', order_id)
