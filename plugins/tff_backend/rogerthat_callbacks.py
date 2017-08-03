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

from mcfw.properties import object_factory
from mcfw.rpc import parse_complex_value, serialize_complex_value
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.rogerthat_api.to.messaging.flow import FLOW_STEP_MAPPING
from plugins.rogerthat_api.to.messaging.forms import FormResultTO
from plugins.rogerthat_api.to.messaging.service_callback_results import FlowMemberResultCallbackResultTO, \
    FormAcknowledgedCallbackResultTO
from plugins.tff_backend.bizz.hoster import order_node, order_node_signed
from plugins.tff_backend.utils import parse_to_human_readable_tag


TAG_MAPPING = {'order_node': order_node,
               'sign_order_node_tos': order_node_signed,
               }


def flow_member_result(rt_settings, request_id, message_flow_run_id, member, steps, end_id, end_message_flow_id,
                       parent_message_key, tag, result_key, flush_id, flush_message_flow_id, service_identity,
                       user_details, flow_params, **kwargs):

    user_details = parse_complex_value(UserDetailsTO, user_details, True)
    steps = parse_complex_value(object_factory("step_type", FLOW_STEP_MAPPING), steps, True)

    f = TAG_MAPPING.get(parse_to_human_readable_tag(tag))
    if not f:
        return None

    result = f(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag, result_key,
               flush_id, flush_message_flow_id, service_identity, user_details, flow_params)

    return result and serialize_complex_value(result, FlowMemberResultCallbackResultTO, False, skip_missing=True)


def form_update(rt_settings, request_id, status, form_result, answer_id, member, message_key, tag, received_timestamp,
                acked_timestamp, parent_message_key, result_key, service_identity, user_details, **kwargs):

    user_details = parse_complex_value(UserDetailsTO, user_details, True)
    form_result = parse_complex_value(FormResultTO, form_result, False)

    f = TAG_MAPPING.get(parse_to_human_readable_tag(tag))
    if not f:
        return None

    result = f(status, form_result, answer_id, member, message_key, tag, received_timestamp, acked_timestamp,
               parent_message_key, result_key, service_identity, user_details)
    return result and serialize_complex_value(result, FormAcknowledgedCallbackResultTO, False, skip_missing=True)
