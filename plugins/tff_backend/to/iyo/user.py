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
from mcfw.properties import unicode_property, typed_property
from plugins.tff_backend.to import TO, convert_to_unicode


class PublicKey(TO):
    label = unicode_property('label')
    publickey = unicode_property('publickey')

    def __init__(self, label=None, publickey=None):
        self.label = label
        self.publickey = publickey


class IYOUser(TO):
    username = unicode_property('username')
    firstname = unicode_property('firstname')
    lastname = unicode_property('lastname')
    publicKeys = typed_property('publicKeys', PublicKey, True)  # type: list[PublicKey]
    expire = unicode_property('expire')

    def __init__(self, username=None, firstname=None, lastname=None, publicKeys=None, expire=None, **kwargs):
        self.username = convert_to_unicode(username)
        self.firstname = convert_to_unicode(firstname)
        self.lastname = convert_to_unicode(lastname)
        self.publicKeys = [PublicKey(**public_key) for public_key in (publicKeys or [])]
        self.expire = convert_to_unicode(expire)
