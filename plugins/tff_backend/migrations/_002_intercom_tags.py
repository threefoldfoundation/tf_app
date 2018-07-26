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
import logging
from collections import defaultdict

from google.appengine.ext import ndb
from google.appengine.ext.deferred import deferred

from framework.bizz.job import run_job, MODE_BATCH
from plugins.tff_backend.bizz.nodes.hoster import get_intercom_tags_for_node_order
from plugins.tff_backend.bizz.intercom_helpers import tag_intercom_users
from plugins.tff_backend.bizz.investor import get_intercom_tags_for_investment
from plugins.tff_backend.bizz.iyo.utils import get_iyo_usernames
from plugins.tff_backend.models.hoster import NodeOrder
from plugins.tff_backend.models.investor import InvestmentAgreement


def migrate(dry_run=False):
    run_job(_get_node_orders, [], _set_intercom_tags_node_orders, [dry_run], mode=MODE_BATCH, batch_size=50)
    run_job(_get_investment_agreements, [], _set_intercom_tags_investment_agreements, [dry_run], mode=MODE_BATCH,
            batch_size=50)


def _get_node_orders():
    return NodeOrder.query()


def _get_investment_agreements():
    return InvestmentAgreement.query()


def _set_intercom_tags_node_orders(node_order_keys, dry_run):
    node_orders = ndb.get_multi(node_order_keys)  # type: list[NodeOrder]
    tags = defaultdict(list)
    for order in node_orders:
        order_tags = get_intercom_tags_for_node_order(order)
        for tag in order_tags:
            if order.username not in tags[tag]:
                tags[tag].append(order.username)
    _set_tags(tags, dry_run)


def _set_intercom_tags_investment_agreements(agreement_keys, dry_run):
    investments = ndb.get_multi(agreement_keys)  # type: list[InvestmentAgreement]
    tags = defaultdict(list)
    for investment in investments:
        investment_tags = get_intercom_tags_for_investment(investment)
        if investment_tags:
            for tag in investment_tags:
                if investment.username not in tags[tag]:
                    tags[tag].append(investment.username)
    _set_tags(tags, dry_run)


def _set_tags(tag_dict, dry_run):
    for tag, users in tag_dict.iteritems():
        logging.info('Adding tag "%s" to users %s', tag, users)
        if not dry_run:
            deferred.defer(tag_intercom_users, tag, users)
