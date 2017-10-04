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
import logging

from google.appengine.ext import ndb

from plugins.tff_backend.bizz.investor import _set_token_count
from plugins.tff_backend.models.investor import InvestmentAgreement


def fix_investments():
    investments = InvestmentAgreement.query().filter(InvestmentAgreement.status > InvestmentAgreement.STATUS_CANCELED)
    to_put = []
    to_fix = []
    for agreement in investments:  # type: InvestmentAgreement
        if not agreement.token_count:
            if not agreement.iyo_see_id:
                _set_token_count(agreement)
                to_put.append(agreement)
            elif agreement.currency != 'BTC':
                to_fix.append(agreement.id)
    ndb.put_multi(to_put)
    logging.warn('These investment agreements need manual migration: %s', to_fix)


def manual_fix():
    mapping = {
        5667908084563968: 0.85
    }  # Incomplete
    to_put = []
    agreements = ndb.get_multi([InvestmentAgreement.create_key(id) for id in mapping])
    for agreement in agreements:  # type: InvestmentAgreement
        token_count_float = agreement.amount / (mapping[agreement.id] * 5)
        precision = 8 if agreement.currency == 'BTC' else 2
        agreement.token_count = long(token_count_float * pow(10, precision))
        agreement.token_precision = precision
        to_put.append(agreement)
    ndb.put_multi(to_put)
