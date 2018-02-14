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

import webapp2

from plugins.tff_backend.bizz.agreements import create_hosting_agreement_pdf, create_token_agreement_pdf
from plugins.tff_backend.bizz.investor import _get_currency_name
from plugins.tff_backend.consts.payment import TOKEN_TFT


class AgreementsTestingPageHandler(webapp2.RequestHandler):
    def get(self, *args, **kwargs):
        type_ = self.request.get("type", "investor")
        name = u"__NAME__"
        address = u"__ADDRESS__"

        if type_ == "hoster":
            pdf = create_hosting_agreement_pdf(name, address)
        elif type_ == "investor":
            token = self.request.get("token", TOKEN_TFT)
            currency = self.request.get("currency", "USD")
            amount = 123.456789123456789
            pdf = create_token_agreement_pdf(name, address, amount, _get_currency_name(currency), currency, token,
                                             payment_info=None, has_verified_utility_bill=True)
        else:
            self.response.out.write(u"Invalid pdf type %s" % type_)
            return

        self.response.headers['Content-Type'] = 'application/pdf'
        self.response.headers['Content-Disposition'] = str('inline; filename=testing.pdf')
        self.response.out.write(pdf)
