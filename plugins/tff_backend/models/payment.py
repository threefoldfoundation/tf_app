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


class ThreeFoldWallet(NdbModel):
    NAMESPACE = NAMESPACE
    tokens = ndb.StringProperty(repeated=True)
    next_unlock_timestamp = ndb.IntegerProperty()
    addresses = ndb.StringProperty(repeated=True)

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

    @classmethod
    def list_by_address(cls, address):
        return ThreeFoldWallet.query() \
            .filter(ThreeFoldWallet.addresses == address)


class ThreeFoldPendingTransactionDetails(NdbModel):
    NAMESPACE = NAMESPACE

    data = ndb.TextProperty()

    @classmethod
    def create_key(cls, transaction_id):
        return ndb.Key(cls, u"%s" % transaction_id, namespace=NAMESPACE)


class RivineBlockHeight(NdbModel):
    NAMESPACE = NAMESPACE

    timestamp = ndb.IntegerProperty()
    height = ndb.IntegerProperty()
    updating = ndb.BooleanProperty()

    @classmethod
    def create_key(cls):
        return ndb.Key(cls, u"BlockHeight", namespace=NAMESPACE)

    @staticmethod
    def get_block_height():
        bh_key = RivineBlockHeight.create_key()
        bh = bh_key.get()
        if bh:
            return bh
        bh = RivineBlockHeight(key=bh_key)
        bh.height = -1
        bh.timestamp = 0
        bh.updating = False
        return bh
