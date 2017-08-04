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
import json
import logging

from mcfw.exceptions import HttpException

from framework.bizz.authentication import get_current_session
from plugins.its_you_online_auth.bizz.authentication import get_itsyouonline_client_from_jwt
from plugins.tff_backend.to.iyo.see import IYOSeeDocument, IYOSeeDocumentView


def _raise_http_exception(status_code, result_text):
    try:
        err = json.loads(result_text)
        e = HttpException(err.get('error'), err)
    except ValueError:
        e = HttpException(result_text)
    e.http_code = status_code
    raise e

def get_see_document(organization_id, username, uniqueid):
    jwt = get_current_session().jwt
    result = get_itsyouonline_client_from_jwt(jwt).api.users.GetSeeObject(uniqueid, username, organization_id)
    logging.debug('get_see_document %s %s', result.status_code, result.text)
    if result.status_code != httplib.OK:
        _raise_http_exception(result.status_code, result.text)
    return IYOSeeDocument(**result)


def get_see_documents(organization_id, username):
    jwt = get_current_session().jwt
    result = get_itsyouonline_client_from_jwt(jwt).api.users.ListSeeObjectsByOrganization(username, organization_id)
    logging.debug('get_see_documents %s %s', result.status_code, result.text)
    if result.status_code != httplib.OK:
        _raise_http_exception(result.status_code, result.text)
    return [IYOSeeDocumentView(**d) for d in result.json()]


def create_see_document(organization_id, username, data):
    jwt = get_current_session().jwt
    result = get_itsyouonline_client_from_jwt(jwt).api.users.CreateSeeObject(data, username, organization_id)
    logging.debug('create_see_document %s %s', result.status_code, result.text)
    if result.status_code not in (httplib.CREATED, httplib.CONFLICT):
        _raise_http_exception(result.status_code, result.text)


def update_see_document( organization_id, username, data):
    jwt = get_current_session().jwt
    result = get_itsyouonline_client_from_jwt(jwt).api.users.UpdateSeeObject(data, data.uniqueid, username, organization_id)
    logging.debug('update_see_document %s %s', result.status_code, result.text)
    if result.status_code not in (httplib.CREATED,):
        _raise_http_exception(result.status_code, result.text)


def sign_see_document(organization_id, username, data):
    jwt = get_current_session().jwt
    result = get_itsyouonline_client_from_jwt(jwt).api.users.SignSeeObject(data, data.version, data.uniqueid, username, organization_id)
    logging.debug('sign_see_document %s %s', result.status_code, result.text)
    if result.status_code not in (httplib.CREATED,):
        _raise_http_exception(result.status_code, result.text)
