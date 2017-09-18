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
from mcfw.properties import unicode_property, long_property, typed_property, float_property, \
    bool_property


class CurrencyValueTO(TO):
    currency = unicode_property('currency')
    value = float_property('value')
    timestamp = long_property('timestamp')
    auto_update = bool_property('auto_update')


class GlobalStatsTO(TO):
    id = unicode_property('id')
    name = unicode_property('name')
    token_count = long_property('token_count')
    unlocked_count = long_property('unlocked_count')
    value = long_property('value')
    currencies = typed_property('currencies', CurrencyValueTO, True)  # type: list[CurrencyValueTO]
    market_cap = long_property('market_cap')


class YahooFinanceCurrencyConversionTO(TO):
    id = unicode_property('id')
    Name = unicode_property('Name')
    Rate = unicode_property('Rate')
    Date = unicode_property('Date')  # e.g. 9/15/2017
    Time = unicode_property('Time')  # e.g. 9:26am
    Bid = unicode_property('Bid')
    Ask = unicode_property('Ask')


class YahooFinanceCurrencyRateTO(TO):
    rate = typed_property('rate', YahooFinanceCurrencyConversionTO,
                          True)  # type: list[YahooFinanceCurrencyConversionTO]


class YahooFinanceCurrencyResultTO(TO):
    count = long_property('count')
    created = unicode_property('created')
    lang = unicode_property('lang')
    results = typed_property('results', YahooFinanceCurrencyRateTO, False)  # type: YahooFinanceCurrencyRateTO
