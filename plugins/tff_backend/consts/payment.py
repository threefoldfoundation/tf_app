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

from plugins.rogerthat_api.plugin_utils import Enum

PROVIDER_ID = u"threefold"

TOKEN_ITFT = u"iTFT"
TOKEN_TFT = u"TFT"
TOKEN_TFT_CONTRIBUTOR = u"TFTC"


class TokenType(Enum):
    A = u'TFT_A'
    B = u'TFT_B'
    C = u'TFT_C'
    D = u'TFT_D'
    I = u'iTFT_A'


class TransactionStatus(Enum):
    UNCONFIRMED = u'unconfirmed'
    CONFIRMED = u'confirmed'
    FAILED = u'failed'


COIN_TO_HASTINGS_PRECISION = 24
COIN_TO_HASTINGS = pow(10, COIN_TO_HASTINGS_PRECISION)
