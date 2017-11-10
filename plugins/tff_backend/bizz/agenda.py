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

import dateutil

from google.appengine.ext import ndb, deferred
from mcfw.consts import MISSING
from mcfw.rpc import returns, arguments, parse_complex_value
from plugins.its_you_online_auth.models import Profile
from plugins.rogerthat_api.api import system
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
from plugins.tff_backend.models.agenda import Event, EventParticipant
from plugins.tff_backend.to.agenda import EventTO, EventPresenceTO, BasePresenceTO, EventParticipantListTO,\
    EventParticipantTO


@returns(EventPresenceTO)
@arguments(params=dict, user_detail=UserDetailsTO)
def get_presence(params, user_detail):
    iyo_username = get_iyo_username(user_detail)
    status = EventParticipant.STATUS_ABSENT
    wants_recording = False
    counts = defaultdict(lambda: 0)

    for participant in EventParticipant.list_by_event(params['event_id']):
        if participant.username == iyo_username:
            status = participant.status
            wants_recording = participant.wants_recording
        counts[participant.status] += 1

    return EventPresenceTO(status=status,
                           wants_recording=wants_recording,
                           username=iyo_username,
                           present_count=counts[EventParticipant.STATUS_PRESENT],
                           absent_count=counts[EventParticipant.STATUS_ABSENT])


@returns()
@arguments(params=dict, user_detail=UserDetailsTO)
def update_presence(params, user_detail):
    presence = parse_complex_value(BasePresenceTO, params, False)
    iyo_username = get_iyo_username(user_detail)
    participant = EventParticipant.get_or_create_participant(presence.event_id, iyo_username)
    participant.status = presence.status
    participant.wants_recording = presence.wants_recording
    participant.put()


@returns(EventParticipantListTO)
@arguments(event_id=long, cursor=unicode, page_size=long)
def list_participants(event_id, cursor=None, page_size=50):
    qry = EventParticipant.list_by_event(event_id)
    results, cursor, more = qry.fetch_page(page_size, cursor=cursor)
    profiles = {p.username: p for p in ndb.get_multi([Profile.create_key(r.username) for r in results if r.username])}
    list_result = EventParticipantListTO(cursor=cursor.to_websafe_string(),
                                         more=more,
                                         results=map(EventParticipantTO.from_model, results))
    for result in list_result.results:
        profile = profiles.get(result.username)
        result.user = profile and profile.to_dict()

    return list_result


@returns(Event)
@arguments(event=EventTO)
def put_event(event):
    start_timestamp = dateutil.parser.parse(event.start_timestamp)
    end_timestamp = None if event.end_timestamp in (None, MISSING) else dateutil.parser.parse(event.end_timestamp)

    def trans():
        model = Event() if event.id is MISSING else Event.get_by_id(id)
        model.title = event.title
        model.description = event.description
        model.start_timestamp = start_timestamp
        model.end_timestamp = end_timestamp
        model.location = event.location
        model.put()
        deferred.defer(put_agenda_app_data, _transactional=True, _countdown=2)
        return model

    return ndb.transaction(trans)


def put_agenda_app_data():
    data = {'agenda_events': [event.to_dict() for event in Event.list()]}
    system.put_service_data(get_rogerthat_api_key(), data)
    system.publish_changes(get_rogerthat_api_key())


def remove_past_events():
    def trans():
        # TODO: list and remove all past events
        deferred.defer(put_agenda_app_data, _transactional=True, _countdown=2)
    ndb.transaction(trans)
