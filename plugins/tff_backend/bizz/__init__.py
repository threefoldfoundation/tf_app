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

from framework.plugin_loader import get_config
from plugins.tff_backend.plugin_consts import NAMESPACE


def get_tf_token_api_key():
    return get_config(NAMESPACE).rogerthat.token_api_key


def get_grid_api_key():
    return get_config(NAMESPACE).rogerthat.grid_api_key


def get_mazraa_api_key():
    return get_config(NAMESPACE).rogerthat.mazraa_api_key
