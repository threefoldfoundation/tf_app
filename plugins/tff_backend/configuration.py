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
from framework.to import TO
from mcfw.properties import unicode_property, typed_property, long_property, unicode_list_property, bool_property


class RogerthatConfiguration(TO):
    api_key = unicode_property('1')
    sik = unicode_property('2')
    url = unicode_property('3')
    payment_secret = unicode_property('4')
    app_id = unicode_property('app_id')


class LedgerConfiguration(TO):
    url = unicode_property('url')
    secret = unicode_property('secret')


class OdooConfiguration(TO):
    url = unicode_property('1')
    database = unicode_property('2')
    username = unicode_property('3')
    password = unicode_property('4')

    incoterm = long_property('5')
    payment_term = long_property('6')
    product_ids = typed_property('product_ids', dict)  # key: the node's socket type, value: product id


class OrchestatorConfiguration(TO):
    jwt = unicode_property('1')


class OnfidoConfiguration(TO):
    api_key = unicode_property('api_key')


class TffConfiguration(TO):
    """
    Args:
        rogerthat(RogerthatConfiguration)
        ledger(LedgerConfiguration)
        odoo(OdooConfiguration)
        support_emails(list[string])
        orchestator(OrchestatorConfiguration)
        investor(InvestorConfiguration)
        apple(AppleConfiguration)
        backup_disabled(bool)
        intercom_admin_id(unicode)
        cloudstorage_encryption_key(unicode)
        onfido(OnfidoConfiguration)
    """
    rogerthat = typed_property('1', RogerthatConfiguration, False)
    ledger = typed_property('3', LedgerConfiguration, False)
    odoo = typed_property('4', OdooConfiguration, False)
    orchestator = typed_property('5', OrchestatorConfiguration, False)
    support_emails = unicode_list_property('support_emails')
    backup_disabled = bool_property('backup_disabled')
    intercom_admin_id = long_property('intercom_admin_id')
    cloudstorage_encryption_key = unicode_property('cloudstorage_encryption_key')
    exchangerate_key = unicode_property('exchangerate_key')
    onfido = typed_property('onfido', OnfidoConfiguration)
