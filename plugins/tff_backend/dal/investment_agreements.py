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
from datetime import datetime

from google.appengine.api import search
from google.appengine.api.search import SortExpression
from google.appengine.ext import ndb

from framework.bizz.job import run_job, MODE_BATCH
from mcfw.exceptions import HttpNotFoundException
from mcfw.rpc import returns, arguments
from plugins.tff_backend.bizz.iyo.utils import get_username, get_iyo_usernames
from plugins.tff_backend.consts.investor import INVESTMENT_AGREEMENT_SEARCH_INDEX
from plugins.tff_backend.models.investor import InvestmentAgreement
from plugins.tff_backend.plugin_consts import NAMESPACE
from plugins.tff_backend.utils.search import remove_all_from_index

INVESTMENT_INDEX = search.Index(INVESTMENT_AGREEMENT_SEARCH_INDEX, namespace=NAMESPACE)


@returns(InvestmentAgreement)
@arguments(agreement_id=(int, long))
def get_investment_agreement(agreement_id):
    # type: (long) -> InvestmentAgreement
    agreement = InvestmentAgreement.get_by_id(agreement_id)
    if not agreement:
        raise HttpNotFoundException('investment_agreement_not_found')
    return agreement


def index_all_investment_agreements():
    remove_all_from_index(INVESTMENT_INDEX)
    run_job(_get_all_investment_agreements, [], multi_index_investment_agreement, [], mode=MODE_BATCH, batch_size=200)


def _get_all_investment_agreements():
    return InvestmentAgreement.query()


def index_investment_agreement(investment):
    # type: (InvestmentAgreement) -> list[search.PutResult]
    logging.info('Indexing investment agreement %s', investment.id)
    document = create_investment_agreement_document(investment)
    return INVESTMENT_INDEX.put(document)


def multi_index_investment_agreement(order_keys):
    # type: (list[ndb.Key]) -> list[search.PutResult]
    logging.info('Indexing %s investment agreements', len(order_keys))
    return INVESTMENT_INDEX.put([create_investment_agreement_document(order) for order in ndb.get_multi(order_keys)])


def _stringify_float(value):
    # type: (float) -> str
    return str(value).rstrip('0').rstrip('.')


def create_investment_agreement_document(investment):
    # type: (InvestmentAgreement) -> search.Document
    investment_id_str = str(investment.id)
    fields = [
        search.AtomField(name='id', value=investment_id_str),
        search.AtomField(name='reference', value=investment.reference),
        search.NumberField(name='status', value=investment.status),
        search.TextField(name='username', value=investment.username),
        search.DateField(name='creation_time', value=datetime.utcfromtimestamp(investment.creation_time)),
        search.TextField(name='name', value=investment.name),
        search.TextField(name='address', value=investment.address and investment.address.replace('\n', '')),
        search.TextField(name='currency', value=investment.currency),
    ]
    if investment.amount:
        fields.append(search.TextField(name='amount', value=_stringify_float(investment.amount)))
    if investment.token_count:
        fields.append(search.TextField(name='token_count', value=_stringify_float(investment.token_count_float)))
    return search.Document(doc_id=investment_id_str, fields=fields)


def search_investment_agreements(query=None, page_size=20, cursor=None):
    # type: (unicode, int, unicode) -> tuple[list[InvestmentAgreement], search.Cursor, bool]
    options = search.QueryOptions(limit=page_size,
                                  cursor=search.Cursor(cursor),
                                  ids_only=True,
                                  sort_options=search.SortOptions(
                                      expressions=[SortExpression(expression='creation_time',
                                                                  direction=SortExpression.DESCENDING)]))
    search_results = INVESTMENT_INDEX.search(search.Query(query, options=options))  # type: search.SearchResults
    results = search_results.results  # type: list[search.ScoredDocument]
    investment_agreements = ndb.get_multi([InvestmentAgreement.create_key(long(result.doc_id)) for result in results])
    return investment_agreements, search_results.cursor, search_results.cursor is not None


def list_investment_agreements_by_user(username):
    return InvestmentAgreement.list_by_user(username)
