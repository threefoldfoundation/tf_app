# -*- coding: utf-8 -*-
# Copyright 2018 GIG Technology NV
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
# @@license_version:1.4@@
from framework.bizz.authentication import get_current_user_id
from framework.plugin_loader import get_plugin
from mcfw.consts import MISSING
from mcfw.rpc import serialize_value, get_type_details


class LogTypes(object):
    WEB = 'tf.web'


def log_restapi_call_result(function, success, kwargs, result_or_error):
    offload_plugin = get_plugin('log_offload')
    if not offload_plugin:
        return
    if function.meta['silent']:
        request_data = None
    else:
        kwarg_types = function.meta[u'kwarg_types']
        request_data = {}
        for arg, value in kwargs.iteritems():
            if arg == 'accept_missing' or value is MISSING:
                continue
            request_data[arg] = serialize_value(value, *get_type_details(kwarg_types[arg], value), skip_missing=True)

    if function.meta['silent_result']:
        result = None
    elif isinstance(result_or_error, Exception):
        result = unicode(result_or_error)
    else:
        result = result_or_error
    offload_plugin.create_log(get_current_user_id(), LogTypes.WEB, request_data, result, function.meta['uri'], success)
