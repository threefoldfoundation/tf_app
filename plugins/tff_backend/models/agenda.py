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

from framework.models.common import NdbModel
from plugins.tff_backend.plugin_consts import NAMESPACE
from google.appengine.ext import ndb


class Event(NdbModel):
    NAMESPACE = NAMESPACE
    title = ndb.StringProperty(indexed=False)
    description = ndb.TextProperty(indexed=False)
    timestamp = ndb.DateTimeProperty(indexed=True)
    location = ndb.StringProperty(indexed=False)


class EventParticipant(NdbModel):
    NAMESPACE = NAMESPACE
    STATUS_PRESENT = 1
    STATUS_PRESENT = 1
    event_id = ndb.IntegerProperty(indexed=True)
    iyo_username = ndb.StringProperty(indexed=False)
    timestamp = ndb.DateTimeProperty(indexed=False, auto_now=True, auto_now_add=True)

    @classmethod
    def list_by_event(cls, event_id):
        return cls.query().filter(cls.event_id == event_id)
