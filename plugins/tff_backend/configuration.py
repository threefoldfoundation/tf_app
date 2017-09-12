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


class RogerthatConfiguration(object):
    api_key = unicode_property('1')
    sik = unicode_property('2')
    url = unicode_property('3')
    payment_secret = unicode_property('4')


class IPFSConfiguration(object):
    secret = unicode_property('1')

    
class LedgerConfiguration(object):
    url = unicode_property('1')
    secret = unicode_property('1')
    
    
class OdooConfiguration(object):
    url = unicode_property('1')
    database = unicode_property('2')
    username = unicode_property('3')
    password = unicode_property('4')


class OrchestatorConfiguration(object):
    jwt = unicode_property('1')
    

class TffConfiguration(object):
    rogerthat = typed_property('1', RogerthatConfiguration, False)
    ipfs = typed_property('2', IPFSConfiguration, False)
    ledger = typed_property('3', LedgerConfiguration, False)
    odoo = typed_property('4', OdooConfiguration, False)
    orchestator = typed_property('5', OrchestatorConfiguration, False)
