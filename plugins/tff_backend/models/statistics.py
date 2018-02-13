# -*- coding: utf-8 -*-
# Copyright 2018 GIG Technology NV
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
# @@license_version:1.4@@
from google.appengine.ext import ndb

from enum import IntEnum
from framework.models.common import NdbModel
from plugins.tff_backend.plugin_consts import NAMESPACE


class FlowRunStatus(IntEnum):
    STARTED = 0
    IN_PROGRESS = 10
    STALLED = 20
    CANCELED = 30
    FINISHED = 40


FLOW_RUN_STATUSES = map(int, FlowRunStatus)


class StepStatistics(NdbModel):
    time_taken = ndb.IntegerProperty()


#  Statistics calculated whenever a step is added
class FlowRunStatistics(NdbModel):
    last_step_date = ndb.DateTimeProperty()
    total_time = ndb.IntegerProperty()  # Time it took to go through the flow in seconds
    steps = ndb.StructuredProperty(StepStatistics, repeated=True)
    next_step = ndb.StringProperty()


class FlowRun(NdbModel):
    NAMESPACE = NAMESPACE
    flow_name = ndb.StringProperty()
    start_date = ndb.DateTimeProperty()
    status = ndb.IntegerProperty(choices=FLOW_RUN_STATUSES)
    statistics = ndb.StructuredProperty(FlowRunStatistics)  # type: FlowRunStatistics
    steps = ndb.JsonProperty(repeated=True, compressed=True)
    tag = ndb.StringProperty()
    user = ndb.StringProperty()

    @property
    def id(self):
        return self.key.id()

    @classmethod
    def create_key(cls, parent_message_key):
        return ndb.Key(cls, parent_message_key, namespace=cls.NAMESPACE)

    @classmethod
    def list(cls):
        return cls.query() \
            .order(-cls.start_date)

    @classmethod
    def list_by_flow_name(cls, flow_name):
        return cls.query() \
            .filter(cls.flow_name == flow_name) \
            .order(-cls.start_date)

    @classmethod
    def list_by_start_date(cls, start_date):
        return cls.query() \
            .filter(cls.start_date > start_date) \
            .order(-cls.start_date)

    @classmethod
    def list_distinct_flows(cls):
        return [f.flow_name for f in cls.query(projection=[cls.flow_name], group_by=[cls.flow_name]).fetch()]

    @classmethod
    def list_by_status_and_last_step_date(cls, status, date):
        return cls.query().filter(cls.status == status).filter(cls.statistics.last_step_date < date)

    @classmethod
    def list_by_user(cls, user):
        return cls.query(cls.user == user).order(-cls.start_date)

    @classmethod
    def list_by_user_and_flow(cls, flow_name, user):
        return cls.query(cls.flow_name == flow_name, cls.user == user).order(-cls.start_date)
