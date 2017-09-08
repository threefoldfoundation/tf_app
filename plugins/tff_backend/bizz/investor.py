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
import httplib
import json
import logging
from types import NoneType

from google.appengine.api import users
from google.appengine.ext import deferred, ndb

from framework.utils import now
from mcfw.exceptions import HttpNotFoundException, HttpBadRequestException
from mcfw.properties import object_factory
from mcfw.rpc import returns, arguments, serialize_complex_value
from plugins.rogerthat_api.api import messaging, system
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.rogerthat_api.to.messaging import Message, AttachmentTO
from plugins.rogerthat_api.to.messaging.flow import FLOW_STEP_MAPPING
from plugins.rogerthat_api.to.messaging.forms import SignTO, SignFormTO, FormResultTO, FormTO, SignWidgetResultTO
from plugins.rogerthat_api.to.messaging.service_callback_results import FormAcknowledgedCallbackResultTO, \
    MessageCallbackResultTypeTO, TYPE_MESSAGE
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.bizz.agreements import create_token_agreement_pdf
from plugins.tff_backend.bizz.authentication import Roles
from plugins.tff_backend.bizz.hoster import get_publickey_label, _create_error_message
from plugins.tff_backend.bizz.ipfs import store_pdf
from plugins.tff_backend.bizz.iyo.see import create_see_document, get_see_document, sign_see_document
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username, get_iyo_organization_id
from plugins.tff_backend.bizz.payment import transfer_genesis_coins_to_user
from plugins.tff_backend.bizz.service import get_main_branding_hash, add_user_to_role
from plugins.tff_backend.bizz.todo import update_investor_progress
from plugins.tff_backend.bizz.todo.investor import InvestorSteps
from plugins.tff_backend.consts.payment import TOKEN_TYPE_B
from plugins.tff_backend.models.investor import InvestmentAgreement
from plugins.tff_backend.plugin_consts import KEY_ALGORITHM, KEY_NAME, THREEFOLD_APP_ID, FULL_CURRENCY_NAMES, \
    CURRENCY_RATES
from plugins.tff_backend.to.investor import InvestmentAgreementTO
from plugins.tff_backend.to.iyo.see import IYOSeeDocumentView, IYOSeeDocumenVersion
from plugins.tff_backend.utils import get_step_value, get_step
from plugins.tff_backend.utils.app import create_app_user_by_email, get_app_user_tuple
from requests.exceptions import HTTPError


@returns()
@arguments(message_flow_run_id=unicode, member=unicode, steps=[object_factory("step_type", FLOW_STEP_MAPPING)],
           end_id=unicode, end_message_flow_id=unicode, parent_message_key=unicode, tag=unicode, result_key=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, service_identity=unicode, user_details=[UserDetailsTO],
           flow_params=unicode)
def invest(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag, result_key,
           flush_id, flush_message_flow_id, service_identity, user_details, flow_params):
    agreement_key = InvestmentAgreement.create_key()
    deferred.defer(_invest, agreement_key, user_details[0].email, user_details[0].app_id, steps, 0)


def _invest(agreement_key, email, app_id, steps, retry_count):
    app_user = create_app_user_by_email(email, app_id)
    logging.info('User %s wants to invest', app_user)

    overview_step = get_step(steps, 'message_overview')
    if overview_step and overview_step.answer_id == u"button_use":
        api_key = get_rogerthat_api_key()
        user_data_keys = ['name', 'billing_address', 'address']
        current_user_data = system.get_user_data(api_key, email, app_id, user_data_keys)
        name = current_user_data['name']
        if current_user_data['billing_address']:
            billing_address = current_user_data['billing_address']
        else:
            billing_address = current_user_data['address']
    else:
        name = get_step_value(steps, 'message_name')
        billing_address = get_step_value(steps, 'message_billing_address')
    currency = get_step_value(steps, 'message_get_currency')
    token_count = int(get_step_value(steps, 'message_get_order_size_ITO'))

    logging.debug('Creating Token agreement')
    pdf_name = 'token_%s.pdf' % agreement_key.id()

    currency_short = currency.replace("_cur", "")
    decimals_after_comma = 8 if currency_short == 'BTC' else 2
    currency_full = FULL_CURRENCY_NAMES[currency_short]
    amount = round(token_count * CURRENCY_RATES[currency_short], decimals_after_comma)

    pdf_contents = create_token_agreement_pdf(name, billing_address, amount, currency_full, currency_short)
    ipfs_link = store_pdf(pdf_name, pdf_contents)
    if not ipfs_link:
        logging.error(u"Failed to create IPFS document with name %s and retry_count %s", pdf_name, retry_count)
        deferred.defer(_invest, agreement_key, email, app_id, steps, retry_count + 1, _countdown=retry_count)
        return

    logging.debug('Storing Investment Agreement in the datastore')

    def trans():
        agreement = InvestmentAgreement(key=agreement_key,
                                        creation_time=now(),
                                        app_user=app_user,
                                        token_count=token_count,
                                        amount=amount,
                                        currency=currency_short,
                                        status=InvestmentAgreement.STATUS_CREATED)
        agreement.put()
        deferred.defer(_create_investment_agreement_iyo_see_doc, agreement_key, app_user, ipfs_link,
                       _transactional=True)

    ndb.transaction(trans)


def _create_investment_agreement_iyo_see_doc(agreement_key, app_user, ipfs_link):
    # type: (ndb.Key, users.User, unicode) -> None
    iyo_username = get_iyo_username(app_user)
    organization_id = get_iyo_organization_id()

    doc_id = u'Internal Token Offering %s' % agreement_key.id()
    doc_category = u'Investment Agreement'
    iyo_see_doc = IYOSeeDocumentView(username=iyo_username,
                                     globalid=organization_id,
                                     uniqueid=doc_id,
                                     version=1,
                                     category=doc_category,
                                     link=ipfs_link,
                                     content_type=u'application/pdf',
                                     markdown_short_description=u'Internal Token Offering - Investment Agreement',
                                     markdown_full_description=u'Internal Token Offering - Investment Agreement')
    logging.debug('Creating IYO SEE document: %s', iyo_see_doc)
    try:
        create_see_document(iyo_username, iyo_see_doc)
    except HTTPError as e:
        if e.response.status_code != httplib.CONFLICT:
            raise e

    attachment_name = u' - '.join([doc_id, doc_category])

    def trans():
        agreement = agreement_key.get()
        agreement.iyo_see_id = doc_id
        agreement.put()
        deferred.defer(_send_ito_agreement_sign_message, agreement.key, app_user, ipfs_link, attachment_name,
                       _transactional=True)

    ndb.transaction(trans)


def _send_ito_agreement_sign_message(agreement_key, app_user, ipfs_link, attachment_name):
    logging.debug('Sending SIGN widget to app user')
    widget = SignTO()
    widget.algorithm = KEY_ALGORITHM
    widget.caption = u'Please enter your PIN code to digitally sign the investment agreement'
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

    member_user, app_id = get_app_user_tuple(app_user)
    messaging.send_form(api_key=get_rogerthat_api_key(),
                        parent_message_key=None,
                        member=member_user.email(),
                        message=u'Please review the investment agreement and press the "Sign" button to accept.',
                        form=form,
                        flags=0,
                        alert_flags=Message.ALERT_FLAG_VIBRATE,
                        branding=get_main_branding_hash(),
                        tag=json.dumps({u'__rt__.tag': u'sign_investment_agreement',
                                        u'agreement_id': agreement_key.id()}).decode('utf-8'),
                        attachments=[attachment],
                        app_id=app_id,
                        step_id=u'sign_investment_agreement')


def _send_ito_agreement_to_admin(agreement_key, admin_app_user):
    logging.debug('Sending SIGN widget to payment admin %s', admin_app_user)

    agreement = agreement_key.get()  # type: InvestmentAgreement
    widget = SignTO()
    widget.algorithm = KEY_ALGORITHM
    widget.caption = u'Sign to mark this investment as paid.'
    widget.key_name = KEY_NAME
    widget.payload = base64.b64encode(str(agreement_key.id())).decode('utf-8')

    form = SignFormTO()
    form.negative_button = u'Abort'
    form.negative_button_ui_flags = 0
    form.positive_button = u'Accept'
    form.positive_button_ui_flags = Message.UI_FLAG_EXPECT_NEXT_WAIT_5
    form.type = SignTO.TYPE
    form.widget = widget

    member_user, app_id = get_app_user_tuple(admin_app_user)
    message = u"""Enter your pin code to mark investment %s as paid.
- from: %s\n
- amount of tokens: %s\n
- amount: %s $
""" % (agreement_key.id(), agreement.iyo_username, agreement.token_count, agreement.amount)

    messaging.send_form(api_key=get_rogerthat_api_key(),
                        parent_message_key=None,
                        member=member_user.email(),
                        message=message,
                        form=form,
                        flags=0,
                        alert_flags=Message.ALERT_FLAG_VIBRATE,
                        branding=get_main_branding_hash(),
                        tag=json.dumps({u'__rt__.tag': u'sign_investment_agreement_admin',
                                        u'agreement_id': agreement_key.id()}).decode('utf-8'),
                        attachments=[],
                        app_id=app_id,
                        step_id=u'sign_investment_agreement_admin')


@returns(FormAcknowledgedCallbackResultTO)
@arguments(status=int, form_result=FormResultTO, answer_id=unicode, member=unicode, message_key=unicode, tag=unicode,
           received_timestamp=int, acked_timestamp=int, parent_message_key=unicode, result_key=unicode,
           service_identity=unicode, user_details=[UserDetailsTO])
def investment_agreement_signed(status, form_result, answer_id, member, message_key, tag, received_timestamp,
                                acked_timestamp, parent_message_key, result_key, service_identity, user_details):
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
        agreement = InvestmentAgreement.create_key(tag_dict['agreement_id']).get()  # type: InvestmentAgreement

        if answer_id != FormTO.POSITIVE:
            logging.info('Investment agreement was canceled')
            agreement.status = InvestmentAgreement.STATUS_CANCELED
            agreement.cancel_time = now()
            agreement.put()
            return None

        logging.info('Received signature for Investment Agreement')

        sign_result = form_result.result.get_value()
        assert isinstance(sign_result, SignWidgetResultTO)
        payload_signature = sign_result.payload_signature

        iyo_organization_id = get_iyo_organization_id()
        iyo_username = get_iyo_username(user_detail)

        logging.debug('Getting IYO SEE document %s', agreement.iyo_see_id)
        doc = get_see_document(iyo_organization_id, iyo_username, agreement.iyo_see_id)
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
        agreement.populate(status=InvestmentAgreement.STATUS_SIGNED,
                           signature=payload_signature,
                           sign_time=now())
        agreement.put()

        # TODO: send mail to TF support
        deferred.defer(add_user_to_role, user_detail, Roles.INVESTOR)
        deferred.defer(update_investor_progress, user_detail.email, user_detail.app_id, InvestorSteps.PAY)

        logging.debug('Sending confirmation message')
        message = MessageCallbackResultTypeTO()
        message.alert_flags = Message.ALERT_FLAG_VIBRATE
        message.answers = []
        message.branding = get_main_branding_hash()
        message.dismiss_button_ui_flags = 0
        message.flags = Message.FLAG_ALLOW_DISMISS | Message.FLAG_AUTO_LOCK
        message.message = u'Thank you. We successfully received your digital signature.' \
                          u' We have stored a copy of this agreement in your ItsYou.Online SEE account.'
        message.step_id = u'investment_agreement_accepted'
        message.tag = None

        result = FormAcknowledgedCallbackResultTO()
        result.type = TYPE_MESSAGE
        result.value = message
        return result
    except:
        logging.exception('An unexpected error occurred')
        return _create_error_message(FormAcknowledgedCallbackResultTO())


@returns(NoneType)
@arguments(status=int, form_result=FormResultTO, answer_id=unicode, member=unicode, message_key=unicode, tag=unicode,
           received_timestamp=int, acked_timestamp=int, parent_message_key=unicode, result_key=unicode,
           service_identity=unicode, user_details=[UserDetailsTO])
def investment_agreement_signed_by_admin(status, form_result, answer_id, member, message_key, tag, received_timestamp,
                                         acked_timestamp, parent_message_key, result_key, service_identity,
                                         user_details):
    tag_dict = json.loads(tag)

    def trans():
        agreement = InvestmentAgreement.create_key(tag_dict['agreement_id']).get()  # type: InvestmentAgreement
        agreement.status = InvestmentAgreement.STATUS_PAID
        agreement.paid_time = now()
        agreement.put()
        user_email, app_id, = get_app_user_tuple(agreement.app_user)
        deferred.defer(transfer_genesis_coins_to_user, agreement.app_user, TOKEN_TYPE_B, agreement.amount,
                       _transactional=True)
        deferred.defer(update_investor_progress, user_email.email(), app_id, InvestorSteps.ASSIGN_TOKENS,
                       _transactional=True)

    ndb.transaction(trans)


@returns(tuple)
@arguments(cursor=unicode, status=(int, long))
def get_investment_agreements(cursor=None, status=None):
    return InvestmentAgreement.fetch_page(cursor, status)


@returns(InvestmentAgreement)
@arguments(agreement_id=(int, long))
def get_investment_agreement(agreement_id):
    agreement = InvestmentAgreement.get_by_id(agreement_id)
    if not agreement:
        raise HttpNotFoundException('investment_agreement_not_found')
    return agreement


@returns(InvestmentAgreement)
@arguments(agreement_id=(int, long), agreement=InvestmentAgreementTO, admin_user=users.User)
def put_investment_agreement(agreement_id, agreement, admin_user):
    admin_app_user = create_app_user_by_email(admin_user.email(), THREEFOLD_APP_ID)
    # type: (long, InvestmentAgreement, users.User) -> InvestmentAgreement
    agreement_model = InvestmentAgreement.get_by_id(agreement_id)  # type: InvestmentAgreement
    if not agreement_model:
        raise HttpNotFoundException('investment_agreement_not_found')
    if agreement_model.status == InvestmentAgreement.STATUS_CANCELED:
        raise HttpBadRequestException('order_canceled')
    if agreement_model.status != InvestmentAgreement.STATUS_SIGNED:
        raise HttpBadRequestException('invalid_status')
    # Only support updating the status for now
    agreement_model.status = agreement.status
    if agreement_model.status == InvestmentAgreement.STATUS_CANCELED:
        agreement_model.cancel_time = now()
    elif agreement_model.status == InvestmentAgreement.STATUS_SIGNED:
        agreement_model.paid_time = now()
        deferred.defer(_send_ito_agreement_to_admin, agreement_model.key, admin_app_user)
    agreement_model.put()
    return agreement_model
