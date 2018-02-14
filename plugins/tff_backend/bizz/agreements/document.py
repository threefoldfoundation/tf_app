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
import base64
import json
import logging

from plugins.rogerthat_api.api import messaging
from plugins.rogerthat_api.to import MemberTO
from plugins.rogerthat_api.to.messaging import Message, AttachmentTO
from plugins.rogerthat_api.to.messaging.forms import SignFormTO, SignTO
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.bizz.iyo.utils import get_app_user_from_iyo_username
from plugins.tff_backend.plugin_consts import KEY_ALGORITHM, KEY_NAME
from plugins.tff_backend.utils.app import get_app_user_tuple


def send_document_sign_message(document_key, username, pdf_url, attachment_name, pdf_size, tag, flow, push_message):
    app_user = get_app_user_from_iyo_username(username)
    logging.debug('Sending sign widget to app user %s for document %s', app_user, document_key)

    form = SignFormTO(positive_button_ui_flags=Message.UI_FLAG_EXPECT_NEXT_WAIT_5,
                      widget=SignTO(algorithm=KEY_ALGORITHM,
                                    key_name=KEY_NAME,
                                    payload=base64.b64encode(pdf_url).decode('utf-8')))

    attachment = AttachmentTO(content_type=u'application/pdf',
                              download_url=pdf_url,
                              name=attachment_name,
                              size=pdf_size)

    tag = json.dumps({
        u'__rt__.tag': tag,
        u'document_id': document_key.id()
    }).decode('utf-8')
    flow_params = json.dumps({
        'form': form.to_dict(),
        'attachments': [attachment.to_dict()]
    })
    email, app_id = get_app_user_tuple(app_user)
    members = [MemberTO(member=email.email(), app_id=app_id, alert_flags=0)]
    messaging.start_local_flow(get_rogerthat_api_key(), None, members, None, tag=tag, context=None, flow=flow,
                               push_message=push_message, flow_params=flow_params)
