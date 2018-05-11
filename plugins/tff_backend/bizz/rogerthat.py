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
import logging

from google.appengine.api import users

from mcfw.rpc import arguments, returns
from plugins.rogerthat_api.api import system, messaging, RogerthatApiException
from plugins.rogerthat_api.to import MemberTO
from plugins.rogerthat_api.to.messaging import Message, AnswerTO
from plugins.rogerthat_api.to.messaging.service_callback_results import TYPE_FLOW, FlowCallbackResultTypeTO, \
    FlowMemberResultCallbackResultTO
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.bizz.service import get_main_branding_hash
from plugins.tff_backend.plugin_consts import FLOW_ERROR_MESSAGE
from plugins.tff_backend.utils.app import get_app_user_tuple


def put_user_data(user_email, app_id, updated_user_data):
    api_key = get_rogerthat_api_key()
    try:
        system.put_user_data(api_key, user_email, app_id, updated_user_data)
    except RogerthatApiException as e:
        if e.code == 60011:  # user not in friend list
            raise Exception(e.message)  # ensure task is retried
        raise


@returns(unicode)
@arguments(member=MemberTO, message=unicode, answers=(None, [AnswerTO]), flags=(int, long))
def send_rogerthat_message(member, message, answers=None, flags=None):
    # type: (MemberTO, unicode, list[AnswerTO]) -> unicode
    flags = flags if flags is not None else Message.FLAG_AUTO_LOCK
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


@returns(unicode)
@arguments(member=(MemberTO, users.User), flow=unicode)
def send_rogerthat_flow(member, flow):
    if isinstance(member, users.User):
        human_user, app_id = get_app_user_tuple(member)
        member = MemberTO(member=human_user.email(), app_id=app_id, alert_flags=Message.ALERT_FLAG_VIBRATE)

    messaging.start_local_flow(api_key=get_rogerthat_api_key(),
                               xml=None,
                               members=[member],
                               flow=flow)


def create_error_message(message=None):
    logging.debug('Sending error message')
    if not message:
        message = u'Oh no! An error occurred.\nHow embarrassing :-(\n\nPlease try again later.'
    result = FlowCallbackResultTypeTO(flow=FLOW_ERROR_MESSAGE,
                                      tag=None,
                                      force_language=None,
                                      flow_params=json.dumps({'message': message}))
    return FlowMemberResultCallbackResultTO(type=TYPE_FLOW, value=result)
