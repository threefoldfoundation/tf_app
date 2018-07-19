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

from mcfw.rpc import returns, arguments
from plugins.tff_backend.bizz.iyo.utils import get_itsyouonline_client_from_username
from plugins.tff_backend.to.iyo.see import IYOSeeDocumentView
from plugins.tff_backend.utils import convert_to_str


@returns([IYOSeeDocumentView])
@arguments(organization_id=unicode, username=unicode)
def get_see_documents(organization_id, username):
    # type: (unicode, unicode) -> list[IYOSeeDocumentView]
    client = get_itsyouonline_client_from_username(username)
    query_params = {
        'globalid': organization_id
    }
    result = client.users.GetSeeObjects(convert_to_str(username), query_params=query_params)
    return [IYOSeeDocumentView(**d) for d in result.json()]

