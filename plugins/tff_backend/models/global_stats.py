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


class CurrencyValue(NdbModel):
    currency = ndb.StringProperty()
    value = ndb.FloatProperty()
    timestamp = ndb.IntegerProperty()
    auto_update = ndb.BooleanProperty(default=True)


class GlobalStats(NdbModel):
    NAMESPACE = NAMESPACE
    name = ndb.StringProperty()
    token_count = ndb.IntegerProperty()
    unlocked_count = ndb.IntegerProperty()
    value = ndb.FloatProperty()  # Value in dollar
    # Value per other currency
    currencies = ndb.LocalStructuredProperty(CurrencyValue, repeated=True)  # type: list[CurrencyValue]
    market_cap = ndb.ComputedProperty(lambda self: self.value * self.unlocked_count, indexed=False)

    @property
    def id(self):
        return self.key.id().decode('utf-8')

    @classmethod
    def create_key(cls, currency):
        return ndb.Key(cls, currency, namespace=NAMESPACE)

    @classmethod
    def list(cls):
        return cls.query()
