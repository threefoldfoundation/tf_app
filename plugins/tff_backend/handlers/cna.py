import webapp2

from plugins.tff_backend.bizz.agreements import create_hosting_agreement_pdf


class CNAHandler(webapp2.RequestHandler):
    def get(self):
        # todo remove after testing
        pdf_contents = create_hosting_agreement_pdf(u"test name")

        self.response.headers['Content-Type'] = 'application/pdf'
        self.response.headers['Content-Disposition'] = str('inline; filename=cna.pdf')
        self.response.out.write(pdf_contents)
