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
from plugins.tff_backend.plugin_consts import NAMESPACE


class AuditLog(NdbModel):
    NAMESPACE = NAMESPACE
    timestamp = ndb.DateTimeProperty(auto_now_add=True)
    audit_type = ndb.StringProperty()
    reference = ndb.KeyProperty()  # type: ndb.Key
    user_id = ndb.StringProperty()
    data = ndb.JsonProperty(compressed=True)

    @classmethod
    def list_by_type(cls, audit_type):
        return cls.query(cls.audit_type == audit_type).order(-cls.timestamp)

    @classmethod
    def list_by_user(cls, user_id):
        return cls.query(cls.user_id == user_id).order(-cls.timestamp)

    @classmethod
    def list_by_type_and_user(cls, audit_type, user_id):
        return cls.list_by_type(audit_type).filter(cls.user_id == user_id)

    @classmethod
    def list(cls):
        return cls.query().order(-cls.timestamp)
