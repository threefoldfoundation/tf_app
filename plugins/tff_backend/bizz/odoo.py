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

from google.appengine.api import urlfetch

import erppeek
from framework.plugin_loader import get_config
from plugins.tff_backend.plugin_consts import NAMESPACE


# GAEXMLRPCTransport is copied from
# http://brizzled.clapper.org/blog/2008/08/25/making-xmlrpc-calls-from-a-google-app-engine-application/
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
    return erppeek.Client(cfg.odoo.url, cfg.odoo.database, cfg.odoo.username, cfg.odoo.password,
                          transport=GAEXMLRPCTransport())


def _save_customer(erp_client, customer):
    # type: (erppeek.Client, object) -> tuple
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


def _save_quotation(cfg, erp_client, billing_id, shipping_id, product_id):
    sale_order_model = erp_client.model('sale.order')
    sale_order_line_model = erp_client.model('sale.order.line')

    order_data = {
        'partner_id': billing_id,
        'partner_shipping_id': shipping_id or billing_id,
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
        'product_id': product_id,
        'state': 'draft'
    }

    sale_order_line = sale_order_line_model.create(order_line_data)
    logging.debug("Created sale.order.line with id %s", sale_order_line.id)

    return order.id, order.name


def create_odoo_quotation(billing_info, shipping_info, product_id):
    logging.info('Creating quotation: \nbilling_info: %s\nshipping_info: %s\nproduct_id: %s', billing_info,
                 shipping_info, product_id)
    cfg = get_config(NAMESPACE)
    erp_client = _get_erp_client(cfg)

    customer = {
        'billing': {
            'name': billing_info.name,
            'email': billing_info.email,
            'phone': billing_info.phone,
            'address': billing_info.address
        },
        'shipping': None
    }
    if shipping_info and shipping_info.name and shipping_info.email and shipping_info.phone and shipping_info.address:
        customer['shipping'] = {
            'name': shipping_info.name,
            'email': shipping_info.email,
            'phone': shipping_info.phone,
            'address': shipping_info.address
        }

    billing_id, shipping_id = _save_customer(erp_client, customer)
    return _save_quotation(cfg, erp_client, billing_id, shipping_id, product_id)


def cancel_odoo_quotation(order_id):
    cfg = get_config(NAMESPACE)
    erp_client = _get_erp_client(cfg)

    sale_order_model = erp_client.model('sale.order')
    sale_order = sale_order_model.browse(order_id)

    order_data = {
        'state': 'cancel'
    }

    try:
        sale_order.write(order_data)
    except xmlrpclib.Fault as e:
        if 'One of the documents you are trying to access has been deleted' not in e.message:
            raise e


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
