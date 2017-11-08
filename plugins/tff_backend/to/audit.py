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
from framework.to import TO
from mcfw.properties import unicode_property, typed_property
from mcfw.rpc import parse_complex_value
from plugins.tff_backend.bizz.audit.mapping import AuditLogType
from plugins.tff_backend.to import PaginatedResultTO
from plugins.tff_backend.to.global_stats import GlobalStatsTO
from plugins.tff_backend.to.investor import InvestmentAgreementTO
from plugins.tff_backend.to.kyc import TffProfileTO
from plugins.tff_backend.to.nodes import NodeOrderTO

AUDIT_LOG_TYPE_MAPPING = {
    AuditLogType.UPDATE_NODE_ORDER.value: NodeOrderTO,
    AuditLogType.UPDATE_GLOBAL_STATS.value: GlobalStatsTO,
    AuditLogType.UPDATE_INVESTMENT_AGREEMENT.value: InvestmentAgreementTO,
    AuditLogType.SET_KYC_STATUS.value: TffProfileTO,
}


class AuditLogTO(TO):
    timestamp = unicode_property('timestamp')
    audit_type = unicode_property('audit_type')
    reference = unicode_property('reference')
    user_id = unicode_property('user_id')
    data = typed_property('data', dict)


class AuditLogDetailsTO(AuditLogTO):
    reference = typed_property('reference', TO, subtype_attr_name='audit_type',
                               subtype_mapping=AUDIT_LOG_TYPE_MAPPING)

    @classmethod
    def from_model(cls, model, reference_model=None):
        # type: (NdbModel, NdbModel) -> AuditLogDetailsTO
        props = model.to_dict()
        props['reference'] = reference_model.to_dict() if reference_model else None
        return parse_complex_value(cls, props, False)


class AuditLogDetailsListTO(PaginatedResultTO):
    results = typed_property('results', AuditLogDetailsTO, True)

    def __init__(self, cursor=None, more=False, results=None):
        super(AuditLogDetailsListTO, self).__init__(cursor, more)
        self.results = results or []
