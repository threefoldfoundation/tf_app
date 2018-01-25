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

from babel.numbers import get_currency_name
from framework.consts import get_base_url, DAY
from framework.i18n_utils import translate, DEFAULT_LANGUAGE
from framework.plugin_loader import get_config
from framework.utils import now
from mcfw.exceptions import HttpNotFoundException, HttpBadRequestException
from mcfw.properties import object_factory
from mcfw.rpc import returns, arguments, serialize_complex_value
from plugins.rogerthat_api.api import messaging
from plugins.rogerthat_api.exceptions import BusinessException
from plugins.rogerthat_api.to import UserDetailsTO, MemberTO
from plugins.rogerthat_api.to.messaging import Message, AttachmentTO
from plugins.rogerthat_api.to.messaging.flow import FLOW_STEP_MAPPING, FormFlowStepTO
from plugins.rogerthat_api.to.messaging.forms import SignTO, SignFormTO, FormResultTO, FormTO, SignWidgetResultTO
from plugins.rogerthat_api.to.messaging.service_callback_results import FlowMemberResultCallbackResultTO, \
    FlowCallbackResultTypeTO, TYPE_FLOW
from plugins.tff_backend.bizz import get_rogerthat_api_key, intercom_helpers
from plugins.tff_backend.bizz.authentication import RogerthatRoles
from plugins.tff_backend.bizz.email import send_emails_to_support
from plugins.tff_backend.bizz.gcs import upload_to_gcs
from plugins.tff_backend.bizz.global_stats import get_global_stats
from plugins.tff_backend.bizz.hoster import get_publickey_label
from plugins.tff_backend.bizz.intercom_helpers import IntercomTags
from plugins.tff_backend.bizz.iyo.see import create_see_document, get_see_document, sign_see_document
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username, get_iyo_organization_id
from plugins.tff_backend.bizz.kyc.onfido_bizz import get_applicant
from plugins.tff_backend.bizz.kyc.rogerthat_callbacks import kyc_part_1
from plugins.tff_backend.bizz.messages import send_message_and_email
from plugins.tff_backend.bizz.payment import transfer_genesis_coins_to_user
from plugins.tff_backend.bizz.rogerthat import create_error_message
from plugins.tff_backend.bizz.service import get_main_branding_hash, add_user_to_role
from plugins.tff_backend.bizz.todo import update_investor_progress
from plugins.tff_backend.bizz.todo.investor import InvestorSteps
from plugins.tff_backend.bizz.user import user_code, get_tff_profile
from plugins.tff_backend.consts.agreements import BANK_ACCOUNTS, ACCOUNT_NUMBERS
from plugins.tff_backend.consts.kyc import country_choices
from plugins.tff_backend.consts.payment import TOKEN_TFT, TOKEN_ITFT, TokenType
from plugins.tff_backend.dal.investment_agreements import get_investment_agreement
from plugins.tff_backend.models.global_stats import GlobalStats
from plugins.tff_backend.models.investor import InvestmentAgreement
from plugins.tff_backend.models.user import KYCStatus
from plugins.tff_backend.plugin_consts import KEY_ALGORITHM, KEY_NAME, NAMESPACE, \
    SUPPORTED_CRYPTO_CURRENCIES, CRYPTO_CURRENCY_NAMES, BUY_TOKENS_FLOW_V3, BUY_TOKENS_FLOW_V3_PAUSED, BUY_TOKENS_TAG, \
    BUY_TOKENS_FLOW_V3_KYC_MENTION, FLOW_CONFIRM_INVESTMENT, FLOW_INVESTMENT_CONFIRMED, FLOW_SIGN_INVESTMENT
from plugins.tff_backend.to.investor import InvestmentAgreementTO, InvestmentAgreementDetailsTO, \
    CreateInvestmentAgreementTO
from plugins.tff_backend.to.iyo.see import IYOSeeDocumentView, IYOSeeDocumenVersion
from plugins.tff_backend.utils import get_step_value, round_currency_amount, get_key_name_from_key_string
from plugins.tff_backend.utils.app import create_app_user_by_email, get_app_user_tuple
from requests.exceptions import HTTPError

INVESTMENT_TODO_MAPPING = {
    InvestmentAgreement.STATUS_CANCELED: None,
    InvestmentAgreement.STATUS_CREATED: InvestorSteps.FLOW_AMOUNT,
    InvestmentAgreement.STATUS_SIGNED: InvestorSteps.PAY,
    InvestmentAgreement.STATUS_PAID: InvestorSteps.ASSIGN_TOKENS,
}


@returns(FlowMemberResultCallbackResultTO)
@arguments(message_flow_run_id=unicode, member=unicode, steps=[object_factory("step_type", FLOW_STEP_MAPPING)],
           end_id=unicode, end_message_flow_id=unicode, parent_message_key=unicode, tag=unicode, result_key=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, service_identity=unicode, user_details=[UserDetailsTO],
           flow_params=unicode)
def invest_tft(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag, result_key,
               flush_id, flush_message_flow_id, service_identity, user_details, flow_params):
    return invest(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag, result_key,
                  flush_id, flush_message_flow_id, service_identity, user_details, flow_params, TOKEN_TFT)


@returns(FlowMemberResultCallbackResultTO)
@arguments(message_flow_run_id=unicode, member=unicode, steps=[object_factory("step_type", FLOW_STEP_MAPPING)],
           end_id=unicode, end_message_flow_id=unicode, parent_message_key=unicode, tag=unicode, result_key=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, service_identity=unicode, user_details=[UserDetailsTO],
           flow_params=unicode)
def invest_itft(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag, result_key,
                flush_id, flush_message_flow_id, service_identity, user_details, flow_params):
    return invest(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag, result_key,
                  flush_id, flush_message_flow_id, service_identity, user_details, flow_params, TOKEN_ITFT)


@returns(FlowMemberResultCallbackResultTO)
@arguments(message_flow_run_id=unicode, member=unicode, steps=[object_factory("step_type", FLOW_STEP_MAPPING)],
           end_id=unicode, end_message_flow_id=unicode, parent_message_key=unicode, tag=unicode, result_key=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, service_identity=unicode, user_details=[UserDetailsTO],
           flow_params=unicode, token=unicode)
def invest(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag, result_key,
           flush_id, flush_message_flow_id, service_identity, user_details, flow_params, token):
    if flush_id == 'flush_kyc' or flush_id == 'flush_corporation':
        # KYC flow started from within the invest flow
        return kyc_part_1(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag,
                          result_key, flush_id, flush_message_flow_id, service_identity, user_details, flow_params)
    try:
        email = user_details[0].email
        app_id = user_details[0].app_id
        app_user = create_app_user_by_email(email, app_id)
        logging.info('User %s wants to invest', email)
        version = get_key_name_from_key_string(steps[0].message_flow_id)
        currency = get_step_value(steps, 'message_get_currency').replace('_cur', '')
        if version.startswith(BUY_TOKENS_FLOW_V3):
            amount = float(get_step_value(steps, 'message_get_order_size_ITO').replace(',', '.'))
            token_count_float = get_token_count(currency, amount)
        else:
            token_count_float = float(get_step_value(steps, 'message_get_order_size_ITO'))
            amount = get_investment_amount(currency, token_count_float)
        username = get_iyo_username(app_user)
        agreement = _create_investment_agreement(amount, currency, token, token_count_float, username, version,
                                                 app_user, status=InvestmentAgreement.STATUS_CREATED)
        agreement.put()

        if version == BUY_TOKENS_FLOW_V3_PAUSED:
            return None

        deferred.defer(_send_sign_investment_reminder, agreement.id, u'long', _countdown=3600)
        deferred.defer(_send_sign_investment_reminder, agreement.id, u'short', _countdown=3 * DAY)
        deferred.defer(_send_sign_investment_reminder, agreement.id, u'short', _countdown=10 * DAY)

        tag = {
            '__rt__.tag': 'invest_complete',
            'investment_id': agreement.id
        }
        flow_params = {
            'token': agreement.token,
            'amount': agreement.amount,
            'currency': agreement.currency
        }
        result = FlowCallbackResultTypeTO(flow=FLOW_CONFIRM_INVESTMENT,
                                          tag=json.dumps(tag).decode('utf-8'),
                                          force_language=None,
                                          flow_params=json.dumps(flow_params))
        return FlowMemberResultCallbackResultTO(type=TYPE_FLOW, value=result)
    except Exception as e:
        logging.exception(e)
        return create_error_message()


def _create_investment_agreement(amount, currency, token, token_count_float, username, version, app_user, **kwargs):
    tff_profile = get_tff_profile(username)
    applicant = get_applicant(tff_profile.kyc.applicant_id)
    name = '%s %s ' % (applicant.first_name, applicant.last_name)
    address = '%s %s' % (applicant.addresses[0].street, applicant.addresses[0].building_number)
    address += '\n%s %s' % (applicant.addresses[0].postcode, applicant.addresses[0].town)
    country = filter(lambda c: c['value'] == applicant.addresses[0].country, country_choices)[0]['label']
    address += '\n%s' % country
    precision = 2
    reference = user_code(username)
    agreement = InvestmentAgreement(creation_time=now(),
                                    app_user=app_user,
                                    token=token,
                                    amount=amount,
                                    token_count=long(token_count_float * pow(10, precision)),
                                    token_precision=precision,
                                    currency=currency,
                                    name=name,
                                    address=address,
                                    version=version,
                                    reference=reference,
                                    **kwargs)
    return agreement


@returns(InvestmentAgreement)
@arguments(agreement=CreateInvestmentAgreementTO)
def create_investment_agreement(agreement):
    # type: (CreateInvestmentAgreementTO) -> InvestmentAgreement
    app_user = users.User(agreement.app_user)
    username = get_iyo_username(app_user)
    tff_profile = get_tff_profile(username)
    if tff_profile.kyc.status != KYCStatus.VERIFIED:
        raise HttpBadRequestException('cannot_invest_not_kyc_verified')

    token_count_float = get_token_count(agreement.currency, agreement.amount)
    agreement_model = _create_investment_agreement(agreement.amount, agreement.currency, agreement.token,
                                                   token_count_float, username, 'manually_created', app_user,
                                                   status=agreement.status, paid_time=agreement.paid_time,
                                                   sign_time=agreement.sign_time)
    prefix, doc_content_base64 = agreement.document.split(',')
    content_type = prefix.split(';')[0].replace('data:', '')
    doc_content = base64.b64decode(doc_content_base64)
    agreement_model.put()
    pdf_name = InvestmentAgreement.filename(agreement_model.id)
    pdf_url = upload_to_gcs(pdf_name, doc_content, content_type)
    deferred.defer(_create_investment_agreement_iyo_see_doc, agreement_model.key, app_user, pdf_url,
                   content_type, send_sign_message=False, pdf_size=len(doc_content))
    return agreement_model


def get_currency_rate(currency):
    global_stats = GlobalStats.create_key(TOKEN_TFT).get()  # type: GlobalStats
    if currency == 'USD':
        return global_stats.value
    currency_stats = filter(lambda c: c.currency == currency, global_stats.currencies)  # type: list[CurrencyValue]
    if not currency_stats:
        raise BusinessException('No stats are set for currency %s', currency)
    return currency_stats[0].value


def get_investment_amount(currency, token_count):
    # type: (unicode, float) -> float
    return round_currency_amount(currency, get_currency_rate(currency) * token_count)


def get_token_count(currency, amount):
    # type: (unicode, float) -> float
    return amount / get_currency_rate(currency)


@returns()
@arguments(email=unicode, tag=unicode, result_key=unicode, context=unicode, service_identity=unicode,
           user_details=UserDetailsTO)
def start_invest(email, tag, result_key, context, service_identity, user_details):
    # type: (unicode, unicode, unicode, unicode, unicode, UserDetailsTO) -> None
    logging.info('Ignoring start_invest poke tag because this flow is not used atm')
    return
    flow = BUY_TOKENS_FLOW_V3_KYC_MENTION
    logging.info('Starting invest flow %s for user %s', flow, user_details.email)
    members = [MemberTO(member=user_details.email, app_id=user_details.app_id, alert_flags=0)]
    flow_params = json.dumps({'currencies': _get_conversion_rates()})
    messaging.start_local_flow(get_rogerthat_api_key(), None, members, service_identity, tag=BUY_TOKENS_TAG,
                               context=context, flow=flow, flow_params=flow_params)


def _get_conversion_rates():
    result = []
    stats = get_global_stats(TOKEN_ITFT)
    for currency in stats.currencies:
        result.append({
            'name': _get_currency_name(currency.currency),
            'symbol': currency.currency,
            'value': currency.value
        })
    return result


@arguments(message_flow_run_id=unicode, member=unicode, steps=[object_factory("step_type", FLOW_STEP_MAPPING)],
           end_id=unicode, end_message_flow_id=unicode, parent_message_key=unicode, tag=unicode, result_key=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, service_identity=unicode, user_details=[UserDetailsTO],
           flow_params=unicode)
def invest_complete(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag,
                    result_key, flush_id, flush_message_flow_id, service_identity, user_details, flow_params):
    email = user_details[0].email
    app_id = user_details[0].app_id
    if 'confirm' in end_id:
        agreement_key = InvestmentAgreement.create_key(json.loads(tag)['investment_id'])
        deferred.defer(_invest, agreement_key, email, app_id, 0)


def _get_currency_name(currency):
    if currency in SUPPORTED_CRYPTO_CURRENCIES:
        return CRYPTO_CURRENCY_NAMES[currency]
    return get_currency_name(currency, locale='en_GB')


def _set_token_count(agreement, token_count_float=None, precision=2):
    # type: (InvestmentAgreement) -> None
    stats = get_global_stats(agreement.token)
    logging.info('Setting token count for agreement %s', agreement.to_dict())
    if agreement.status == InvestmentAgreement.STATUS_CREATED:
        if agreement.currency == 'USD':
            agreement.token_count = long((agreement.amount / stats.value) * pow(10, precision))
        else:
            currency_stats = filter(lambda s: s.currency == agreement.currency, stats.currencies)[0]
            if not currency_stats:
                raise HttpBadRequestException('Could not find currency conversion for currency %s' % agreement.currency)
            agreement.token_count = long((agreement.amount / currency_stats.value) * pow(10, precision))
    # token_count can be overwritten when marking the investment as paid for BTC
    elif agreement.status == InvestmentAgreement.STATUS_SIGNED:
        if agreement.currency == 'BTC':
            if not token_count_float:
                raise HttpBadRequestException('token_count_float must be provided when setting token count for BTC')
            # The course of BTC changes how much tokens are granted
            if agreement.token_count:
                logging.debug('Overwriting token_count for investment agreement %s from %s to %s',
                              agreement.id, agreement.token_count, token_count_float)
            agreement.token_count = long(token_count_float * pow(10, precision))
    agreement.token_precision = precision


def _invest(agreement_key, email, app_id, retry_count):
    # type: (ndb.Key, unicode, unicode, long) -> None
    from plugins.tff_backend.bizz.agreements import create_token_agreement_pdf
    app_user = create_app_user_by_email(email, app_id)
    logging.debug('Creating Token agreement')
    agreement = get_investment_agreement(agreement_key.id())
    _set_token_count(agreement)
    agreement.put()
    currency_full = _get_currency_name(agreement.currency)
    pdf_name = InvestmentAgreement.filename(agreement_key.id())
    pdf_contents = create_token_agreement_pdf(agreement.name, agreement.address, agreement.amount, currency_full,
                                              agreement.currency, agreement.token)
    pdf_url = upload_to_gcs(pdf_name, pdf_contents, 'application/pdf')
    logging.debug('Storing Investment Agreement in the datastore')
    pdf_size = len(pdf_contents)
    deferred.defer(_create_investment_agreement_iyo_see_doc, agreement_key, app_user, pdf_url, pdf_size=pdf_size)
    deferred.defer(update_investor_progress, email, app_id, INVESTMENT_TODO_MAPPING[agreement.status])


def _create_investment_agreement_iyo_see_doc(agreement_key, app_user, pdf_url, content_type='application/pdf',
                                             send_sign_message=True, pdf_size=0):
    # type: (ndb.Key, users.User, unicode) -> None
    iyo_username = get_iyo_username(app_user)
    doc_id = u'Internal Token Offering %s' % agreement_key.id()
    doc_category = u'Purchase Agreement'
    iyo_see_doc = IYOSeeDocumentView(username=iyo_username,
                                     globalid=get_iyo_organization_id(),
                                     uniqueid=doc_id,
                                     version=1,
                                     category=doc_category,
                                     link=pdf_url,
                                     content_type=content_type,
                                     markdown_short_description=u'Internal Token Offering - Purchase Agreement',
                                     markdown_full_description=u'Internal Token Offering - Purchase Agreement')
    logging.debug('Creating IYO SEE document: %s', iyo_see_doc)
    try:
        create_see_document(iyo_username, iyo_see_doc)
    except HTTPError as e:
        if e.response.status_code != httplib.CONFLICT:
            raise e

    def trans():
        agreement = agreement_key.get()
        agreement.iyo_see_id = doc_id
        agreement.put()
        if send_sign_message:
            attachment_name = u' - '.join([doc_id, doc_category])
            deferred.defer(_send_ito_agreement_sign_message, agreement.key, app_user, pdf_url, attachment_name,
                           pdf_size, _transactional=True)

    ndb.transaction(trans)


def _send_ito_agreement_sign_message(agreement_key, app_user, pdf_url, attachment_name, pdf_size):
    logging.debug('Sending SIGN widget to app user')

    form = SignFormTO(positive_button_ui_flags=Message.UI_FLAG_EXPECT_NEXT_WAIT_5,
                      widget=SignTO(algorithm=KEY_ALGORITHM,
                                    key_name=KEY_NAME,
                                    payload=base64.b64encode(pdf_url).decode('utf-8')))

    attachment = AttachmentTO(content_type=u'application/pdf',
                              download_url=pdf_url,
                              name=attachment_name,
                              size=pdf_size)

    tag = json.dumps({
        u'__rt__.tag': u'sign_investment_agreement',
        u'agreement_id': agreement_key.id()
    }).decode('utf-8')
    flow_params = json.dumps({
        'form': form.to_dict(),
        'attachments': [attachment.to_dict()]
    })
    email, app_id = get_app_user_tuple(app_user)
    members = [MemberTO(member=email.email(), app_id=app_id, alert_flags=0)]
    messaging.start_local_flow(get_rogerthat_api_key(), None, members, None, tag=tag,
                               context=None, flow=FLOW_SIGN_INVESTMENT, flow_params=flow_params)


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
    message = u"""Enter your pin code to mark purchase agreement %(investment)s (reference %(reference)s as paid.
- from: %(user)s\n
- amount: %(amount)s %(currency)s
- %(token_count_float)s %(token_type)s tokens
""" % {'investment': agreement.reference,
       'user': get_iyo_username(agreement.app_user),
       'amount': agreement.amount,
       'currency': agreement.currency,
       'token_count_float': agreement.token_count_float,
       'token_type': agreement.token,
       'reference': agreement.reference}

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


@returns(FlowMemberResultCallbackResultTO)
@arguments(message_flow_run_id=unicode, member=unicode, steps=[object_factory("step_type", FLOW_STEP_MAPPING)],
           end_id=unicode, end_message_flow_id=unicode, parent_message_key=unicode, tag=unicode, result_key=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, service_identity=unicode, user_details=[UserDetailsTO],
           flow_params=unicode)
def investment_agreement_signed(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key,
                                tag, result_key, flush_id, flush_message_flow_id, service_identity, user_details,
                                flow_params):
    try:
        user_detail = user_details[0]
        tag_dict = json.loads(tag)
        agreement = InvestmentAgreement.create_key(tag_dict['agreement_id']).get()  # type: InvestmentAgreement

        last_step = steps[-1]
        assert isinstance(last_step, FormFlowStepTO)
        if last_step.answer_id != FormTO.POSITIVE:
            logging.info('Investment agreement was canceled')
            agreement.status = InvestmentAgreement.STATUS_CANCELED
            agreement.cancel_time = now()
            agreement.put()
            return None

        logging.info('Received signature for Investment Agreement')

        sign_result = last_step.form_result.result.get_value()
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
            return create_error_message()
        doc_view.keystore_label = keystore_label
        logging.debug('Signing IYO SEE document')
        sign_see_document(iyo_organization_id, iyo_username, doc_view)

        logging.debug('Storing signature in DB')
        agreement.populate(status=InvestmentAgreement.STATUS_SIGNED,
                           signature=payload_signature,
                           sign_time=now())
        agreement.put_async()

        deferred.defer(add_user_to_role, user_detail, RogerthatRoles.INVESTOR)
        intercom_tags = get_intercom_tags_for_investment(agreement)
        if intercom_tags:
            for i_tag in intercom_tags:
                deferred.defer(intercom_helpers.tag_intercom_users, i_tag, [iyo_username])
        deferred.defer(update_investor_progress, user_detail.email, user_detail.app_id,
                       INVESTMENT_TODO_MAPPING[agreement.status])
        deferred.defer(_inform_support_of_new_investment, iyo_username, agreement.id, agreement.token_count_float)
        logging.debug('Sending confirmation message')
        prefix_message = translate(DEFAULT_LANGUAGE, 'tff', 'thanks_we_received_your_investment_signature')
        deferred.defer(send_payment_instructions, agreement.app_user, agreement.id, prefix_message)
        result = FlowCallbackResultTypeTO(flow=FLOW_INVESTMENT_CONFIRMED,
                                          tag=None,
                                          force_language=None,
                                          flow_params=json.dumps({'reference': agreement.reference}))
        return FlowMemberResultCallbackResultTO(type=TYPE_FLOW, value=result)
    except:
        logging.exception('An unexpected error occurred')
        return create_error_message()


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
        if answer_id != FormTO.POSITIVE:
            logging.info('Investment agreement sign aborted')
            return
        if agreement.status == InvestmentAgreement.STATUS_PAID:
            logging.warn('Ignoring request to set InvestmentAgreement %s as paid because it is already paid',
                         agreement.id)
            return
        agreement.status = InvestmentAgreement.STATUS_PAID
        agreement.paid_time = now()
        agreement.put()
        user_email, app_id, = get_app_user_tuple(agreement.app_user)
        deferred.defer(transfer_genesis_coins_to_user, agreement.app_user, TokenType.I,
                       long(agreement.token_count_float * 100), _transactional=True)
        deferred.defer(update_investor_progress, user_email.email(), app_id, INVESTMENT_TODO_MAPPING[agreement.status],
                       _transactional=True)
        deferred.defer(_send_tokens_assigned_message, agreement.app_user, _transactional=True)

    ndb.transaction(trans)


@returns(InvestmentAgreementDetailsTO)
@arguments(agreement_id=(int, long))
def get_investment_agreement_details(agreement_id):
    agreement = get_investment_agreement(agreement_id)
    if agreement.iyo_see_id:
        iyo_organization_id = get_iyo_organization_id()
        username = get_iyo_username(agreement.app_user)
        see_document = get_see_document(iyo_organization_id, username, agreement.iyo_see_id)
    else:
        see_document = None
    return InvestmentAgreementDetailsTO.from_model(agreement, see_document)


@returns(InvestmentAgreement)
@arguments(agreement_id=(int, long), agreement=InvestmentAgreementTO, admin_user=users.User)
def put_investment_agreement(agreement_id, agreement, admin_user):
    admin_app_user = create_app_user_by_email(admin_user.email(), get_config(NAMESPACE).rogerthat.app_id)
    # type: (long, InvestmentAgreement, users.User) -> InvestmentAgreement
    agreement_model = InvestmentAgreement.get_by_id(agreement_id)  # type: InvestmentAgreement
    if not agreement_model:
        raise HttpNotFoundException('investment_agreement_not_found')
    if agreement_model.status == InvestmentAgreement.STATUS_CANCELED:
        raise HttpBadRequestException('order_canceled')
    if agreement.status not in (InvestmentAgreement.STATUS_SIGNED, InvestmentAgreement.STATUS_CANCELED):
        raise HttpBadRequestException('invalid_status')
    # Only support updating the status for now
    agreement_model.status = agreement.status
    if agreement_model.status == InvestmentAgreement.STATUS_CANCELED:
        agreement_model.cancel_time = now()
    elif agreement_model.status == InvestmentAgreement.STATUS_SIGNED:
        agreement_model.paid_time = now()
        if agreement.currency == 'BTC':
            _set_token_count(agreement_model, agreement.token_count_float)
        deferred.defer(_send_ito_agreement_to_admin, agreement_model.key, admin_app_user)
    agreement_model.put()
    return agreement_model


def _inform_support_of_new_investment(iyo_username, agreement_id, token_count):
    subject = "New purchase agreement signed"
    body = """Hello,

We just received a new purchase agreement (%(agreement_id)s) from %(iyo_username)s for %(token_count_float)s tokens.

Please visit %(base_url)s/investment-agreements/%(agreement_id)s to find more details, and collect all the money!
""" % {"iyo_username": iyo_username,
       "agreement_id": agreement_id,
       'base_url': get_base_url(),
       "token_count_float": token_count}  # noQA
    send_emails_to_support(subject, body)


@returns()
@arguments(app_user=users.User, agreement_id=(int, long), message_prefix=unicode)
def send_payment_instructions(app_user, agreement_id, message_prefix):
    agreement = get_investment_agreement(agreement_id)
    params = {
        'currency': agreement.currency,
        'iban': BANK_ACCOUNTS.get(agreement.currency, BANK_ACCOUNTS['USD']),
        'account_number': ACCOUNT_NUMBERS.get(agreement.currency),
        'reference': agreement.reference,
        'message_prefix': message_prefix
    }
    if agreement.currency == "BTC":
        params['amount'] = '{:.8f}'.format(agreement.amount)
        message = u"""%(message_prefix)sPlease use the following transfer details
Amount: %(currency)s %(amount)s - wallet 3GTf7gWhvWqfsurxXpEj6DU7SVoLM3wC6A

Please inform us by email at payments@threefoldtoken.com when you have made payment.

Reference: %(reference)s"""

    else:
        params['amount'] = '{:.2f}'.format(agreement.amount)
        message = u"""%(message_prefix)sPlease use the following transfer details
Amount: %(currency)s %(amount)s

Bank: Mashreq Bank

Bank address: Al Hawai Tower, Ground Floor Sheikh Zayed Road - PO Box 36612 - UAE Dubai

Account number: %(account_number)s

IBAN: %(iban)s / BIC : BOMLAEAD

For the attention of Green IT Globe Holdings FZC, a company incorporated under the laws of Sharjah, United Arab Emirates, with registered office at SAIF Zone, SAIF Desk Q1-07-038/B

Important: The payment must be made from a bank account registered under your name. Please use %(reference)s as reference."""  # noQA

    msg = message % params
    subject = u'ThreeFold payment instructions'
    send_message_and_email(app_user, msg, subject)


def _send_tokens_assigned_message(app_user):
    subject = u'ThreeFold tokens assigned'
    message = 'Dear ThreeFold Member, we have just assigned your tokens to your wallet. ' \
              'It may take up to an hour for them to appear in your wallet. ' \
              '\n\nWe would like to take this opportunity to remind you to have a paper backup of your wallet. ' \
              'You can make such a backup by writing down the 29 words you can use to restore the wallet. ' \
              '\nYou can find these 29 words by going to Settings -> Security -> threefold. ' \
              '\n\nThank you once again for getting on board!'
    send_message_and_email(app_user, message, subject)


@arguments(agreement=InvestmentAgreement)
def get_intercom_tags_for_investment(agreement):
    if agreement.status not in [InvestmentAgreement.STATUS_PAID, InvestmentAgreement.STATUS_SIGNED]:
        return []
    if agreement.token == TOKEN_ITFT:
        return [IntercomTags.ITFT_PURCHASER, IntercomTags.GREENITGLOBE_CONTRACT]
    elif agreement.token == TOKEN_TFT:
        # todo: In the future (PTO), change ITO_INVESTOR to IntercomTags.TFT_PURCHASER
        return [IntercomTags.BETTERTOKEN_CONTRACT, IntercomTags.ITO_INVESTOR]
    else:
        logging.warn('Unknown token %s, not tagging intercom user %s', agreement.token, agreement.app_user)
        return []


@returns()
@arguments(agreement_id=(int, long), message_type=unicode)
def _send_sign_investment_reminder(agreement_id, message_type):
    agreement = get_investment_agreement(agreement_id)
    if agreement.status != InvestmentAgreement.STATUS_CREATED:
        return

    if message_type == u'long':
        message = 'Dear ThreeFold Member,\n\n' \
                  'Thank you for joining the ThreeFold Foundation! Your contract has been created and is ready to be signed and processed.\n' \
                  'You can find your created %s Purchase Agreement in your ThreeFold messages.' % (agreement.token)
    elif message_type == u'short':
        message = 'Dear ThreeFold Member,\n\n' \
                  'It appears that your created iTFT Purchase Agreement has not been signed yet.'
    else:
        return
    subject = u'Your Purchase Agreement is ready to be signed'

    send_message_and_email(agreement.app_user, message, subject)

