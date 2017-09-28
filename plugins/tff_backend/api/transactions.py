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
from plugins.tff_backend.bizz.authentication import Scopes
from plugins.tff_backend.bizz.iyo.utils import get_app_user_from_iyo_username
from plugins.tff_backend.bizz.payment import transfer_genesis_coins_to_user, get_pending_transactions
from plugins.tff_backend.to.transactions import PendingTransactionListTO, NewTransactionTO, PendingTransactionTO


@rest('/users/<username:[^/]+>/transactions', 'get', Scopes.TEAM)
@returns(PendingTransactionListTO)
@arguments(username=unicode, token_type=unicode, page_size=(int, long), cursor=unicode)
def api_get_transactions(username, token_type=None, page_size=50, cursor=None):
    app_user = get_app_user_from_iyo_username(username)
    return PendingTransactionListTO.from_query(*get_pending_transactions(app_user, token_type, page_size, cursor))


@rest('/users/<username:[^/]+>/transactions', 'post', Scopes.ADMINS)
@returns(PendingTransactionTO)
@arguments(username=unicode, data=NewTransactionTO)
def api_create_transaction(username, data):
    # type: (unicode, NewTransactionTO) -> PendingTransactionTO
    app_user = get_app_user_from_iyo_username(username)
    date_signed = data.date_signed if data.date_signed is not MISSING else 0
    transaction = transfer_genesis_coins_to_user(app_user, data.token_type, data.token_count, data.memo, date_signed)
    return PendingTransactionTO.from_model(transaction)
