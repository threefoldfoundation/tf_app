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
from plugins.tff_backend.bizz.global_stats import _get_currency_conversions
from plugins.tff_backend.models.global_stats import GlobalStats


def migrate():
    for stats_model in GlobalStats.query():  # type: GlobalStats
        new_value = stats_model.value / 100
        currencies = _get_currency_conversions(stats_model.currencies, new_value)
        stats_model.populate(currencies=currencies, value=new_value)
        stats_model.put()
