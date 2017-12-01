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
from collections import defaultdict

from google.appengine.api import urlfetch, apiproxy_stub_map
from google.appengine.ext import ndb
from google.appengine.ext.deferred import deferred

from framework.bizz.job import run_job
from framework.plugin_loader import get_config
from framework.utils import now
from mcfw.cache import cached
from mcfw.consts import DEBUG
from mcfw.rpc import returns, arguments
from plugins.its_you_online_auth.bizz.authentication import refresh_jwt
from plugins.rogerthat_api.exceptions import BusinessException
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
from plugins.tff_backend.bizz.odoo import get_node_id_from_odoo
from plugins.tff_backend.bizz.todo import HosterSteps, update_hoster_progress
from plugins.tff_backend.consts.hoster import DEBUG_NODE_DATA
from plugins.tff_backend.models.hoster import NodeOrder, NodeOrderStatus
from plugins.tff_backend.models.user import TffProfile
from plugins.tff_backend.plugin_consts import NAMESPACE
from plugins.tff_backend.utils.app import get_app_user_tuple


@returns(apiproxy_stub_map.UserRPC)
def _orc_call(path):
    # type: (basestring) -> apiproxy_stub_map.UserRPC
    cfg = get_config(NAMESPACE)
    jwt = _refresh_jwt(cfg.orchestator.jwt)
    headers = {'Authorization': u'Bearer %s' % jwt}
    rpc = urlfetch.create_rpc(deadline=30)
    urlfetch.make_fetch_call(rpc, url=u'https://orc.threefoldtoken.com%s' % path, headers=headers)
    return rpc


@cached(1, 3600)
@returns(unicode)
@arguments(jwt=unicode)
def _refresh_jwt(jwt):
    """
        Cached method to refresh JWT only when it's needed (once every hour, at most)
    Returns:
        unicode
    """
    return refresh_jwt(jwt, 3600)


def get_node_status(node_id):
    result = _orc_call('/nodes/%s' % node_id).get_result()  # type: urlfetch._URLFetchResult
    if result.status_code == 404:
        return u'not_found'
    if result.status_code != 200:
        if 400 <= result.status_code < 500:
            exception_class = deferred.PermanentTaskFailure
        else:
            exception_class = Exception
        msg = 'get_node_status returned status code %s for node_id %s\nContent: %s' % (
            result.status_code, node_id, result.content)
        raise exception_class(msg)

    return json.loads(result.content)['status']


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
    node_id = get_node_id_from_odoo(order.odoo_sale_order_id)
    if not node_id:
        raise BusinessException('Could not find node id for sale order %s on odoo' % order_id)

    status = get_node_status(node_id)
    if status == u'running':
        logging.info('Marking node from node order %s as arrived', order_id)
        human_user, app_id = get_app_user_tuple(order.app_user)
        order.populate(arrival_time=now(),
                       status=NodeOrderStatus.ARRIVED)
        order.put()
        deferred.defer(set_node_id_on_profile, order.app_user, node_id, _transactional=True)
        deferred.defer(update_hoster_progress, human_user.email(), app_id, HosterSteps.NODE_POWERED,
                       _transactional=True)
    else:
        logging.info('Node from order %s is not online yet', order_id)


@ndb.transactional(xg=True)
def set_node_id_on_profile(app_user, node_id):
    username = get_iyo_username(app_user)
    profile = TffProfile.create_key(username)
    profile.node_id = node_id
    profile.put()


def get_node_stats(node_id):
    data = {
        'status': None,
        'info': None,
        'stats': None,
    }
    if DEBUG:
        # return _get_stats({'status': {'status': 'halted'}, 'stats': None, 'info': None})
        return _get_stats(DEBUG_NODE_DATA)
    if node_id:
        # Start 3 api calls at the same time and wait for all of them to finish afterwards
        rpcs = [
            _orc_call('/nodes/%s' % node_id),
            _orc_call('/nodes/%s/info' % node_id),
            _orc_call('/nodes/%s/stats' % node_id),
        ]
        results = [rpc.get_result() for rpc in rpcs]
        for i, key in enumerate(data):
            if results[i].status_code == 200:
                data[key] = json.loads(results[i].content)
            else:
                logging.warn('Response from orchestrator: %s %s' % (results[i].status_code, results[i].content))
    return _get_stats(data)


def get_node_id_for_user(app_user):
    for order in NodeOrder.list_by_user(app_user):
        if order.status in (NodeOrderStatus.SENT, NodeOrderStatus.ARRIVED):
            node_id = get_node_id_from_odoo(order.odoo_sale_order_id)
            if node_id:
                return node_id


def _get_stats(data):
    stats = {
        'status': 'halted',
        'bootTime': None,
        'network': {'incoming': [], 'outgoing': []},
        'cpu': {'utilisation': []}
    }
    for key, values in data.iteritems():
        if values:
            if key == 'status':
                stats['status'] = values['status']
            elif key == 'info' and values['bootTime']:
                stats['bootTime'] = values['bootTime']
            elif key == 'stats':
                stats['network'] = {
                    'incoming': values[u'network.throughput.incoming/enp1s0']['history'].get('3600', []),
                    'outgoing': values[u'network.throughput.outgoing/enp1s0']['history'].get('3600', [])
                }
                stats['cpu'] = _get_cpu_stats(values)
    return stats


def _get_cpu_stats(data):
    # Summarize all CPU usages of each core into 1 object
    total_cpu = defaultdict(lambda: {'avg': 0.0, 'count': 0, 'max': 0.0, 'start': 0, 'total': 0.0})
    cpu_count = 0
    for key in data:
        cpu_count += 1
        if key.startswith('machine.CPU.percent'):
            cpu_stats = data[key]['history']['3600']
            for stat_obj in cpu_stats:
                timestamp = stat_obj['start']
                for k in total_cpu[timestamp]:
                    if k == 'start':
                        total_cpu[timestamp][k] = stat_obj[k]
                    else:
                        total_cpu[timestamp][k] += stat_obj[k]
    for timestamp in total_cpu:
        for k in total_cpu[timestamp]:
            if k != 'start':
                total_cpu[timestamp][k] = total_cpu[timestamp][k] / cpu_count
    return {'utilisation': sorted(total_cpu.values(), key=lambda v: v['start'])}
