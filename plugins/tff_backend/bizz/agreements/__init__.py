import os
import jinja2

from xhtml2pdf import pisa

try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO

ASSETS_FOLDER = os.path.join(os.path.dirname(__file__), 'assets')
JINJA_ENVIRONMENT = jinja2.Environment(loader=jinja2.FileSystemLoader([ASSETS_FOLDER]))

def create_hosting_agreement_pdf(effective_date, full_name, address):
    template_variables = {
        'logo_path': 'assets/logo.jpg',
        'effective_date': effective_date,
        'full_name': full_name,
        'address': address
    }

    source_html = JINJA_ENVIRONMENT.get_template('hosting.html').render(template_variables)

    output_stream = StringIO()
    pisa.CreatePDF(src=source_html, dest=output_stream, path='%s' % ASSETS_FOLDER)
    pdf_contents = output_stream.getvalue()
    output_stream.close()

    return pdf_contents

def create_token_agreement_pdf(full_name, address, amount_dollars, amount_usd):
    template_variables = {
        'logo_path': 'assets/logo.jpg',
        'full_name': full_name,
        'address': address,
        'amount_dollars': amount_dollars,
        'amount_usd': amount_usd
    }

    source_html = JINJA_ENVIRONMENT.get_template('token.html').render(template_variables)

    output_stream = StringIO()
    pisa.CreatePDF(src=source_html, dest=output_stream, path='%s' % ASSETS_FOLDER)
    pdf_contents = output_stream.getvalue()
    output_stream.close()

    return pdf_contents
