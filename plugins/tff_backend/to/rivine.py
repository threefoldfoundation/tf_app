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

from framework.to import TO
from mcfw.properties import long_property, unicode_property, typed_property, bool_property, float_property
from plugins.tff_backend.to import PaginatedResultTO


class PaymentAssetRequiredActionTO(TO):
    action = unicode_property('1')
    description = unicode_property('2')
    data = unicode_property('3')


class PaymentAssetBalanceTO(TO):
    amount = long_property('1')
    description = unicode_property('2')
    precision = long_property('3')


class PaymentProviderAssetTO(TO):
    provider_id = unicode_property('1')
    id = unicode_property('2')
    type = unicode_property('3')
    name = unicode_property('4')
    currency = unicode_property('5')
    available_balance = typed_property('6', PaymentAssetBalanceTO)
    total_balance = typed_property('7', PaymentAssetBalanceTO)
    verified = bool_property('8')
    enabled = bool_property('9')
    has_balance = bool_property('10')
    has_transactions = bool_property('11')
    required_action = typed_property('12', PaymentAssetRequiredActionTO)


class PublicPaymentProviderTransactionTO(TO):
    id = unicode_property('1')
    timestamp = long_property('2')
    currency = unicode_property('3')
    amount = long_property('4')
    precision = long_property('5')
    status = unicode_property('6')


class CryptoTransactionInputTO(TO):
    parent_id = unicode_property('1')
    timelock = long_property('2')


class CryptoTransactionOutputTO(TO):
    value = unicode_property('1')
    unlockhash = unicode_property('2')


class CryptoTransactionDataTO(TO):
    input = typed_property('1', CryptoTransactionInputTO, False)
    outputs = typed_property('2', CryptoTransactionOutputTO, True)
    timelock = long_property('3', default=0)
    algorithm = unicode_property('4', default=None)
    public_key_index = long_property('5', default=0)
    public_key = unicode_property('6', default=None)
    signature_hash = unicode_property('7', default=None)
    signature = unicode_property('8', default=None)


class CryptoTransactionTO(TO):
    minerfees = unicode_property('1')
    data = typed_property('2', CryptoTransactionDataTO, True)
    from_address = unicode_property('3')
    to_address = unicode_property('4')


class CreateSignatureDataTO(TO):
    amount = float_property('amount')
    precision = long_property('precision')
    from_address = unicode_property('from_address')
    to_address = unicode_property('to_address')


class PaymentProviderSignatureDataTransactionTO(TO):
    id = unicode_property('1')
    amount = long_property('2')
    precision = long_property('3')
    memo = unicode_property('4')
    from_asset_id = unicode_property('5')
    to_asset_id = unicode_property('6')


class PaymentProviderTransactionTO(TO):
    id = unicode_property('1')
    type = unicode_property('2')
    name = unicode_property('3')
    amount = long_property('4')
    currency = unicode_property('5')
    memo = unicode_property('6')
    timestamp = long_property('7')
    from_asset_id = unicode_property('8')
    to_asset_id = unicode_property('9')
    precision = long_property('10')
    crypto_transaction = typed_property('11', CryptoTransactionTO, False)


class GetPaymentTransactionsResponseTO(TO):
    cursor = unicode_property('1', default=None)
    transactions = typed_property('2', PaymentProviderTransactionTO, True)


class CreateTransactionResponseTO(TO):
    status = unicode_property('1')


class TransactionTO(TO):
    id = unicode_property('id')
    status = unicode_property('status')
    timestamp = long_property('timestamp')
    inputs = typed_property('inputs', CryptoTransactionOutputTO, True)
    outputs = typed_property('outputs', CryptoTransactionOutputTO, True)
    minerfees = unicode_property('minerfees')


class TransactionListTO(PaginatedResultTO):
    results = typed_property('results', TransactionTO, True)


class WalletBalanceTO(TO):
    available = long_property('available')
    total = long_property('total')
    description = unicode_property('description')
    token = unicode_property('token')
    precision = long_property('precision')
