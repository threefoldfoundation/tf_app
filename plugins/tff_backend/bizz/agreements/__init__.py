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

import os
import time

import jinja2

from xhtml2pdf import pisa

try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO

ASSETS_FOLDER = os.path.join(os.path.dirname(__file__), 'assets')
JINJA_ENVIRONMENT = jinja2.Environment(loader=jinja2.FileSystemLoader([ASSETS_FOLDER]))


def _get_effective_date():
    return time.strftime('%d %b %Y', time.gmtime())


def create_hosting_agreement_pdf(full_name, address):
    template_variables = {
        'logo_path': 'assets/logo.jpg',
        'effective_date': _get_effective_date(),
        'full_name': full_name,
        'address': address
    }

    source_html = JINJA_ENVIRONMENT.get_template('hosting.html').render(template_variables)

    output_stream = StringIO()
    pisa.CreatePDF(src=source_html, dest=output_stream, path='%s' % ASSETS_FOLDER)
    pdf_contents = output_stream.getvalue()
    output_stream.close()

    return pdf_contents


def create_token_agreement_pdf(full_name, address, amount, currency_full, currency_short):
    if currency_short == 'BTC':
        amount_formatted = '{:.8f}'.format(amount)
        html_file = 'token_btc.html'
    else:
        amount_formatted = '{:.2f}'.format(amount)
        html_file = 'token.html'
    template_variables = {
        'logo_path': 'assets/logo.jpg',
        'effective_date': _get_effective_date(),
        'full_name': full_name,
        'address': address,
        'amount': amount_formatted,
        'currency_full': currency_full,
        'currency_short': currency_short
    }

    source_html = JINJA_ENVIRONMENT.get_template(html_file).render(template_variables)

    output_stream = StringIO()
    pisa.CreatePDF(src=source_html, dest=output_stream, path='%s' % ASSETS_FOLDER)
    pdf_contents = output_stream.getvalue()
    output_stream.close()

    return pdf_contents
