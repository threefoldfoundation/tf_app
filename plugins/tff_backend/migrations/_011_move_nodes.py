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

from plugins.tff_backend.models.nodes import Node
from plugins.tff_backend.models.user import TffProfile


def migrate(dry_run=False):
    to_put = []
    for profile in TffProfile.query():
        if profile.nodes:
            for node in profile.nodes:
                to_put.append(Node(key=Node.create_key(node.id),
                                   serial_number=node.serial_number,
                                   username=profile.username if profile.username != 'threefold_dummy_1' else None,
                                   last_update=node.last_update))
    if dry_run:
        return to_put
    ndb.put_multi(to_put)


def cleanup():
    to_put = []
    for profile in TffProfile.query():
        if 'nodes' in profile._properties:
            del profile._properties['nodes']
            to_put.append(profile)
    ndb.put_multi(to_put)
