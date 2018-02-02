# -*- coding: utf-8 -*-
# Copyright 2018 GIG Technology NV
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
# @@license_version:1.4@@

from google.appengine.ext import ndb

from enum import Enum
from framework.models.common import NdbModel
from plugins.tff_backend.bizz.gcs import get_serving_url, encrypt_filename
from plugins.tff_backend.plugin_consts import NAMESPACE


class DocumentType(Enum):
    TOKEN_VALUE_ADDENDUM = 'token-value-addendum'


class DocumentStatus(Enum):
    CREATED = 'created'
    SIGNED = 'signed'


class Document(NdbModel):
    username = ndb.StringProperty()
    iyo_see_id = ndb.StringProperty()
    type = ndb.StringProperty(choices=map(lambda x: x.value, DocumentType))
    status = ndb.StringProperty(choices=map(lambda x: x.value, DocumentStatus), default=DocumentStatus.CREATED.value)
    creation_timestamp = ndb.DateTimeProperty(auto_now_add=True)

    @property
    def id(self):
        return self.key.id()

    @property
    def filename(self):
        return self.create_filename(self.type, self.id)

    @property
    def url(self):
        return get_serving_url(self.filename)

    @classmethod
    def create_key(cls, document_id):
        return ndb.Key(cls, document_id, namespace=NAMESPACE)

    @classmethod
    def create_filename(cls, document_type, document_id):
        return u'%s/%s.pdf' % (document_type, encrypt_filename(document_id))

    @classmethod
    def list_by_username(cls, username):
        return cls.query().filter(cls.username == username)
