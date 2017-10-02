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

from babel.numbers import get_currency_name
from plugins.tff_backend.bizz.global_stats import get_global_stats
from plugins.tff_backend.utils import round_currency_amount
from plugins.tff_backend.consts.agreements import BANK_ACCOUNTS
from plugins.tff_backend.consts.payment import TOKEN_TFT, TOKEN_ITFT
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


def create_token_agreement_pdf(full_name, address, amount, currency_full, currency_short, token=TOKEN_TFT):
    if token == TOKEN_ITFT:
        html_file = 'token_itft.html'
    elif currency_short == 'BTC':
        html_file = 'token_tft_btc.html'
    else:
        html_file = 'token_tft.html'

    if currency_short == 'BTC':
        amount_formatted = '{:.8f}'.format(amount)
    else:
        amount_formatted = '{:.2f}'.format(amount)
    conversion = {}
    if token:
        stats = get_global_stats(TOKEN_TFT)
        conversion = {currency.currency: round_currency_amount(currency.currency, currency.value / stats.value) for
                      currency in stats.currencies}
    currency_messages = []
    for currency in BANK_ACCOUNTS:
        account = BANK_ACCOUNTS[currency]
        if currency == 'BTC':
            currency_messages.append(
                u'when using Bitcoin: to the Company’s BitCoin wallet hosted by BitOasis Technologies FZE, at the'
                u' following digital address: <b>%s</b> (the “<b>Wallet</b>”)' % account)
        else:
            currency_messages.append(
                u'when using %s: to the Company’s bank account at Mashreq Bank, IBAN: <b>%s</b> SWIFT/BIC:'
                u' <b>BOMLAEAD</b>' % (get_currency_name(currency, locale='en_GB'), account))
    template_variables = {
        'logo_path': 'assets/logo.jpg',
        'effective_date': _get_effective_date(),
        'full_name': full_name,
        'address': address,
        'amount': amount_formatted,
        'currency_full': currency_full,
        'currency_short': currency_short,
        'currency_messages': currency_messages,
        'conversion': conversion
    }

    source_html = JINJA_ENVIRONMENT.get_template(html_file).render(template_variables)

    output_stream = StringIO()
    pisa.CreatePDF(src=source_html, dest=output_stream, path='%s' % ASSETS_FOLDER)
    pdf_contents = output_stream.getvalue()
    output_stream.close()

    return pdf_contents
