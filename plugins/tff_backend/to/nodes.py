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
from google.appengine.ext import ndb

from mcfw.properties import long_property, unicode_property, typed_property, bool_property
from plugins.tff_backend.models.hoster import NodeOrder
from plugins.tff_backend.to import TO


class NodeOrderTO(TO):
    id = long_property('id')
    app_user = unicode_property('app_user')
    name = unicode_property('name')
    address = unicode_property('address')
    status = long_property('status')
    tos_iyo_see_id = unicode_property('tos_iyo_see_id')
    signature_payload = unicode_property('signature_payload')
    signature = unicode_property('signature')
    order_time = long_property('order_time')
    sign_time = long_property('sign_time')
    send_time = long_property('send_time')
    arrival_time = long_property('arrival_time')
    cancel_time = long_property('cancel_time')
    modification_time = long_property('modification_time')
    arrival_qr_code_url = unicode_property('arrival_qr_code_url')

    def __init__(self, id=None, app_user=None, name=None, address=None, status=None, tos_iyo_see_id=None,
                 signature_payload=None, signature=None, order_time=None, sign_time=None, send_time=None,
                 arrival_time=None, cancel_time=None, modification_time=None, arrival_qr_code_url=None):
        for prop, val in locals().iteritems():
            setattr(self, prop, val)

    @classmethod
    def from_model(cls, model):
        # type: (NodeOrder) -> NodeOrderTO
        return cls(**model.to_dict())


class PaginatedResultTO(TO):
    cursor = unicode_property('cursor')
    more = bool_property('more')

    def __init__(self, cursor=None, more=False):
        self.cursor = cursor
        self.more = more


class NodeOrderListTO(PaginatedResultTO):
    results = typed_property('results', NodeOrderTO, True)

    def __init__(self, cursor=None, more=False, results=None):
        super(NodeOrderListTO, self).__init__(cursor, more)
        self.results = results or []

    @classmethod
    def from_query(cls, models, cursor, more):
        # type: (list[NodeOrder], ndb.Cursor, bool) -> object
        orders = [NodeOrderTO.from_model(model) for model in models]
        return cls(cursor.to_websafe_string().decode('utf-8'), more, orders)
