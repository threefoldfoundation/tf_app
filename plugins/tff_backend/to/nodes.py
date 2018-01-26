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

from google.appengine.api import search
from google.appengine.ext import ndb

from framework.to import TO
from mcfw.properties import long_property, unicode_property, typed_property
from plugins.tff_backend.models.hoster import NodeOrder
from plugins.tff_backend.to import PaginatedResultTO
from plugins.tff_backend.to.iyo.see import IYOSeeDocument


class ContactInfoTO(TO):
    name = unicode_property('name')
    email = unicode_property('email')
    phone = unicode_property('phone')
    address = unicode_property('address')


class NodeOrderTO(TO):
    id = long_property('id')
    app_user = unicode_property('app_user')
    billing_info = typed_property('billing_info', ContactInfoTO)
    shipping_info = typed_property('shipping_info', ContactInfoTO)
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
    odoo_sale_order_id = long_property('odoo_sale_order_id')
    socket = unicode_property('socket')
    document_url = unicode_property('document_url')


class CreateNodeOrderTO(TO):
    app_user = unicode_property('app_user')
    billing_info = typed_property('billing_info', ContactInfoTO)  # type: ContactInfoTO
    shipping_info = typed_property('shipping_info', ContactInfoTO)  # type: ContactInfoTO
    status = long_property('status')
    order_time = long_property('order_time')
    sign_time = long_property('sign_time')
    send_time = long_property('send_time')
    odoo_sale_order_id = long_property('odoo_sale_order_id')
    document = unicode_property('document')


class NodeOrderDetailsTO(NodeOrderTO):
    see_document = typed_property('see_document', IYOSeeDocument)  # type: IYOSeeDocument

    @classmethod
    def from_model(cls, model, see_document):
        to = super(NodeOrderDetailsTO, cls).from_model(model)
        to.see_document = see_document
        return to


class NodeOrderListTO(PaginatedResultTO):
    results = typed_property('results', NodeOrderTO, True)

    @classmethod
    def from_query(cls, models, cursor, more):
        assert isinstance(cursor, (ndb.Cursor, NoneType))
        results = [NodeOrderTO.from_model(model) for model in models]
        return cls(cursor and cursor.to_websafe_string().decode('utf-8'), more, results)

    @classmethod
    def from_search(cls, models, cursor, more):
        # type: (list[NodeOrder], search.Cursor, bool) -> object
        assert isinstance(cursor, (search.Cursor, NoneType))
        orders = [NodeOrderTO.from_model(model) for model in models]
        return cls(cursor and cursor.web_safe_string.decode('utf-8'), more, orders)
