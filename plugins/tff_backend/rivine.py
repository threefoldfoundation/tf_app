# -*- coding: utf-8 -*-
# Copyright 2018 GIG Technology NV
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

from framework.plugin_loader import get_config
from mcfw.exceptions import HttpException, HttpBadRequestException
from mcfw.rpc import returns, arguments
from plugins.tff_backend.consts.payment import TOKEN_TFT, COIN_TO_HASTINGS, TransactionStatus
from plugins.tff_backend.plugin_consts import NAMESPACE
from plugins.tff_backend.to.rivine import CryptoTransactionTO, \
    CryptoTransactionDataTO, CryptoTransactionInputTO, CryptoTransactionOutputTO

MATURITY_DEPTH = 10


def get_explorer_base_url():
    rivine_url = get_config(NAMESPACE).rivine_url
    return '%s/explorer' % rivine_url


def do_get_request(url):
    response = urlfetch.fetch(url, deadline=10)
    if response.status_code != 200:
        raise Exception(u'%s %s\n%s' % (url, response.status_code, response.content))
    try:
        return json.loads(response.content)
    except:
        logging.debug(response.content)
        raise


def get_block_height():
    url = get_explorer_base_url()
    r = do_get_request(url)
    return r['height']


def get_block_by_height(height):
    url = '%s/blocks/%s' % (get_explorer_base_url(), height)
    r = do_get_request(url)
    return r['block']


def get_info_by_hash(hash_):
    url = '%s/hashes/%s' % (get_explorer_base_url(), hash_)
    response = urlfetch.fetch(url, deadline=10)  # type: urlfetch._URLFetchResult
    try:
        content = json.loads(response.content)
    except:
        content = response.content
    if response.status_code == 200:
        return content
    elif response.status_code == 400 and 'unrecognized hash' in content['message']:
        return None
    else:
        err = HttpException(content['message'] if isinstance(content, dict) else content)
        err.http_code = response.status_code
        raise err


def get_transactions(address, status=None):
    if status and status not in (TransactionStatus.UNCONFIRMED, TransactionStatus.CONFIRMED):
        return []
    info = get_info_by_hash(address)
    if not info or info['hashtype'] != 'unlockhash':
        return []

    live_block_height = get_block_height() - MATURITY_DEPTH
    transactions = []
    for t in info['transactions']:
        if t['height'] > live_block_height:
            t_status = TransactionStatus.UNCONFIRMED
        else:
            t_status = TransactionStatus.CONFIRMED

        if status and status == TransactionStatus.CONFIRMED and t_status != TransactionStatus.CONFIRMED:
            continue
        elif status and status == TransactionStatus.UNCONFIRMED and t_status != TransactionStatus.UNCONFIRMED:
            continue
        if not t['coinoutputids'] or len(t['coinoutputids']) == 0:
            continue

        for sco_id, co in zip(t['coinoutputids'], t['rawtransaction']['data']['coinoutputs']):
            # todo investigate if correct when fully spent
            if co['unlockhash'] != address:
                continue

            transactions.append({'id': t['id'],
                                 'height': t['height'],
                                 'timestamp': get_block_by_height(t['height'])['rawblock']['timestamp'],
                                 'output_id': sco_id,
                                 'inputs': t['coininputoutputs'],
                                 'outputs': t['rawtransaction']['data']['coinoutputs'],
                                 'amount': unicode(co['value']),
                                 'currency': TOKEN_TFT,
                                 'status': t_status,
                                 'spent': False})

    if not transactions:
        return []

    for t in info['transactions']:
        if not t['rawtransaction']['data']['coininputs'] or len(t['rawtransaction']['data']['coininputs']) == 0:
            continue

        for ci in t['rawtransaction']['data']['coininputs']:
            for t in transactions:
                if ci['parentid'] != t['output_id']:
                    continue
                t['spent'] = True
    return sorted(transactions, key=lambda k: k['timestamp'], reverse=True)


def get_balance(address):
    amount = 0
    transactions = get_transactions(address, TransactionStatus.CONFIRMED)
    for t in transactions:
        if t['spent']:
            continue
        amount += long(t['amount'])
    return amount


def get_output_ids(address):
    d = []
    transactions = get_transactions(address, TransactionStatus.CONFIRMED)
    for t in transactions:
        if t['spent']:
            continue
        d.append(t)
    return d


@returns(CryptoTransactionTO)
@arguments(from_address=unicode, to_address=unicode, amount=long)
def create_signature_data(from_address, to_address, amount):
    logging.info('create_signature_data(%s, %s, %s)', from_address, to_address, amount)
    transactions = get_output_ids(from_address)
    transaction = CryptoTransactionTO(minerfees=unicode(COIN_TO_HASTINGS), data=[], from_address=from_address,
                                      to_address=to_address)
    fee_substracted = False

    amount_left = amount
    for t in transactions:
        data = CryptoTransactionDataTO(timelock=0, outputs=[], algorithm=None, public_key_index=0,
                                       public_key=None, signature_hash=None, signature=None)
        data.input = CryptoTransactionInputTO(parent_id=t['output_id'], timelock=0)
        should_break = False
        a = long(t['amount'])
        if not fee_substracted:
            a -= COIN_TO_HASTINGS
            fee_substracted = True

        if (amount_left - a) > 0:
            data.outputs.append(CryptoTransactionOutputTO(value=unicode(a), unlockhash=to_address))
            amount_left -= a
        else:
            should_break = True
            data.outputs.append(CryptoTransactionOutputTO(value=unicode(amount_left), unlockhash=to_address))
            data.outputs.append(CryptoTransactionOutputTO(value=unicode(a - amount_left), unlockhash=from_address))

        transaction.data.append(data)

        if should_break:
            break
    else:
        raise HttpBadRequestException('insufficient_funds')

    return transaction


@returns(dict)
@arguments(crypto_transaction=CryptoTransactionTO)
def create_transaction_payload(crypto_transaction):
    data = {
        'coininputs': [],
        'coinoutputs': [],
        'blockstakeinputs': None,
        'blockstakeoutputs': None,
        'minerfees': [crypto_transaction.minerfees],
        'arbitrarydata': None
    }
    for d in crypto_transaction.data:
        coininput = {
            u"parentid": d.input.parent_id,
            u"unlocker": {
                u"type": 1,
                u"condition": {
                    u"publickey": u"%s:%s" % (d.algorithm, d.public_key)
                },
                u"fulfillment": {
                    u"signature": d.signature
                }
            }
        }
        data["coininputs"].append(coininput)

    for d in crypto_transaction.data:
        for output in d.outputs:
            coinoutput = {
                u"value": output.value,
                u"unlockhash": output.unlockhash
            }

            data["coinoutputs"].append(coinoutput)

    return {
        'version': 0,
        'data': data
    }


@returns(dict)
@arguments(data=CryptoTransactionTO)
def create_transaction(data):
    payload = create_transaction_payload(data)
    url = '%s/transactionpool/transactions' % get_config(NAMESPACE).rivine_url
    response = urlfetch.fetch(url=url, payload=json.dumps(payload), method=urlfetch.POST, deadline=10)
    logging.info('%d %s', response.status_code, response.content)
    if response.status_code != 200:
        try:
            err_msg = json.loads(response.content)['message']
        except Exception:
            err_msg = response.content
        err = HttpException(err_msg)
        err.http_code = response.status_code
        raise err
    return json.loads(response.content)
