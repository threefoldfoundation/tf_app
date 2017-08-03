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

from mcfw.properties import object_factory
from mcfw.rpc import returns, arguments
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.rogerthat_api.to.messaging import AttachmentTO, Message
from plugins.rogerthat_api.to.messaging.flow import FLOW_STEP_MAPPING
from plugins.rogerthat_api.to.messaging.forms import SignTO, SignFormTO, FormResultTO, FormTO
from plugins.rogerthat_api.to.messaging.service_callback_results import FlowMemberResultCallbackResultTO, TYPE_FORM, \
    FormCallbackResultTypeTO, FormAcknowledgedCallbackResultTO, MessageCallbackResultTypeTO, TYPE_MESSAGE
from plugins.tff_backend.bizz.service import get_main_branding_hash
from plugins.tff_backend.models.hoster import NodeOrder
from plugins.tff_backend.plugin_consts import KEY_NAME, KEY_ALGORITHM
from plugins.tff_backend.utils import get_step_value
from plugins.tff_backend.utils.app import create_app_user_by_email


def now():
    from framework.utils import now as now_
    return now_()


@returns(FlowMemberResultCallbackResultTO)
@arguments(message_flow_run_id=unicode, member=unicode, steps=[object_factory("step_type", FLOW_STEP_MAPPING)],
           end_id=unicode, end_message_flow_id=unicode, parent_message_key=unicode, tag=unicode, result_key=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, service_identity=unicode, user_details=[UserDetailsTO],
           flow_params=unicode)
def order_node(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag, result_key,
               flush_id, flush_message_flow_id, service_identity, user_details, flow_params):

    address = get_step_value(steps, 'message_address')
    name = get_step_value(steps, 'message_name')

    # TODO: IYO SEE
    tos_iyo_see_id = None
    tos_iyo_see_url = u'http://www.rogerthat.net/wp-content/uploads/2012/01/Mobicage_Privacy_Policy.pdf'

    order = NodeOrder()
    order.address = address
    order.app_user = create_app_user_by_email(user_details[0].email, user_details[0].app_id)
    order.tos_iyo_see_id = tos_iyo_see_id
    order.name = name
    order.order_time = now()
    order.status = NodeOrder.STATUS_CREATED
    order.put()

    widget = SignTO()
    widget.algorithm = KEY_ALGORITHM
    widget.caption = u'Please enter your PIN code to digitally sign the terms and conditions'
    widget.key_name = KEY_NAME
    widget.payload = u'TODO'  # TODO: PAYLOAD

    form = SignFormTO()
    form.negative_button = u'Abort'
    form.negative_button_ui_flags = 0
    form.positive_button = u'Accept'
    form.positive_button_ui_flags = Message.UI_FLAG_EXPECT_NEXT_WAIT_5
    form.type = SignTO.TYPE
    form.widget = widget

    attachment = AttachmentTO()
    attachment.content_type = u'application/pdf'
    attachment.download_url = tos_iyo_see_url
    attachment.name = u'Terms and conditions'

    message = FormCallbackResultTypeTO()
    message.alert_flags = Message.ALERT_FLAG_VIBRATE
    message.attachments = [attachment]
    message.branding = get_main_branding_hash()
    message.flags = 0
    message.form = form
    message.message = u'Please review the terms and conditions and press the "Sign" button to accept.'
    message.step_id = u'sign_order_node_tos'
    message.tag = json.dumps({u'__rt__.tag': u'sign_order_node_tos',
                              u'order_id': order.id}).decode('utf-8')

    result = FlowMemberResultCallbackResultTO()
    result.type = TYPE_FORM
    result.value = message
    return result


@returns(FormAcknowledgedCallbackResultTO)
@arguments(status=int, form_result=FormResultTO, answer_id=unicode, member=unicode, message_key=unicode, tag=unicode,
           received_timestamp=int, acked_timestamp=int, parent_message_key=unicode, result_key=unicode,
           service_identity=unicode, user_details=[UserDetailsTO])
def order_node_signed(status, form_result, answer_id, member, message_key, tag, received_timestamp, acked_timestamp,
                      parent_message_key, result_key, service_identity, user_details):

    if answer_id != FormTO.POSITIVE:
        return None

    # signatures[0] : signature of the hash of the payload
    # signatures[1] : signature of the hash of the message + the hash of the payload + the hash of all the attachments
    signatures = form_result.result.get_value()
    message_signature = signatures[1]

    tag_dict = json.loads(tag)
    order = NodeOrder.get_by_id(tag_dict['order_id'])

    # TODO: send signature to IYO see

    order.status = NodeOrder.STATUS_SIGNED
    order.signature = message_signature
    order.sign_time = now()
    order.put()

    message = MessageCallbackResultTypeTO()
    message.alert_flags = Message.ALERT_FLAG_VIBRATE
    message.answers = []
    message.branding = get_main_branding_hash()
    message.dismiss_button_ui_flags = 0
    message.flags = Message.FLAG_ALLOW_DISMISS | Message.FLAG_AUTO_LOCK
    message.message = u'Thank you. Your order has been placed successfully. It has ID "%s".\n\n' \
        u'You can check the status of your order using the "Node status" functionality.' % order.human_readable_id
    message.step_id = u'order_completed'
    message.tag = None

    result = FormAcknowledgedCallbackResultTO()
    result.type = TYPE_MESSAGE
    result.value = message
    return result
