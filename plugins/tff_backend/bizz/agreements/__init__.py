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

import codecs
from collections import defaultdict
import os
import time

from babel.numbers import get_currency_name
from framework.utils import azzert
import jinja2

import inflect
import markdown
from mcfw.rpc import returns, arguments
from plugins.tff_backend.bizz.global_stats import get_global_stats
from plugins.tff_backend.consts.agreements import BANK_ACCOUNTS
from plugins.tff_backend.consts.payment import TOKEN_TFT, TOKEN_ITFT
from plugins.tff_backend.models.investor import PaymentInfo, InvestmentAgreement
from plugins.tff_backend.utils import round_currency_amount
from xhtml2pdf import pisa

try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO

ASSETS_FOLDER = os.path.join(os.path.dirname(__file__), 'assets')
JINJA_ENVIRONMENT = jinja2.Environment(loader=jinja2.FileSystemLoader([ASSETS_FOLDER]))


def _get_effective_date(t=None):
    return time.strftime('%d %b %Y', time.gmtime(t))


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


@returns(unicode)
@arguments(currency_short=unicode, payment_info=[int])
def get_bank_account_info(currency_short, payment_info):
    suffix = currency_short
    if payment_info and PaymentInfo.UAE.value in payment_info:
        suffix += '-UAE'

    bank_file = os.path.join(ASSETS_FOLDER, 'bank_%s.md' % suffix)
    with codecs.open(bank_file, 'r', encoding='utf-8') as f:
        return f.read()


def create_itft_amendment_1_pdf(app_user):
    from plugins.tff_backend.bizz.investor import get_total_token_count
    agreements = InvestmentAgreement.list_by_status_and_user(app_user, (InvestmentAgreement.STATUS_PAID,
                                                                        InvestmentAgreement.STATUS_SIGNED))
    azzert(agreements)
    agreements.sort(key=lambda a: a.sign_time)
    purchase_amounts = ''
    sign_dates = ''
    for i, agreement in enumerate(agreements):
        if i:
            purchase_amounts += '<br>'
            sign_dates += '<br>'
        purchase_amounts += '%s %s' % (agreement.amount, agreement.currency)
        sign_dates += _get_effective_date(agreement.sign_time)

    old_count = get_total_token_count(app_user, agreements)[TOKEN_ITFT]
    new_count = old_count * 100.0
    purchase_amount_in_usd = old_count * 5.0

    fmt = lambda x: '{:.2f}'.format(x)
    template_variables = {
        'logo_path': 'assets/logo.jpg',
        'agreement': _get_effective_date,
        'full_name': agreements[0].name,
        'purchase_amounts': purchase_amounts,
        'sign_dates': sign_dates,
        'old_count': fmt(old_count),
        'new_count': fmt(new_count),
        'purchase_amount_in_usd': fmt(purchase_amount_in_usd),
        'title': 'iTFT Purchase Agreement - Amendment I<br>iTFT Token Price & Volume Adjustment'
    }

    md = JINJA_ENVIRONMENT.get_template('itft_amendment_1.md').render(template_variables)
    markdown_to_html = markdown.markdown(md, extensions=['markdown.extensions.tables'])
    template_variables['markdown_to_html'] = markdown_to_html.replace('<th', '<td')
    return _render_pdf_from_html('token_itft.html', template_variables)


def create_token_agreement_pdf(full_name, address, amount, currency_full, currency_short, token=TOKEN_TFT,
                               payment_info=None):
    # don't forget to update intercom tags when adding new contracts / tokens
    if currency_short == 'BTC':
        amount_formatted = '{:.8f}'.format(amount)
    else:
        amount_formatted = '{:.2f}'.format(amount)
    stats = get_global_stats(token)
    conversion = {currency.currency: round_currency_amount(currency.currency, currency.value / stats.value) for
                  currency in stats.currencies}

    template_variables = {
        'logo_path': 'assets/logo.jpg',
        'effective_date': _get_effective_date(),
        'full_name': full_name,
        'address': address.replace('\n', ', '),
        'amount': amount_formatted,
        'currency_full': currency_full,
        'price': stats.value,
        'price_words': inflect.engine().number_to_words(stats.value).title(),
        'currency_short': currency_short,
        'conversion': conversion
    }

    if token == TOKEN_ITFT:
        html_file = 'token_itft.html'
        context = {'bank_account': get_bank_account_info(currency_short, payment_info or [])}
        context.update(template_variables)
        md = JINJA_ENVIRONMENT.get_template('token_itft.md').render(context)
        markdown_to_html = markdown.markdown(md, extensions=['markdown.extensions.tables'])
        template_variables['markdown_to_html'] = markdown_to_html.replace('<th', '<td')
        template_variables['title'] = u'iTFT Purchase Agreement'
    else:
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

        template_variables['currency_messages'] = currency_messages
        html_file = 'token_tft_btc.html' if currency_short == 'BTC' else 'token_tft.html'

    return _render_pdf_from_html(html_file, template_variables)


def _render_pdf_from_html(html_file, template_variables):
    source_html = JINJA_ENVIRONMENT.get_template(html_file).render(template_variables)

    output_stream = StringIO()
    pisa.CreatePDF(src=source_html, dest=output_stream, path='%s' % ASSETS_FOLDER)
    pdf_contents = output_stream.getvalue()
    output_stream.close()

    return pdf_contents
