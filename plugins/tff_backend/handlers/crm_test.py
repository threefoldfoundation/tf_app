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

from plugins.tff_backend.bizz.crm.api import upsert_node_order_deal, upsert_investment_deal
from plugins.tff_backend.bizz.crm.api_util import CrmException
from plugins.tff_backend.models.hoster import NodeOrder
from plugins.tff_backend.models.investor import InvestmentAgreement


class CrmTestHandler(webapp2.RequestHandler):
    def get(self, type_, id_):
        thing_id = long(id_)
        try:
            if type_ == 'node-order':
                upsert_node_order_deal(NodeOrder.create_key(thing_id))
            elif type_ == 'investment':
                upsert_investment_deal(InvestmentAgreement.create_key(thing_id))
            else:
                self.abort(404)
            self.response.write('ok')
        except CrmException as e:
            self.response.write('Error from CRM: %d\n%s' % (e.status_code, e.content))
