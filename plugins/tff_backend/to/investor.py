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
from types import NoneType

from google.appengine.ext import ndb

from framework.to import TO
from mcfw.properties import long_property, unicode_property, typed_property, float_property
from plugins.tff_backend.models.investor import InvestmentAgreement
from plugins.tff_backend.to import PaginatedResultTO
from plugins.tff_backend.to.iyo.see import IYOSeeDocument


class InvestmentAgreementTO(TO):
    id = long_property('id')
    app_user = unicode_property('app_user')
    amount = float_property('amount')
    referrer = unicode_property('referrer')
    token = unicode_property('token')
    token_count = float_property('token_count')
    currency = unicode_property('currency')
    name = unicode_property('name')
    address = unicode_property('address')
    iyo_see_id = unicode_property('iyo_see_id')
    signature_payload = unicode_property('signature_payload')
    signature = unicode_property('signature')
    status = long_property('status')
    creation_time = long_property('creation_time')
    sign_time = long_property('sign_time')
    paid_time = long_property('paid_time')
    cancel_time = long_property('cancel_time')
    modification_time = long_property('modification_time')


class InvestmentAgreementDetailsTO(InvestmentAgreementTO):
    see_document = typed_property('see_document', IYOSeeDocument)

    @classmethod
    def from_model(cls, model, see_document):
        # type: (InvestmentAgreement, IYOSeeDocument) -> cls
        assert isinstance(model, InvestmentAgreement)
        to = super(InvestmentAgreementDetailsTO, cls).from_model(model)
        to.see_document = see_document
        return to


class InvestmentAgreementListTO(PaginatedResultTO):
    results = typed_property('results', InvestmentAgreementTO, True)

    def __init__(self, cursor=None, more=False, results=None):
        super(InvestmentAgreementListTO, self).__init__(cursor, more)
        self.results = results or []

    @classmethod
    def from_query(cls, models, cursor, more):
        # type: (list[InvestmentAgreement], ndb.Cursor, bool) -> object
        assert isinstance(cursor, (ndb.Cursor, NoneType))
        orders = [InvestmentAgreementTO.from_model(model) for model in models]
        return cls(cursor and cursor.to_websafe_string().decode('utf-8'), more, orders)
