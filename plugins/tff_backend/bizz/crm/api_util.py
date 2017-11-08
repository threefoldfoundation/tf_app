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

from google.appengine.api import urlfetch

from framework.plugin_loader import get_config
from plugins.tff_backend.plugin_consts import NAMESPACE


class CrmException(Exception):
    def __init__(self, status_code, content):
        self.status_code = status_code
        try:
            self.content = json.loads(content)
        except ValueError:
            self.content = content
        super(CrmException, self).__init__('Failed to execute call to crm')


def exec_graphql_request(query, variables=None, operation_name=None):
    # type: (unicode, dict) -> dict
    payload = {'query': query, 'variables': variables, 'operationName': operation_name}
    # todo: which JWT do we use for this?
    # jwt MUST be from itsyou.online (not staging.itsyou.online)
    # jwt = Session.create_key('lucasvanhalst').get().jwt
    jwt = 'eyJhbGciOiJFUzM4NCIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsidGZmX2JhY2tlbmQiXSwiYXpwIjoidGhyZWVmb2xkIiwiZXhwIjoxNTA5MTQ3NTA2LCJpc3MiOiJpdHN5b3VvbmxpbmUiLCJyZWZyZXNoX3Rva2VuIjoiT2FyZnFUV3ItVFJnZDRxRTExQ3RSZFBLMnNMQiIsInNjb3BlIjpbInVzZXI6bWVtYmVyb2Y6dGhyZWVmb2xkIiwidXNlcjpuYW1lIiwidXNlcjpzZWUiLCJ1c2VyOmtleXN0b3JlIiwidXNlcjp2YWxpZGF0ZWQ6ZW1haWwiLCJ1c2VyOnZhbGlkYXRlZDpwaG9uZSIsInVzZXI6YWRkcmVzcyJdLCJ1c2VybmFtZSI6Imx1Y2FzdmFuaGFsc3QifQ.-GKKsorXH1UylbHHpG5zp5ZaasFJ01byXW5zE-WagZ8crD-KAtwM7NcLNRC2KavFLg5aFJxEDBiVXxyHp3h9JrYTWBg3wgmSRh8wHjDQJRxC3kr1ShvSsDq7PLuYT0XH'
    url = '%s/api' % get_config(NAMESPACE).crm_url
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'bearer %s' % jwt
    }
    logging.debug('POST: %s\nHeaders: %s\n%s', url, headers, payload)
    response = urlfetch.fetch(url, json.dumps(payload), urlfetch.POST, headers=headers, validate_certificate=False)
    logging.debug('Response from CRM: %s\n%s', response.status_code, response.content)
    if response.status_code != 200:
        raise CrmException(response.status_code, response.content)
    response_data = json.loads(response.content)
    if 'data' in response_data:
        for method in response_data['data']:
            if 'ok' in response_data['data'][method] and not response_data['data'][method]['ok']:
                raise CrmException(response.status_code, response.content)
    return response_data
