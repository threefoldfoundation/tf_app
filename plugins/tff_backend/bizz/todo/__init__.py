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

from mcfw.rpc import returns, arguments

from plugins.rogerthat_api.api import system
from plugins.tff_backend.bizz import get_tf_token_api_key
from plugins.tff_backend.bizz.rogerthat import put_user_data
from plugins.tff_backend.bizz.todo.hoster import HosterSteps
from plugins.tff_backend.bizz.todo.investor import InvestorSteps


# The 'todo list' functionality is currently not used - consider removing it

@returns()
@arguments(email=unicode, app_id=unicode, step=unicode)
def update_hoster_progress(email, app_id, step):
    list_id = 'hoster'
    if HosterSteps.should_archive(step):
        _remove_list(email, app_id, list_id)
        return
    progress = HosterSteps.get_progress(step)
    _update_list(email, app_id, list_id, progress)


@returns()
@arguments(email=unicode, app_id=unicode, step=unicode)
def update_investor_progress(email, app_id, step):
    list_id = 'investor'
    if InvestorSteps.should_archive(step):
        _remove_list(email, app_id, list_id)
        return
    progress = InvestorSteps.get_progress(step)
    _update_list(email, app_id, list_id, progress)


@returns()
@arguments(email=unicode, app_id=unicode, list_id=unicode, progress=dict)
def _update_list(email, app_id, list_id, progress):
    user_data_keys = ['todo_lists']

    api_key = get_tf_token_api_key()
    current_user_data = system.get_user_data(api_key, email, app_id, user_data_keys)
    user_data = {}
    if not current_user_data.get('todo_lists'):
        user_data['todo_lists'] = [list_id]
    elif list_id not in current_user_data.get('todo_lists'):
        user_data['todo_lists'] = current_user_data.get('todo_lists') + [list_id]

    user_data['todo_%s' % list_id] = progress

    put_user_data(api_key, email, app_id, user_data)


@returns()
@arguments(email=unicode, app_id=unicode, list_id=unicode)
def _remove_list(email, app_id, list_id):
    user_data_keys = ['todo_lists']

    api_key = get_tf_token_api_key()
    current_user_data = system.get_user_data(api_key, email, app_id, user_data_keys)
    todo_lists = current_user_data.get('todo_lists') or []
    if list_id in todo_lists:
        todo_lists.remove(list_id)
        user_data = {'todo_lists': todo_lists}
        put_user_data(api_key, email, app_id, user_data)

    system.del_user_data(api_key, email, app_id, ['todo_%s' % list_id])
