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
from mcfw.rpc import arguments, returns
from plugins.rogerthat_api.api import system, messaging
from plugins.rogerthat_api.to import MemberTO
from plugins.rogerthat_api.to.messaging import Message, AnswerTO
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.bizz.service import get_main_branding_hash
from plugins.tff_backend.utils.app import get_app_user_tuple


def put_user_data(app_user, updated_user_data):
    api_key = get_rogerthat_api_key()
    email, app_id = get_app_user_tuple(app_user)
    system.put_user_data(api_key, email.email(), app_id, updated_user_data)


@returns(unicode)
@arguments(member=MemberTO, message=unicode, answers=(None, [AnswerTO]))
def send_rogerthat_message(member, message, answers=None):
    # type: (MemberTO, unicode, list[AnswerTO]) -> unicode
    flags = Message.FLAG_AUTO_LOCK
    if not answers:
        flags = flags | Message.FLAG_ALLOW_DISMISS
        answers = []
    return messaging.send(api_key=get_rogerthat_api_key(),
                          parent_message_key=None,
                          members=[member],
                          message=message,
                          answers=answers or [],
                          flags=flags,
                          alert_flags=Message.ALERT_FLAG_VIBRATE,
                          branding=get_main_branding_hash(),
                          tag=None)
