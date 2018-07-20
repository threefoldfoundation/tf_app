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
import logging

from google.appengine.ext import ndb

from framework.bizz.job import run_job
from plugins.tff_backend.bizz.iyo.see import get_see_documents
from plugins.tff_backend.bizz.iyo.utils import get_iyo_organization_id, get_username
from plugins.tff_backend.models.document import Document
from plugins.tff_backend.models.hoster import NodeOrder
from plugins.tff_backend.models.investor import InvestmentAgreement
from plugins.tff_backend.models.payment import ThreeFoldTransaction, ThreeFoldPendingTransaction
from plugins.tff_backend.models.user import TffProfile


def migrate(dry_run=False):
    run_job(_get_all_users, [], migrate_documents, [dry_run])


def _get_all_users():
    return TffProfile.query()


def migrate_documents(profile_key, dry_run):
    # type: (ndb.Key, bool) -> None
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
    for node_order in NodeOrder.query(NodeOrder.app_user == tff_profile.app_user):  # type: NodeOrder
        if not node_order.signature and node_order.tos_iyo_see_id in signatures:
            node_order.signature = signatures[node_order.tos_iyo_see_id]
        node_order.username = username
        del node_order.app_user
        to_put.append(node_order)
    for agreement in InvestmentAgreement.query(
        InvestmentAgreement.app_user == tff_profile.app_user):  # type: InvestmentAgreement
        if not agreement.signature and agreement.iyo_see_id in signatures:
            agreement.signature = signatures[agreement.iyo_see_id]
        agreement.username = username
        del agreement.app_user
        to_put.append(agreement)
    for trans_type in [ThreeFoldTransaction, ThreeFoldPendingTransaction]:
        for transaction in trans_type.query().filter(trans_type.app_users == tff_profile.app_user):
            transaction.from_username = get_username(transaction.from_user)
            transaction.to_username = get_username(transaction.to_user)
            for i, u in enumerate(transaction.app_users):
                transaction.app_users[i] = get_username(u)
            del transaction.from_user
            del transaction.to_user
            del transaction.app_users
            to_put.append(transaction)
    if dry_run:
        logging.info(to_put)
    else:
        ndb.put_multi(to_put)
