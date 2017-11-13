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
from collections import defaultdict

from mcfw.rpc import returns, arguments, parse_complex_value
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
from plugins.tff_backend.models.agenda import EventParticipant
from plugins.tff_backend.to.agenda import EventPresenceTO, BasePresenceTO


@returns(EventPresenceTO)
@arguments(params=dict, user_detail=UserDetailsTO)
def get_presence(params, user_detail):
    iyo_username = get_iyo_username(user_detail)
    status = EventParticipant.STATUS_UNKNOWN
    wants_recording = False
    counts = defaultdict(lambda: 0)
    event_id = params['event_id']

    for participant in EventParticipant.list_by_event(event_id):
        if participant.username == iyo_username:
            status = participant.status
            wants_recording = participant.wants_recording
        counts[participant.status] += 1

    return EventPresenceTO(event_id=event_id,
                           status=status,
                           wants_recording=wants_recording,
                           username=iyo_username,
                           present_count=counts[EventParticipant.STATUS_PRESENT],
                           absent_count=counts[EventParticipant.STATUS_ABSENT])


@returns(dict)
@arguments(params=dict, user_detail=UserDetailsTO)
def update_presence(params, user_detail):
    presence = parse_complex_value(BasePresenceTO, params, False)
    iyo_username = get_iyo_username(user_detail)
    participant = EventParticipant.get_or_create_participant(presence.event_id, iyo_username)
    participant.status = presence.status
    participant.wants_recording = presence.wants_recording
    participant.put()
    return participant.to_dict()
