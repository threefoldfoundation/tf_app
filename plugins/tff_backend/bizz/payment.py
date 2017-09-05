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
import hashlib
import hmac
import json
import logging
import time
import uuid

from dateutil.relativedelta import relativedelta

from framework.plugin_loader import get_config
from framework.utils import now, get_epoch_from_datetime, urlencode
from google.appengine.api import urlfetch, users
from google.appengine.ext import deferred, ndb
from mcfw.consts import DEBUG
from mcfw.rpc import returns, arguments
from plugins.rogerthat_api.exceptions import BusinessException
from plugins.tff_backend.consts.payment import TOKEN_TFF, TOKEN_TYPE_A, TOKEN_TYPE_B, TOKEN_TYPE_C, \
    TOKEN_TYPE_D, TOKEN_TFF_CONTRIBUTOR
from plugins.tff_backend.models.payment import ThreeFoldWallet, ThreeFoldTransaction, \
    ThreeFoldPendingTransaction, ThreeFoldBlockHeight
from plugins.tff_backend.plugin_consts import NAMESPACE


@returns(unicode)
@arguments(app_user=users.User, token=unicode)
def get_asset_id_from_token(app_user, token):
    return u"%s:%s" % (app_user.email(), token)


@returns(users.User)
@arguments(asset_id=unicode)
def get_app_user_from_asset_id(asset_id):
    return users.User(asset_id.rsplit(u":", 1)[0])
    
    
@returns(unicode)
@arguments(asset_id=unicode)
def get_token_from_asset_id(asset_id):
    return asset_id.rsplit(u":", 1)[1]


@returns([unicode])
@arguments(app_user=users.User)
def get_asset_ids(app_user):
    tokens = [TOKEN_TFF]
    if app_user:
        w_key = ThreeFoldWallet.create_key(app_user)
        w = w_key.get()
        if w and w.tokens:
            tokens = w.tokens

    return [get_asset_id_from_token(app_user, token) for token in tokens]


@returns(tuple)
@arguments(app_user=users.User, token=unicode)
def get_balance(app_user, token):
    available_balance = 0
    total_balance = 0
    total_description_details = []
    for t in ThreeFoldTransaction.list_with_amount_left(app_user, token):
        amount_spent = t.amount - t.amount_left
        unlocked_amount = 0
        now_ = now()
        for unlock_timestamp, unlock_amount in zip(t.unlock_timestamps, t.unlock_amounts):
            if unlock_timestamp <= now_:
                unlocked_amount += unlock_amount
            else:
                total_description_details.append((unlock_timestamp, unlock_amount))


        spendable_amount = unlocked_amount - amount_spent

        available_balance += spendable_amount
        total_balance += t.amount_left

    if total_description_details:
        total_description = u"##  %s Unlock times" % token

        total_description += u"\n\n|Date|#%s|" % token
        total_description += u"\n|---|---:|"
        for (unlock_timestamp, unlock_amount) in sorted(total_description_details, key=lambda tup: tup[0]):
            total_description += u"\n|%s|%s|" % (time.strftime("%a %d %b %Y %H:%M:%S GMT", time.localtime(unlock_timestamp)), u'{:0,.2f}'.format(unlock_amount / 100.0))
    else:
        total_description = None

    return available_balance, total_balance, total_description


def sync_payment_asset(app_user, asset_id):
    cfg = get_config(NAMESPACE)
    
    args = dict()
    args["app_user"] = app_user.email()
    args["asset_id"] = asset_id
    
    headers = {}
    headers['Authorization'] = cfg.rogerthat.payment_secret

    urlfetch.fetch(
        url=u"%s/payments/callbacks/threefold/sync?%s" % (cfg.rogerthat.url, urlencode(args)),
        method=urlfetch.GET,
        headers=headers,
        deadline=10)


@returns(ndb.Query)
@arguments(app_user=users.User, token=unicode)
def get_transactions(app_user, token):
    return ThreeFoldTransaction.list_by_user(app_user, token)


@returns(ndb.Query)
@arguments(app_user=users.User, token=unicode)
def get_transaction_of_type_pending(app_user, token):
    return ThreeFoldPendingTransaction.list_by_user(app_user, token)


@returns()
@arguments()
def sync_transactions():
    unprocessed_transactions = ThreeFoldPendingTransaction.count_pending()

    def trans():
        bh = ThreeFoldBlockHeight.get_block_height()
        if bh.updating:
            logging.debug("sync_transactions was already updating...")
            return
        if unprocessed_transactions > 0:
            logging.debug("sync_transactions need to sync %s transactions", unprocessed_transactions)
            bh.updating = True
            bh.put()
            deferred.defer(_sync_transactions, _transactional=True)
            return
        logging.debug("sync_transactions not needed block height was already %s", bh.height)
        return

    ndb.transaction(trans)


@returns()
@arguments()
def _sync_transactions():
    def trans_finish():
        bh = ThreeFoldBlockHeight.get_block_height()
        if not bh.updating:
            return
        bh.timestamp = now()
        bh.updating = False
        bh.put()

    qry = ThreeFoldPendingTransaction.query() \
        .filter(ThreeFoldPendingTransaction.synced == False) \
        .order(-ThreeFoldPendingTransaction.timestamp)
        
    pt_keys = [pt.key for pt in qry.fetch(100)]
    if len(pt_keys) > 0:
        _migrate_pending_transactions(pt_keys)
    else:
        ndb.transaction(trans_finish, xg=True)


@returns()
@arguments(keys=[ndb.Key])
def _migrate_pending_transactions(keys):
    @ndb.non_transactional
    def list_transactions_with_amount_left(app_user, token):
        return [t.key for t in ThreeFoldTransaction.list_with_amount_left(app_user, token)]

    def trans(keys):
        bh = ThreeFoldBlockHeight.get_block_height()
        if not bh.updating:
            logging.debug('Blockheight already syncing')
            return

        pt_key = keys.pop()
        if len(keys) == 0:
            deferred.defer(_sync_transactions, _countdown=1, _transactional=True)
        else:
            deferred.defer(_migrate_pending_transactions, keys, _transactional=True)

        pt = pt_key.get()
        if not pt:
            logging.debug('Pending transaction not found')
            return
        
        pt.synced = True
        height = bh.height + 1

        funding_transactions_to_put = []
        if pt.from_user:
            funding_transactions_keys = list_transactions_with_amount_left(pt.from_user, pt.token)
            funding_transactions = ndb.get_multi(funding_transactions_keys)
            amount_left = pt.amount
            for ft in funding_transactions:
                funding_transactions_to_put.append(ft)

                spendable_amount = get_spendable_amount_of_transaction(ft)
                if (amount_left - spendable_amount) >= 0:
                    amount_left -= spendable_amount
                    ft.amount_left -= spendable_amount
                    if ft.amount_left == 0:
                        ft.fully_spent = True
                else:
                    ft.amount_left -= amount_left
                    break
            else:
                logging.debug('Insufficient funds')
                pt.synced_status = ThreeFoldPendingTransaction.STATUS_FAILED
                pt.put()
                return  # not enough money ...
            ndb.put_multi(funding_transactions_to_put)
        else:
            logging.info("Genesis payout to %s at height %s", pt.to_user, height)
            
        pt.synced_status = ThreeFoldPendingTransaction.STATUS_CONFIRMED
        pt.put()

        bh.timestamp = now()
        bh.height = height
        bh.put()

        new_transaction = ThreeFoldTransaction.create_new()
        new_transaction.timestamp = now()
        new_transaction.height = height
        new_transaction.unlock_timestamps = pt.unlock_timestamps
        new_transaction.unlock_amounts = pt.unlock_amounts
        new_transaction.token = pt.token
        new_transaction.token_type = pt.token_type
        new_transaction.amount = pt.amount
        new_transaction.amount_left = pt.amount
        new_transaction.fully_spent = False
        new_transaction.app_users = []
        if pt.from_user:
            new_transaction.app_users.append(pt.from_user)
            deferred.defer(sync_payment_asset, pt.from_user,
                           get_asset_id_from_token(pt.from_user, pt.token), _countdown=5, _transactional=True)
        if pt.to_user:
            new_transaction.app_users.append(pt.to_user)
            deferred.defer(sync_payment_asset, pt.to_user,
                           get_asset_id_from_token(pt.to_user, pt.token), _countdown=5, _transactional=True)
        new_transaction.from_user = pt.from_user
        new_transaction.to_user = pt.to_user

        new_transaction.put()
        deferred.defer(_save_transaction_to_backlog, new_transaction.id, _transactional=True)

    ndb.transaction(lambda: trans(keys), xg=True)


@returns()
@arguments()
def sync_wallets():
    now_ = now()
    for wallet in ThreeFoldWallet.list_update_needed(now_):
        deferred.defer(sync_wallet_for_user, wallet.app_user)


@returns()
@arguments(app_user=users.User)
def sync_wallet_for_user(app_user):
    wallet = ThreeFoldWallet.create_key(app_user).get()
    if not wallet:
        return

    now_ = now()
    next_unlock_timestamp = 0
    for token in wallet.tokens:
        for t in ThreeFoldTransaction.list_with_amount_left(app_user, token):
            for unlock_timestamp in t.unlock_timestamps:
                if unlock_timestamp > now_:
                    if not next_unlock_timestamp:
                        next_unlock_timestamp = unlock_timestamp
                    elif next_unlock_timestamp > unlock_timestamp:
                        next_unlock_timestamp = unlock_timestamp

    wallet.next_unlock_timestamp = next_unlock_timestamp
    wallet.put()

    for token in wallet.tokens:
        deferred.defer(sync_payment_asset, app_user, get_asset_id_from_token(app_user, token), _countdown=5)


@returns((int, long))
@arguments(transaction=ThreeFoldTransaction)
def get_spendable_amount_of_transaction(transaction):
    amount_spent = transaction.amount - transaction.amount_left
    unlocked_amount = 0
    now_ = now()
    for unlock_timestamp, unlock_amount in zip(transaction.unlock_timestamps, transaction.unlock_amounts):
        if unlock_timestamp <= now_:
            unlocked_amount += unlock_amount

    return unlocked_amount - amount_spent


@returns()
@arguments(app_user=users.User, token_type=unicode, amount=(int, long), memo=unicode)
def _transfer_genesis_coins_to_user(app_user, token_type, amount, memo=None):
    if TOKEN_TYPE_A == token_type:
        token = TOKEN_TFF
        unlock_timestamps = [0]
        unlock_amounts = [amount]
    elif TOKEN_TYPE_B == token_type:
        token = TOKEN_TFF
        d = datetime.now() + relativedelta(months=6)
        unlock_timestamps = [get_epoch_from_datetime(d)]
        unlock_amounts = [amount]
    elif TOKEN_TYPE_C == token_type:
        token = TOKEN_TFF
        unlock_timestamps = []
        unlock_amounts = []
        a = amount / 48
        for i in xrange(0, 39):
            d = datetime.now() + relativedelta(months=48 - i)
            unlock_timestamps = [get_epoch_from_datetime(d)] + unlock_timestamps
            unlock_amounts = [a] + unlock_amounts

        d = datetime.now() + relativedelta(months=9)
        unlock_timestamps = [get_epoch_from_datetime(d)] + unlock_timestamps
        unlock_amounts = [amount - sum(unlock_amounts)] + unlock_amounts

    elif TOKEN_TYPE_D == token_type:
        token = TOKEN_TFF_CONTRIBUTOR
        unlock_timestamps = [0]
        unlock_amounts = [amount]
    else:
        raise Exception(u"Unknown token type")

    key = ThreeFoldWallet.create_key(app_user)
    wallet = key.get()
    if not wallet:
        wallet = ThreeFoldWallet(key=key, tokens=[])

    if token not in wallet.tokens:
        wallet.tokens.append(token)

    if unlock_timestamps[0] > 0 and (not wallet.next_unlock_timestamp or unlock_timestamps[0] < wallet.next_unlock_timestamp):
        wallet.next_unlock_timestamp = unlock_timestamps[0]

    wallet.put()

    transaction_id = unicode(uuid.uuid4())
    pt = ThreeFoldPendingTransaction(key=ThreeFoldPendingTransaction.create_key(transaction_id),
                                     timestamp=now(),
                                     unlock_timestamps=unlock_timestamps,
                                     unlock_amounts=unlock_amounts,
                                     token=token,
                                     token_type=token_type,
                                     amount=amount,
                                     memo=memo,
                                     app_users=[app_user],
                                     from_user=None,
                                     to_user=app_user,
                                     synced=False,
                                     synced_status=ThreeFoldPendingTransaction.STATUS_PENDING)
    pt.put()


@returns()
@arguments(transaction_id=(int, long))
def _save_transaction_to_backlog(transaction_id):
    cfg = get_config(NAMESPACE)
    if not (cfg.backlog.url or cfg.backlog.secret):
        if DEBUG:
            logging.warn('Transaction backlog is not filled in, doing nothing')
            return
        raise Exception('Backlog config is not filled in') 

    transaction = ThreeFoldTransaction.get_by_id(transaction_id)
    if not transaction:
        raise BusinessException('ThreeFoldTransaction with id %s not found!' % transaction_id)
    data = {
        'id': transaction.id,
        'timestamp': transaction.timestamp,
        'amount': transaction.amount
    }
    if transaction.from_user:
        data['from'] = hmac.new(cfg.backlog.secret.encode(), transaction.from_user.email(), hashlib.sha1).hexdigest()
    if transaction.to_user:
        data['to'] = hmac.new(cfg.backlog.secret.encode(), transaction.to_user.email(), hashlib.sha1).hexdigest()
    headers = {
        'Authorization': cfg.backlog.secret
    }
    url = cfg.backlog.url + '/transactions'
    result = urlfetch.fetch(url, json.dumps(data), urlfetch.POST, headers, deadline=30)
    if result.status_code not in (200, 201):
        logging.info('Status:%s Content: %s', result.status_code, result.content)
        raise Exception('Failed to add transaction to backlog')
