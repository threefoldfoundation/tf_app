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

from mcfw.rpc import returns, arguments, serialize_complex_value
from plugins.tff_backend.bizz.iyo.utils import get_itsyouonline_client_from_username
from plugins.tff_backend.to.iyo.keystore import IYOKeyStoreKey
from plugins.tff_backend.utils import convert_to_str


@returns(IYOKeyStoreKey)
@arguments(username=unicode, data=IYOKeyStoreKey)
def create_keystore_key(username, data):
    client = get_itsyouonline_client_from_username(username)
    data = serialize_complex_value(data, IYOKeyStoreKey, False, skip_missing=True)
    result = client.api.users.SaveKeyStoreKey(data, convert_to_str(username))
    return IYOKeyStoreKey(**result.json())


@returns([IYOKeyStoreKey])
@arguments(username=unicode)
def get_keystore(username):
    client = get_itsyouonline_client_from_username(username)
    result = client.api.users.GetKeyStore(convert_to_str(username))
    return [IYOKeyStoreKey(**key) for key in result.json()]
