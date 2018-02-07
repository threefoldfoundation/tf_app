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
from types import NoneType
import uuid

from google.appengine.api import urlfetch, users
from google.appengine.ext import deferred, ndb

from dateutil.relativedelta import relativedelta
from framework.plugin_loader import get_config
from framework.utils import now, get_epoch_from_datetime, urlencode
from mcfw.consts import DEBUG
from mcfw.exceptions import HttpBadRequestException
from mcfw.rpc import returns, arguments
from plugins.its_you_online_auth.bizz.profile import get_profile
from plugins.rivine_explorer.api import get_output_ids
from plugins.rogerthat_api.exceptions import BusinessException
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
from plugins.tff_backend.consts.payment import TOKEN_TFT, TOKEN_TFT_CONTRIBUTOR, TOKEN_ITFT, TokenType
from plugins.tff_backend.models.payment import ThreeFoldWallet, ThreeFoldTransaction, \
    ThreeFoldPendingTransaction, ThreeFoldBlockHeight
from plugins.tff_backend.plugin_consts import NAMESPACE, COIN_TO_HASTINGS
from plugins.tff_backend.to.payment import WalletBalanceTO, CryptoTransactionTO, \
    CryptoTransactionDataTO, CryptoTransactionInputTO, CryptoTransactionOutputTO
from plugins.tff_backend.utils.app import get_app_id_from_app_user


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
    app_id = get_app_id_from_app_user(app_user)
    if app_id != get_config(NAMESPACE).rogerthat.app_id and not DEBUG:
        return []
    tokens = [TOKEN_TFT]
    if app_user:
        w_key = ThreeFoldWallet.create_key(app_user)
        w = w_key.get()
        if w and w.tokens:
            tokens = w.tokens

    return [get_asset_id_from_token(app_user, token) for token in tokens]


@returns(WalletBalanceTO)
@arguments(app_user=users.User, token=unicode)
def get_balance(app_user, token):
    # type: (users.User, unicode) -> WalletBalanceTO
    transactions = ThreeFoldTransaction.list_with_amount_left_by_token(app_user, token)
    return _get_balance_from_transactions(transactions, token)


def _get_balance_from_transactions(transactions, token):
    # type: (list[ThreeFoldTransaction], unicode) -> WalletBalanceTO
    available_balance = 0
    total_balance = 0
    total_description_details = []
    # TODO set to minimum precision of all transactions when transactions have the 'precision' property
    # (and multiply available / total amount depending on precision)
    precision = 2
    # for transaction in transactions:
    #     precision = max(transaction.precision, precision)

    for transaction in transactions:
        if transaction.token != token:
            raise BusinessException('Invalid transaction supplied to _get_balance_from_transactions. '
                                    'All transactions must have %s as token', token)
        amount_spent = transaction.amount - transaction.amount_left
        unlocked_amount = 0
        now_ = now()
        for unlock_timestamp, unlock_amount in zip(transaction.unlock_timestamps, transaction.unlock_amounts):
            if unlock_timestamp <= now_:
                unlocked_amount += unlock_amount
            else:
                total_description_details.append((unlock_timestamp, unlock_amount))

        spendable_amount = unlocked_amount - amount_spent

        available_balance += spendable_amount
        total_balance += transaction.amount_left
    if total_description_details:
        total_description = u"""##  %(token)s Unlock times'

|Date|#%(token)s|
|---|---:|
        """ % {'token': token}
        for unlock_timestamp, unlock_amount in sorted(total_description_details, key=lambda tup: tup[0]):
            date = time.strftime('%a %d %b %Y %H:%M:%S GMT', time.localtime(unlock_timestamp))
            amount = u'{:0,.2f}'.format(unlock_amount / 100.0)
            total_description += u'\n|%s|%s|' % (date, amount)
    else:
        total_description = None
    return WalletBalanceTO(available=available_balance, total=total_balance, description=total_description, token=token,
                           precision=precision)


@returns([WalletBalanceTO])
@arguments(app_user=users.User)
def get_all_balances(app_user):
    transactions = ThreeFoldTransaction.list_with_amount_left(app_user)
    token_types = set(map(lambda transaction: transaction.token, transactions))
    results = []
    for token in token_types:
        transactions_per_token = [trans for trans in transactions if trans.token == token]
        results.append(_get_balance_from_transactions(transactions_per_token, token))
    return results


def sync_payment_asset(app_user, asset_id):
    cfg = get_config(NAMESPACE)

    args = dict()
    args["app_user"] = app_user.email()
    args["asset_id"] = asset_id

    headers = {'Authorization': cfg.rogerthat.payment_secret}

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
    return ThreeFoldPendingTransaction.list_unsynced_by_user(app_user, token)


@returns(tuple)
@arguments(app_user=users.User, token_type=(unicode, NoneType), page_size=(int, long), cursor=unicode)
def get_pending_transactions(app_user, token_type, page_size, cursor):
    # type: (users.User, unicode, long, unicode) -> tuple[list[ThreeFoldPendingTransaction], ndb.Cursor, bool]
    if token_type:
        validate_token_type(token_type)
        return ThreeFoldPendingTransaction.list_by_user_and_token_type(app_user, token_type) \
            .fetch_page(page_size, start_cursor=ndb.Cursor(urlsafe=cursor))
    else:
        return ThreeFoldPendingTransaction.list_by_user(app_user) \
            .fetch_page(page_size, start_cursor=ndb.Cursor(urlsafe=cursor))


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
        .order(-ThreeFoldPendingTransaction.timestamp)  # NOQA

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
        return [t.key for t in ThreeFoldTransaction.list_with_amount_left_by_token(app_user, token)]

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
        deferred.defer(_save_transaction_to_backlog, new_transaction.id, 'git', _transactional=True)
        deferred.defer(_save_transaction_to_backlog, new_transaction.id, 'tierion', _transactional=True)

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
        for t in ThreeFoldTransaction.list_with_amount_left_by_token(app_user, token):
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


def validate_token_type(token_type):
    if token_type not in TokenType.all():
        raise HttpBadRequestException(u'invalid_token_type', {'possible_token_types': TokenType.all()})


@returns(CryptoTransactionTO)
@arguments(from_asset_id=unicode, to_asset_id=unicode, amount=(int, long), app_user=users.User)
def create_signature_data(from_asset_id, to_asset_id, amount, app_user):
    transactions = get_output_ids(from_asset_id)

    transaction = CryptoTransactionTO()
    transaction.minerfees = unicode(COIN_TO_HASTINGS)
    transaction.data = []
    transaction.from_address = from_asset_id
    transaction.to_address = to_asset_id

    amount_left = amount
    for t in transactions:
        data = CryptoTransactionDataTO()
        data.input = CryptoTransactionInputTO(t.output_id, 0)
        data.outputs = []
        data.timelock = 0
        data.algorithm = None
        data.public_key_index = 0
        data.public_key = None
        data.signature_hash = None
        data.signature = None

        should_break = False
        a = long(t.amount)
        if (amount_left - a) >= 0:
            data.outputs.append(CryptoTransactionOutputTO(unicode(a), to_asset_id))
            amount_left -= a
        else:
            should_break = True
            data.outputs.append(CryptoTransactionOutputTO(unicode(amount_left), to_asset_id))
            data.outputs.append(CryptoTransactionOutputTO(unicode(a - amount_left), from_asset_id))

        transaction.data.append(data)

        if should_break:
            break
    else:
        raise Exception('insufficient_funds')

    return transaction


@returns(ThreeFoldPendingTransaction)
@arguments(app_user=users.User, token_type=unicode, amount=(int, long), memo=unicode, epoch=(int, long))
def transfer_genesis_coins_to_user(app_user, token_type, amount, memo=None, epoch=0):
    validate_token_type(token_type)
    if amount <= 0:
        raise HttpBadRequestException('invalid_amount')
    # Validate that this user has a profile
    get_profile(get_iyo_username(app_user))
    if epoch > 0:
        date_signed = datetime.utcfromtimestamp(epoch)
    else:
        date_signed = datetime.now()

    if TokenType.A == token_type:
        token = TOKEN_TFT
        unlock_timestamps = [0]
        unlock_amounts = [amount]

    elif TokenType.B == token_type:
        token = TOKEN_TFT
        d = date_signed + relativedelta(months=6)
        unlock_timestamps = [get_epoch_from_datetime(d)]
        unlock_amounts = [amount]

    elif TokenType.C == token_type:
        token = TOKEN_TFT
        unlock_timestamps = []
        unlock_amounts = []
        a = amount / 48
        for i in xrange(0, 39):
            d = date_signed + relativedelta(months=48 - i)
            unlock_timestamps = [get_epoch_from_datetime(d)] + unlock_timestamps
            unlock_amounts = [a] + unlock_amounts

        d = date_signed + relativedelta(months=9)
        unlock_timestamps = [get_epoch_from_datetime(d)] + unlock_timestamps
        unlock_amounts = [amount - sum(unlock_amounts)] + unlock_amounts

    elif TokenType.D == token_type:
        token = TOKEN_TFT_CONTRIBUTOR
        unlock_timestamps = [0]
        unlock_amounts = [amount]

    elif TokenType.I == token_type:
        token = TOKEN_ITFT
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

    if unlock_timestamps[0] > 0 and (
            not wallet.next_unlock_timestamp or unlock_timestamps[0] < wallet.next_unlock_timestamp):
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
    return pt


@returns()
@arguments(transaction_id=(int, long), backlog_type=unicode)
def _save_transaction_to_backlog(transaction_id, backlog_type):
    return  # Temporarily disabled
    if backlog_type not in ('tierion', 'git'):
        raise Exception('Invalid backlog_type')
    cfg = get_config(NAMESPACE)
    if not (cfg.ledger.url or cfg.ledger.secret):
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
        data['from'] = hmac.new(cfg.ledger.secret.encode(), transaction.from_user.email(), hashlib.sha1).hexdigest()
    if transaction.to_user:
        data['to'] = hmac.new(cfg.ledger.secret.encode(), transaction.to_user.email(), hashlib.sha1).hexdigest()
    headers = {
        'Authorization': cfg.ledger.secret
    }
    url = cfg.ledger.url + '/transactions/%s' % backlog_type
    result = urlfetch.fetch(url, json.dumps(data), urlfetch.POST, headers, deadline=30)
    if result.status_code not in (200, 201):
        logging.info('Status:%s Content: %s', result.status_code, result.content)
        raise Exception('Failed to add transaction to backlog')
