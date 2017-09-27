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
import base64
import httplib
import logging
import urllib
import uuid

import webapp2

import qrcode
from framework.bizz.authentication import get_current_session
from framework.bizz.session import create_session
from framework.handlers import render_error_page
from framework.models.session import Session
from framework.plugin_loader import get_auth_plugin, get_config
from framework.utils import get_server_url, now
from mcfw.consts import MISSING
from mcfw.exceptions import HttpException, HttpBadRequestException
from plugins.its_you_online_auth.bizz.authentication import get_jwt
from plugins.its_you_online_auth.its_you_online_auth_plugin import ItsYouOnlineAuthPlugin
from plugins.its_you_online_auth.models import OauthState
from plugins.its_you_online_auth.plugin_consts import SOURCE_APP
from plugins.tff_backend.configuration import TffConfiguration
from plugins.tff_backend.plugin_consts import NAMESPACE


class RefreshHandler(webapp2.RequestHandler):

    def get(self):
        app_redirect_uri = self.request.GET.get('app_redirect_uri', None)

        try:
            if not app_redirect_uri:
                logging.debug('app_redirect_uri is missing')
                raise HttpBadRequestException()

        except HttpException as e:
            render_error_page(self.response, e.http_code, e.error)
            return
        auth_plugin = get_auth_plugin()
        assert isinstance(auth_plugin, ItsYouOnlineAuthPlugin)
        config = auth_plugin.configuration
        if config.required_scopes and config.required_scopes is not MISSING:
            scope = config.required_scopes
        else:
            scope = ''

        organization_id = config.root_organization.name

        params = {
            'response_type': 'code',
            'client_id': config.root_organization.name,
            'redirect_uri': '%s/refresh/callback' % get_server_url(),
            'scope': scope,
            'state': str(uuid.uuid4())
        }

        refresh_state = OauthState(key=OauthState.create_key(params['state']))
        refresh_state.populate(timestamp=now(),
                               organization_id=organization_id,
                               source=SOURCE_APP,
                               app_redirect_uri=app_redirect_uri,
                               completed=False)
        refresh_state.put()

        oauth_url = '%s/authorize?%s' % (auth_plugin.oauth_base_url, urllib.urlencode(params))
        logging.info('Redirecting to %s', oauth_url)
        self.redirect(str(oauth_url))


class RefreshCallbackHandler(webapp2.RequestHandler):
    def get(self):
        code = self.request.GET.get('code', None)
        state = self.request.GET.get('state', None)
        try:
            if not (code and state):
                logging.debug('Code or state are missing.\nCode: %s\nState:%s', code, state)
                raise HttpBadRequestException()

            refresh_state = OauthState.create_key(state).get()
            if not refresh_state:
                logging.debug('Refresh state not found')
                raise HttpBadRequestException()

        except HttpException as e:
            render_error_page(self.response, e.http_code, e.error)
            return

        try:
            jwt, username, scopes = get_jwt(code, refresh_state, '%s/refresh/callback' % get_server_url())
            create_session(username, scopes, jwt, secret=username)
            params = {'success': 'OK'}

        except HttpException as e:
            params = {
                'error': e.error,
                'error_description': 'An error occurred. Please try again.'
            }

        url = '%s?%s' % (refresh_state.app_redirect_uri, urllib.urlencode(params))
        logging.info('Redirecting to %s', url)
        self.redirect(str(url))


class AppleReviewQrHandler(webapp2.RequestHandler):
    def get(self):
        auth = self.request.authorization
        if auth is None or not self.check_auth(auth):
            self.response.set_status(httplib.UNAUTHORIZED)
            self.response.headers['WWW-Authenticate'] = 'Basic realm="Login required"'
            return
        username = get_config(NAMESPACE).apple.iyo_username
        session = Session.list_active_user(username).get()
        if not session:
            logging.error('No session found for %s! Login with this account to resolve the issue', username)
            self.abort(httplib.UNAUTHORIZED)
        img = qrcode.make(session.jwt)
        self.response.headers['Content-Type'] = 'image/png'
        img.save(self.response.out)

    def check_auth(self, auth):
        encoded_auth = auth[1]
        username_colon_pass = base64.b64decode(encoded_auth)
        username, password = map(lambda x: x.lower().strip(), username_colon_pass.split(':'))
        config = get_config(NAMESPACE)
        assert isinstance(config, TffConfiguration)
        return username == config.apple.username and password == config.apple.password
