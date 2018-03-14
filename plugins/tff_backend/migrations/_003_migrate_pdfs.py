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
from google.appengine.api import urlfetch

from framework.bizz.job import run_job
from plugins.tff_backend.bizz.gcs import upload_to_gcs
from plugins.tff_backend.bizz.nodes.hoster import get_node_order_details
from plugins.tff_backend.bizz.investor import get_investment_agreement_details
from plugins.tff_backend.models.hoster import NodeOrder
from plugins.tff_backend.models.investor import InvestmentAgreement


def migrate(dry_run=False):
    run_job(_get_node_orders, [], _move_node_order_pdf_to_gcs, [])
    run_job(_get_investment_agreements, [], _move_investment_agreement_pdf_to_gcs, [])


def _get_node_orders():
    return NodeOrder.query()


def _get_investment_agreements():
    return InvestmentAgreement.query()


def _move_node_order_pdf_to_gcs(node_order_key):
    node_order = get_node_order_details(node_order_key.id())
    if not node_order.see_document:
        return
    original_url = node_order.see_document.versions[0].link
    _move_pdf(NodeOrder.filename(node_order.id), original_url)


def _move_investment_agreement_pdf_to_gcs(investment_agreement_key):
    investment_agreement = get_investment_agreement_details(investment_agreement_key.id())
    if not investment_agreement.see_document:
        return
    original_url = investment_agreement.see_document.versions[0].link
    _move_pdf(InvestmentAgreement.filename(investment_agreement.id), original_url)


def _move_pdf(filename, original_url):
    if 'gateway.ipfs' in original_url:
        response = urlfetch.fetch(original_url, deadline=30)
        if response.status_code != 200:
            raise Exception('Invalid response from %s: %s\n%s', response.status_code, response.content)
        pdf_content = response.content
        upload_to_gcs(filename, pdf_content, 'application/pdf')
