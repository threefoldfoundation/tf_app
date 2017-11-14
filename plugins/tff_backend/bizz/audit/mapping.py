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
from enum import Enum
from plugins.tff_backend.models.agenda import Event
from plugins.tff_backend.models.global_stats import GlobalStats
from plugins.tff_backend.models.hoster import NodeOrder
from plugins.tff_backend.models.investor import InvestmentAgreement


class AuditLogType(Enum):
    UPDATE_GLOBAL_STATS = 'update_global_stats'
    UPDATE_INVESTMENT_AGREEMENT = 'update_investment_agreement'
    UPDATE_NODE_ORDER = 'update_node_order'
    UPDATE_AGENDA_EVENT = 'update_agenda_event'


AuditLogMapping = {
    AuditLogType.UPDATE_GLOBAL_STATS: GlobalStats,
    AuditLogType.UPDATE_INVESTMENT_AGREEMENT: InvestmentAgreement,
    AuditLogType.UPDATE_NODE_ORDER: NodeOrder,
    AuditLogType.UPDATE_AGENDA_EVENT: Event,
}

AuditLogMappingTypes = tuple(type(v) for v in AuditLogMapping.values())
