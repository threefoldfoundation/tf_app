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
from enum import Enum
from framework.to import TO
from mcfw.properties import unicode_property, typed_property


class TickerEntryType(Enum):
    FLOW = 'flow'
    INSTALLATION = 'installation'


class TickerEntryTO(TO):
    date = unicode_property('date')
    data = typed_property('data', dict)
    id = unicode_property('id')
    type = unicode_property('type')  # one of ['flow', 'installation']

    def to_dict(self, include=None, exclude=None):
        return super(TickerEntryTO, self).to_dict(exclude=exclude or ['id'])
