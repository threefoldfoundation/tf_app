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
from babel.numbers import list_currencies

NAMESPACE = u'tff_backend'

KEY_ALGORITHM = u'ed25519'
KEY_NAME = u'threefold'

SUPPORTED_CRYPTO_CURRENCIES = {'BTC'}
CRYPTO_CURRENCY_NAMES = {
    'BTC': 'Bitcoin'
}
SUPPORTED_CURRENCIES = list_currencies() | SUPPORTED_CRYPTO_CURRENCIES

BUY_TOKENS_FLOW_V3 = u'buy_tokens_ITO_v3'
BUY_TOKENS_FLOW_V3_PAUSED = u'buy_tokens_ITO_v3_paused'
BUY_TOKENS_FLOW_V3_KYC_MENTION = u'buy_tokens_ITO_v3_KYCmention'
BUY_TOKENS_FLOW_V4 = u'buy_tokens_ITO_v4'
BUY_TOKENS_TAG = u'invest_itft'
