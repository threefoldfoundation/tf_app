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

from google.appengine.api import users

from framework.bizz.authentication import get_current_session
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.tff_backend.bizz.authentication import Scopes
from plugins.tff_backend.bizz.investor import get_investment_agreements, get_investment_agreement, \
    put_investment_agreement
from plugins.tff_backend.to.investor import InvestmentAgreementListTO, InvestmentAgreementTO


@rest('/investment-agreements', 'get', Scopes.ADMIN)
@returns(InvestmentAgreementListTO)
@arguments(cursor=unicode, status=(int, long))
def api_get_investment_agreements(cursor=None, status=None):
    return InvestmentAgreementListTO.from_query(*get_investment_agreements(cursor, status))


@rest('/investment-agreements/<agreement_id:[^/]+>', 'get', Scopes.ADMIN)
@returns(InvestmentAgreementTO)
@arguments(agreement_id=(int, long))
def api_get_investment_agreement(agreement_id):
    return InvestmentAgreementTO.from_model(get_investment_agreement(agreement_id))


@rest('/investment-agreements/<agreement_id:[^/]+>', 'put', Scopes.PAYMENT_ADMIN)
@returns(InvestmentAgreementTO)
@arguments(agreement_id=(int, long), data=InvestmentAgreementTO)
def api_put_investment_agreement(agreement_id, data):
    user = users.User('%s@itsyou.online' % get_current_session().user_id)
    agreement = put_investment_agreement(agreement_id, data, user)
    return InvestmentAgreementTO.from_model(agreement)
