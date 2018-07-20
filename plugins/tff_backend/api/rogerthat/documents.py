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

from mcfw.rpc import returns, arguments
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.tff_backend.bizz.global_stats import ApiCallException
from plugins.tff_backend.bizz.iyo.utils import get_username
from plugins.tff_backend.models.document import Document, DocumentType
from plugins.tff_backend.models.hoster import NodeOrder
from plugins.tff_backend.models.investor import InvestmentAgreement
from plugins.tff_backend.to.user import SignedDocumentTO


@returns([SignedDocumentTO])
@arguments(params=dict, user_detail=UserDetailsTO)
def api_list_documents(params, user_detail):
    try:
        username = get_username(user_detail)
        orders = NodeOrder.list_by_user(username).fetch_async()
        agreements = InvestmentAgreement.list_by_user(username).fetch_async()
        documents = Document.list_by_username(username).fetch_async()
        results = []
        for order in orders.get_result():  # type: NodeOrder
            results.append(SignedDocumentTO(description=u'Terms and conditions for ordering a Zero-Node',
                                            signature=order.signature,
                                            name=u'Zero-Node order %s' % order.id,
                                            link=order.document_url))
        for agreement in agreements.get_result():  # type: InvestmentAgreement
            results.append(SignedDocumentTO(description=u'Internal token offering - Investment Agreement',
                                            signature=agreement.signature,
                                            name=u'Investment agreement %s' % agreement.id,
                                            link=agreement.document_url))
        for document in documents.get_result():  # type: Document
            if document.type == DocumentType.TOKEN_VALUE_ADDENDUM:
                description = u"""After much feedback from the blockchain and cryptocurrency community, we have adjusted the price of the iTFT from USD $5.00 to
USD $0.05. This means for the Purchase Amount previously outlined in your Purchase Agreement(s), you will receive more tokens."""
                results.append(SignedDocumentTO(description=description,
                                                signature=document.signature,
                                                name=u'ITFT Price Adjustment %s' % document.id,
                                                link=document.url))
        return results
    except:
        logging.error('Failed to list documents', exc_info=True)
        raise ApiCallException(u'Could not load ThreeFold documents. Please try again later.')
