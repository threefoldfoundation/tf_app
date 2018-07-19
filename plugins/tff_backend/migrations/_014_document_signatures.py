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

from google.appengine.ext import ndb

from framework.bizz.job import run_job
from plugins.tff_backend.bizz.iyo.see import get_see_documents
from plugins.tff_backend.bizz.iyo.utils import get_iyo_organization_id
from plugins.tff_backend.models.document import Document
from plugins.tff_backend.models.hoster import NodeOrder
from plugins.tff_backend.models.investor import InvestmentAgreement
from plugins.tff_backend.models.user import TffProfile


def migrate():
    run_job(_get_all_users, [], migrate_documents, [])


def _get_all_users():
    return TffProfile.query()


def migrate_documents(profile_key):
    # type: (ndb.Key) -> None
    username = profile_key.string_id()
    tff_profile = profile_key.get()  # type: TffProfile
    iyo_organization_id = get_iyo_organization_id()
    see_docs = get_see_documents(iyo_organization_id, username)
    signatures = {doc.uniqueid: doc.signature for doc in see_docs if doc.signature}
    to_put = []
    for document in Document.list_by_username(username):  # type: Document
        if not document.signature and document.iyo_see_id in signatures:
            document.signature = signatures[document.iyo_see_id]
            to_put.append(document)
    for node_order in NodeOrder.list_by_user(tff_profile.app_user):  # type: NodeOrder
        if not node_order.signature and node_order.tos_iyo_see_id in signatures:
            node_order.signature = signatures[node_order.tos_iyo_see_id]
            to_put.append(node_order)
    for agreement in InvestmentAgreement.list_by_user(tff_profile.app_user):  # type: InvestmentAgreement
        if not agreement.signature and agreement.iyo_see_id in signatures:
            agreement.signature = signatures[agreement.iyo_see_id]
            to_put.append(agreement)
    ndb.put_multi(to_put)
