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

from plugins.tff_backend.to import TO, convert_to_unicode
from mcfw.properties import unicode_property, unicode_list_property


class IYOUser(TO):
    username = unicode_property('username')
    firstname = unicode_property('firstname')
    lastname = unicode_property('lastname')
    publicKeys = unicode_list_property('publicKeys')
    expire = unicode_property('expire')

    def __init__(self, username=None, firstname=None, lastname=None, public_keys=None, expire=None, **kwargs):
        if public_keys is None:
            public_keys = []

        self.username = convert_to_unicode(username)
        self.firstname = convert_to_unicode(firstname)
        self.lastname = convert_to_unicode(lastname)
        self.public_keys = map(convert_to_unicode, public_keys)
        self.expire = convert_to_unicode(expire)
