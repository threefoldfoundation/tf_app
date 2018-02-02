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
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.rogerthat_api.to.messaging.forms import SignWidgetResultTO
from plugins.tff_backend.bizz.iyo.keystore import get_publickey_label
from plugins.tff_backend.bizz.iyo.utils import get_itsyouonline_client_from_username, get_iyo_organization_id
from plugins.tff_backend.to.iyo.see import IYOSeeDocument, IYOSeeDocumentView, IYOSeeDocumenVersion
from plugins.tff_backend.utils import convert_to_str
from requests import HTTPError


@returns(IYOSeeDocument)
@arguments(organization_id=unicode, username=unicode, uniqueid=unicode, version=unicode)
def get_see_document(organization_id, username, uniqueid, version=u"latest"):
    client = get_itsyouonline_client_from_username(username)
    query_params = {
        'version': version
    }
    result = client.api.users.GetSeeObject(uniqueid, organization_id, convert_to_str(username),
                                           query_params=query_params)
    return IYOSeeDocument(**result.json())


@returns([IYOSeeDocumentView])
@arguments(organization_id=unicode, username=unicode)
def get_see_documents(organization_id, username):
    client = get_itsyouonline_client_from_username(username)
    query_params = {
        'globalid': organization_id
    }
    result = client.api.users.GetSeeObjects(convert_to_str(username), query_params=query_params)
    return [IYOSeeDocumentView(**d) for d in result.json()]


@returns(IYOSeeDocumentView)
@arguments(username=unicode, doc=IYOSeeDocumentView)
def _create_see_document(username, doc):
    client = get_itsyouonline_client_from_username(username)
    data = serialize_complex_value(doc, IYOSeeDocumentView, False, skip_missing=True)
    result = client.api.users.CreateSeeObject(data, convert_to_str(username))
    return IYOSeeDocumentView(**result.json())


@returns(IYOSeeDocumentView)
@arguments(organization_id=unicode, username=unicode, doc=IYOSeeDocumentView)
def update_see_document(organization_id, username, doc):
    client = get_itsyouonline_client_from_username(username)
    data = serialize_complex_value(doc, IYOSeeDocumentView, False, skip_missing=True)
    result = client.api.users.UpdateSeeObject(data, doc.uniqueid, organization_id, convert_to_str(username))
    return IYOSeeDocumentView(**result.json())


@returns(IYOSeeDocumentView)
@arguments(organization_id=unicode, username=unicode, doc=IYOSeeDocumentView)
def _sign_see_document(organization_id, username, doc):
    client = get_itsyouonline_client_from_username(username)
    data = serialize_complex_value(doc, IYOSeeDocumentView, False, skip_missing=True)
    result = client.api.users.SignSeeObject(data, convert_to_str(doc.version), doc.uniqueid, organization_id,
                                            convert_to_str(username))
    return IYOSeeDocumentView(**result.json())


@arguments(username=unicode, iyo_see_id=unicode, sign_result=SignWidgetResultTO, user_detail=UserDetailsTO)
def sign_see_document(username, iyo_see_id, sign_result, user_detail):
    # type: (unicode, unicode, SignWidgetResultTO, UserDetailsTO) -> None
    public_key = sign_result.public_key.public_key
    iyo_organization_id = get_iyo_organization_id()
    logging.debug('Getting IYO SEE document %s', iyo_see_id)
    doc = get_see_document(iyo_organization_id, username, iyo_see_id)
    doc_view = IYOSeeDocumentView(username=doc.username,
                                  globalid=doc.globalid,
                                  uniqueid=doc.uniqueid,
                                  **serialize_complex_value(doc.versions[-1], IYOSeeDocumenVersion, False))
    doc_view.signature = sign_result.payload_signature
    keystore_label = get_publickey_label(public_key, user_detail)
    if not keystore_label:
        raise Exception('Could not find keystore label for user %s and public key %s' % (user_detail, public_key))
    doc_view.keystore_label = keystore_label
    logging.debug('Signing IYO SEE document')
    try:
        _sign_see_document(iyo_organization_id, username, doc_view)
    except HTTPError as e:
        # Already signed, ignore
        if e.response.status_code != httplib.CONFLICT:
            raise e


@arguments(document_id=unicode, category=unicode, description=unicode, username=unicode, pdf_url=unicode,
           content_type=unicode)
def create_see_document(document_id, category, description, username, pdf_url,
                        content_type=u'application/pdf'):
    iyo_see_doc = IYOSeeDocumentView(username=username,
                                     globalid=get_iyo_organization_id(),
                                     uniqueid=document_id,
                                     version=1,
                                     category=category,
                                     link=pdf_url,
                                     content_type=content_type,
                                     markdown_short_description=description,
                                     markdown_full_description=description)
    logging.debug('Creating IYO SEE document: %s', iyo_see_doc)
    try:
        _create_see_document(username, iyo_see_doc)
    except HTTPError as e:
        if e.response.status_code != httplib.CONFLICT:
            raise e
