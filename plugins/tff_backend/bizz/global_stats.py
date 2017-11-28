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

from google.appengine.api import urlfetch
from google.appengine.ext import ndb

from framework.plugin_loader import get_config
from framework.utils import now
from mcfw.cache import cached
from mcfw.exceptions import HttpNotFoundException, HttpBadRequestException
from mcfw.rpc import arguments, returns
from plugins.rogerthat_api.exceptions import BusinessException
from plugins.tff_backend.models.global_stats import GlobalStats, CurrencyValue
from plugins.tff_backend.plugin_consts import NAMESPACE
from plugins.tff_backend.to.global_stats import GlobalStatsTO, CurrencyValueTO


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


@arguments(currencies=(CurrencyValueTO, CurrencyValue), dollar_value=(int, long))
def _get_currency_conversions(currencies, dollar_value):
    # type: (list[CurrencyValueTO | CurrencyValue], int) -> list[CurrencyValue]
    currency_result = _get_current_currency_rates()
    result_list = []
    invalid_currencies = [c.currency for c in currencies if c.currency not in currency_result]
    if invalid_currencies:
        raise HttpBadRequestException('invalid_currencies', {'currencies': invalid_currencies})
    for currency in currencies:
        if currency.auto_update:
            value_of_one_usd = currency_result.get(currency.currency)
            currency.value = dollar_value / value_of_one_usd
            currency.timestamp = now()
        result_list.append(CurrencyValue(currency=currency.currency, value=currency.value, timestamp=currency.timestamp,
                                         auto_update=currency.auto_update))
    return result_list


def _get_current_currency_rates():
    # type: () -> dict[unicode, float]
    """
    Keys are currencies, values are the price of 1 USD in that currency
    """
    result = get_fiat_rate()
    result.update(get_crypto_rate())
    return result


def get_fiat_rate():
    # type: () -> dict[unicode, float]
    return {k: 1.0 / v for k, v in json.loads(_get_fiat_rate())['rates'].iteritems()}


def get_crypto_rate():
    # type: () -> dict[unicode, float]
    return {r['symbol']: float(r['price_usd']) for r in json.loads(_get_crypto_rate())}


@cached(1)
@returns(unicode)
@arguments()
def _get_fiat_rate():
    # Max 1000 calls / month with free account
    return _fetch('https://v3.exchangerate-api.com/bulk/%s/USD' % get_config(NAMESPACE).exchangerate_key)


@cached(1)
@returns(unicode)
@arguments()
def _get_crypto_rate():
    return _fetch('https://api.coinmarketcap.com/v1/ticker')


def _fetch(url):
    result = urlfetch.fetch(url)  # type: urlfetch._URLFetchResult
    logging.info('Response from %s: %s %s', url, result.status_code, result.content)
    if result.status_code != 200:
        raise BusinessException('Invalid status from %s: %s' % (url, result.status_code))
    return result.content
