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

from mcfw.properties import long_property, unicode_property, typed_property, bool_property


class PaymentAssetRequiredActionTO(object):
    action = unicode_property('1')
    description = unicode_property('2')
    data = unicode_property('3')


class PaymentAssetBalanceTO(object):
    amount = long_property('1')
    description = unicode_property('2')
    precision = long_property('3')


class PaymentProviderAssetTO(object):
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


class PublicPaymentProviderTransactionTO(object):
    id = unicode_property('1')
    timestamp = long_property('2')
    currency = unicode_property('3')
    amount = long_property('4')
    precision = long_property('5')
    status = unicode_property('6')


class PaymentProviderTransactionTO(object):
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


class GetPaymentTransactionsResponseTO(object):
    cursor = unicode_property('1', default=None)
    transactions = typed_property('2', PaymentProviderTransactionTO, True)


class CreateTransactionResponseTO(object):
    status = unicode_property('1')


class TargetInfoTO(object):
    name = unicode_property('1')
    asset_id = unicode_property('2')