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

from Queue import Queue, Empty
import json
import logging
from threading import Thread
import time

from google.appengine.api import urlfetch
from google.appengine.ext import deferred, ndb

from framework.utils import now
from mcfw.consts import DEBUG
from plugins.tff_backend.models.payment import RivineBlockHeight, \
    ThreeFoldWallet

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


def get_transactions(address):
    info = get_info_by_hash(address)
    if info['hashtype'] != "unlockhash":
        return []

    transactions = []
    for t in info['transactions']:
        if not t['coinoutputids'] or len(t['coinoutputids']) == 0:
            continue

        for sco_id, co in zip(t['coinoutputids'], t['rawtransaction']['coinoutputs']):
            if co['unlockhash'] != address:
                continue

            transactions.append({'output_id': sco_id,
                                 'inputs': t['coininputoutputs'],
                                 'outputs': t['rawtransaction']['coinoutputs'],
                                 'amount': unicode(co['value']),
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
    transactions = get_transactions(address)
    for t in transactions:
        if t['spent']:
            continue
        amount += long(t['amount'])
    return amount


def get_output_ids(address):
    d = []
    transactions = get_transactions(address)
    for t in transactions:
        if t['spent']:
            continue
        d.append(t)
    return d


def create_transaction(data):
    url = 'http://localhost:23110/transactionpool/transactions'
    logging.warn('url: %s\ndata: %s', url, data)
    payload = data
    headers = {}
    headers['user-agent'] = "Rivine-Agent"
    headers['authorization'] = 'Basic test123'
    response = urlfetch.fetch(url=url, payload=json.dumps(payload), method=urlfetch.POST, headers=headers, deadline=10)
    raise Exception(u'%s: %s\n%s' % (url, response.status_code, response.content))


def sync_block_height():
    live_block_height = get_block_height() - MATURITY_DEPTH

    def trans():
        bh = RivineBlockHeight.get_block_height()
        if bh.updating:
            logging.debug("sync_block_height was already updating")

        elif bh.height < 0:
            logging.debug("sync_block_height ran for the first time")
            bh.height = live_block_height
            bh.put()

        elif bh.height < live_block_height:
            logging.debug("sync_block_height updating height from %s to %s", bh.height, live_block_height)
            bh.updating = True
            bh.put()
            deferred.defer(_sync_block_height, bh.height, live_block_height, _transactional=True)

    ndb.transaction(trans)


def _sync_block_height(current_block_height, to_height):
    start_time = time.time()

    work = Queue()
    results = Queue()

    from_height = current_block_height + 1

    for h in range(from_height, to_height):
        work.put(h)

    def slave():

        def process_miner_payouts(b):
            if not b['rawblock']['minerpayouts']:
                return

            for mp in b['rawblock']['minerpayouts']:
                results.put(mp['unlockhash'])

        def process_transactions(b):
            for t in b['transactions']:
                if not t['rawtransaction']['coinoutputs']:
                    continue

                if 'coininputoutputs' not in t or not t['coininputoutputs']:
                    for co in t['rawtransaction']['coinoutputs']:
                        results.put(co['unlockhash'])
                else:
                    for cio in t['coininputoutputs']:
                        results.put(cio['unlockhash'])

                    for co in t['rawtransaction']['coinoutputs']:
                        results.put(co['unlockhash'])

        while True:
            try:
                h = work.get_nowait()
            except Empty:
                break  # No more work, goodbye

            try:
                b = get_block_by_height(h)
                process_miner_payouts(b)
                process_transactions(b)

            except Exception as e:
                results.put(e)

    threads = []
    for _ in xrange(10):
        t = Thread(target=slave)
        t.start()
        threads.append(t)

    for t in threads:
        t.join()

    addresses = set()
    while not results.empty():
        r = results.get()
        if isinstance(r, Exception):
            raise r
        else:
            addresses.add(r)

    def trans():
        bh = RivineBlockHeight.get_block_height()
        if not bh.updating:
            return 0

        bh.timestamp = now()
        bh.updating = False
        bh.height = to_height
        bh.put()

        deferred.defer(_update_wallets_with_addresses, addresses, _transactional=True)

        return len(addresses)

    size = ndb.transaction(trans, xg=True)

    took_time = time.time() - start_time
    msg = 'sync_transactions Took {0:.3f}s to sync block {1} -> {2} and resulted in {3} updated addresses'
    logging.info(msg.format(took_time, from_height, to_height, size))


def _update_wallets_with_addresses(addresses):
    for address in addresses:
        deferred.defer(_update_wallet_with_address, address)


def _update_wallet_with_address(address):
    from plugins.tff_backend.bizz.payment import sync_payment_asset

    for wallet in ThreeFoldWallet.list_by_address(address):
        deferred.defer(sync_payment_asset, wallet.app_user, address)
