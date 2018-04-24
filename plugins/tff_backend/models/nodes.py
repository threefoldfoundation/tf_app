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

from framework.models.common import NdbModel
from plugins.rogerthat_api.plugin_utils import Enum
from plugins.tff_backend.plugin_consts import NAMESPACE


class NodeStatus(Enum):
    HALTED = 'halted'
    RUNNING = 'running'


class WalletStatus(Enum):
    ERROR = 'error'
    UNLOCKED = 'unlocked'


class NodeChainStatus(NdbModel):
    wallet_status = ndb.StringProperty(choices=WalletStatus.all())
    block_height = ndb.IntegerProperty(default=0)


class Node(NdbModel):
    NAMESPACE = NAMESPACE
    serial_number = ndb.StringProperty()
    last_update = ndb.DateTimeProperty()
    username = ndb.StringProperty()
    status = ndb.StringProperty(default=NodeStatus.HALTED)
    status_date = ndb.DateTimeProperty()
    info = ndb.JsonProperty()
    chain_status = ndb.StructuredProperty(NodeChainStatus)

    @property
    def id(self):
        return self.key.string_id().decode('utf-8')

    @classmethod
    def create_key(cls, node_id):
        # type: (unicode) -> ndb.Key
        return ndb.Key(cls, node_id, namespace=NAMESPACE)

    @classmethod
    def list_by_user(cls, username):
        return cls.query().filter(cls.username == username)

    @classmethod
    def list_by_status(cls, status):
        return cls.query().filter(cls.status == status)

    @classmethod
    def list_running_by_last_update(cls, date):
        return cls.query().filter(cls.last_update < date).filter(cls.status == NodeStatus.RUNNING)
