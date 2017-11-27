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
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.tff_backend.bizz.agenda import list_events, get_event, put_event, list_participants
from plugins.tff_backend.bizz.audit.audit import audit
from plugins.tff_backend.bizz.audit.mapping import AuditLogType
from plugins.tff_backend.bizz.authentication import Scopes
from plugins.tff_backend.to.agenda import EventTO, EventParticipantListTO


@rest('/agenda-events', 'get', Scopes.TEAM, silent_result=True)
@returns([EventTO])
@arguments(past=bool)
def api_list_events(past=False):
    return [EventTO.from_model(model) for model in list_events(past)]


@rest('/agenda-events', 'post', Scopes.ADMINS)
@returns(EventTO)
@arguments(data=EventTO)
def api_create_event(data):
    return EventTO.from_model(put_event(data))


@rest('/agenda-events/<event_id:[^/]+>/participants', 'get', Scopes.TEAM, silent_result=True)
@returns(EventParticipantListTO)
@arguments(event_id=(int, long), cursor=unicode, page_size=(int, long))
def api_list_event_participants(event_id, cursor=None, page_size=50):
    return list_participants(event_id, cursor, page_size)


@rest('/agenda-events/<event_id:[^/]+>', 'get', Scopes.TEAM)
@returns(EventTO)
@arguments(event_id=(int, long))
def api_get_event(event_id):
    return EventTO.from_model(get_event(event_id))


@audit(AuditLogType.UPDATE_AGENDA_EVENT, 'event_id')
@rest('/agenda-events/<event_id:[^/]+>', 'put', Scopes.ADMINS)
@returns(EventTO)
@arguments(event_id=(int, long), data=EventTO)
def api_put_event(event_id, data):
    data.id = event_id
    return EventTO.from_model(put_event(data))
