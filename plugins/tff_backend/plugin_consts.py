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
BUY_TOKENS_FLOW_V5 = u'buy_tokens_ITO_v5'
KYC_FLOW_PART_1 = u'kyc_part_1'
KYC_FLOW_PART_1_TAG = u'kyc_part_1'
KYC_FLOW_PART_2_TAG = u'kyc_part_2'
BUY_TOKENS_TAG = u'invest_itft'
INVEST_FLOW_TAG = 'invest_complete'
SIGN_TOKEN_VALUE_ADDENDUM_TAG = u'sign_token_value_addendum'

FLOW_ERROR_MESSAGE = 'error_message'
FLOW_HOSTER_SIGNATURE_RECEIVED = 'hoster_signature_received'
FLOW_CONFIRM_INVESTMENT = 'confirm_investment'
FLOW_SIGN_INVESTMENT = 'sign_investment'
FLOW_INVESTMENT_CONFIRMED = 'investment_confirmed'
FLOW_SIGN_HOSTING_AGREEMENT = 'sign_hosting_agreement'
FLOW_HOSTER_REMINDER = 'hoster_reminder'
FLOW_UTILITY_BILL_RECEIVED = 'utility_bill_received'
FLOW_SIGN_TOKEN_VALUE_ADDENDUM = 'sign_token_value_addendum'

FF_ENDED_TIMESTAMP = 1517785200  # friends and family sale
SCHEDULED_QUEUE = 'scheduled-queue'
COIN_TO_HASTINGS = 1000000000000000000000000
COIN_TO_HASTINGS_PERCISION = len(str(COIN_TO_HASTINGS)) - 1
