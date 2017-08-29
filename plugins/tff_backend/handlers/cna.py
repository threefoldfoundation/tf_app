import webapp2

from plugins.tff_backend.bizz.cna import get_cna_stream


class CNAHandler(webapp2.RequestHandler):
    def get(self):
        pdf_contents = get_cna_stream()
        self.response.out.write(pdf_contents)
