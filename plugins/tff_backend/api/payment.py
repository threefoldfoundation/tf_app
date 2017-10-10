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

from framework.plugin_loader import get_config
from framework.utils import now
from google.appengine.api import users
from google.appengine.ext import ndb
from mcfw.consts import MISSING
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.tff_backend.bizz.payment import get_asset_ids, get_token_from_asset_id, get_balance, get_transactions, \
    get_asset_id_from_token, get_app_user_from_asset_id, get_transaction_of_type_pending
from plugins.tff_backend.consts.payment import PROVIDER_ID, TOKEN_TFT_CONTRIBUTOR, TOKEN_TYPE_D, TOKEN_TYPE_A,\
    TOKEN_ITFT, TOKEN_TYPE_I
from plugins.tff_backend.models.payment import ThreeFoldPendingTransaction
from plugins.tff_backend.plugin_consts import NAMESPACE
from plugins.tff_backend.to.payment import PaymentProviderAssetTO, PaymentAssetBalanceTO, \
    PaymentProviderTransactionTO, GetPaymentTransactionsResponseTO, CreateTransactionResponseTO, \
    PublicPaymentProviderTransactionTO


def custom_auth_method(f, requestHandler):
    cfg = get_config(NAMESPACE)
    if cfg.rogerthat.payment_secret == requestHandler.request.headers.get("Authorization"):
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
    app_user = get_app_user_from_asset_id(asset_id)
    token = get_token_from_asset_id(asset_id)

    available_amount, total_amount, total_description = get_balance(app_user, token)

    available_balance = PaymentAssetBalanceTO()
    available_balance.amount = available_amount
    available_balance.description = None
    available_balance.precision = 2
    total_balance = PaymentAssetBalanceTO()
    total_balance.amount = total_amount
    total_balance.description = total_description
    total_balance.precision = 2

    to = PaymentProviderAssetTO()
    to.provider_id = PROVIDER_ID
    to.id = asset_id
    to.type = u"account"
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
    pt = ThreeFoldPendingTransaction.create_key(transaction_id).get()
    if not pt:
        return None

    to = PublicPaymentProviderTransactionTO()
    to.id = pt.id
    to.timestamp = pt.timestamp
    to.currency = pt.token
    to.amount = pt.amount
    to.precision = pt.precision
    to.status = pt.synced_status

    return to


@rest('/payment/transactions', 'get', custom_auth_method=custom_auth_method)
@returns(GetPaymentTransactionsResponseTO)
@arguments(asset_id=unicode, transaction_type=unicode, cursor=unicode)
def api_get_transactions(asset_id, transaction_type, cursor=None):
    app_user = get_app_user_from_asset_id(asset_id)

    rto = GetPaymentTransactionsResponseTO()
    rto.transactions = []

    if transaction_type == u"confirmed":
        qry = get_transactions(app_user, get_token_from_asset_id(asset_id))
    elif transaction_type == u"pending":
        qry = get_transaction_of_type_pending(app_user, get_token_from_asset_id(asset_id))
    else:
        rto.cursor = None
        return rto

    transaction_models, new_cursor, has_more = qry.fetch_page(10, start_cursor=ndb.Cursor(
        urlsafe=cursor) if cursor else None)

    for t in transaction_models:
        if transaction_type == u"confirmed":
            trans_id = unicode(t.height)
        else:
            trans_id = unicode(t.id)

        to = PaymentProviderTransactionTO()
        to.id = trans_id
        to.type = u'transfer'
        to.name = u'Transfer %s' % trans_id
        to.amount = t.amount
        to.currency = t.token
        to.memo = t.memo
        to.timestamp = t.timestamp
        to.from_asset_id = get_asset_id_from_token(t.from_user, t.token) if t.from_user else None
        to.to_asset_id = get_asset_id_from_token(t.to_user, t.token)
        to.precision = 2 # todo precision
        rto.transactions.append(to)

    rto.cursor = unicode(new_cursor.urlsafe()) if has_more and new_cursor else None
    return rto


@rest('/payment/transactions', 'post', custom_auth_method=custom_auth_method)
@returns(CreateTransactionResponseTO)
@arguments(data=PaymentProviderTransactionTO)
def api_create_transaction(data):
    to = CreateTransactionResponseTO()

    if data.id is MISSING or data.amount is MISSING or data.from_asset_id is MISSING or data.to_asset_id is MISSING:
        to.status = ThreeFoldPendingTransaction.STATUS_FAILED
        return to
    if not (data.id or data.amount or data.from_asset_id or data.to_asset_id):
        to.status = ThreeFoldPendingTransaction.STATUS_FAILED
        return to
    
    if data.precision is MISSING:
        data.precision = 2

    from_user = get_app_user_from_asset_id(data.from_asset_id)
    to_user = get_app_user_from_asset_id(data.to_asset_id)
    token = get_token_from_asset_id(data.from_asset_id)
    if token == TOKEN_ITFT:
        token_type = TOKEN_TYPE_I
    elif token == TOKEN_TFT_CONTRIBUTOR:
        token_type = TOKEN_TYPE_D
    else:
        token_type = TOKEN_TYPE_A

    def trans():
        pt_key = ThreeFoldPendingTransaction.create_key(data.id)
        pt = pt_key.get()
        if not pt:
            pt = ThreeFoldPendingTransaction(key=pt_key,
                                             timestamp=now())
        elif pt.synced:
            return pt.synced_status

        # todo precision
        pt.unlock_timestamps = [0]
        pt.unlock_amounts = [data.amount]
        pt.token = token
        pt.token_type = token_type
        pt.amount = data.amount
        pt.memo = data.memo
        pt.app_users = [from_user, to_user]
        pt.from_user = from_user
        pt.to_user = to_user
        pt.synced = False
        pt.synced_status = ThreeFoldPendingTransaction.STATUS_PENDING
        pt.put()

        return pt.synced_status

    to.status = ndb.transaction(trans)
    return to


@rest('/payment/create_transaction', 'get', custom_auth_method=custom_auth_method)
@returns(unicode)
@arguments(app_user=unicode,  params=unicode)
def create_transaction(app_user, params):
    # todo
    # check if we can reuse /transactions POST
    # else process params and create pending transaction
    return json.dumps({u'success': True,
                       u'provider_id': PROVIDER_ID,
                       u'transaction_id': u'trans id',
                       u'status': u'status'})
