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

import xmlrpclib
import logging

from google.appengine.api import urlfetch
from framework.plugin_loader import get_config
from plugins.tff_backend.plugin_consts import NAMESPACE
import erppeek


# GAEXMLRPCTransport is copied from http://brizzled.clapper.org/blog/2008/08/25/making-xmlrpc-calls-from-a-google-app-engine-application/
class GAEXMLRPCTransport(object):
    """Handles an HTTP transaction to an XML-RPC server."""

    def __init__(self):
        pass

    def request(self, host, handler, request_body, verbose=0):
        result = None
        url = 'http://%s%s' % (host, handler)
        try:
            response = urlfetch.fetch(url,
                                      payload=request_body,
                                      method=urlfetch.POST,
                                      headers={'Content-Type': 'text/xml'})
        except:
            msg = 'Failed to fetch %s' % url
            logging.error(msg)
            raise xmlrpclib.ProtocolError(host + handler, 500, msg, {})

        if response.status_code != 200:
            logging.error('%s returned status code %s' %
                          (url, response.status_code))
            raise xmlrpclib.ProtocolError(host + handler,
                                          response.status_code,
                                          "",
                                          response.headers)
        else:
            result = self.__parse_response(response.content)

        return result

    def __parse_response(self, response_body):
        p, u = xmlrpclib.getparser(use_datetime=False)
        p.feed(response_body)
        return u.close()
    


def get_erp_client():
    cfg = get_config(NAMESPACE)
    return erppeek.Client(cfg.odoo.url, cfg.odoo.database, cfg.odoo.username, cfg.odoo.password, transport=GAEXMLRPCTransport(), verbose=True)


def update_odoo_object(odoo_object, **values):
    odoo_object.write(values)


def save_customer(erp_client, customer):
    partner = erp_client.model('res.partner')
    
    odoo_contact = {
        'type': u'contact',
        'name': customer['billing']['name'],
        'email': customer['billing']['email'],
        'phone': customer['billing']['phone'],
        'street': customer['billing']['address']
    }
    
    if customer['billing']['id']:
        odoo_partner_contact = partner.browse(customer['billing']['id'])
        update_odoo_object(odoo_partner_contact, **odoo_contact)
    else:
        odoo_partner_contact = partner.create(odoo_contact)
        
    if not customer['shipping']:
        return {
            'billing_id': odoo_partner_contact.id,
            'shipping_id': None
        }
    
    odoo_delivery = {
        'parent_id': odoo_partner_contact.id,
        'type': u'delivery',
        'name': customer['shipping']['name'],
        'email': customer['shipping']['email'],
        'phone': customer['shipping']['phone'],
        'street': customer['shipping']['address']
    }
    
    if customer['shipping']['id']:
        odoo_partner_delivery = partner.browse(customer['shipping']['id'])
        update_odoo_object(odoo_partner_delivery, **odoo_delivery)
        
    else:
        odoo_partner_delivery = partner.create(odoo_delivery)
        
    return {
        'billing_id': odoo_partner_contact.id,
        'shipping_id': odoo_partner_delivery.id
    }


def save_quotation(ep_client, ids):
    order = ep_client.model('sale.order')
    
    odoo_order_data = {
        'partner_id': ids['billing_id'],
        'partner_shipping_id': ids['shipping_id'],
        'state': 'sent',
        'incoterm': 15, # delivered duty paid
        'payment_term': 1 #immediate payment
    }
    
    odoo_order = order.browse(168)
    update_odoo_object(odoo_order, **odoo_order_data)
    #order.create(odoo_order)
    
    
    order_line = ep_client.model('sale.order.line')
    odoo_order_line_data = {
        'order_id': 168,
        'order_partner_id': ids['billing_id'],
        'product_uos_qty': 1,
        'product_uom': 1,
        'product_id': 4,
        'state': 'draft'
    }
    
    odoo_order_line = order_line.browse(173)
    update_odoo_object(odoo_order_line, **odoo_order_line_data)
    #order_line.create(odoo_order_line)
    

def test():
    erp_client = get_erp_client()
    
    customer = {
        'billing': {
            'id': 120,
            'name': u"Test name billing",
            'email': u"test@example.com billing",
            'phone': u"911",
            'address': u"Billing address \n boejaaa"
        },
        'shipping': {
            'id': 121,
            'name': u"Test name shipping",
            'email': u"test@example.com shipping",
            'phone': u"112",
            'address': u"Shipping address \n boejaaa"
        }
    }
    
    ids = save_customer(erp_client, customer)
    save_quotation(erp_client, ids)
    