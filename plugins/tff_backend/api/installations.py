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
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.rogerthat_api.to.installation import InstallationLogTO, InstallationTO, InstallationListTO
from plugins.tff_backend.bizz.authentication import Scopes
from plugins.tff_backend.bizz.installations import list_installations, get_installation, list_installation_logs


@rest('/installations', 'get', Scopes.BACKEND_READONLY, silent_result=True)
@returns(InstallationListTO)
@arguments(page_size=(int, long), cursor=unicode)
def api_list_installations(page_size=50, cursor=None):
    return list_installations(page_size=page_size, cursor=cursor)


@rest('/installations/<installation_id:[^/]+>', 'get', Scopes.BACKEND_READONLY, silent_result=True)
@returns(InstallationTO)
@arguments(installation_id=unicode)
def api_get_installation(installation_id):
    return get_installation(installation_id=installation_id)


@rest('/installations/<installation_id:[^/]+>/logs', 'get', Scopes.BACKEND_READONLY, silent_result=True)
@returns([InstallationLogTO])
@arguments(installation_id=unicode)
def api_list_installation_logs(installation_id):
    return list_installation_logs(installation_id=installation_id)
