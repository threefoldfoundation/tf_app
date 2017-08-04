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

from mcfw.rpc import returns, arguments
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.tff_backend.bizz.iyo import get_iyo_organization_id, get_iyo_username
from plugins.tff_backend.plugin_consts import KEY_NAME


@returns()
@arguments(user_detail=UserDetailsTO)
def user_registered(user_detail):
    # TODO: implementation
    organization_id = get_iyo_organization_id()
    username = get_iyo_username(user_detail)

    logging.info('Adding user %s to IYO organization %s', username, organization_id)
    logging.warn('TODO')

    logging.info('Adding public key with label %s', KEY_NAME)
    logging.warn('TODO')
