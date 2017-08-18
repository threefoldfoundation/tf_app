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

import webapp2

from framework.bizz.authentication import get_current_session
from framework.bizz.i18n import get_user_language
from framework.handlers import render_logged_in_page, render_page
from framework.plugin_loader import get_plugin
from plugins.its_you_online_auth.its_you_online_auth_plugin import ItsYouOnlineAuthPlugin


class IndexPageHandler(webapp2.RequestHandler):
    def get(self, *args, **kwargs):
        if get_current_session():
            render_logged_in_page(self)
        else:
            query = self.request.query if self.request.query else ''
            if not self.request.GET.get('source'):
                plugin = get_plugin('its_you_online_auth')  # type: ItsYouOnlineAuthPlugin
                query += '&scope=user:memberof:%s' % plugin.configuration.root_organization.name
            parameters = {
                'lang': get_user_language(),
                'query_params': '?%s' % query
            }
            render_page(self.response, 'unauthorized_index.html', template_parameters=parameters)
