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

from mcfw.exceptions import HttpBadRequestException


class OrderAlreadyExistsException(HttpBadRequestException):
    def __init__(self, so_id):
        super(OrderAlreadyExistsException, self).__init__('order_already_exists', {'so_id': so_id})


class InvalidContentTypeException(HttpBadRequestException):
    def __init__(self, content_type, allowed_content_types):
        data = {'content_type': content_type,
                'allowed_content_types': allowed_content_types}
        super(InvalidContentTypeException, self).__init__('invalid_content_type', data)
