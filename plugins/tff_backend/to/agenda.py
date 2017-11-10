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

from framework.to import TO
from mcfw.properties import unicode_property, long_property, bool_property, typed_property
from plugins.tff_backend.to import PaginatedResultTO


class EventTO(TO):
    id = long_property('id')
    type = long_property('type')
    title = unicode_property('title')
    description = unicode_property('description')
    location = unicode_property('location')
    start_timestamp = unicode_property('start_timestamp')
    end_timestamp = unicode_property('end_timestamp')


class BasePresenceTO(TO):
    event_id = long_property('event_id')
    username = unicode_property('username')
    wants_recording = bool_property('wants_recording')
    status = long_property('status')


class EventPresenceTO(BasePresenceTO):
    present_count = long_property('present_count')
    absent_count = long_property('absent_count')


class EventParticipantTO(BasePresenceTO):
    user = typed_property('user', dict, False)
    modification_timestamp = unicode_property('modification_timestamp')


class EventParticipantListTO(PaginatedResultTO):
    results = typed_property('results', EventParticipantTO, True)
