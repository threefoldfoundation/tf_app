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


class Event(NdbModel):
    NAMESPACE = NAMESPACE

    TYPE_EVENT = 1
    TYPE_VIDEO_SESSION = 2

    type = ndb.IntegerProperty(indexed=False, choices=[TYPE_EVENT, TYPE_VIDEO_SESSION], default=TYPE_EVENT)
    title = ndb.StringProperty(indexed=False)
    description = ndb.TextProperty(indexed=False)
    start_timestamp = ndb.DateTimeProperty(indexed=True)
    end_timestamp = ndb.DateTimeProperty(indexed=False)
    location = ndb.TextProperty(indexed=False)
    creation_timestamp = ndb.DateTimeProperty(indexed=False, auto_now_add=True)

    @property
    def id(self):
        return self.key.id()

    @classmethod
    def create_key(cls, event_id):
        return ndb.Key(cls, event_id, namespace=NAMESPACE)

    @classmethod
    def list(cls):
        return cls.query().order(Event.start_timestamp)

    @classmethod
    def list_past(cls, timestamp):
        return cls.query().filter(Event.start_timestamp < timestamp)


class EventParticipant(NdbModel):
    NAMESPACE = NAMESPACE

    STATUS_PRESENT = 1
    STATUS_UNKNOWN = 0
    STATUS_ABSENT = -1

    event_id = ndb.IntegerProperty(indexed=True)
    username = ndb.StringProperty(indexed=True)
    status = ndb.IntegerProperty(
        indexed=True, choices=[STATUS_ABSENT, STATUS_UNKNOWN, STATUS_PRESENT], default=STATUS_UNKNOWN)
    wants_recording = ndb.BooleanProperty(indexed=True, default=False)
    modification_timestamp = ndb.DateTimeProperty(indexed=False, auto_now=True, auto_now_add=True)

    @classmethod
    def list_by_event(cls, event_id):
        return cls.query().filter(cls.event_id == event_id)

    @classmethod
    def get_participant(cls, event_id, username):
        return cls.list_by_event(event_id).filter(cls.username == username).get()

    @classmethod
    def get_or_create_participant(cls, event_id, username):
        return cls.get_participant(event_id, username) or cls(event_id=event_id, username=username)
