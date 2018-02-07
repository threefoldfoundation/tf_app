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

from google.appengine.api.search import MAXIMUM_DOCUMENTS_RETURNED_PER_SEARCH

from framework.bizz.authentication import get_current_session
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.tff_backend.bizz.audit.audit import audit
from plugins.tff_backend.bizz.audit.mapping import AuditLogType
from plugins.tff_backend.bizz.authentication import Scopes
from plugins.tff_backend.bizz.investor import put_investment_agreement, create_investment_agreement
from plugins.tff_backend.bizz.iyo.utils import get_app_user_from_iyo_username
from plugins.tff_backend.dal.investment_agreements import search_investment_agreements, get_investment_agreement
from plugins.tff_backend.to.investor import InvestmentAgreementListTO, InvestmentAgreementTO, \
    CreateInvestmentAgreementTO, InvestmentAgreementDetailTO
from plugins.tff_backend.utils.search import sanitise_search_query


@rest('/investment-agreements', 'get', Scopes.BACKEND_ADMIN, silent_result=True)
@returns(InvestmentAgreementListTO)
@arguments(page_size=(int, long), cursor=unicode, query=unicode, status=(int, long))
def api_get_investment_agreements(page_size=20, cursor=None, query=None, status=None):
    page_size = min(page_size, MAXIMUM_DOCUMENTS_RETURNED_PER_SEARCH)
    filters = {'status': status}
    return InvestmentAgreementListTO.from_search(
        *search_investment_agreements(sanitise_search_query(query, filters), page_size, cursor))


@rest('/investment-agreements', 'post', Scopes.BACKEND_ADMIN, silent=True)
@returns(InvestmentAgreementDetailTO)
@arguments(data=CreateInvestmentAgreementTO)
def api_create_investment_agreement(data):
    return InvestmentAgreementDetailTO.from_dict(create_investment_agreement(data).to_dict(['username']))


@rest('/investment-agreements/<agreement_id:[^/]+>', 'get', Scopes.BACKEND_ADMIN)
@returns(InvestmentAgreementDetailTO)
@arguments(agreement_id=(int, long))
def api_get_investment_agreement(agreement_id):
    return InvestmentAgreementDetailTO.from_dict(get_investment_agreement(agreement_id).to_dict(['username']))


@audit(AuditLogType.UPDATE_INVESTMENT_AGREEMENT, 'agreement_id')
@rest('/investment-agreements/<agreement_id:[^/]+>', 'put', Scopes.BACKEND_ADMIN)
@returns(InvestmentAgreementDetailTO)
@arguments(agreement_id=(int, long), data=InvestmentAgreementTO)
def api_put_investment_agreement(agreement_id, data):
    app_user = get_app_user_from_iyo_username(get_current_session().user_id)
    agreement = put_investment_agreement(agreement_id, data, app_user)
    return InvestmentAgreementDetailTO.from_dict(agreement.to_dict(['username']))
