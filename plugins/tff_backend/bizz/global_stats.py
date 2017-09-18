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
import time

from google.appengine.api import urlfetch
from google.appengine.ext import ndb

from framework.utils import urlencode
from mcfw.exceptions import HttpNotFoundException, HttpBadRequestException
from mcfw.rpc import parse_complex_value
from plugins.tff_backend.models.global_stats import GlobalStats, CurrencyValue
from plugins.tff_backend.plugin_consts import SUPPORTED_CURRENCIES
from plugins.tff_backend.to.global_stats import GlobalStatsTO, YahooFinanceCurrencyResultTO, CurrencyValueTO, \
    YahooFinanceCurrencyConversionTO


class ApiCallException(Exception):
    pass


def list_global_stats():
    # type: () -> list[GlobalStats]
    return GlobalStats.list()


def get_global_stats(stats_id):
    # type: (unicode) -> GlobalStats
    return GlobalStats.create_key(stats_id).get()


def put_global_stats(stats_id, stats):
    # type: (unicode, GlobalStatsTO) -> GlobalStats
    assert isinstance(stats, GlobalStatsTO)
    invalid_currencies = [c.currency for c in stats.currencies if c.currency not in SUPPORTED_CURRENCIES]
    if invalid_currencies:
        raise HttpBadRequestException('invalid_currencies', {'currencies': invalid_currencies})
    stats_model = GlobalStats.create_key(stats_id).get()  # type: GlobalStats
    if not stats_model:
        raise HttpNotFoundException('global_stats_not_found')
    currencies = _get_currency_conversions(stats.currencies, stats.value)
    stats_model.populate(currencies=currencies, **stats.to_dict(exclude=['id', 'market_cap', 'currencies']))
    stats_model.put()
    return stats_model


def update_currencies():
    to_put = []
    for stats in GlobalStats.query():
        stats.currencies = _get_currency_conversions(stats.currencies, stats.value)
        to_put.append(stats)
    ndb.put_multi(to_put)


def _get_currency_conversions(currencies, dollar_value):
    # type: (list[CurrencyValueTO | CurrencyValue]) -> list[CurrencyValue]
    currency_result = _get_current_currency_rates(currencies)
    result_list = []
    for currency in currencies:
        if currency.auto_update:
            result = filter(lambda r: r.id == '%sUSD' % currency.currency, currency_result.results.rate)[0]
            assert isinstance(result, YahooFinanceCurrencyConversionTO)
            time_tuple = time.strptime('%s %s' % (result.Date, result.Time.upper()), '%m/%d/%Y %H:%M%p')
            timestamp = long(time.mktime(time_tuple))
            value = dollar_value / float(result.Rate)
        else:
            value = currency.value
            timestamp = currency.timestamp
        result_list.append(CurrencyValue(currency=currency.currency, value=value, timestamp=timestamp,
                                         auto_update=currency.auto_update))
    return result_list


def _get_current_currency_rates(currencies):
    # type: (list[CurrencyValueTO | CurrencyValue]) -> YahooFinanceCurrencyResultTO
    pairs = ', '.join(['"%sUSD"' % c.currency for c in currencies if c.auto_update])
    qry = 'select * from yahoo.finance.xchange where pair in (%s)' % pairs
    qryparams = {
        'format': 'json',
        'q': qry,
        'env': 'store://datatables.org/alltableswithkeys'
    }
    url = 'http://query.yahooapis.com/v1/public/yql?%s' % urlencode(qryparams)
    logging.info('Request to %s', url)
    result = urlfetch.fetch(url)
    logging.info('Request result %s %s', result.status_code, result.content)
    content = json.loads(result.content)['query']
    if content['count'] == 1:  # In case there's only one currency, force that an array is returned
        content['results']['rate'] = [content['results']['rate']]
    return parse_complex_value(YahooFinanceCurrencyResultTO, content, False)
