import base64
import httplib
import json
import logging

from requests.exceptions import HTTPError

from framework.plugin_loader import get_config
from framework.utils import now
from google.appengine.ext import deferred, ndb
from mcfw.properties import object_factory
from mcfw.rpc import returns, arguments, serialize_complex_value
from plugins.rogerthat_api.api import messaging
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.rogerthat_api.to.messaging import Message, AttachmentTO
from plugins.rogerthat_api.to.messaging.flow import FLOW_STEP_MAPPING
from plugins.rogerthat_api.to.messaging.forms import SignTO, SignFormTO, FormResultTO, FormTO, SignWidgetResultTO
from plugins.rogerthat_api.to.messaging.service_callback_results import FormAcknowledgedCallbackResultTO, \
    MessageCallbackResultTypeTO, TYPE_MESSAGE
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.bizz.authentication import Roles
from plugins.tff_backend.bizz.hoster import get_publickey_label, _create_error_message
from plugins.tff_backend.bizz.iyo.see import create_see_document, get_see_document, sign_see_document
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username, get_iyo_organization_id
from plugins.tff_backend.bizz.service import get_main_branding_hash, add_user_to_role
from plugins.tff_backend.models.investor import InvestmentAgreement
from plugins.tff_backend.plugin_consts import NAMESPACE, KEY_ALGORITHM, KEY_NAME
from plugins.tff_backend.to.iyo.see import IYOSeeDocumentView, IYOSeeDocumenVersion
from plugins.tff_backend.utils import get_step_value
from plugins.tff_backend.utils.app import create_app_user_by_email, get_app_user_tuple


# TODO: make this configurable in a settings page or cron #31
PRICE_PER_TOKEN = {
    'USD_cur': 5.0,
    'EUR_cur': 4.2,
    'BTC_cur': 0.00116,
    'ETH_cur': 0.01485
}


@returns()
@arguments(message_flow_run_id=unicode, member=unicode, steps=[object_factory("step_type", FLOW_STEP_MAPPING)],
           end_id=unicode, end_message_flow_id=unicode, parent_message_key=unicode, tag=unicode, result_key=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, service_identity=unicode, user_details=[UserDetailsTO],
           flow_params=unicode)
def invest(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag, result_key,
           flush_id, flush_message_flow_id, service_identity, user_details, flow_params):
    deferred.defer(_invest, user_details[0], steps)


def _invest(user_detail, steps):
    app_user = create_app_user_by_email(user_detail.email, user_detail.app_id)
    logging.info('User %s wants to invest', app_user)

    referrer = get_step_value(steps, 'message_get_referral')[0]
    currency = get_step_value(steps, 'message_get_currency')
    token_count = int(get_step_value(steps, 'message_get_order_size_ITO'))

    logging.debug('Storing Investment Agreement in the datastore')
    agreement_key = InvestmentAgreement.create_key()
    def trans():
        agreement = InvestmentAgreement(key=agreement_key,
                                        creation_time=now(),
                                        app_user=app_user,
                                        token_count=token_count,
                                        currency=currency,
                                        currency_rate=PRICE_PER_TOKEN[currency],
                                        referrer=create_app_user_by_email(referrer, user_detail.app_id),
                                        status=InvestmentAgreement.STATUS_CREATED)
        agreement.put()
        deferred.defer(_create_investment_agreement, agreement.key, app_user, _transactional=True)

    ndb.transaction(trans)


def _create_investment_agreement(agreement_key, app_user):
    # TODO: create in ipfs
    cfg = get_config(NAMESPACE)
    ipfs_link = cfg.tos.order_node
    deferred.defer(_create_investment_agreement_iyo_see_doc, agreement_key, app_user, ipfs_link)


def _create_investment_agreement_iyo_see_doc(agreement_key, app_user, ipfs_link):
    iyo_username = get_iyo_username(app_user)
    organization_id = get_iyo_organization_id()

    doc_id = u'Internal Token Offering'
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

        logging.debug('Sending confirmation message')
        message = MessageCallbackResultTypeTO()
        message.alert_flags = Message.ALERT_FLAG_VIBRATE
        message.answers = []
        message.branding = get_main_branding_hash()
        message.dismiss_button_ui_flags = 0
        message.flags = Message.FLAG_ALLOW_DISMISS | Message.FLAG_AUTO_LOCK
        message.message = u'Thank you. TODO...'
        message.step_id = u'investment_agreement_accepted'
        message.tag = None

        result = FormAcknowledgedCallbackResultTO()
        result.type = TYPE_MESSAGE
        result.value = message
        return result
    except:
        logging.exception('An unexpected error occurred')
        return _create_error_message(FormAcknowledgedCallbackResultTO())
