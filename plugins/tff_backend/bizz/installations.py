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
from framework.plugin_loader import get_config
from plugins.rogerthat_api.api import app
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.plugin_consts import NAMESPACE


def list_installations(**kwargs):
    return app.list_installations(get_rogerthat_api_key(), app_id=get_config(NAMESPACE).rogerthat.app_id, **kwargs)


def get_installation(**kwargs):
    return app.get_installation(get_rogerthat_api_key(), **kwargs)


def list_installation_logs(**kwargs):
    return app.list_installation_logs(get_rogerthat_api_key(), **kwargs)
