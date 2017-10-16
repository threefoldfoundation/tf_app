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

from mcfw.exceptions import HttpBadRequestException
from mcfw.restapi import rest
from mcfw.rpc import returns, arguments
from plugins.tff_backend.bizz.audit.audit import list_audit_logs_details, list_audit_logs, \
    list_audit_logs_by_type_and_user, list_audit_logs_by_type, list_audit_logs_by_user
from plugins.tff_backend.bizz.audit.mapping import AuditLogMapping
from plugins.tff_backend.bizz.authentication import Scopes
from plugins.tff_backend.to.audit import AuditLogDetailsListTO


@rest('/audit-logs', 'get', Scopes.ADMINS)
@returns(AuditLogDetailsListTO)
@arguments(page_size=(int, long), cursor=unicode, type=unicode, user_id=unicode, include_reference=bool)
def api_list_audit_logs(page_size=100, cursor=None, type=None, user_id=None, include_reference=True):
    page_size = min(1000, page_size)
    if type and type not in AuditLogMapping:
        raise HttpBadRequestException('invalid_type', {'allowed_types': AuditLogMapping.keys()})
    if type and user_id:
        query_results = list_audit_logs_by_type_and_user(type, user_id, page_size, cursor)
    elif type:
        query_results = list_audit_logs_by_type(type, page_size, cursor)
    elif user_id:
        query_results = list_audit_logs_by_user(user_id, page_size, cursor)
    else:
        query_results = list_audit_logs(page_size, cursor)
    return list_audit_logs_details(query_results, include_reference)
