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

import erppeek
from framework.plugin_loader import get_config
from plugins.tff_backend.plugin_consts import NAMESPACE


def get_erp_client():
    cfg = get_config(NAMESPACE)
    return erppeek.Client(cfg.odoo.url, cfg.odoo.database, cfg.odoo.username, cfg.odoo.password)


def create_quotation(erp_client, customer):
    odoo_customer_id = get_customer_id(erp_client, customer)
    put_quotation_in_odoo(erp_client, odoo_customer_id)


def get_customer_id(erp_client, customer):
    partner = erppeek.Model(erp_client, 'res.partner')
    
#     parent_id = None
#     type = u'contact' #'u'delivery'
    
    odoo_contact = {
        'parent_id': None,
        'type': u'contact',
        'name': customer['name'],
        'email': customer['email'],
        'phone': customer['phone'],
    }
    
    if customer["odoo_contact_id"]:
        odoo_customer = partner.browse(customer["odoo_contact_id"])
        odoo_customer.write(odoo_contact)
    else:
        odoo_customer = partner.create(odoo_contact)

    return odoo_customer.id


def put_quotation_in_odoo(ep_client, odoo_customer_id):
    order = erppeek.Model(ep_client, 'sale.order')
    


def test():
    erp_client = get_erp_client()
    customer = {
        'odoo_contact_id': None,
        'name': u"Test name",
        'email': u"test@example.com",
        'phone': u"911",
        'billing_address': u"Billing address \n boejaaa",
        'shipping_address': u"Shipping address \n boejaaa"
    }
    create_quotation(erp_client, customer)