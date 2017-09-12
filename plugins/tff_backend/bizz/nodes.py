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

import json
import logging

from framework.plugin_loader import get_config
from google.appengine.api import urlfetch
from plugins.its_you_online_auth.bizz.authentication import refresh_jwt
from plugins.tff_backend.plugin_consts import NAMESPACE


def get_node_status(node_id):
    cfg = get_config(NAMESPACE)
    try:
        jwt = refresh_jwt(cfg.orchestator.jwt, 3600)
    except Exception:
        logging.warn("get_node_status failed to refresh jwt", exc_info=True)
        return None
    
    headers = {}
    headers['Authorization'] = u"Bearer %s" % jwt
    result = urlfetch.fetch(url=u"https://orc.threefoldtoken.com/nodes/%s" % node_id, headers=headers, deadline=10)
    if result.status_code != 200:
        logging.warn("get_node_status returned status code %s for node_id '%s'", result.status_code, node_id)
        return None
    
    return json.loads(result.content)['status']