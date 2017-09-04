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

from framework.utils import try_or_defer
from mcfw.properties import object_factory
from mcfw.rpc import parse_complex_value, serialize_complex_value
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.rogerthat_api.to.friends import ACCEPT_ID, DECLINE_ID
from plugins.rogerthat_api.to.messaging import Message
from plugins.rogerthat_api.to.messaging.flow import FLOW_STEP_MAPPING
from plugins.rogerthat_api.to.messaging.forms import FormResultTO
from plugins.rogerthat_api.to.messaging.service_callback_results import FlowMemberResultCallbackResultTO, \
    FormAcknowledgedCallbackResultTO
from plugins.rogerthat_api.to.system import RoleTO
from plugins.tff_backend.bizz.hoster import order_node, order_node_signed, node_arrived
from plugins.tff_backend.bizz.investor import invest, investment_agreement_signed
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
from plugins.tff_backend.bizz.user import user_registered, store_public_key, store_iyo_info_in_userdata, \
    is_user_in_roles
from plugins.tff_backend.utils import parse_to_human_readable_tag, is_flag_set

TAG_MAPPING = {'order_node': order_node,
               'sign_order_node_tos': order_node_signed,
               'node_arrival': node_arrived,
               'invest': invest,
               'sign_investment_agreement': investment_agreement_signed,
               }


def log_and_parse_user_details(user_details):
    is_list = isinstance(user_details, list)
    user_detail = user_details[0] if is_list else user_details
    logging.debug('Current user: %(email)s:%(app_id)s', user_detail)
    return parse_complex_value(UserDetailsTO, user_details, is_list)


def flow_member_result(rt_settings, request_id, message_flow_run_id, member, steps, end_id, end_message_flow_id,
                       parent_message_key, tag, result_key, flush_id, flush_message_flow_id, service_identity,
                       user_details, flow_params, **kwargs):
    user_details = log_and_parse_user_details(user_details)
    steps = parse_complex_value(object_factory("step_type", FLOW_STEP_MAPPING), steps, True)

    f = TAG_MAPPING.get(parse_to_human_readable_tag(tag))
    if not f:
        return None

    result = f(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag, result_key,
               flush_id, flush_message_flow_id, service_identity, user_details, flow_params)

    return result and serialize_complex_value(result, FlowMemberResultCallbackResultTO, False, skip_missing=True)


def form_update(rt_settings, request_id, status, form_result, answer_id, member, message_key, tag, received_timestamp,
                acked_timestamp, parent_message_key, result_key, service_identity, user_details, **kwargs):
    if not is_flag_set(Message.STATUS_ACKED, status):
        return None

    user_details = log_and_parse_user_details(user_details)
    form_result = parse_complex_value(FormResultTO, form_result, False)

    f = TAG_MAPPING.get(parse_to_human_readable_tag(tag))
    if not f:
        return None

    result = f(status, form_result, answer_id, member, message_key, tag, received_timestamp, acked_timestamp,
               parent_message_key, result_key, service_identity, user_details)
    return result and serialize_complex_value(result, FormAcknowledgedCallbackResultTO, False, skip_missing=True)


def friend_register(rt_settings, request_id, params, response):
    if response['result'] == DECLINE_ID:
        return

    user_details = log_and_parse_user_details(params['user_details'])
    return user_registered(user_details[0], params['data'])


def friend_invite(rt_settings, request_id, user_details, **kwargs):
    return ACCEPT_ID


def friend_update(rt_settings, request_id, user_details, changed_properties, **kwargs):
    if 'public_keys' not in changed_properties:
        return

    user_detail = log_and_parse_user_details(user_details)
    try_or_defer(store_public_key, user_detail)


def friend_invite_result(rt_settings, request_id, params, response):
    user_detail = log_and_parse_user_details(params['user_details'])[0]
    username = get_iyo_username(user_detail)
    if user_detail.public_keys:
        try_or_defer(store_public_key, user_detail)
    try_or_defer(store_iyo_info_in_userdata, username, user_detail)


def friend_is_in_roles(rt_settings, request_id, service_identity, user_details, roles, **kwargs):
    user_details = log_and_parse_user_details(user_details)
    roles = parse_complex_value(RoleTO, roles, True)
    return is_user_in_roles(user_details[0], roles)
