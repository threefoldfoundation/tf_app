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

import httplib
import logging

from mcfw.rpc import returns, arguments
from plugins.tff_backend.bizz.iyo.utils import get_iyo_client
from plugins.tff_backend.to.iyo.keystore import IYOKeyStoreKey
from plugins.tff_backend.utils import raise_http_exception


@returns(IYOKeyStoreKey)
@arguments(username=unicode, data=IYOKeyStoreKey)
def create_keystore_key(username, data):
    client = get_iyo_client(username)
    result = client.api.users.SaveKeyStoreKey(data, username)
    logging.debug('create_keystore_key %s %s', result.status_code, result.text)
    if result.status_code not in (httplib.CREATED, httplib.CONFLICT):
        raise_http_exception(result.status_code, result.text)
    return IYOKeyStoreKey(**result.json())
