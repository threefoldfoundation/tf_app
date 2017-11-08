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
from datetime import datetime
from time import strftime

from google.appengine.ext import ndb

from mcfw.rpc import arguments, returns
from plugins.tff_backend.bizz.crm.contacts import upsert_contact, get_contact
from plugins.tff_backend.bizz.crm.deals import get_deal_type, DealState, upsert_deal, DealType
from plugins.tff_backend.bizz.iyo.user import get_user
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
from plugins.tff_backend.bizz.user import user_code, get_or_create_profile
from plugins.tff_backend.models.hoster import NodeOrderStatus, NodeOrder
from plugins.tff_backend.models.investor import InvestmentAgreement

InvestmentDealTypeStates = {
    InvestmentAgreement.STATUS_CREATED: DealState.NEW,
    InvestmentAgreement.STATUS_SIGNED: DealState.CONFIRMED,
    InvestmentAgreement.STATUS_PAID: DealState.PENDING,
    InvestmentAgreement.STATUS_CANCELED: DealState.CLOSED,
}

NodeOrderDealTypes = {
    NodeOrderStatus.CANCELED: DealState.CLOSED,
    NodeOrderStatus.APPROVED: DealState.INTERESTED,
    NodeOrderStatus.SIGNED: DealState.CONFIRMED,
    NodeOrderStatus.SENT: DealState.PENDING,
    NodeOrderStatus.ARRIVED: DealState.CLOSED,
    NodeOrderStatus.WAITING_APPROVAL: DealState.NEW,
    NodeOrderStatus.PAID: DealState.PENDING
}


def format_date(timestamp):
    return strftime('%Y-%m-%d %H:%M:%S', datetime.utcfromtimestamp(timestamp).timetuple())


@returns()
@arguments(investment_agreement_key=ndb.Key)
def upsert_investment_deal(investment_agreement_key):
    investment_agreement = investment_agreement_key.get()  # type: InvestmentAgreement
    iyo_username = get_iyo_username(investment_agreement.app_user)
    firstname, lastname, referral_code, contact_id = _update_contact(iyo_username, investment_agreement.app_user,
                                                                     investment_agreement.name)
    deal_type = get_deal_type(investment_agreement.token, False)
    deal_state = InvestmentDealTypeStates.get(investment_agreement.status)
    is_paid = investment_agreement.status == InvestmentAgreement.STATUS_PAID
    document_comment = None
    paid_comment = None
    if investment_agreement.document_url:
        document_comment = 'Document URL: %s' % investment_agreement.document_url
    if investment_agreement.paid_time:
        paid_comment = 'Paid time: %s' % format_date(investment_agreement.paid_time)
    deal_name = '%s %s I' % (firstname, lastname)
    upsert_deal(investment_agreement.crm_deal_id, deal_name, investment_agreement.amount, investment_agreement.currency,
                deal_type, deal_state, contact_id, is_paid, referral_code, document_comment, paid_comment, None)


@returns()
@arguments(node_order_key=ndb.Key)
def upsert_node_order_deal(node_order_key):
    node_order = node_order_key.get()
    assert isinstance(node_order, NodeOrder)
    iyo_username = get_iyo_username(node_order.app_user)
    firstname, lastname, referral_code, contact_id = _update_contact(iyo_username, node_order.app_user,
                                                                     node_order.billing_info.name,
                                                                     node_order.billing_info.email,
                                                                     node_order.billing_info.phone)
    deal_state = NodeOrderDealTypes.get(node_order.status)
    document_comment = None
    shipping_comment = None
    if node_order.document_url:
        document_comment = 'Document URL: %s' % node_order.document_url
    if node_order.shipping_info and node_order.shipping_info.address:
        shipping_info = node_order.shipping_info
        shipping_comment = """Shipping information:
- Name: %s
- Address: %s
- Email: %s
- Phone: %s
""" % (shipping_info.name, shipping_info.address, shipping_info.email, shipping_info.phone)
    deal_name = '%s %s I' % (firstname, lastname)
    upsert_deal(node_order.crm_deal_id, deal_name, None, 'EUR', DealType.HOSTER, deal_state, contact_id,
                node_order.is_paid, referral_code, document_comment, None, shipping_comment)


def _update_contact(iyo_username, app_user, name, email=None, phone=None):
    referral_code = user_code(iyo_username)
    profile, _ = get_or_create_profile(iyo_username, app_user)
    if profile.crm_contact_id:
        contact_id = profile.crm_contact_id
        contact = get_contact(contact_id)
        firstname, lastname = contact['firstname'], contact['lastname']
    else:
        user_information = get_user(iyo_username)
        iyo_firstname = user_information.firstname.strip().lower() if user_information.firstname else None
        iyo_lastname = user_information.lastname.strip().lower() if user_information.firstname else None
        if ' ' in name:
            firstname, lastname = name.split(' ', 1)
        else:
            firstname, lastname = name, name
        if firstname.strip().lower() == iyo_lastname or lastname.strip().lower() == iyo_firstname:
            firstname, lastname = lastname, firstname
        if not email and user_information.validatedemailaddresses:
            email = user_information.validatedemailaddresses[0].emailaddress
        if not phone and user_information.validatedphonenumbers:
            phone = user_information.validatedphonenumbers[0].phonenumber
        street_number = user_information.addresses[0].nr
        street_name = user_information.addresses[0].street
        city = user_information.addresses[0].city
        country = user_information.addresses[0].country
        zip_code = user_information.addresses[0].postalcode
        contact_id = upsert_contact(firstname, lastname, email, phone, referral_code, street_number, street_name, city,
                                    country, zip_code)
        profile.crm_contact_id = contact_id
        profile.put()
    return firstname, lastname, referral_code, contact_id
