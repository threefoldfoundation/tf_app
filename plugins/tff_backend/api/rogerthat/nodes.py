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
import logging

from google.appengine.api import users
from google.appengine.ext.deferred import deferred

from mcfw.consts import DEBUG
from mcfw.rpc import arguments
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.tff_backend.bizz.global_stats import ApiCallException
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
from plugins.tff_backend.bizz.nodes import get_node_stats, get_node_id_for_user, set_node_id_on_profile
from plugins.tff_backend.models.user import TffProfile
from plugins.tff_backend.utils.app import create_app_user


@arguments(params=dict, user_detail=UserDetailsTO)
def api_get_node_status(params, user_detail):
    # type: (dict, UserDetailsTO) -> dict
    try:
        node_id = None
        if not DEBUG:
            profile = TffProfile.create_key(get_iyo_username(user_detail)).get()  # type: TffProfile
            node_id = profile.node_id
            if not node_id:
                # fallback, should only happen when user checks his node status before our cron job has ran.
                logging.warn('Fetching node serial number from odoo since it was not set on TffProfile for user %s',
                             user_detail.email)
                app_user = create_app_user(users.User(user_detail.email), user_detail.app_id)
                node_id = get_node_id_for_user(app_user)
                if node_id:
                    deferred.defer(set_node_id_on_profile, app_user, node_id)
                else:
                    raise ApiCallException(
                        u'It looks like you either do not have a node yet or it has never been online yet.')
        return get_node_stats(node_id)
    except ApiCallException:
        raise
    except Exception as e:
        logging.exception(e)
        raise ApiCallException(u'Could not get node status. Please try again later.')
