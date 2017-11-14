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
from functools import wraps
import logging

from enum import Enum
from six import string_types

from framework.bizz.authentication import get_current_session
from framework.to import TO
from google.appengine.ext import ndb
from plugins.tff_backend.bizz.audit import mapping
from plugins.tff_backend.models.audit import AuditLog
from plugins.tff_backend.to.audit import AuditLogDetailsTO, AuditLogDetailsListTO


def audit(audit_type, reference_arg):
    """
        Decorator to be used with @rest function calls
    Args:
        audit_type (mapping.AuditLogType): Use a property of mapping.AuditLogType which has a reference to the db model
        reference_arg (Union[basestring, list[basestring]]: kwarg(s) of the @rest function which are needed to call
         the create_key method of the model
    """

    def wrap(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            if isinstance(reference_arg, string_types):
                key_args = kwargs.get(reference_arg)
            else:
                key_args = (kwargs.pop(arg) for arg in reference_arg)
            kwargs.pop('accept_missing')
            # At this point kwargs is the rest of the kwargs that aren't needed to construct the key
            # In most cases it will only contain 'data' which is the post/put data
            audit_log(audit_type, key_args, kwargs)
            return f(*args, **kwargs)

        return wrapped

    return wrap


def audit_log(audit_type, key_args, data, user_id=None):
    """
        Logs an action of the current user. reference_args can be the arguments needed to call the create_key method of
        the model, or an ndb key.
    Args:
        audit_type (mapping.AuditLogType)
        key_args(Union[string_types, tuple, ndb.Key])
        data (Union[TO, dict])
        user_id (unicode)

    Returns:
        ndb.Future
    """
    if not user_id:
        session = get_current_session()
        user_id = session and session.user_id
    model = mapping.AuditLogMapping.get(audit_type)
    if not isinstance(model, mapping.AuditLogMappingTypes):
        logging.error('model %s is not a supported audit log type', model)
        return
    if isinstance(key_args, (string_types, int, long)):
        reference = model.create_key(key_args)
    elif isinstance(key_args, tuple):
        # Model must have create_key method
        reference = model.create_key(*key_args)
    else:
        assert isinstance(key_args, ndb.Key)
        reference = key_args
    if isinstance(audit_type, Enum):
        audit_type = audit_type.value
    data_ = {k: data[k].to_dict() if isinstance(data[k], TO) else data[k] for k in data}
    return AuditLog(audit_type=audit_type, reference=reference, user_id=user_id, data=data_).put_async()


def list_audit_logs(page_size, cursor):
    # type: (long, unicode) -> tuple[list[AuditLog], ndb.Cursor, bool]
    return AuditLog.list().fetch_page(page_size, start_cursor=ndb.Cursor(urlsafe=cursor))


def list_audit_logs_by_type(audit_type, page_size, cursor):
    # type: (mapping.AuditLogType, long, unicode) -> tuple[list[AuditLog], unicode, bool]
    return AuditLog.list_by_type(audit_type).fetch_page(page_size, start_cursor=ndb.Cursor(urlsafe=cursor))


def list_audit_logs_by_user(user_id, page_size, cursor):
    # type: (unicode, long, unicode) -> tuple[list[AuditLog], unicode, bool]
    return AuditLog.list_by_user(user_id).fetch_page(page_size, start_cursor=ndb.Cursor(urlsafe=cursor))


def list_audit_logs_by_type_and_user(audit_log_type, user_id, page_size, cursor):
    # type: (mapping.AuditLogType, unicode, long, unicode) -> tuple[list[AuditLog], unicode, bool]
    return AuditLog.list_by_type_and_user(audit_log_type, user_id).fetch_page(page_size,
                                                                              start_cursor=ndb.Cursor(urlsafe=cursor))


def list_audit_logs_details(query_results, include_reference=True):
    # type: (tuple[list[AuditLog], ndb.Cursor, bool], bool) -> AuditLogDetailsListTO
    if not include_reference:
        results = [AuditLogDetailsTO.from_model(log_model) for log_model in query_results[0]]
    else:
        referenced_models = ndb.get_multi([log_model.reference for log_model in query_results[0]])
        results = []
        for log_model, referenced_model in zip(query_results[0], referenced_models):
            results.append(AuditLogDetailsTO.from_model(log_model, referenced_model))
    websafe_cursor = query_results[1].to_websafe_string() if query_results[1] else None
    return AuditLogDetailsListTO(cursor=websafe_cursor, more=query_results[2], results=results)
