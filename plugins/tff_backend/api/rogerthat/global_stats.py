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

from mcfw.rpc import returns
from plugins.tff_backend.bizz.global_stats import list_global_stats, ApiCallException
from plugins.tff_backend.to.global_stats import GlobalStatsTO


@returns([GlobalStatsTO])
def api_list_global_stats(*args, **kwargs):
    try:
        return [GlobalStatsTO.from_model(stat) for stat in list_global_stats()]
    except Exception as e:
        logging.exception(e)
        raise ApiCallException('Could not list global statistics. Please try again later.')
