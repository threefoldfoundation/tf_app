import webapp2

from plugins.tff_backend.bizz.cna import get_cna_stream


class CNAHandler(webapp2.RequestHandler):
    def get(self):
        pdf_contents = get_cna_stream()

        self.response.headers['Content-Type'] = 'application/pdf'
        self.response.headers['Content-Disposition'] = str('inline; filename=cna.pdf')
        self.response.out.write(pdf_contents)
