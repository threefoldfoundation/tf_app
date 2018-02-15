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

from google.appengine.api import users

from framework.plugin_loader import get_config
from mcfw.consts import MISSING
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments, serialize_complex_value
from plugins.tff_backend.bizz.payment import get_asset_ids, get_token_from_asset_id, \
    create_signature_data, create_rivine_transaction
from plugins.tff_backend.consts.payment import PROVIDER_ID, TRANS_STATUS_FAILED, \
    COIN_TO_HASTINGS_PERCISION, COIN_TO_HASTINGS
from plugins.tff_backend.models.payment import ThreeFoldPendingTransactionDetails
from plugins.tff_backend.plugin_consts import NAMESPACE
from plugins.tff_backend.rivine import get_balance, get_transactions, \
    get_transaction
from plugins.tff_backend.to.payment import PaymentProviderAssetTO, PaymentAssetBalanceTO, \
    PaymentProviderTransactionTO, GetPaymentTransactionsResponseTO, CreateTransactionResponseTO, \
    PublicPaymentProviderTransactionTO, CryptoTransactionResponseTO, PaymentProviderSignatureDataTransactionTO, \
    CryptoTransactionTO


def custom_auth_method(f, request_handler):
    cfg = get_config(NAMESPACE)
    if cfg.rogerthat.payment_secret == request_handler.request.headers.get("Authorization"):
        return True
    logging.error(u"Someone tried to access private apis...")
    return False


@rest('/payment/assets', 'get', custom_auth_method=custom_auth_method)
@returns([PaymentProviderAssetTO])
@arguments(app_user=unicode)
def api_get_assets(app_user):
    assets = []
    for asset_id in get_asset_ids(users.User(app_user)):
        asset = api_get_asset(asset_id)
        if asset:
            assets.append(asset)
    return assets


@rest('/payment/assets/<asset_id:[^/]+>', 'get', custom_auth_method=custom_auth_method)
@returns(PaymentProviderAssetTO)
@arguments(asset_id=unicode)
def api_get_asset(asset_id):
    token = get_token_from_asset_id(asset_id)

    balance = get_balance(asset_id)

    available_balance = PaymentAssetBalanceTO(amount=balance, description=None, precision=COIN_TO_HASTINGS_PERCISION)
    total_balance = PaymentAssetBalanceTO(amount=balance, description=None, precision=COIN_TO_HASTINGS_PERCISION)

    to = PaymentProviderAssetTO()
    to.provider_id = PROVIDER_ID
    to.id = asset_id
    to.type = u"cryptocurrency_wallet"
    to.name = token
    to.currency = token
    to.available_balance = available_balance
    to.total_balance = total_balance
    to.verified = True
    to.enabled = True
    to.has_balance = True
    to.has_transactions = True
    to.required_action = None
    return to


@rest('/payment/transactions/<transaction_id:[^/]+>/public', 'get', custom_auth_method=custom_auth_method)
@returns(PublicPaymentProviderTransactionTO)
@arguments(transaction_id=unicode)
def api_get_public_transaction_detail(transaction_id):
    t = get_transaction(transaction_id)
    if not t:
        return None

    to = PublicPaymentProviderTransactionTO()
    to.id = t['id']
    to.timestamp = t['timestamp']
    to.currency = t['currency']
    to.amount = long(t['amount'])
    to.precision = COIN_TO_HASTINGS_PERCISION
    to.status = t['status']
    return to


@rest('/payment/transactions', 'get', custom_auth_method=custom_auth_method)
@returns(GetPaymentTransactionsResponseTO)
@arguments(asset_id=unicode, transaction_type=unicode, cursor=unicode)
def api_get_transactions(asset_id, transaction_type, cursor=None):
    rto = GetPaymentTransactionsResponseTO()
    rto.transactions = []
    rto.cursor = None
    
    for t in get_transactions(asset_id, transaction_type):
        to = PaymentProviderTransactionTO()
        to.id = t['id']
        to.type = u'transfer'
        to.name = u'Transfer %s' % t['id']
        to.amount = long(t['amount'])
        to.currency = t['currency']
        to.memo = None
        to.timestamp = t['timestamp']
        to.from_asset_id = t['inputs'][0]['unlockhash']
        if to.from_asset_id == asset_id:
            if t['outputs'][0]['unlockhash'] == asset_id:
                to.to_asset_id = t['outputs'][1]['unlockhash']
            else:
                to.to_asset_id = t['outputs'][0]['unlockhash']
        else:
            to.to_asset_id = asset_id
        to.precision = COIN_TO_HASTINGS_PERCISION
        rto.transactions.append(to)

    return rto


@rest('/payment/transactions/create_signature_data', 'post', custom_auth_method=custom_auth_method)
@returns(CryptoTransactionResponseTO)
@arguments(data=PaymentProviderSignatureDataTransactionTO)
def api_create_signature_data_transaction(data):
    to = CryptoTransactionResponseTO()
    to.result = None
    to.error = None
    # todo calculate amount with precision
    try:
        to.result = create_signature_data(data.from_asset_id, data.to_asset_id, data.amount * COIN_TO_HASTINGS)
        transaction = ThreeFoldPendingTransactionDetails(key=ThreeFoldPendingTransactionDetails.create_key(data.id),
                                                         data=json.dumps(serialize_complex_value(to.result, CryptoTransactionTO, False)))
        transaction.put()

    except Exception as e:
        to.error = unicode(e.message)
    return to


@rest('/payment/transactions', 'post', custom_auth_method=custom_auth_method)
@returns(CreateTransactionResponseTO)
@arguments(data=PaymentProviderTransactionTO)
def api_create_transaction(data):
    to = CreateTransactionResponseTO()

    if data.id is MISSING or data.amount is MISSING or data.from_asset_id is MISSING or data.to_asset_id is MISSING:
        to.status = TRANS_STATUS_FAILED
        return to
    if not (data.id or data.amount or data.from_asset_id or data.to_asset_id):
        to.status = TRANS_STATUS_FAILED
        return to

    ptd = ThreeFoldPendingTransactionDetails.create_key(data.id).get()
    if not ptd:
        to.status = TRANS_STATUS_FAILED
        return to

    if data.precision is MISSING:
        data.precision = 2

    # todo validate transaction with saved transaction

    create_rivine_transaction(data.crypto_transaction)

