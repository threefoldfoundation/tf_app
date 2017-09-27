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

from google.appengine.api import users, mail
from google.appengine.ext import ndb, deferred

from framework.plugin_loader import get_config
from framework.utils import now, try_or_defer
from mcfw.exceptions import HttpNotFoundException, HttpBadRequestException
from mcfw.properties import object_factory
from mcfw.rpc import returns, arguments, serialize_complex_value
from plugins.rogerthat_api.api import qr, messaging, system
from plugins.rogerthat_api.to import UserDetailsTO, MemberTO
from plugins.rogerthat_api.to.messaging import AttachmentTO, Message, AnswerTO
from plugins.rogerthat_api.to.messaging.flow import FLOW_STEP_MAPPING
from plugins.rogerthat_api.to.messaging.forms import SignTO, SignFormTO, FormResultTO, FormTO, SignWidgetResultTO
from plugins.rogerthat_api.to.messaging.service_callback_results import FlowMemberResultCallbackResultTO, \
    FormAcknowledgedCallbackResultTO, MessageCallbackResultTypeTO, TYPE_MESSAGE
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.bizz.agreements import create_hosting_agreement_pdf
from plugins.tff_backend.bizz.authentication import Roles
from plugins.tff_backend.bizz.ipfs import store_pdf
from plugins.tff_backend.bizz.iyo.keystore import get_keystore
from plugins.tff_backend.bizz.iyo.see import create_see_document, sign_see_document, get_see_document
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username, get_iyo_organization_id
from plugins.tff_backend.bizz.nodes import get_node_status
from plugins.tff_backend.bizz.odoo import create_odoo_quotation, get_odoo_serial_number, cancel_odoo_quotation
from plugins.tff_backend.bizz.rogerthat import put_user_data
from plugins.tff_backend.bizz.service import get_main_branding_hash, add_user_to_role
from plugins.tff_backend.bizz.todo import update_hoster_progress
from plugins.tff_backend.bizz.todo.hoster import HosterSteps
from plugins.tff_backend.consts.hoster import REQUIRED_TOKEN_COUNT_TO_HOST
from plugins.tff_backend.models.hoster import NodeOrder, PublicKeyMapping, NodeOrderStatus, ContactInfo
from plugins.tff_backend.models.investor import InvestmentAgreement
from plugins.tff_backend.plugin_consts import KEY_NAME, KEY_ALGORITHM, NAMESPACE
from plugins.tff_backend.to.iyo.see import IYOSeeDocumentView, IYOSeeDocumenVersion
from plugins.tff_backend.to.nodes import NodeOrderTO, NodeOrderDetailsTO
from plugins.tff_backend.utils import get_step_value, get_step
from plugins.tff_backend.utils.app import create_app_user_by_email, get_app_user_tuple


@returns()
@arguments(message_flow_run_id=unicode, member=unicode, steps=[object_factory("step_type", FLOW_STEP_MAPPING)],
           end_id=unicode, end_message_flow_id=unicode, parent_message_key=unicode, tag=unicode, result_key=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, service_identity=unicode, user_details=[UserDetailsTO],
           flow_params=unicode)
def order_node(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag, result_key,
               flush_id, flush_message_flow_id, service_identity, user_details, flow_params):
    order_key = NodeOrder.create_key()
    deferred.defer(_order_node, order_key, user_details[0].email, user_details[0].app_id, steps)


def _order_node(order_key, user_email, app_id, steps):
    logging.info('Receiving order of Zero-Node')
    app_user = create_app_user_by_email(user_email, app_id)

    overview_step = get_step(steps, 'message_overview')
    if overview_step and overview_step.answer_id == u"button_use":
        api_key = get_rogerthat_api_key()
        user_data_keys = ['name', 'email', 'phone', 'billing_address', 'address', 'shipping_name', 'shipping_email',
                          'shipping_phone', 'shipping_address']
        user_data = system.get_user_data(api_key, user_email, app_id, user_data_keys)
        billing_info = ContactInfo(name=user_data['name'],
                                   email=user_data['email'],
                                   phone=user_data['phone'],
                                   address=user_data['billing_address'] or user_data['address'])

        if user_data['shipping_name']:
            shipping_info = ContactInfo(name=user_data['shipping_name'],
                                        email=user_data['shipping_email'],
                                        phone=user_data['shipping_phone'],
                                        address=user_data['shipping_address'])
        else:
            shipping_info = billing_info

        updated_user_data = None
    else:
        name = get_step_value(steps, 'message_name')
        email = get_step_value(steps, 'message_email')
        phone = get_step_value(steps, 'message_phone')
        billing_address = get_step_value(steps, 'message_billing_address')
        updated_user_data = {
            'name': name,
            'email': email,
            'phone': phone,
            'billing_address': billing_address,
        }

        billing_info = ContactInfo(name=name,
                                   email=email,
                                   phone=phone,
                                   address=billing_address)

        same_shipping_info_step = get_step(steps, 'message_choose_shipping_info')
        if same_shipping_info_step and same_shipping_info_step.answer_id == u"button_yes":
            shipping_info = billing_info
        else:
            shipping_name = get_step_value(steps, 'message_shipping_name')
            shipping_email = get_step_value(steps, 'message_shipping_email')
            shipping_phone = get_step_value(steps, 'message_shipping_phone')
            shipping_address = get_step_value(steps, 'message_shipping_address')
            updated_user_data.update({
                'shipping_name': shipping_name,
                'shipping_email': shipping_email,
                'shipping_phone': shipping_phone,
                'shipping_address': shipping_address,
            })

            shipping_info = ContactInfo(name=shipping_name,
                                        email=shipping_email,
                                        phone=shipping_phone,
                                        address=shipping_address)

    # Check if user has invested >= 120 tokens
    paid_orders = InvestmentAgreement.list_by_status_and_user(app_user, InvestmentAgreement.STATUS_PAID)
    total_tokens = sum([o.token_count for o in paid_orders])
    can_host = total_tokens >= REQUIRED_TOKEN_COUNT_TO_HOST
    if can_host:
        # Check if user has no previous node order. If so, send message stating that.
        active_orders = [o for o in NodeOrder.list_by_user(app_user) if o.status != NodeOrderStatus.CANCELED]
        can_host = len(active_orders) == 0
        if not can_host:
            logging.info('User already has a node order, sending abort message')
            member_user, app_id = get_app_user_tuple(app_user)
            msg = u'Dear ThreeFold Member, we sadly cannot grant your request to host an additional ThreeFold Node:' \
                  u' We are currently only allowing one Node to be hosted per ThreeFold Member and location.' \
                  u' This will allow us to build a bigger base and a more diverse Grid.'
            messaging.send(api_key=get_rogerthat_api_key(),
                           parent_message_key=None,
                           members=[MemberTO(member=member_user.email(), app_id=app_id, alert_flags=0)],
                           message=msg,
                           answers=[
                               AnswerTO(id='ok', caption='Ok', action=None, type='button', ui_flags=0, color=None)],
                           flags=Message.FLAG_AUTO_LOCK,
                           alert_flags=Message.ALERT_FLAG_VIBRATE,
                           branding=get_main_branding_hash(),
                           tag='no_multiple_node_orders_allowed')
            return

    def trans():
        logging.debug('Storing order in the database')
        order = NodeOrder(key=order_key,
                          app_user=app_user,
                          tos_iyo_see_id=None,
                          billing_info=billing_info,
                          shipping_info=shipping_info,
                          order_time=now(),
                          status=NodeOrderStatus.APPROVED if can_host else NodeOrderStatus.WAITING_APPROVAL)
        order.put()
        if can_host:
            logging.info('User has invested more than %s tokens, immediately creating node order PDF.',
                         REQUIRED_TOKEN_COUNT_TO_HOST)
            deferred.defer(_create_node_order_pdf, order_key.id(), _transactional=True)
        else:
            logging.info('User has not invested more than %s tokens, an admin needs to approve this order manually.',
                         REQUIRED_TOKEN_COUNT_TO_HOST)
            deferred.defer(_inform_support_of_new_node_order, order_key.id(), _transactional=True)
        if updated_user_data:
            deferred.defer(put_user_data, app_user, updated_user_data, _transactional=True)

    ndb.transaction(trans)


def _create_node_order_pdf(node_order_id, retry_count=0):
    """
    Creates node order PDF on IPFS and sends it to
    Args:
        node_order_id (long)
        retry_count (long)
    """
    node_order = get_node_order(node_order_id)
    user_email, app_id = get_app_user_tuple(node_order.app_user)
    logging.debug('Creating Hosting agreement')
    pdf_name = 'node_%s.pdf' % node_order_id
    pdf_contents = create_hosting_agreement_pdf(node_order.billing_info.name, node_order.billing_info.address)
    ipfs_link = store_pdf(pdf_name, pdf_contents)
    if not ipfs_link:
        retry_count += 1
        logging.info('Retrying creating IPFS PDF after %s tries', retry_count)
        deferred.defer(_create_node_order_pdf, node_order_id, _countdown=retry_count)
        return
    deferred.defer(_create_order_arrival_qr, node_order_id)
    deferred.defer(_order_node_iyo_see, node_order.app_user, node_order_id, ipfs_link)
    deferred.defer(update_hoster_progress, user_email.email(), app_id, HosterSteps.FLOW_ADDRESS)


def _order_node_iyo_see(app_user, node_order_id, ipfs_link):
    iyo_username = get_iyo_username(app_user)
    organization_id = get_iyo_organization_id()

    iyo_see_doc = IYOSeeDocumentView(username=iyo_username,
                                     globalid=organization_id,
                                     uniqueid=u'Zero-Node order %s' % NodeOrder.create_human_readable_id(node_order_id),
                                     version=1,
                                     category=u'Terms and conditions',
                                     link=ipfs_link,
                                     content_type=u'application/pdf',
                                     markdown_short_description=u'Terms and conditions for ordering a Zero-Node',
                                     markdown_full_description=u'Terms and conditions for ordering a Zero-Node')
    logging.debug('Creating IYO SEE document: %s', iyo_see_doc)
    iyo_see_doc = create_see_document(iyo_username, iyo_see_doc)

    attachment_name = u' - '.join([iyo_see_doc.uniqueid, iyo_see_doc.category])

    def trans():
        order = get_node_order(node_order_id)
        order.tos_iyo_see_id = iyo_see_doc.uniqueid
        order.put()
        deferred.defer(_create_quotation, app_user, node_order_id, ipfs_link, attachment_name,
                       _transactional=True)

    ndb.transaction(trans)


@returns()
@arguments(app_user=users.User, order_id=(int, long), ipfs_link=unicode, attachment_name=unicode)
def _create_quotation(app_user, order_id, ipfs_link, attachment_name):
    def trans():
        order = NodeOrder.get_by_id(order_id)

        odoo_sale_order_id, odoo_sale_order_name = create_odoo_quotation(order.billing_info, order.shipping_info)

        order.odoo_sale_order_id = odoo_sale_order_id
        order.put()

        deferred.defer(_send_order_node_sign_message, app_user, order_id, ipfs_link, attachment_name,
                       odoo_sale_order_name, _transactional=True)

    ndb.transaction(trans)
    

@returns()
@arguments(order_id=(int, long))
def _cancel_quotation(order_id):
    def trans():
        node_order = get_node_order(order_id)
        if node_order.odoo_sale_order_id:
            cancel_odoo_quotation(node_order.odoo_sale_order_id)

        node_order.populate(status=NodeOrderStatus.CANCELED, cancel_time=now())
        node_order.put()

    ndb.transaction(trans)


@returns()
@arguments(app_user=users.User, order_id=(int, long), ipfs_link=unicode, attachment_name=unicode, order_name=unicode)
def _send_order_node_sign_message(app_user, order_id, ipfs_link, attachment_name, order_name):
    logging.debug('Sending SIGN widget to app user')
    widget = SignTO()
    widget.algorithm = KEY_ALGORITHM
    widget.caption = u'Please enter your PIN code to digitally sign the terms and conditions'
    widget.key_name = KEY_NAME
    widget.payload = base64.b64encode(ipfs_link).decode('utf-8')

    form = SignFormTO()
    form.negative_button = u'Abort'
    form.negative_button_ui_flags = 0
    form.positive_button = u'Accept'
    form.positive_button_ui_flags = Message.UI_FLAG_EXPECT_NEXT_WAIT_5
    form.type = SignTO.TYPE
    form.widget = widget

    attachment = AttachmentTO()
    attachment.content_type = u'application/pdf'
    attachment.download_url = ipfs_link
    attachment.name = attachment_name
    message = u"""Order %(order_name)s Received

You have now been approved for hosting duties!
We will keep you updated of the Node shipping process through the app.

Please review the terms and conditions and press the "Sign" button to accept.
""" % {"order_name": order_name}

    member_user, app_id = get_app_user_tuple(app_user)
    messaging.send_form(api_key=get_rogerthat_api_key(),
                        parent_message_key=None,
                        member=member_user.email(),
                        message=message,
                        form=form,
                        flags=0,
                        alert_flags=Message.ALERT_FLAG_VIBRATE,
                        branding=get_main_branding_hash(),
                        tag=json.dumps({u'__rt__.tag': u'sign_order_node_tos',
                                        u'order_id': order_id}).decode('utf-8'),
                        attachments=[attachment],
                        app_id=app_id,
                        step_id=u'sign_order_node_tos')


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
        user_detail = user_details[0]
        tag_dict = json.loads(tag)
        order = get_node_order(tag_dict['order_id'])

        if answer_id != FormTO.POSITIVE:
            logging.info('Zero-Node order was canceled')
            deferred.defer(_cancel_quotation, order.id)
            return None

        logging.info('Received signature for Zero-Node order')

        sign_result = form_result.result.get_value()
        assert isinstance(sign_result, SignWidgetResultTO)
        payload_signature = sign_result.payload_signature

        iyo_organization_id = get_iyo_organization_id()
        iyo_username = get_iyo_username(user_detail)

        logging.debug('Getting IYO SEE document %s', order.tos_iyo_see_id)
        doc = get_see_document(iyo_organization_id, iyo_username, order.tos_iyo_see_id)
        doc_view = IYOSeeDocumentView(username=doc.username,
                                      globalid=doc.globalid,
                                      uniqueid=doc.uniqueid,
                                      **serialize_complex_value(doc.versions[-1], IYOSeeDocumenVersion, False))
        doc_view.signature = payload_signature
        keystore_label = get_publickey_label(sign_result.public_key.public_key, user_detail)
        if not keystore_label:
            return _create_error_message(FormAcknowledgedCallbackResultTO())
        doc_view.keystore_label = keystore_label
        logging.debug('Signing IYO SEE document')
        sign_see_document(iyo_organization_id, iyo_username, doc_view)

        logging.debug('Storing signature in DB')
        order.populate(status=NodeOrderStatus.SIGNED,
                       signature=payload_signature,
                       sign_time=now())
        order.put()

        # TODO: send mail to TF support
        deferred.defer(add_user_to_role, user_detail, Roles.HOSTERS)
        deferred.defer(update_hoster_progress, user_detail.email, user_detail.app_id, HosterSteps.FLOW_SIGN)

        logging.debug('Sending confirmation message')
        message = MessageCallbackResultTypeTO()
        message.alert_flags = Message.ALERT_FLAG_VIBRATE
        message.answers = []
        message.branding = get_main_branding_hash()
        message.dismiss_button_ui_flags = 0
        message.flags = Message.FLAG_ALLOW_DISMISS | Message.FLAG_AUTO_LOCK
        message.message = u'Thank you. We successfully received your digital signature.' \
                          u' We have stored a copy of this agreement in your ItsYou.Online SEE account.\n\n' \
                          u'Your order with ID "%s" has been placed successfully.\n' % order.human_readable_id
        message.step_id = u'order_completed'
        message.tag = None

        result = FormAcknowledgedCallbackResultTO()
        result.type = TYPE_MESSAGE
        result.value = message
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
        iyo_keys = get_keystore(get_iyo_username(user_details))
        results = filter(lambda k: public_key in k.key, iyo_keys)  # some stuff is prepended to the key
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
    order = get_node_order(order_id)
    order.arrival_qr_code_url = qr_image_uri
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


@returns(tuple)
@arguments(cursor=unicode, status=(int, long))
def get_node_orders(cursor=None, status=None):
    return NodeOrder.fetch_page(cursor, status)


@returns(NodeOrder)
@arguments(order_id=(int, long))
def get_node_order(order_id):
    # type: (int) -> NodeOrder
    order = NodeOrder.get_by_id(order_id)
    if not order:
        raise HttpNotFoundException('order_not_found')
    return order


@returns(NodeOrderDetailsTO)
@arguments(order_id=(int, long))
def get_node_order_details(order_id):
    node_order = get_node_order(order_id)
    if node_order.tos_iyo_see_id:
        iyo_organization_id = get_iyo_organization_id()
        username = get_iyo_username(node_order.app_user)
        see_document = get_see_document(iyo_organization_id, username, node_order.tos_iyo_see_id)
    else:
        see_document = None
    return NodeOrderDetailsTO.from_model(node_order, see_document)


@returns(NodeOrder)
@arguments(order_id=(int, long), order=NodeOrderTO)
def put_node_order(order_id, order):
    # type: (long, NodeOrderTO) -> NodeOrder
    order_model = get_node_order(order_id)
    if order_model.status == NodeOrderStatus.CANCELED:
        raise HttpBadRequestException('order_canceled')
    if order.status not in (NodeOrderStatus.CANCELED, NodeOrderStatus.SENT, NodeOrderStatus.APPROVED):
        raise HttpBadRequestException('invalid_status')
    # Only support updating the status for now
    if order_model.status != order.status:
        order_model.status = order.status
        human_user, app_id = get_app_user_tuple(order_model.app_user)
        if order_model.status == NodeOrderStatus.CANCELED:
            order_model.cancel_time = now()
            if order_model.odoo_sale_order_id:
                deferred.defer(cancel_odoo_quotation, order_model.odoo_sale_order_id)
            deferred.defer(update_hoster_progress, human_user.email(), app_id, HosterSteps.NODE_POWERED) # nuke todo list
        elif order_model.status == NodeOrderStatus.SENT:
            order_model.send_time = now()
            deferred.defer(update_hoster_progress, human_user.email(), app_id, HosterSteps.NODE_SENT)
            deferred.defer(check_if_node_comes_online, order_id, _countdown=12 * 60 * 60)
        elif order_model.status == NodeOrderStatus.APPROVED:
            deferred.defer(_create_node_order_pdf, order_id)
    else:
        logging.debug('Status was already %s, not doing anything', order_model.status)

    order_model.put()
    return order_model


@returns()
@arguments(tag=unicode, arrival_time=(int, long))
def _store_order_arrival(tag, arrival_time):
    tag_dict = json.loads(tag)
    order_id = tag_dict['order_id']
    logging.info('Marking order %s as arrived', order_id)
    order = get_node_order(order_id)  # type: NodeOrder
    order.arrival_time = arrival_time
    order.status = NodeOrderStatus.ARRIVED
    order.put()

    human_user, app_id = get_app_user_tuple(order.app_user)
    deferred.defer(update_hoster_progress, human_user.email(), app_id, HosterSteps.NODE_DELIVERY_CONFIRMED)


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


def check_if_node_comes_online(order_id):
    order = get_node_order(order_id)
    if not order.odoo_sale_order_id:
        logging.warn("check_if_node_comes_online failed odoo quotation was not found")
        deferred.defer(check_if_node_comes_online, order_id, _countdown=12 * 60 * 60)
        return

    serial_number = get_odoo_serial_number(order.odoo_sale_order_id)
    if not serial_number:
        logging.warn("check_if_node_comes_online failed odoo serial_number was not found")
        deferred.defer(check_if_node_comes_online, order_id, _countdown=12 * 60 * 60)
        return

    status = get_node_status(serial_number)
    if status and status == u"running":
        human_user, app_id = get_app_user_tuple(order.app_user)
        deferred.defer(update_hoster_progress, human_user.email(), app_id, HosterSteps.NODE_POWERED)
    else:
        deferred.defer(check_if_node_comes_online, order_id, _countdown=1 * 60 * 60)


@returns()
@arguments(email=unicode, app_id=unicode, order_id=(int, long))
def send_payment_instructions(email, app_id, order_id):
    """Currently unused since node orders are free"""
    order = get_node_order(order_id)

    message = u"""Please use the following transfer details
Amount: USD 600 - Bank : Mashreq Bank - IBAN : AE230330000019120028156 - BIC : BOMLAEAD

For the attention of Green IT Globe Holdings FZC, a company incorporated under the laws of Sharjah, United Arab Emirates, with registered office at SAIF Zone, SAIF Desk Q1-07-038/B
Please use the SO%(order_id)s as reference.
""" % {"order_id": order.odoo_sale_order_id}

    member = MemberTO()
    member.member = email
    member.app_id = app_id
    member.alert_flags = Message.ALERT_FLAG_VIBRATE

    messaging.send(api_key=get_rogerthat_api_key(),
                   parent_message_key=None,
                   message=message,
                   answers=[],
                   flags=0,
                   members=[member],
                   branding=get_main_branding_hash(),
                   tag=None)


def _inform_support_of_new_node_order(node_order_id):
    node_order = get_node_order(node_order_id)
    cfg = get_config(NAMESPACE)
    iyo_username = get_iyo_username(node_order.app_user)

    subject = 'New Node Order by %s' % node_order.billing_info.name
    body = """Hello,

We just received a new Node order from %(name)s (IYO username %(iyo_username)s) with id %(node_order_id)s.
This order needs to be manually approved since this user has not invested more than %(min_tokens)s tokens yet via the app.
Check the old investment agreements to verify if this user can sign up as a hoster and if not, contact him.

Please visit https://tff-backend.appspot.com/orders/%(node_order_id)s to approve or cancel this order.
""" % {
        'name': node_order.billing_info.name,
        'iyo_username': iyo_username,
        'node_order_id': node_order.id,
        'min_tokens': REQUIRED_TOKEN_COUNT_TO_HOST
    }

    for email in cfg.investor.support_emails:
        mail.send_mail(sender='no-reply@tff-backend.appspotmail.com',
                       to=email,
                       subject=subject,
                       body=body)
