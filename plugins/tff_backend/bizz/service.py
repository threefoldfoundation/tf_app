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

from mcfw.cache import cached
from mcfw.rpc import returns, arguments
from plugins.rogerthat_api.api import system
from plugins.tff_backend.bizz import get_rogerthat_api_key


@cached(version=1, lifetime=86400, request=True, memcache=True)
@returns(unicode)
@arguments()
def get_main_branding_hash():
    api_key = get_rogerthat_api_key()
    si = system.get_identity(api_key)
    return si.description_branding
