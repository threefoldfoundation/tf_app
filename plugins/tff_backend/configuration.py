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


class RogerthatKeysConfiguration(object):
    api_key = unicode_property('1')
    sik = unicode_property('2')


class RogerthatConfiguration(object):
    dev = typed_property('1', RogerthatKeysConfiguration, False)
    prod = typed_property('2', RogerthatKeysConfiguration, False)


class IPFSConfiguration(object):
    secret = unicode_property('1')


class TffConfiguration(object):
    rogerthat = typed_property('1', RogerthatConfiguration, False)
    ipfs = typed_property('2', IPFSConfiguration, False)
