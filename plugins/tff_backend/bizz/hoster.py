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
import base64
import json
import logging

from google.appengine.ext import ndb, deferred

from framework.plugin_loader import get_config
from framework.utils import now, try_or_defer
from mcfw.properties import object_factory
from mcfw.rpc import returns, arguments, serialize_complex_value
from plugins.rogerthat_api.api import qr
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.rogerthat_api.to.messaging import AttachmentTO, Message
from plugins.rogerthat_api.to.messaging.flow import FLOW_STEP_MAPPING
from plugins.rogerthat_api.to.messaging.forms import SignTO, SignFormTO, FormResultTO, FormTO, SignWidgetResultTO
from plugins.rogerthat_api.to.messaging.service_callback_results import FlowMemberResultCallbackResultTO, TYPE_FORM, \
    FormCallbackResultTypeTO, FormAcknowledgedCallbackResultTO, MessageCallbackResultTypeTO, TYPE_MESSAGE
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.bizz.iyo.keystore import get_keystore
from plugins.tff_backend.bizz.iyo.see import create_see_document, sign_see_document, get_see_document
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username, get_iyo_organization_id
from plugins.tff_backend.bizz.service import get_main_branding_hash
from plugins.tff_backend.models.hoster import NodeOrder, PublicKeyMapping
from plugins.tff_backend.plugin_consts import KEY_NAME, KEY_ALGORITHM, NAMESPACE
from plugins.tff_backend.to.iyo.see import IYOSeeDocumentView, IYOSeeDocumenVersion
from plugins.tff_backend.utils import get_step_value
from plugins.tff_backend.utils.app import create_app_user_by_email


@returns(FlowMemberResultCallbackResultTO)
@arguments(message_flow_run_id=unicode, member=unicode, steps=[object_factory("step_type", FLOW_STEP_MAPPING)],
           end_id=unicode, end_message_flow_id=unicode, parent_message_key=unicode, tag=unicode, result_key=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, service_identity=unicode, user_details=[UserDetailsTO],
           flow_params=unicode)
def order_node(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag, result_key,
               flush_id, flush_message_flow_id, service_identity, user_details, flow_params):
    try:
        logging.info('Receiving order of Zero-Node')

        address = get_step_value(steps, 'message_address')
        name = get_step_value(steps, 'message_name')

        order_key = NodeOrder.create_key()

        cfg = get_config(NAMESPACE)
        iyo_username = get_iyo_username(user_details[0])
        organization_id = get_iyo_organization_id()

        iyo_see_doc = IYOSeeDocumentView(username=iyo_username,
                                         globalid=organization_id,
                                         uniqueid=u'Zero-Node order %s' % NodeOrder.create_human_readable_id(
                                             order_key.id()),
                                         version=1,
                                         category=u'Terms and conditions',
                                         link=cfg.tos.order_node,
                                         content_type=u'application/pdf',
                                         markdown_short_description=u'Terms and conditions for ordering a Zero-Node',
                                         markdown_full_description=u'Terms and conditions for ordering a Zero-Node')
        logging.debug('Creating IYO SEE document: %s', iyo_see_doc)
        iyo_see_doc = create_see_document(iyo_username, iyo_see_doc)

        logging.debug('Storing order in the database')

        def trans():
            order = NodeOrder(key=order_key,
                              address=address,
                              app_user=create_app_user_by_email(user_details[0].email, user_details[0].app_id),
                              tos_iyo_see_id=iyo_see_doc.uniqueid,
                              name=name,
                              order_time=now(),
                              status=NodeOrder.STATUS_CREATED)
            order.put()
            deferred.defer(_create_order_arrival_qr, order.id, _transactional=True)
            return order

        order = ndb.transaction(trans)

        logging.debug('Sending SIGN widget to app user')
        widget = SignTO()
        widget.algorithm = KEY_ALGORITHM
        widget.caption = u'Please enter your PIN code to digitally sign the terms and conditions'
        widget.key_name = KEY_NAME
        widget.payload = base64.b64encode(cfg.tos.order_node).decode('utf-8')

        form = SignFormTO()
        form.negative_button = u'Abort'
        form.negative_button_ui_flags = 0
        form.positive_button = u'Accept'
        form.positive_button_ui_flags = Message.UI_FLAG_EXPECT_NEXT_WAIT_5
        form.type = SignTO.TYPE
        form.widget = widget

        attachment = AttachmentTO()
        attachment.content_type = u'application/pdf'
        attachment.download_url = iyo_see_doc.link
        attachment.name = u' - '.join([iyo_see_doc.uniqueid, iyo_see_doc.category])

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
    except:
        logging.exception('An unexpected error occurred')
        return _create_error_message(FlowMemberResultCallbackResultTO())


@returns(FormAcknowledgedCallbackResultTO)
@arguments(status=int, form_result=FormResultTO, answer_id=unicode, member=unicode, message_key=unicode, tag=unicode,
           received_timestamp=int, acked_timestamp=int, parent_message_key=unicode, result_key=unicode,
           service_identity=unicode, user_details=[UserDetailsTO])
def order_node_signed(status, form_result, answer_id, member, message_key, tag, received_timestamp, acked_timestamp,
                      parent_message_key, result_key, service_identity, user_details):
    """
    Args:
        status (int)
        form_result (FormResultTO)
        answer_id (unicode)
        member (unicode)
        message_key (unicode)
        tag (unicode)
        received_timestamp (int)
        acked_timestamp (int)
        parent_message_key (unicode)
        result_key (unicode)
        service_identity (unicode)
        user_details(list[UserDetailsTO])

    Returns:
        FormAcknowledgedCallbackResultTO
    """
    try:
        tag_dict = json.loads(tag)
        order = NodeOrder.create_key(tag_dict['order_id']).get()  # type: NodeOrder

        if answer_id != FormTO.POSITIVE:
            logging.info('Zero-Node order was canceled')
            order.status = NodeOrder.STATUS_CANCELED
            order.cancel_time = now()
            order.put()
            return None

        logging.info('Received signature for Zero-Node order')

        sign_result = form_result.result.get_value()
        assert isinstance(sign_result, SignWidgetResultTO)
        message_signature = sign_result.payload_signature

        iyo_organization_id = get_iyo_organization_id()
        iyo_username = get_iyo_username(user_details[0])

        logging.debug('Getting IYO SEE document %s', order.tos_iyo_see_id)
        doc = get_see_document(iyo_organization_id, iyo_username, order.tos_iyo_see_id)
        doc_view = IYOSeeDocumentView(username=doc.username,
                                      globalid=doc.globalid,
                                      uniqueid=doc.uniqueid,
                                      **serialize_complex_value(doc.versions[-1], IYOSeeDocumenVersion, False))
        doc_view.signature = message_signature
        keystore_label = get_publickey_label(sign_result.public_key.public_key, user_details[0])
        if not keystore_label:
            return _create_error_message(FormAcknowledgedCallbackResultTO())
        doc_view.keystore_label = keystore_label
        logging.debug('Signing IYO SEE document')
        sign_see_document(iyo_organization_id, iyo_username, doc_view)

        logging.debug('Storing signature in DB')
        order.populate(status=NodeOrder.STATUS_SIGNED,
                       signature=message_signature,
                       sign_time=now())
        order.put()

        # TODO: send mail to TF support

        logging.debug('Sending confirmation message')
        message = MessageCallbackResultTypeTO()
        message.alert_flags = Message.ALERT_FLAG_VIBRATE
        message.answers = []
        message.branding = get_main_branding_hash()
        message.dismiss_button_ui_flags = 0
        message.flags = Message.FLAG_ALLOW_DISMISS | Message.FLAG_AUTO_LOCK
        message.message = u'Thank you. Your order with ID "%s" has been placed successfully.\n\n' \
                          u'You can check the status of your order using' \
                          u' the "Node status" functionality.' % order.human_readable_id
        message.step_id = u'order_completed'
        message.tag = None

        result = FormAcknowledgedCallbackResultTO()
        result.type = TYPE_MESSAGE
        result.value = message
        # todo invite to users.hosters organization
        return result
    except:
        logging.exception('An unexpected error occurred')
        return _create_error_message(FormAcknowledgedCallbackResultTO())


def get_publickey_label(public_key, user_details):
    # type: (unicode, UserDetailsTO) -> unicode
    mapping = PublicKeyMapping.create_key(public_key, user_details.email).get()
    if mapping:
        return mapping.label
    else:
        logging.error('No PublicKeyMapping found! falling back to doing a request to itsyou.online')
        keystore = get_keystore(get_iyo_username(user_details))
        results = filter(lambda key: key == public_key, keystore)
        if len(results):
            return results[0].label
        else:
            logging.error('Could not find label for public key %s on itsyou.online', public_key)
            return None



@returns()
@arguments(order_id=(int, long))
def _create_order_arrival_qr(order_id):
    human_readable_id = NodeOrder.create_human_readable_id(order_id)
    api_key = get_rogerthat_api_key()
    qr_details = qr.create(api_key,
                           description=u'Confirm arrival of order\n%s' % human_readable_id,
                           tag=json.dumps({u'__rt__.tag': u'node_arrival',
                                           u'order_id': order_id}),
                           flow=u'node_arrival',
                           branding=get_main_branding_hash())

    try_or_defer(_store_order_arrival_qr, order_id, qr_details.image_uri)


@returns()
@arguments(order_id=(int, long), qr_image_uri=unicode)
def _store_order_arrival_qr(order_id, qr_image_uri):
    logging.info('Setting arrival QR code %s for order %s', qr_image_uri, order_id)
    order = NodeOrder.create_key(order_id).get()
    order.arrival_qr_code = qr_image_uri
    order.put()


@returns(FlowMemberResultCallbackResultTO)
@arguments(message_flow_run_id=unicode, member=unicode, steps=[object_factory("step_type", FLOW_STEP_MAPPING)],
           end_id=unicode, end_message_flow_id=unicode, parent_message_key=unicode, tag=unicode, result_key=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, service_identity=unicode, user_details=[UserDetailsTO],
           flow_params=unicode)
def node_arrived(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag, result_key,
                 flush_id, flush_message_flow_id, service_identity, user_details, flow_params):
    try_or_defer(_store_order_arrival, tag, now())
    return None


@returns([NodeOrder])
@arguments()
def get_node_orders():
    return NodeOrder.list()


@returns()
@arguments(tag=unicode, arrival_time=(int, long))
def _store_order_arrival(tag, arrival_time):
    tag_dict = json.loads(tag)
    order_id = tag_dict['order_id']
    logging.info('Marking order %s as arrived', order_id)
    order = NodeOrder.create_key(order_id).get()
    order.arrival_time = now()
    order.status = NodeOrder.STATUS_ARRIVED
    order.put()


def _create_error_message(callback_result):
    logging.debug('Sending error message')
    message = MessageCallbackResultTypeTO()
    message.alert_flags = Message.ALERT_FLAG_VIBRATE
    message.answers = []
    message.branding = get_main_branding_hash()
    message.dismiss_button_ui_flags = 0
    message.flags = Message.FLAG_ALLOW_DISMISS | Message.FLAG_AUTO_LOCK
    message.message = u'Oh no! An error occurred.\nHow embarrassing :-(\n\nPlease try again later.'
    message.step_id = u'error'
    message.tag = None

    callback_result.type = TYPE_MESSAGE
    callback_result.value = message
    return callback_result
