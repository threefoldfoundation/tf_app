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
from mcfw.exceptions import HttpBadRequestException
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.tff_backend.consts.payment import COIN_TO_HASTINGS
from plugins.tff_backend.rivine import get_transactions, create_transaction, create_signature_data
from plugins.tff_backend.to.rivine import CryptoTransactionTO, CreateSignatureDataTO, TransactionListTO, \
    TransactionTO, CryptoTransactionOutputTO


@rest('/wallet/transactions', 'get')
@returns(TransactionListTO)
@arguments(address=unicode)
def api_get_transactions(address):
    to = TransactionListTO()
    to.results = []
    for t in get_transactions(address):
        trans_to = TransactionTO()
        trans_to.id = t['id']
        trans_to.status = t['status']
        trans_to.timestamp = t['timestamp']
        trans_to.spent = t['spent']
        trans_to.inputs = []
        for i in t['inputs']:
            co = CryptoTransactionOutputTO()
            co.value = i['value']
            co.unlockhash = i['unlockhash']
            trans_to.inputs.append(co)
        trans_to.outputs = []
        for o in t['outputs']:
            co = CryptoTransactionOutputTO()
            co.value = o['value']
            co.unlockhash = o['unlockhash']
            trans_to.outputs.append(co)
        to.results.append(trans_to)
    return to


@rest('/wallet/create_signature_data', 'post')
@returns(CryptoTransactionTO)
@arguments(data=CreateSignatureDataTO)
def api_create_signature_data_transaction(data):
    try:
        amount = data.amount * pow(10, data.precision) * COIN_TO_HASTINGS
        return create_signature_data(data.from_address, data.to_address, amount)
    except Exception as e:
        raise HttpBadRequestException(e.message)


@rest('/wallet/transactions', 'post')
@returns()
@arguments(data=CryptoTransactionTO)
def api_create_transaction(data):
    create_transaction(data)
