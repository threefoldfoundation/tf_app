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
from plugins.tff_backend.bizz.crm.api_util import exec_graphql_request
from plugins.tff_backend.consts.payment import TOKEN_TFT, TOKEN_ITFT


class DealState(object):
    NEW, INTERESTED, CONFIRMED, PENDING, CLOSED = 'NEW', 'INTERESTED', 'CONFIRMED', 'PENDING', 'CLOSED'


class DealCurrency(object):
    USD, EUR, AED, GBP, BTC = 'NEW', 'INTERESTED', 'CONFIRMED', 'PENDING', 'CLOSED'


class DealType(object):
    HOSTER, ITO, PTO, AMBASSADOR, ITFT = 'HOSTER', 'ITO', 'PTO', 'AMBASSADOR', 'ITFT'


def get_deal_type(token, hoster=False):
    if hoster:
        return DealType.HOSTER
    elif token == TOKEN_TFT:
        return DealType.ITO
    elif token == TOKEN_ITFT:
        return DealType.ITFT
    raise Exception('Unknown deal type for token %s' % token)


def _get_deal(deal_id):
    query = """
query GetDeal($uid: String) {
  deal(uid: $uid) {
    uid
    description
    amount
    currency
    dealType
    dealState
    closedAt
    companyId
    contactId
    comments {
      edges {
        node {
          id
          content
        }
      }
    }
  }
}
"""
    return exec_graphql_request(query, {'uid': deal_id})['data']['deal']


def create_deal(deal_name, amount, currency, deal_type, deal_state, contact_id, referral_code,
                comments):
    params = {
        'name': deal_name,
        'amount': amount,
        'currency': currency,
        'dealType': deal_type,
        'dealState': deal_state,
        'contactId': contact_id,
        'referralCode': referral_code,
        'comments': [{'content': comment} for comment in comments]
    }
    mutation = """
mutation CreateDeals($records: [CreateDealArguments]!) {
  createDeals(records: $records) {
    ok
    ids
  }
}
"""
    return exec_graphql_request(mutation, {'records': [params]})['data']['createDeals']['ids']


def update_deal(deal, deal_state, is_paid, comments):
    params = {
        'uid': deal['uid'],
        'dealState': deal_state,
        'isPaid': is_paid,
        'comments': [{'content': comment} for comment in comments]
    }
    mutation = """
mutation CreateDeals($records: [UpdateDealArguments]!) {
  updateDeals(records: $records) {
    ok
    ids
  }
}
"""
    return exec_graphql_request(mutation, {'records': [params]})['data']['updateDeals']['ids']


def upsert_deal(deal_id, deal_name, amount, currency, deal_type, deal_state, contact_id, is_paid, referral_code,
                document_comment, paid_comment, shipping_comment):
    if deal_id:
        deal = _get_deal(deal_id)
        new_comments = []
        should_add_doc_comment, should_add_paid_comment, should_add_shipping_comment = True, True, True
        for edge in deal['comments']['edges']:
            comment = edge['node']
            if 'drive.google.com' in comment['content'] or document_comment in comment['content']:
                should_add_doc_comment = False
            if 'Paid time:' in comment['content']:
                should_add_paid_comment = False
            if 'Shipping information' in comment:
                should_add_shipping_comment = False
        if should_add_doc_comment and document_comment:
            new_comments.append(document_comment)
        if should_add_paid_comment and paid_comment:
            new_comments.append(paid_comment)
        if should_add_shipping_comment and shipping_comment:
            new_comments.append(shipping_comment)
        update_deal(deal, deal_state, is_paid, new_comments)
    else:
        comments = [c for c in [document_comment, paid_comment, shipping_comment] if c]
        create_deal(deal_name, amount, currency, deal_type, deal_state, contact_id, referral_code, comments)
