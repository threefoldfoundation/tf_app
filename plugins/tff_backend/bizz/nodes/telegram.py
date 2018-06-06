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
import json
import logging

from google.appengine.api import urlfetch

from framework.plugin_loader import get_config
from mcfw.consts import MISSING, DEBUG
from plugins.tff_backend.configuration import TelegramConfig
from plugins.tff_backend.plugin_consts import NAMESPACE


class TelegramException(Exception):
    pass


def _telegram_request(method, payload=None):
    telegram_config = get_config(NAMESPACE).telegram  # type: TelegramConfig
    if telegram_config is MISSING:
        logging.debug('Not sending request to telegram because no config was found')
        return
    headers = {'Content-Type': 'application/json'}
    if payload:
        payload['chat_id'] = telegram_config.chat_id
    response = urlfetch.fetch('https://api.telegram.org/bot%s/%s' % (telegram_config.bot_token, method),
                              json.dumps(payload), urlfetch.POST, headers)  # type: urlfetch._URLFetchResult
    if response.status_code == 200:
        return response.content
    raise TelegramException(response.content)


def send_message(message):
    data = {
        'text': message,
        'parse_mode': 'markdown',
    }
    if DEBUG:
        logging.info('Message to telegram: %s' % message)
        return
    return _telegram_request('sendMessage', data)
