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

import httplib
import logging

from mcfw.rpc import returns, arguments, serialize_complex_value
from plugins.tff_backend.bizz.iyo.utils import get_iyo_client
from plugins.tff_backend.to.iyo.see import IYOSeeDocument, IYOSeeDocumentView
from plugins.tff_backend.utils import raise_http_exception


@returns(IYOSeeDocument)
@arguments(organization_id=unicode, username=unicode, uniqueid=unicode)
def get_see_document(organization_id, username, uniqueid):
    client = get_iyo_client(username)
    result = client.api.users.GetSeeObject(uniqueid, username, organization_id)
    logging.debug('get_see_document %s %s', result.status_code, result.text)
    if result.status_code != httplib.OK:
        raise_http_exception(result.status_code, result.text)
    return IYOSeeDocument(**result.json())


@returns(IYOSeeDocumentView)
@arguments(organization_id=unicode, username=unicode)
def get_see_documents(organization_id, username):
    client = get_iyo_client(username)
    result = client.api.users.ListSeeObjectsByOrganization(username, organization_id)
    logging.debug('get_see_documents %s %s', result.status_code, result.text)
    if result.status_code != httplib.OK:
        raise_http_exception(result.status_code, result.text)
    return [IYOSeeDocumentView(**d) for d in result.json()]


@returns(IYOSeeDocumentView)
@arguments(organization_id=unicode, username=unicode, doc=IYOSeeDocumentView)
def create_see_document(organization_id, username, doc):
    client = get_iyo_client(username)
    data = serialize_complex_value(doc, IYOSeeDocumentView, False, skip_missing=True)
    result = client.api.users.CreateSeeObject(data, username, organization_id)
    logging.debug('create_see_document %s %s', result.status_code, result.text)
    if result.status_code not in (httplib.CREATED, httplib.CONFLICT):
        raise_http_exception(result.status_code, result.text)
    return IYOSeeDocumentView(**result.json())


@returns(IYOSeeDocumentView)
@arguments(organization_id=unicode, username=unicode, doc=IYOSeeDocumentView)
def update_see_document(organization_id, username, doc):
    client = get_iyo_client(username)
    data = serialize_complex_value(doc, IYOSeeDocumentView, False, skip_missing=True)
    result = client.api.users.UpdateSeeObject(data, doc.uniqueid, username, organization_id)
    logging.debug('update_see_document %s %s', result.status_code, result.text)
    if result.status_code not in (httplib.CREATED,):
        raise_http_exception(result.status_code, result.text)
    return IYOSeeDocumentView(**result.json())


@returns(IYOSeeDocumentView)
@arguments(organization_id=unicode, username=unicode, doc=IYOSeeDocumentView)
def sign_see_document(organization_id, username, doc):
    client = get_iyo_client(username)
    data = serialize_complex_value(doc, IYOSeeDocumentView, False, skip_missing=True)
    result = client.api.users.SignSeeObject(data, doc.version, doc.uniqueid, username, organization_id)
    logging.debug('sign_see_document %s %s', result.status_code, result.text)
    if result.status_code not in (httplib.CREATED,):
        raise_http_exception(result.status_code, result.text)
    return IYOSeeDocumentView(**result.json())
