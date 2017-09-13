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

import logging
import xmlrpclib

import erppeek

from framework.plugin_loader import get_config
from google.appengine.api import urlfetch
from google.appengine.ext import ndb
from plugins.tff_backend.models.hoster import NodeOrder
from plugins.tff_backend.plugin_consts import NAMESPACE


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
    


def _get_erp_client(cfg):
    return erppeek.Client(cfg.odoo.url, cfg.odoo.database, cfg.odoo.username, cfg.odoo.password, transport=GAEXMLRPCTransport())


def _save_customer(cfg, erp_client, customer):
    res_partner_model = erp_client.model('res.partner')
    
    contact = {
        'type': u'contact',
        'name': customer['billing']['name'],
        'email': customer['billing']['email'],
        'phone': customer['billing']['phone'],
        'street': customer['billing']['address']
    }
    partner_contact = res_partner_model.create(contact)
    logging.debug("Created res.partner (contact) with id %s", partner_contact.id)
        
    if not customer['shipping']:
        return partner_contact.id, None
    
    delivery = {
        'parent_id': partner_contact.id,
        'type': u'delivery',
        'name': customer['shipping']['name'],
        'email': customer['shipping']['email'],
        'phone': customer['shipping']['phone'],
        'street': customer['shipping']['address']
    }
    
    partner_delivery = res_partner_model.create(delivery)
    logging.debug("Created res.partner (delivery) with id %s", partner_delivery.id)
        
    return partner_contact.id, partner_delivery.id


def _save_quotation(cfg, erp_client, billing_id, shipping_id):
    sale_order_model = erp_client.model('sale.order')
    sale_order_line_model = erp_client.model('sale.order.line')
    
    order_data = {
        'partner_id': billing_id,
        'partner_shipping_id': shipping_id,
        'state': 'sent',
        'incoterm': cfg.odoo.incoterm,
        'payment_term': cfg.odoo.payment_term
    }
    
    order = sale_order_model.create(order_data)
    logging.debug("Created sale.order with id %s", order.id)
    
    order_line_data = {
        'order_id': order.id,
        'order_partner_id': billing_id,
        'product_uos_qty': 1,
        'product_uom': 1,
        'product_id': cfg.odoo.product_id,
        'state': 'draft'
    }
    
    sale_order_line = sale_order_line_model.create(order_line_data)
    logging.debug("Created sale.order.line with id %s", sale_order_line.id)
    
    return order.id,  order.name
       
    
def create_odoo_quotation(order_id):
    cfg = get_config(NAMESPACE)
    erp_client = _get_erp_client(cfg)
    
    def trans():
        order = NodeOrder.get_by_id(order_id)
        if not order:
            return
        
        customer = {
            'billing': {
                'name': order.billing_info.name,
                'email': order.billing_info.email,
                'phone': order.billing_info.phone,
                'address': order.billing_info.address
            },
            'shipping': None
        }
        if order.shipping_info:
            customer['shipping'] = {
                'name': order.shipping_info.name,
                'email': order.shipping_info.email,
                'phone': order.shipping_info.phone,
                'address': order.shipping_info.address
            }
        
        billing_id, shipping_id = _save_customer(cfg, erp_client, customer)
        odoo_sale_order_id, odoo_sale_order_name = _save_quotation(cfg, erp_client, billing_id, shipping_id)
        order.odoo_sale_order_id = odoo_sale_order_id
        order.odoo_sale_order_name = odoo_sale_order_name
        order.put()
        
    ndb.transaction(trans)
    

def get_odoo_serial_number(order_id):
    cfg = get_config(NAMESPACE)
    erp_client = _get_erp_client(cfg)
    
    sale_order_model = erp_client.model('sale.order')
    stock_picking_model = erp_client.model('stock.picking')
    stock_move_model = erp_client.model('stock.move')
    stock_production_lot_model = erp_client.model('stock.production.lot')
    
    sale_order = sale_order_model.browse(order_id)
    for picking_id in sale_order.picking_ids.id:
        stock_picking = stock_picking_model.browse(picking_id)
        for move_line in stock_picking.move_lines.id:
            stock_move = stock_move_model.browse(move_line)
            for lot_id in stock_move.lot_ids.id:
                stock_production_lot = stock_production_lot_model.browse(lot_id)
                if stock_production_lot.product_id.id == cfg.odoo.stock_id:
                    return stock_production_lot.name
    return None
