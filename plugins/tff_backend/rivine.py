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

from mcfw.consts import DEBUG
from mcfw.rpc import returns, arguments
from plugins.tff_backend.consts.payment import TOKEN_TFT, TRANS_STATUS_CONFIRMED, \
    TRANS_STATUS_PENDING, COIN_TO_HASTINGS
from plugins.tff_backend.to.payment import CryptoTransactionTO, \
    CryptoTransactionDataTO, CryptoTransactionInputTO, CryptoTransactionOutputTO

MATURITY_DEPTH = 10


def get_explorer_base_url():
    if DEBUG:
        return 'http://localhost:2015/explorer'
    return 'https://explorer.rivine.io/explorer'


def do_get_request(url):
    response = urlfetch.fetch(url, deadline=10)
    if response.status_code != 200:
        raise Exception(u'url: %s\n%s' % (url, response.status_code, response.content))
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
    r = do_get_request(url)
    return r


def get_transactions(address, status=None):
    if status and status not in (TRANS_STATUS_PENDING, TRANS_STATUS_CONFIRMED,):
        return []
    info = get_info_by_hash(address)
    if info['hashtype'] != "unlockhash":
        return []

    live_block_height = get_block_height() - MATURITY_DEPTH
    transactions = []
    for t in info['transactions']:
        if t['height'] > live_block_height:
            t_status = TRANS_STATUS_PENDING
        else:
            t_status = TRANS_STATUS_CONFIRMED

        if status and status == TRANS_STATUS_CONFIRMED and t_status != TRANS_STATUS_CONFIRMED:
            continue
        elif status and status == TRANS_STATUS_PENDING and t_status != TRANS_STATUS_PENDING:
            continue
        if not t['coinoutputids'] or len(t['coinoutputids']) == 0:
            continue


        for sco_id, co in zip(t['coinoutputids'], t['rawtransaction']['coinoutputs']):
            if co['unlockhash'] != address:
                continue

            transactions.append({'id': t['id'],
                                 'height': t['height'],
                                 'timestamp': get_block_by_height(t['height'])['rawblock']['timestamp'],
                                 'output_id': sco_id,
                                 'inputs': t['coininputoutputs'],
                                 'outputs': t['rawtransaction']['coinoutputs'],
                                 'amount': unicode(co['value']),
                                 'currency': TOKEN_TFT,
                                 'status': t_status,
                                 'spent': False})

    if not transactions:
        return []

    for t in info['transactions']:
        if not t['rawtransaction']['coininputs'] or len(t['rawtransaction']['coininputs']) == 0:
            continue

        for ci in t['rawtransaction']['coininputs']:
            for t in transactions:
                if ci['parentid'] != t['output_id']:
                    continue
                t['spent'] = True
    return transactions


def get_balance(address):
    amount = 0
    transactions = get_transactions(address, TRANS_STATUS_CONFIRMED)
    for t in transactions:
        if t['spent']:
            continue
        amount += long(t['amount'])
    return amount


def get_output_ids(address):
    d = []
    transactions = get_transactions(address, TRANS_STATUS_CONFIRMED)
    for t in transactions:
        if t['spent']:
            continue
        d.append(t)
    return d


@returns(CryptoTransactionTO)
@arguments(from_address=unicode, to_address=unicode, amount=(int, long))
def create_signature_data(from_address, to_address, amount):
    transactions = get_output_ids(to_address)
    transaction = CryptoTransactionTO()
    transaction.minerfees = unicode(COIN_TO_HASTINGS)
    transaction.data = []
    transaction.from_address = from_address
    transaction.to_address = to_address

    fee_substracted = False

    amount_left = amount
    for t in transactions:
        data = CryptoTransactionDataTO()
        data.input = CryptoTransactionInputTO(t['output_id'], 0)
        data.outputs = []
        data.timelock = 0
        data.algorithm = None
        data.public_key_index = 0
        data.public_key = None
        data.signature_hash = None
        data.signature = None

        should_break = False
        a = long(t['amount'])
        if not fee_substracted:
            a -= COIN_TO_HASTINGS
            fee_substracted = True

        if (amount_left - a) > 0:
            data.outputs.append(CryptoTransactionOutputTO(unicode(a), to_address))
            amount_left -= a
        else:
            should_break = True
            data.outputs.append(CryptoTransactionOutputTO(unicode(amount_left), to_address))
            data.outputs.append(CryptoTransactionOutputTO(unicode(a - amount_left), from_address))

        transaction.data.append(data)

        if should_break:
            break
    else:
        raise Exception('insufficient_funds')

    return transaction


@returns(dict)
@arguments(crypto_transaction=CryptoTransactionTO)
def create_transaction_payload(crypto_transaction):
    data = {}
    data["coininputs"] = []
    for d in crypto_transaction.data:
        coininput = {
            u"parentid": d.input.parent_id,
            u"unlockconditions": {
                u"timelock": d.input.timelock,
                u"publickeys": [{
                    u"algorithm": d.algorithm,
                    u"key": d.public_key
                }],
                u"signaturesrequired": 1
            }
        }
        data["coininputs"].append(coininput)

    data["coinoutputs"] = []
    for d in crypto_transaction.data:
        for output in d.outputs:
            coinoutput = {
                u"value": output.value,
                u"unlockhash": output.unlockhash
            }

            data["coinoutputs"].append(coinoutput)

    data["blockstakeinputs"] = None
    data["blockstakeoutputs"] = None
    data["minerfees"] = [crypto_transaction.minerfees]  # todo investigate if this should be done/output
    data["arbitrarydata"] = None
    data["transactionsignatures"] = []
    for d in crypto_transaction.data:
        transactionsignature = {
            u"parentid": d.input.parent_id,
            u"publickeyindex": d.public_key_index,
            u"timelock": d.timelock,
            u"coveredfields": {
                u"wholetransaction": True,
                u"coininputs": None,
                u"coinoutputs": None,
                u"blockstakeinputs": None,
                u"blockstakeoutputs": None,
                u"minerfees": None,
                u"arbitrarydata": None,
                u"transactionsignatures": None
            },
            u"signature": d.signature
        }
        data["transactionsignatures"].append(transactionsignature)

    return data


@returns()
@arguments(data=CryptoTransactionTO)
def create_transaction(data):
    payload = create_transaction_payload(data)
    url = 'http://localhost:23110/transactionpool/transactions'
    logging.warn('url: %s\npayload: %s', url, payload)
    headers = {}
    headers['user-agent'] = "Rivine-Agent"
    headers['authorization'] = 'Basic test123'
    response = urlfetch.fetch(url=url, payload=json.dumps(payload), method=urlfetch.POST, headers=headers, deadline=10)
    raise Exception(u'%s: %s\n%s' % (url, response.status_code, response.content))
