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
from mcfw.exceptions import HttpNotFoundException
from plugins.tff_backend.models.global_stats import GlobalStats
from plugins.tff_backend.to.global_stats import GlobalStatsTO


class ApiCallException(Exception):
    pass


def list_global_stats():
    # type: () -> list[GlobalStats]
    return GlobalStats.list()


def get_global_stats(stats_id):
    # type: (unicode) -> GlobalStats
    return GlobalStats.create_key(stats_id).get()


def put_global_stats(stats_id, stats):
    # type: (unicode, GlobalStatsTO) -> GlobalStats
    assert isinstance(stats, GlobalStatsTO)
    stats_model = GlobalStats.create_key(stats_id).get()  # type: GlobalStats
    if not stats_model:
        raise HttpNotFoundException('global_stats_not_found')
    stats_model.populate(**stats.to_dict(exclude=['id', 'market_cap']))
    stats_model.put()
    return stats_model
