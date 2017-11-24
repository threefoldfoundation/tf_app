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

import datetime
import logging

import dateutil
from dateutil.relativedelta import relativedelta

from framework.consts import DAY
from google.appengine.ext import ndb, deferred
from mcfw.consts import MISSING
from mcfw.exceptions import HttpNotFoundException
from mcfw.rpc import returns, arguments
from plugins.its_you_online_auth.models import Profile
from plugins.rogerthat_api.api import system
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.models.agenda import Event, EventParticipant
from plugins.tff_backend.to.agenda import EventTO, EventParticipantListTO, \
    EventParticipantTO


def list_events(skip_past=False):
    return Event.list(skip_past)


@returns(Event)
@arguments(event_id=(int, long))
def get_event(event_id):
    event = Event.create_key(event_id).get()
    if not event:
        raise HttpNotFoundException('event_not_found', {'event_id': event_id})
    return event


@returns(EventParticipantListTO)
@arguments(event_id=long, cursor=unicode, page_size=long)
def list_participants(event_id, cursor=None, page_size=50):
    qry = EventParticipant.list_by_event(event_id)
    results, cursor, more = qry.fetch_page(page_size, cursor=cursor)
    profiles = {p.username: p for p in ndb.get_multi([Profile.create_key(r.username) for r in results if r.username])}
    list_result = EventParticipantListTO(cursor=cursor and cursor.to_websafe_string(),
                                         more=more,
                                         results=map(EventParticipantTO.from_model, results))
    for result in list_result.results:
        profile = profiles.get(result.username)
        result.user = profile and profile.to_dict()

    return list_result


@ndb.transactional()
@returns(Event)
@arguments(event=EventTO)
def put_event(event):
    # type: (EventTO) -> Event
    model = Event() if event.id is MISSING else Event.get_by_id(event.id)
    args = event.to_dict(exclude=['id'])
    args.update(
        start_timestamp=dateutil.parser.parse(event.start_timestamp.replace('Z', '')),
        end_timestamp=None if event.end_timestamp in (None, MISSING) else dateutil.parser.parse(
            event.end_timestamp.replace('Z', ''))
    )
    model.populate(**args)
    model.put()
    logging.info('Event created/updated: %s', model)
    deferred.defer(put_agenda_app_data, _transactional=True, _countdown=2)
    return model


def put_agenda_app_data():
    data = {'agenda_events': [event.to_dict() for event in Event.list()]}
    system.put_service_data(get_rogerthat_api_key(), data)
    system.publish_changes(get_rogerthat_api_key())


@returns([Event])
@arguments()
def update_expired_events():
    now = datetime.datetime.now()
    updated = []
    for e in Event.list_expired(now):
        end_timestamp = e.end_timestamp or e.start_timestamp + relativedelta(seconds=DAY / 2)
        if end_timestamp < now:
            e.past = True
            updated.append(e)
    if updated:
        logging.info('Updating %s event(s): %s', len(updated), [e.id for e in updated])
        ndb.put_multi(updated)
        deferred.defer(put_agenda_app_data, _countdown=2)
    return updated
