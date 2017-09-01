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


class HosterSteps(object):
    DOWNLOAD = 'DOWNLOAD'
    REGISTER_IYO = 'REGISTER_IYO'
    FLOW_INIT = 'FLOW_INIT'
    FLOW_SIGN = 'FLOW_SIGN'
    FLOW_ADDRESS = 'FLOW_ADDRESS'
    PAY = 'PAY'
    NODE_SENT = 'NODE_SENT'
    NODE_DELIVERY_ACCEPTED = 'NODE_DELIVERY_ACCEPTED'
    NODE_DELIVERY_CONFIRMED = 'NODE_DELIVERY_CONFIRMED'
    NODE_POWERED = 'NODE_POWERED'

    @classmethod
    def all(cls):
        return [cls.DOWNLOAD,
                cls.REGISTER_IYO,
                cls.FLOW_INIT,
                cls.FLOW_SIGN,
                cls.FLOW_ADDRESS,
                cls.PAY,
                cls.NODE_SENT,
                cls.NODE_DELIVERY_ACCEPTED,
                cls.NODE_DELIVERY_CONFIRMED,
                cls.NODE_POWERED]

    @classmethod
    def should_archive(cls, step):
        return cls.NODE_POWERED == step

    @classmethod
    def get_name_for_step(cls, step):
        if cls.DOWNLOAD == step:
            return 'Download the ThreeFold app'
        if cls.REGISTER_IYO == step:
            return 'Register on ItsYou.Online'
        if cls.FLOW_INIT == step:
            return 'Initiate “become a hoster process” in the TF app'
        if cls.FLOW_SIGN == step:
            return 'Sign the hoster agreement'
        if cls.FLOW_ADDRESS == step:
            return 'Share shipping address, telephone number, name with shipping company'
        if cls.PAY == step:
            return 'Pay for your tokens'
        if cls.NODE_SENT == step:
            return 'Receive confirmation of sending'
        if cls.NODE_DELIVERY_ACCEPTED == step:
            return 'Accept node from delivery service'
        if cls.NODE_DELIVERY_CONFIRMED == step:
            return 'Confirm delivery of node'
        if cls.NODE_POWERED == step:
            return 'Hook up node to internet and power'

        logging.error("Hoster step name '%s' not set", step)
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
        d['id'] = 'hoster'
        d['name'] = 'Become a hoster'
        d['items'] = list(reversed(items))
        return d
