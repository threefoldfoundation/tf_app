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
import logging

from google.appengine.ext import ndb

from framework.bizz.job import run_job
from plugins.rogerthat_api.api import system, RogerthatApiException
from plugins.tff_backend.bizz import get_grid_api_key, get_mazraa_api_key
from plugins.tff_backend.bizz.nodes.stats import _put_node_status_user_data
from plugins.tff_backend.bizz.rogerthat import put_user_data
from plugins.tff_backend.bizz.user import get_kyc_user_data
from plugins.tff_backend.models.nodes import Node
from plugins.tff_backend.models.user import TffProfile
from plugins.tff_backend.utils.app import get_app_user_tuple


def migrate():
    run_job(_get_profiles, [], _save_data, [])
    nodes = Node.query(projection=[Node.username], group_by=[Node.username]).fetch(1000)
    complete = []
    for node in nodes:
        if node.username:
            try:
                _put_node_status_user_data(TffProfile.create_key(node.username))
                complete.append(node.username)
            except Exception as e:
                logging.exception(e.message)
    return complete


def _get_profiles():
    return TffProfile.query()


def _save_data(profile_key):
    # type: (ndb.Key) -> None
    username = profile_key.id()
    profile = profile_key.get()  # type: TffProfile
    grid_data = {
        'nodes': [n.to_dict() for n in Node.list_by_user(username)],
    }
    email, app_id = get_app_user_tuple(profile.app_user)
    email = email.email()
    put_user_data(get_grid_api_key(), email, app_id, grid_data)
    try:
        system.put_user_data(get_mazraa_api_key(), email, app_id, get_kyc_user_data(profile))
    except RogerthatApiException as e:
        if e.code == 60011:  # user not in friend list, ignore as this isn't an autoconnected service
            logging.info(e.message)
        else:
            raise
