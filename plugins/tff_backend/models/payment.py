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

from google.appengine.api import users
from google.appengine.ext import ndb

from framework.models.common import NdbModel
from plugins.tff_backend.plugin_consts import NAMESPACE


class ThreeFoldBlockHeight(NdbModel):
    NAMESPACE = NAMESPACE
    timestamp = ndb.IntegerProperty()
    height = ndb.IntegerProperty()
    updating = ndb.BooleanProperty()

    @classmethod
    def create_key(cls):
        return ndb.Key(cls, u"TFFBlockHeight", namespace=NAMESPACE)

    @staticmethod
    def get_block_height():
        bh_key = ThreeFoldBlockHeight.create_key()
        bh = bh_key.get()
        if bh:
            return bh
        bh = ThreeFoldBlockHeight(key=bh_key)
        bh.height = -1
        bh.timestamp = 0
        bh.updating = False
        return bh


class ThreeFoldWallet(NdbModel):
    NAMESPACE = NAMESPACE
    tokens = ndb.StringProperty(repeated=True)
    next_unlock_timestamp = ndb.IntegerProperty()

    @property
    def app_user(self):
        return users.User(self.key.string_id().decode('utf8'))

    @classmethod
    def create_key(cls, app_user):
        return ndb.Key(cls, app_user.email(), namespace=NAMESPACE)

    @classmethod
    def list_update_needed(cls, now_):
        return ThreeFoldWallet.query() \
            .filter(ThreeFoldWallet.next_unlock_timestamp > 0) \
            .filter(ThreeFoldWallet.next_unlock_timestamp < now_)


class ThreeFoldBaseTransaction(NdbModel):
    NAMESPACE = NAMESPACE
    timestamp = ndb.IntegerProperty()
    unlock_timestamps = ndb.IntegerProperty(repeated=True, indexed=False)  # type: list[int]
    unlock_amounts = ndb.IntegerProperty(repeated=True, indexed=False)  # type: list[int]
    token = ndb.StringProperty()
    token_type = ndb.StringProperty()
    amount = ndb.IntegerProperty()
    amount_left = ndb.IntegerProperty()
    precision = ndb.IntegerProperty(default=2)
    fully_spent = ndb.BooleanProperty()
    memo = ndb.StringProperty()
    app_users = ndb.UserProperty(repeated=True)
    from_user = ndb.UserProperty()
    to_user = ndb.UserProperty()


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
    def list_by_user(cls, app_user, token):
        return cls.query() \
            .filter(cls.app_users == app_user) \
            .filter(cls.token == token) \
            .order(-cls.timestamp)

    @classmethod
    def list_with_amount_left_by_token(cls, app_user, token):
        return cls.query() \
            .filter(cls.to_user == app_user) \
            .filter(cls.token == token) \
            .filter(cls.fully_spent == False) \
            .order(-cls.timestamp)  # noQA

    @classmethod
    def list_with_amount_left(cls, app_user):
        return cls.query() \
            .filter(cls.to_user == app_user) \
            .filter(cls.fully_spent == False) \
            .order(-cls.timestamp)  # noQA


class ThreeFoldPendingTransactionDetails(NdbModel):
    NAMESPACE = NAMESPACE

    data = ndb.TextProperty()

    @classmethod
    def create_key(cls, transaction_id):
        return ndb.Key(cls, u"%s" % transaction_id, namespace=NAMESPACE)


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
    def count_pending(cls):
        return cls.query() \
            .filter(cls.synced == False) \
            .count(None)  # noQA

    @classmethod
    def list_by_user(cls, app_user):
        return cls.query() \
            .filter(cls.app_users == app_user) \
            .order(-cls.timestamp)

    @classmethod
    def list_by_user_and_token_type(cls, app_user, token_type):
        return cls.list_by_user(app_user) \
            .filter(cls.token_type == token_type)

    @classmethod
    def list_unsynced_by_user(cls, app_user, token):
        return cls.list_by_user(app_user) \
            .filter(cls.token == token) \
            .filter(cls.synced == False)  # noQA
