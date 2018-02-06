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

from framework.bizz.job import run_job
from plugins.tff_backend.bizz.investor import multiply_tokens_for_agreements, create_token_value_agreement
from plugins.tff_backend.models.document import Document, DocumentType
from plugins.tff_backend.models.investor import InvestmentAgreement, PaymentInfo
from plugins.tff_backend.models.user import TffProfile


def migrate(dry_run=False):
    run_job(_get_all_profiles, [], _create_token_value_agreement_if_needed, [])


def _get_all_profiles():
    return TffProfile.query()


def _create_token_value_agreement_if_needed(profile_key):
    profile = profile_key.get()  # type: TffProfile
    investments = [i for i in InvestmentAgreement.list_by_user(profile.app_user) if
                   PaymentInfo.HAS_MULTIPLIED_TOKENS not in i.payment_info]  # type list[InvestmentAgreement]
    statuses = [InvestmentAgreement.STATUS_PAID, InvestmentAgreement.STATUS_SIGNED]
    canceled_or_started_investments = [i for i in investments if i.status not in statuses]
    to_put, token_count = multiply_tokens_for_agreements(canceled_or_started_investments)
    assert (token_count == 0, 'Expected token_count to be 0')
    logging.info('Updated %s agreements for user %s', len(to_put), profile.username)
    if to_put:
        ndb.put_multi(to_put)
    has_document = any(
        d.type == DocumentType.TOKEN_VALUE_ADDENDUM.value for d in Document.list_by_username(profile.username))
    if any(i.status in statuses for i in investments) and not has_document:
        create_token_value_agreement(profile.username)
