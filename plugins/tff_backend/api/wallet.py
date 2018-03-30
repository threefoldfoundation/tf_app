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

from mcfw import restapi
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.tff_backend.consts.payment import COIN_TO_HASTINGS
from plugins.tff_backend.rivine import get_transactions, create_transaction, create_signature_data, get_block_height
from plugins.tff_backend.to.rivine import CryptoTransactionTO, CreateSignatureDataTO


def _set_access_control_header():
    response = restapi.GenericRESTRequestHandler.getCurrentResponse()
    response.headers['Access-Control-Allow-Origin'] = '*'


@rest('/wallet/latest', 'get', silent_result=True)
@returns(dict)
@arguments()
def api_get_latest_block():
    _set_access_control_header()
    return {'height': get_block_height()}


@rest('/wallet/transactions', 'get', silent_result=True)
@returns([dict])
@arguments(address=unicode)
def api_get_transactions(address):
    _set_access_control_header()
    return get_transactions(address)


@rest('/wallet/create_signature_data', 'post')
@returns(CryptoTransactionTO)
@arguments(data=CreateSignatureDataTO)
def api_create_signature_data_transaction(data):
    _set_access_control_header()
    amount = long(round(data.amount)) * COIN_TO_HASTINGS / pow(10, data.precision)
    return create_signature_data(data.from_address, data.to_address, amount)


@rest('/wallet/create_signature_data', 'options')
@returns()
@arguments()
def api_create_signature_data_transaction_options():
    pass


@rest('/wallet/transactions', 'post')
@returns(dict)
@arguments(data=CryptoTransactionTO)
def api_create_transaction(data):
    _set_access_control_header()
    return create_transaction(data)


@rest('/wallet/transactions', 'options')
@returns()
@arguments()
def api_create_transaction_options():
    pass
