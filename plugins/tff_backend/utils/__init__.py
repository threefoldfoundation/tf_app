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

import json
import re

from google.appengine.ext import db

from mcfw.rpc import returns, arguments
from plugins.rogerthat_api.to.messaging.flow import BaseFlowStepTO

HUMAN_READABLE_TAG_REGEX = re.compile('(.*?)\\s*\\{.*\\}')


@returns(unicode)
@arguments(tag=unicode)
def parse_to_human_readable_tag(tag):
    if tag is None:
        return None

    if tag.startswith('{') and tag.endswith('}'):
        try:
            tag_dict = json.loads(tag)
        except:
            return tag
        return tag_dict.get('__rt__.tag', tag)

    m = HUMAN_READABLE_TAG_REGEX.match(tag)
    if m:
        return m.group(1)

    return tag


@returns(BaseFlowStepTO)
@arguments(steps=[BaseFlowStepTO], step_id=unicode)
def get_step(steps, step_id):
    # type: (list[BaseFlowStepTO], unicode) -> Optional[BaseFlowStepTO]
    for step in reversed(steps):
        if step.step_id == step_id:
            return step
    return None


@returns(object)
@arguments(steps=[BaseFlowStepTO], step_id=unicode)
def get_step_value(steps, step_id):
    step = get_step(steps, step_id)
    return step and step.get_value()


def is_flag_set(flag, value):
    return value & flag == flag


def set_flag(flag, value):
    return flag | value


def unset_flag(flag, value):
    return value & ~flag


def round_currency_amount(currency, amount):
    decimals_after_comma = 8 if currency == 'BTC' else 2
    return round(amount, decimals_after_comma)


def convert_to_str(data):
    from framework.utils import convert_to_str as convert
    return convert(data)


def get_key_name_from_key_string(key_string):
    try:
        return db.Key(key_string).name()
    except db.BadArgumentError:
        return key_string
