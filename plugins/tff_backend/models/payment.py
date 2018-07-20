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


class ThreeFoldBaseTransaction(NdbModel):
    NAMESPACE = NAMESPACE
    timestamp = ndb.IntegerProperty()
    unlock_timestamps = ndb.IntegerProperty(repeated=True, indexed=False)  # type: list[int]
    unlock_amounts = ndb.IntegerProperty(repeated=True, indexed=False)  # type: list[int]
    token = ndb.StringProperty()
    token_type = ndb.StringProperty()
    amount = ndb.IntegerProperty()
    precision = ndb.IntegerProperty(default=2)
    memo = ndb.StringProperty()
    app_users = ndb.UserProperty(repeated=True)  # TODO: remove after migration 014
    from_user = ndb.UserProperty()  # TODO: remove after migration 014
    to_user = ndb.UserProperty()  # TODO: remove after migration 014
    usernames = ndb.StringProperty()
    from_username = ndb.StringProperty()
    to_username = ndb.StringProperty()


class ThreeFoldTransaction(ThreeFoldBaseTransaction):
    amount_left = ndb.IntegerProperty()
    fully_spent = ndb.BooleanProperty()
    height = ndb.IntegerProperty()

    @property
    def id(self):
        return self.key.id()

    @classmethod
    def create_new(cls):
        return cls(namespace=NAMESPACE)

    @classmethod
    def list_with_amount_left(cls, username):
        return cls.query() \
            .filter(cls.to_username == username) \
            .filter(cls.fully_spent == False) \
            .order(-cls.timestamp)  # noQA


class ThreeFoldPendingTransaction(ThreeFoldBaseTransaction):
    STATUS_PENDING = u'pending'
    STATUS_CONFIRMED = u'confirmed'
    STATUS_FAILED = u'failed'

    synced = ndb.BooleanProperty()
    synced_status = ndb.StringProperty()

    @property
    def id(self):
        return self.key.string_id().decode('utf8')

    @classmethod
    def create_key(cls, transaction_id):
        return ndb.Key(cls, u"%s" % transaction_id, namespace=NAMESPACE)

    @classmethod
    def list_by_user(cls, username):
        return cls.query() \
            .filter(cls.usernames == username) \
            .order(-cls.timestamp)
