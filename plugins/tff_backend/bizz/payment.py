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

import time

from google.appengine.api import users
from google.appengine.ext import ndb

from framework.utils import now
from mcfw.rpc import returns, arguments
from plugins.rogerthat_api.exceptions import BusinessException
from plugins.tff_backend.models.payment import ThreeFoldTransaction, ThreeFoldPendingTransaction
from plugins.tff_backend.to.payment import WalletBalanceTO


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


@returns(tuple)
@arguments(app_user=users.User, page_size=(int, long), cursor=unicode)
def get_pending_transactions(app_user, page_size, cursor):
    # type: (users.User, long, unicode) -> tuple[list[ThreeFoldPendingTransaction], ndb.Cursor, bool]
    return ThreeFoldPendingTransaction.list_by_user(app_user) \
        .fetch_page(page_size, start_cursor=ndb.Cursor(urlsafe=cursor))
