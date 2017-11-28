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

NAMESPACE = u'tff_backend'

KEY_ALGORITHM = u'ed25519'
KEY_NAME = u'threefold'

SUPPORTED_CRYPTO_CURRENCIES = {'BTC'}
CRYPTO_CURRENCY_NAMES = {
    'BTC': 'Bitcoin'
}

BUY_TOKENS_FLOW_V3 = u'buy_tokens_ITO_v3'
BUY_TOKENS_FLOW_V3_PAUSED = u'buy_tokens_ITO_v3_paused'
BUY_TOKENS_FLOW_V3_KYC_MENTION = u'buy_tokens_ITO_v3_KYCmention'
BUY_TOKENS_FLOW_V4 = u'buy_tokens_ITO_v4'
KYC_FLOW_PART_1 = u'kyc_part_1'
KYC_FLOW_PART_1_TAG = u'kyc_part_1'
KYC_FLOW_PART_2_TAG = u'kyc_part_2'
BUY_TOKENS_TAG = u'invest_itft'
