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

from framework.to import TO, convert_to_unicode
from mcfw.properties import unicode_property, typed_property


class IYOKeyStoreKeyData(TO):
    timestamp = unicode_property('1')
    comment = unicode_property('2')
    algorithm = unicode_property('3')

    def __init__(self, timestamp=None, comment=None, algorithm=None, **kwargs):
        self.timestamp = convert_to_unicode(timestamp)
        self.comment = convert_to_unicode(comment)
        self.algorithm = convert_to_unicode(algorithm)


class IYOKeyStoreKey(TO):
    key = unicode_property('1')
    globalid = unicode_property('2')
    username = unicode_property('3')
    label = unicode_property('4')
    keydata = typed_property('5', IYOKeyStoreKeyData, False)

    def __init__(self, key=None, globalid=None, username=None, label=None,
                 keydata=None, **kwargs):
        self.key = convert_to_unicode(key)
        self.globalid = convert_to_unicode(globalid)
        self.username = convert_to_unicode(username)
        self.label = convert_to_unicode(label)
        self.keydata = IYOKeyStoreKeyData(**keydata) if keydata else None
