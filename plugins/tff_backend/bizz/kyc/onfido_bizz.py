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

import onfido
from framework.plugin_loader import get_config
from mcfw.consts import DEBUG
from onfido import Applicant, Check
from onfido.rest import ApiException
from plugins.tff_backend.configuration import TffConfiguration
from plugins.tff_backend.plugin_consts import NAMESPACE
from urllib3 import encode_multipart_formdata

_client = None


def get_api_client():
    if _client:
        return _client
    config = get_config(NAMESPACE)
    assert isinstance(config, TffConfiguration)
    if DEBUG:
        assert config.onfido.api_key.startswith('test_')
    onfido.configuration.api_key['Authorization'] = 'token=%s' % config.onfido.api_key
    onfido.configuration.api_key_prefix['Authorization'] = 'Token'
    api = onfido.DefaultApi()
    globals()['_client'] = api
    return api


def create_applicant(applicant):
    applicant.sandbox = DEBUG
    return get_api_client().create_applicant(data=applicant)


def update_applicant(applicant_id, applicant):
    # type: (str, Applicant) -> Applicant
    applicant.sandbox = DEBUG
    return get_api_client().update_applicant(applicant_id, data=applicant)


def list_applicants():
    return get_api_client().list_applicants()


def upload_document(applicant_id, document_type, document_url, side=None):
    # type: (str, str, str, str) -> onfido.Document
    logging.info('Downloading %s', document_url)
    file_response = urlfetch.fetch(document_url)  # type: urlfetch._URLFetchResult
    if file_response.status_code != 200:
        raise ApiException(file_response.status_code, file_response.content)
    content_type = file_response.headers.get('content-type', 'image/jpeg')
    if 'png' in content_type:
        file_name = '%s.png' % document_type
    else:
        file_name = '%s.jpg' % document_type
    return _upload_document(applicant_id, document_type, side, file_name, file_response.content, content_type)


def _upload_document(applicant_id, document_type, side, file_name, file_content, content_type):
    params = [
        ('type', document_type),
        ('side', side),
        ('file', (file_name, file_content, content_type)),
    ]
    payload, payload_content_type = encode_multipart_formdata(params)
    headers = {
        'Authorization': onfido.configuration.get_api_key_with_prefix('Authorization'),
        'Content-Type': payload_content_type,
        'Accept': 'application/json'
    }
    client = get_api_client()
    url = '%s/applicants/%s/documents' % (client.api_client.host, applicant_id)
    response = urlfetch.fetch(url, payload, urlfetch.POST, headers=headers)  # type: urlfetch._URLFetchResult
    if response.status_code != 201:
        raise ApiException(response.status_code, response.content)
    return deserialize(json.loads(response.content), onfido.Document)


def create_check(applicant_id):
    # type: (str) -> Check
    reports = [
        onfido.Report(name='identity', variant='kyc'),
        onfido.Report(name='document'),
        onfido.Report(name='watchlist', variant='full'),
    ]
    check = Check(type='express', reports=reports)
    return get_api_client().create_check(applicant_id, data=check)


def serialize(data):
    return get_api_client().api_client.sanitize_for_serialization(data)


def deserialize(data, klass):
    # Be my guest to improve this
    # New class which inherits ApiClient fails with new public method
    # Dynamically adding public method which calls private method fails
    return get_api_client().api_client._ApiClient__deserialize(data, klass)


def list_checks(applicant_id):
    # type: (str) -> list[onfido.Check]
    # note that pagination does not work with this generated client
    return get_api_client().list_checks(applicant_id).checks
