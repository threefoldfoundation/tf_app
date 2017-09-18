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

from google.appengine.ext import deferred

from mcfw.properties import object_factory
from mcfw.rpc import parse_complex_value, serialize_complex_value
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.rogerthat_api.to.friends import ACCEPT_ID, DECLINE_ID
from plugins.rogerthat_api.to.messaging import Message
from plugins.rogerthat_api.to.messaging.flow import FLOW_STEP_MAPPING
from plugins.rogerthat_api.to.messaging.forms import FormResultTO
from plugins.rogerthat_api.to.messaging.service_callback_results import FlowMemberResultCallbackResultTO, \
    FormAcknowledgedCallbackResultTO, SendApiCallCallbackResultTO, MessageAcknowledgedCallbackResultTO
from plugins.rogerthat_api.to.system import RoleTO
from plugins.tff_backend.api.rogerthat.global_stats import api_list_global_stats
from plugins.tff_backend.api.rogerthat.its_you_online import api_iyo_see_list, api_iyo_see_detail
from plugins.tff_backend.api.rogerthat.referrals import api_set_referral
from plugins.tff_backend.bizz.global_stats import ApiCallException
from plugins.tff_backend.bizz.hoster import order_node, order_node_signed, node_arrived
from plugins.tff_backend.bizz.investor import invest, investment_agreement_signed, \
    investment_agreement_signed_by_admin, invest_complete
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
from plugins.tff_backend.bizz.user import user_registered, store_public_key, store_info_in_userdata, \
    is_user_in_roles
from plugins.tff_backend.plugin_consts import THREEFOLD_APP_ID
from plugins.tff_backend.utils import parse_to_human_readable_tag, is_flag_set

TAG_MAPPING = {
    'order_node': order_node,
    'sign_order_node_tos': order_node_signed,
    'node_arrival': node_arrived,
    'invest': invest,
    'invest_complete': invest_complete,
    'sign_investment_agreement': investment_agreement_signed,
    'sign_investment_agreement_admin': investment_agreement_signed_by_admin,
}

API_METHOD_MAPPING = {
    'referrals.set': api_set_referral,
    'global_stats.list': api_list_global_stats,
    'iyo.see.list': api_iyo_see_list,
    'iyo.see.detail': api_iyo_see_detail
}


def log_and_parse_user_details(user_details):
    # type: (dict) -> UserDetailsTO
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


def messaging_update(rt_settings, request_id, status, answer_id, received_timestamp, member, message_key, tag,
                     acked_timestamp, parent_message_key, service_identity, user_details, **kwargs):
    if not is_flag_set(Message.STATUS_ACKED, status):
        return None

    user_details = log_and_parse_user_details(user_details)
    f = TAG_MAPPING.get(parse_to_human_readable_tag(tag))
    if not f:
        return None

    result = f(status, answer_id, received_timestamp, member, message_key, tag, acked_timestamp, parent_message_key,
               service_identity, user_details)
    return result and serialize_complex_value(result, MessageAcknowledgedCallbackResultTO, False, skip_missing=True)


def friend_register(rt_settings, request_id, params, response):
    if response['result'] == DECLINE_ID:
        return

    user_details = log_and_parse_user_details(params['user_details'])
    return user_registered(user_details[0], params['data'])


def friend_invited(rt_settings, request_id, user_details, **kwargs):
    user_details = log_and_parse_user_details(user_details)
    if user_details[0].app_id == THREEFOLD_APP_ID:
        return ACCEPT_ID
    return DECLINE_ID


def friend_update(rt_settings, request_id, user_details, changed_properties, **kwargs):
    if 'public_keys' not in changed_properties:
        return

    user_detail = log_and_parse_user_details(user_details)
    deferred.defer(store_public_key, user_detail)


def friend_invite_result(rt_settings, request_id, params, response):
    user_detail = log_and_parse_user_details(params['user_details'])[0]
    username = get_iyo_username(user_detail)
    if user_detail.public_keys:
        deferred.defer(store_public_key, user_detail)
    deferred.defer(store_info_in_userdata, username, user_detail)


def friend_is_in_roles(rt_settings, request_id, service_identity, user_details, roles, **kwargs):
    user_details = log_and_parse_user_details(user_details)
    roles = parse_complex_value(RoleTO, roles, True)
    return is_user_in_roles(user_details[0], roles)


def system_api_call(rt_settings, request_id, method, params, user_details, **kwargs):
    if method not in API_METHOD_MAPPING:
        logging.warn('Ignoring unknown api call: %s', method)
        return
    user_details = log_and_parse_user_details(user_details)
    response = SendApiCallCallbackResultTO(error=None, result=None)
    try:
        params = json.loads(params) if params else params
        result = API_METHOD_MAPPING[method](params=params, user_detail=user_details[0])
        if result is not None:
            is_list = isinstance(result, list)
            if is_list and result:
                _type = type(result[0])
            else:
                _type = type(result)

            if isinstance(result, unicode):
                response.result = result
            else:
                result = serialize_complex_value(result, _type, is_list)
                response.result = json.dumps(result).decode('utf-8')
    except ApiCallException as e:
        response.error = e.message
    except:
        logging.exception('Unhandled API call exception')
        response.error = u'An unknown error has occurred. Please try again later.'
    return serialize_complex_value(response, SendApiCallCallbackResultTO, False)
