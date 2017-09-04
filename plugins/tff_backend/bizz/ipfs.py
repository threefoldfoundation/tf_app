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

import json
import logging

from google.appengine.api import urlfetch

from framework.plugin_loader import get_config
from plugins.tff_backend.plugin_consts import NAMESPACE
from poster.encode import multipart_encode, MultipartParam


def store_pdf(pdf_name, pdf_contents):
    logging.debug('Storing IPFS document')
    params = []
    params.append(MultipartParam("FileItem1",
                                 filename=pdf_name,
                                 filetype='application/pdf',
                                 value=pdf_contents))

    payloadgen, headers = multipart_encode(params)
    payload = str().join(payloadgen)

    cfg = get_config(NAMESPACE)
    headers['Authorization'] = cfg.ipfs.secret

    result = urlfetch.fetch(
        url=u"https://ipfs.threefoldtoken.com/api/files",
        payload=payload,
        method=urlfetch.POST,
        headers=headers)

    if result.status_code != 200:
        return None

    return u'https://gateway.ipfs.io/ipfs/%s' % json.loads(result.content)['Hash']
