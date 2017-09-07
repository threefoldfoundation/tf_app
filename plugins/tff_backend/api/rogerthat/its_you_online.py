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
from plugins.tff_backend.bizz.iyo.see import get_see_documents, get_see_document
from plugins.tff_backend.bizz.iyo.utils import get_iyo_organization_id, get_iyo_username
from plugins.tff_backend.to.iyo.see import IYOSeeDocumentView, IYOSeeDocument


@returns([IYOSeeDocumentView])
@arguments(params=dict, user_detail=UserDetailsTO)
def api_iyo_see_list(params, user_detail):
    try:
        iyo_organization_id = get_iyo_organization_id()
        iyo_username = get_iyo_username(user_detail)
        return get_see_documents(iyo_organization_id, iyo_username)
    except:
        logging.error('iyo.see.list exception occurred', exc_info=True)
        raise ApiCallException(u'Could not load itsyou.online see documents. Please try again later.')


@returns(IYOSeeDocument)
@arguments(params=dict, user_detail=UserDetailsTO)
def api_iyo_see_detail(params, user_detail):
    try:
        iyo_organization_id = get_iyo_organization_id()
        iyo_username = get_iyo_username(user_detail)
        return get_see_document(iyo_organization_id, iyo_username, params['uniqueid'], u'all')
    except:
        logging.error('iyo.see.detail exception occurred', exc_info=True)
        raise ApiCallException(u'Could not load itsyou.online see document details. Please try again later.')
