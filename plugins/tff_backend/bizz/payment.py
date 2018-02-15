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

from google.appengine.api import urlfetch, users

from framework.plugin_loader import get_config
from framework.utils import urlencode
from mcfw.consts import DEBUG
from mcfw.rpc import returns, arguments
from plugins.tff_backend.consts.payment import TOKEN_TFT, COIN_TO_HASTINGS
from plugins.tff_backend.models.payment import ThreeFoldWallet
from plugins.tff_backend.plugin_consts import NAMESPACE
from plugins.tff_backend.rivine import get_output_ids, create_transaction, \
    get_balance
from plugins.tff_backend.to.payment import CryptoTransactionTO, \
    CryptoTransactionDataTO, CryptoTransactionInputTO, CryptoTransactionOutputTO
from plugins.tff_backend.utils.app import get_app_id_from_app_user


@returns(unicode)
@arguments(app_user=users.User, token=unicode)
def get_asset_id_from_token(app_user, token):
    return u"%s:%s" % (app_user.email(), token)


@returns(users.User)
@arguments(asset_id=unicode)
def get_app_user_from_asset_id(asset_id):
    return users.User(asset_id.rsplit(u":", 1)[0])


@returns(unicode)
@arguments(asset_id=unicode)
def get_token_from_asset_id(asset_id):
    if ":" not in asset_id:
        return TOKEN_TFT
    return asset_id.rsplit(u":", 1)[1]


@returns([unicode])
@arguments(app_user=users.User)
def get_asset_ids(app_user):
    app_id = get_app_id_from_app_user(app_user)
    if app_id != get_config(NAMESPACE).rogerthat.app_id and not DEBUG:
        return []

    if app_user:
        w_key = ThreeFoldWallet.create_key(app_user)
        w = w_key.get()
        if w and w.addresses:
            return w.addresses

    return []


def get_all_balances(app_user):
    balance = 0
    if not app_user:
        return balance

    w_key = ThreeFoldWallet.create_key(app_user)
    w = w_key.get()
    if w and w.addresses:
        for address in w.addresses:
            balance += get_balance(address)

    return balance


def sync_payment_asset(app_user, asset_id):
    cfg = get_config(NAMESPACE)

    args = dict()
    args["app_user"] = app_user.email()
    if asset_id:
        args["asset_id"] = asset_id

    headers = {'Authorization': cfg.rogerthat.payment_secret}

    urlfetch.fetch(
        url=u"%s/payments/callbacks/threefold/sync?%s" % (cfg.rogerthat.url, urlencode(args)),
        method=urlfetch.GET,
        headers=headers,
        deadline=10)


@returns(CryptoTransactionTO)
@arguments(from_asset_id=unicode, to_asset_id=unicode, amount=(int, long))
def create_signature_data(from_asset_id, to_asset_id, amount):
    transactions = get_output_ids(from_asset_id)
    transaction = CryptoTransactionTO()
    transaction.minerfees = unicode(COIN_TO_HASTINGS)
    transaction.data = []
    transaction.from_address = from_asset_id
    transaction.to_address = to_asset_id

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
            data.outputs.append(CryptoTransactionOutputTO(unicode(a), to_asset_id))
            amount_left -= a
        else:
            should_break = True
            data.outputs.append(CryptoTransactionOutputTO(unicode(amount_left), to_asset_id))
            data.outputs.append(CryptoTransactionOutputTO(unicode(a - amount_left), from_asset_id))

        transaction.data.append(data)

        if should_break:
            break
    else:
        raise Exception('insufficient_funds')

    return transaction


@returns()
@arguments(crypto_transaction=CryptoTransactionTO)
def create_rivine_transaction(crypto_transaction):
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

    create_transaction(data)
