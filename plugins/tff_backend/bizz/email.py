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
import logging

from google.appengine.api import mail
from google.appengine.api.app_identity import app_identity

from framework.plugin_loader import get_config
from plugins.tff_backend.plugin_consts import NAMESPACE


def send_emails_to_support(subject, body):
    cfg = get_config(NAMESPACE)
    sender = 'no-reply@%s.appspotmail.com' % app_identity.get_application_id()
    logging.debug('Sending email to support: %s\n %s', subject, body)
    for email in cfg.support_emails:
        logging.debug('Sending email to %s', email)
        mail.send_mail(sender=sender,
                       to=email,
                       subject=subject,
                       body=body)
