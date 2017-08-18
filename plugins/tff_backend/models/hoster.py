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

from framework.models.common import NdbModel
from framework.utils import chunks
from plugins.tff_backend.plugin_consts import NAMESPACE


class NodeOrder(NdbModel):
    STATUS_CANCELED = -1
    STATUS_CREATED = 0
    STATUS_SIGNED = 1
    STATUS_SENT = 2
    STATUS_ARRIVED = 3

    app_user = ndb.UserProperty()
    name = ndb.StringProperty(indexed=False)
    address = ndb.StringProperty(indexed=False)

    status = ndb.IntegerProperty(default=STATUS_CREATED)
    tos_iyo_see_id = ndb.StringProperty(indexed=False)
    signature_payload = ndb.StringProperty(indexed=False)
    signature = ndb.StringProperty(indexed=False)
    order_time = ndb.IntegerProperty()
    sign_time = ndb.IntegerProperty()
    send_time = ndb.IntegerProperty()
    arrival_time = ndb.IntegerProperty()
    cancel_time = ndb.IntegerProperty()

    @property
    def iyo_username(self):
        from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
        return get_iyo_username(self.app_user)

    @property
    def id(self):
        return self.key.id()

    @property
    def human_readable_id(self):
        return NodeOrder.create_human_readable_id(self.id)

    @classmethod
    def create_key(cls, order_id=None):
        if order_id is None:
            order_id = cls.allocate_ids(1)[0]
        return ndb.Key(cls, order_id, namespace=NAMESPACE)

    @classmethod
    def create_human_readable_id(cls, order_id):
        id_str = str(order_id)
        if len(id_str) % 4 == 0:
            return '.'.join(chunks(id_str, 4))
        return id_str

    @classmethod
    def list(cls):
        return cls.query(namespace=NAMESPACE).fetch()


class PublicKeyMapping(NdbModel):
    label = ndb.StringProperty()  # label on itsyou.online

    @classmethod
    def create_key(cls, public_key, user_email):
        return ndb.Key(cls, public_key, cls, user_email, namespace=NAMESPACE)
