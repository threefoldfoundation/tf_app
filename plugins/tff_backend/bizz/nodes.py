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
from plugins.its_you_online_auth.models import Profile
from plugins.rogerthat_api.api import system
from plugins.rogerthat_api.exceptions import BusinessException
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
from plugins.tff_backend.bizz.messages import send_message_and_email
from plugins.tff_backend.bizz.odoo import get_nodes_from_odoo
from plugins.tff_backend.bizz.todo import HosterSteps, update_hoster_progress
from plugins.tff_backend.consts.hoster import DEBUG_NODE_DATA
from plugins.tff_backend.models.hoster import NodeOrder, NodeOrderStatus
from plugins.tff_backend.models.user import TffProfile, NodeInfo
from plugins.tff_backend.plugin_consts import NAMESPACE
from plugins.tff_backend.to.nodes import UserNodeStatusTO
from plugins.tff_backend.utils.app import get_app_user_tuple


@returns(apiproxy_stub_map.UserRPC)
def _orc_call(path):
    # type: (basestring) -> apiproxy_stub_map.UserRPC
    cfg = get_config(NAMESPACE)
    try:
        jwt = _refresh_jwt(cfg.orchestator.jwt)
    except:
        msg = 'Could not refresh JWT'
        logging.exception(msg)
        raise deferred.PermanentTaskFailure(msg)
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


def get_nodes_status(node_ids):
    rpcs = []
    for node_id in node_ids:
        rpcs.append(_orc_call('/nodes/%s' % node_id))
    results = [rpc.get_result() for rpc in rpcs]
    for result in results:
        if result.status_code == 404:
            return u'not_found'
        if result.status_code != 200:
            if 400 <= result.status_code < 500:
                exception_class = deferred.PermanentTaskFailure
            else:
                exception_class = Exception
            msg = 'get_nodes_status returned status code %s for node_id %s\nContent: %s' % (
                result.status_code, node_id, result.content)
            raise exception_class(msg)
    return [json.loads(result.content)['status'] for result in results]


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
    nodes = get_nodes_from_odoo(order.odoo_sale_order_id)
    if not nodes:
        raise BusinessException('Could not find nodes for sale order %s on odoo' % order_id)

    statuses = get_nodes_status([n['id'] for n in nodes])
    if all([status == 'running' for status in statuses]):
        logging.info('Marking nodes %s from node order %s as arrived', nodes, order_id)
        human_user, app_id = get_app_user_tuple(order.app_user)
        order.populate(arrival_time=now(),
                       status=NodeOrderStatus.ARRIVED)
        order.put()
        iyo_username = get_iyo_username(order.app_user)
        deferred.defer(add_nodes_to_profile, iyo_username, nodes, _transactional=True)
        deferred.defer(update_hoster_progress, human_user.email(), app_id, HosterSteps.NODE_POWERED,
                       _transactional=True)
    else:
        logging.info('Nodes %s from order %s are not all online yet', nodes, order_id)


@ndb.transactional()
@returns(TffProfile)
@arguments(iyo_username=unicode, nodes=[dict])
def add_nodes_to_profile(iyo_username, nodes):
    profile = TffProfile.create_key(iyo_username).get()
    existing_ids = [n.id for n in profile.nodes]
    for node in nodes:
        if node['id'] not in existing_ids:
            profile.nodes.append(NodeInfo(**node))
    profile.put()
    user, app_id = get_app_user_tuple(profile.app_user)
    data = {'nodes': [n.to_dict() for n in profile.nodes]}
    deferred.defer(system.put_user_data, get_rogerthat_api_key(), user.email(), app_id, data, _transactional=True)
    return profile


def get_nodes_stats(nodes):
    # type: (list[NodeInfo]) -> list[dict]
    if DEBUG:
        return [_get_stats(DEBUG_NODE_DATA)]
    rpcs = []
    # Start all api calls at the same time and wait for all of them to finish afterwards
    for node in nodes:
        if node.status != 'halted':
            logging.info('Getting stats for node %s', node)
            rpcs.extend([
                ('info', node.id, _orc_call('/nodes/%s/info' % node.id)),
                ('stats', node.id, _orc_call('/nodes/%s/stats' % node.id)),
            ])
    results_per_node = {node.id: {'id': node.id,
                                  'status': node.status,
                                  'serial_number': node.serial_number,
                                  'info': None,
                                  'stats': None}
                        for node in nodes}
    for key, node_id, rpc in rpcs:
        result = rpc.get_result()
        if result.status_code == 200:
            results_per_node[node_id][key] = json.loads(result.content)
        else:
            logging.warn('Response from orchestrator: %s %s' % (result.status_code, result.content))
    all_stats = []
    for stats in results_per_node.itervalues():
        all_stats.append(_get_stats(stats))
    return all_stats


def get_nodes_for_user(app_user):
    nodes = []
    for order in NodeOrder.list_by_user(app_user):
        if order.status in (NodeOrderStatus.SENT, NodeOrderStatus.ARRIVED):
            nodes.extend(get_nodes_from_odoo(order.odoo_sale_order_id))
    return nodes


def _get_stats(data):
    node_info = {
        'id': data['id'],
        'serial_number': data['serial_number'],
        'status': data['status'],
        'stats': {
            'bootTime': None,
            'network': {'incoming': [], 'outgoing': []},
            'cpu': {'utilisation': []}
        }
    }
    for key, values in data.iteritems():
        if values:
            stats = node_info['stats']
            if key == 'info' and values['bootTime']:
                stats['bootTime'] = values['bootTime']
            elif key == 'stats':
                stats['network'] = {
                    'incoming': values[u'network.throughput.incoming/enp1s0']['history'].get('3600', []),
                    'outgoing': values[u'network.throughput.outgoing/enp1s0']['history'].get('3600', [])
                }
                stats['cpu'] = _get_cpu_stats(values)
    return node_info


def _get_cpu_stats(data):
    # Summarize all CPU usages of each core into 1 object
    total_cpu = defaultdict(lambda: {'avg': 0.0, 'count': 0, 'max': 0.0, 'start': 0, 'total': 0.0})
    cpu_count = 0
    for key in data:
        cpu_count += 1
        if key.startswith('machine.CPU.percent'):
            cpu_stats = data[key]['history'].get('3600', [])
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


def check_node_statuses():
    result = _orc_call('/nodes').get_result()
    if result.status_code != 200:
        msg = 'check_node_statuses returned status code %s\nContent: %s' % (result.status_code, result.content)
        raise deferred.PermanentTaskFailure(msg)

    statuses = {r['id']: r['status'] for r in json.loads(result.content)}
    run_job(_get_profiles_with_node, [], _check_node_status, [statuses])


def _get_profiles_with_node():
    return TffProfile.list_with_node()


@ndb.transactional()
def _check_node_status(tff_profile_key, statuses):
    try:
        tff_profile = tff_profile_key.get()  # type: TffProfile
        should_update = False
        for node in tff_profile.nodes:
            status = statuses.get(node.id)
            if not status:
                logging.warn('Expected to find node %s in the ORC response', node.id)
                continue
            if node.status != status:
                logging.info('Node %s of user %s changed from status "%s" to "%s"',
                             tff_profile.username, node.id, node.status, status)
                should_update = True
                # Disable until the status doesn't change every 5 minutes, spamming the user with messages
                # from_status = node.status
                node.status = status

                # now = datetime.datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
                # _send_node_status_update_message(tff_profile.app_user, from_status, status, now)

        if should_update:
            tff_profile.put()
            deferred.defer(_put_node_status_user_data, tff_profile_key, _transactional=True)
    except:
        msg = 'Failure in checking node status for %s' % tff_profile_key
        logging.exception(msg, _suppress=False)
        raise deferred.PermanentTaskFailure(msg)


def _put_node_status_user_data(tff_profile_key):
    tff_profile = tff_profile_key.get()
    user, app_id = get_app_user_tuple(tff_profile.app_user)
    data = {'nodes': [n.to_dict() for n in tff_profile.nodes]}
    system.put_user_data(get_rogerthat_api_key(), user.email(), app_id, data)


def _send_node_status_update_message(app_user, from_status, to_status, now):
    if from_status == u'running':
        subject = u'Connection to your node has been lost since %s' % now
        msg = u'Dear ThreeFold Member,\n\n' \
              u'Connection to your node has been lost since %s. Please check the network connection of your node.\n' \
              u'Kind regards,\n' \
              u'The ThreeFold Team' % (now)
    elif to_status == u'running':
        subject = u'Connection to your node has been resumed since %s' % now
        msg = u'Dear ThreeFold Member,\n\n' \
              u'Congratulations! Your node is now successfully connected to our system, and has been resumed since %s.\n' \
              u'Kind regards,\n' \
              u'The ThreeFold Team' % (now)
    else:
        logging.debug(
            "_send_node_status_update_message not sending message for status '%s' => '%s'", from_status, to_status)
        return

    send_message_and_email(app_user, msg, subject)


def list_nodes_by_status(status=None):
    # type: (unicode) -> list[UserNodeStatusTO]
    if status:
        qry = TffProfile.list_by_node_status(status)
    else:
        qry = TffProfile.list_with_node()
    tff_profiles = qry.fetch()  # type: list[TffProfile]
    profiles = {profile.username: profile for profile in
                ndb.get_multi([Profile.create_key(p.username) for p in tff_profiles])}
    results = [UserNodeStatusTO(
        profile=profiles.get(tff_profile.username).to_dict() if tff_profile.username in profiles else None,
        nodes=[node.to_dict() for node in tff_profile.nodes]
    ) for tff_profile in tff_profiles]
    return sorted(results, key=lambda k: k.profile and k.profile['info']['firstname'])
