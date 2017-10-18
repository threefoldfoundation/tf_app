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

from mcfw.consts import MISSING
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.its_you_online_auth.bizz.profile import search_profiles, get_profile
from plugins.tff_backend.bizz.authentication import Scopes
from plugins.tff_backend.bizz.iyo.utils import get_app_user_from_iyo_username
from plugins.tff_backend.bizz.payment import transfer_genesis_coins_to_user, get_pending_transactions, get_all_balances
from plugins.tff_backend.to.payment import NewTransactionTO, PendingTransactionTO, PendingTransactionListTO, \
    WalletBalanceTO


@rest('/users', 'get', Scopes.TEAM)
@returns(dict)  # CBA to create proper type
@arguments(page_size=(int, long), cursor=unicode, query=unicode)
def api_search_users(page_size=50, cursor=None, query=''):
    profiles, cursor, more = search_profiles(query, page_size, cursor)
    return {
        'cursor': cursor and cursor.web_safe_string.encode('utf-8'),
        'more': more,
        'results': [profile.to_dict() for profile in profiles],
    }


@rest('/users/<username:[^/]+>', 'get', Scopes.TEAM)
@returns(dict)
@arguments(username=str)
def api_get_user(username):
    username = username.decode('utf-8')  # username must be unicode
    return get_profile(username).to_dict()


@rest('/users/<username:[^/]+>/transactions', 'get', Scopes.TEAM)
@returns(PendingTransactionListTO)
@arguments(username=str, token_type=unicode, page_size=(int, long), cursor=unicode)
def api_get_transactions(username, token_type=None, page_size=50, cursor=None):
    username = username.decode('utf-8')  # username must be unicode
    app_user = get_app_user_from_iyo_username(username)
    return PendingTransactionListTO.from_query(*get_pending_transactions(app_user, token_type, page_size, cursor))


@rest('/users/<username:[^/]+>/balance', 'get', Scopes.TEAM)
@returns([WalletBalanceTO])
@arguments(username=str)
def api_get_balance(username):
    username = username.decode('utf-8')  # username must be unicode
    app_user = get_app_user_from_iyo_username(username)
    return get_all_balances(app_user)


@rest('/users/<username:[^/]+>/transactions', 'post', Scopes.ADMINS)
@returns(PendingTransactionTO)
@arguments(username=str, data=NewTransactionTO)
def api_create_transaction(username, data):
    # type: (unicode, NewTransactionTO) -> PendingTransactionTO
    username = username.decode('utf-8')  # username must be unicode
    app_user = get_app_user_from_iyo_username(username)
    date_signed = data.date_signed if data.date_signed is not MISSING else 0
    transaction = transfer_genesis_coins_to_user(app_user, data.token_type, long(data.token_count * 100), data.memo,
                                                 date_signed)
    return PendingTransactionTO.from_model(transaction)
