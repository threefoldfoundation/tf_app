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

class InvestorSteps(object):
    DOWNLOAD = 'DOWNLOAD'
    ITO_INVITES = 'ITO_INVITES'
    ITO_INVITES_ACCEPTED = 'ITO_INVITES_ACCEPTED'
    FLOW_INIT = 'FLOW_INIT'
    FLOW_AMOUNT = 'FLOW_AMOUNT'
    FLOW_SIGN = 'FLOW_SIGN'
    ITO_INVESTORS = 'ITO_INVESTORS'
    PAY = 'PAY'
    PAY_PROCESS = 'PAY_PROCESS'
    ASSIGN_TOKENS = 'ASSIGN_TOKENS'

    @classmethod
    def all(cls):
        return [cls.DOWNLOAD,
                cls.ITO_INVITES,
                cls.ITO_INVITES_ACCEPTED,
                cls.FLOW_INIT,
                cls.FLOW_AMOUNT,
                cls.FLOW_SIGN,
                cls.ITO_INVESTORS,
                cls.PAY,
                cls.PAY_PROCESS,
                cls.ASSIGN_TOKENS]

    @classmethod
    def should_archive(cls, step):
        return cls.ASSIGN_TOKENS == step

    @classmethod
    def get_name_for_step(cls, step):
        if cls.DOWNLOAD == step:
            return 'Download the ThreeFold app'
        if cls.ITO_INVITES == step:
            return 'Get invited to join the IYO.ITOinvited group'
        if cls.ITO_INVITES_ACCEPTED == step:
            return 'Accept invitation in IYO'
        if cls.FLOW_INIT == step:
            return 'Initiate “join ITO” in the TF app'
        if cls.FLOW_AMOUNT == step:
            return 'Select currency, amount of tokens'
        if cls.FLOW_SIGN == step:
            return 'Sign the ITO agreement'
        if cls.ITO_INVESTORS == step:
            return 'Get added to the IYO.ITOinvestors group'
        if cls.PAY == step:
            return 'Make payment'
        if cls.PAY_PROCESS == step:
            return 'We process payment'
        if cls.ASSIGN_TOKENS == step:
            return 'Tokens are assigned'

        logging.error("Investor step name '%s' not set", step)
        return step

    @classmethod
    def get_progress(cls, last_checked_step):
        checked = False
        items = []
        for step in reversed(cls.all()):
            if not checked and step == last_checked_step:
                checked = True

            item = {}
            item['id'] = step
            item['name'] = cls.get_name_for_step(step)
            item['checked'] = checked
            items.append(item)

        d = {}
        d['id'] = 'investor'
        d['name'] = 'Become an investor'
        d['items'] = list(reversed(items))
        return d
