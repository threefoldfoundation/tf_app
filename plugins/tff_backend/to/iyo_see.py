from mcfw.properties import unicode_property, typed_property, long_property
from plugins.tff_backend.to.to import TO

def _convert_to_unicode(v):
    if v is None:
        return None
    if isinstance(v, unicode):
        return v
    return unicode(v)


class IYOSeeDocumenVersion(TO):
    version = long_property('4')
    category = unicode_property('5')
    link = unicode_property('6')
    content_type = unicode_property('7')
    markdown_short_description = unicode_property('8')
    markdown_full_description = unicode_property('9')
    creation_date = unicode_property('10')
    start_date = unicode_property('11')
    end_date = unicode_property('12')
    keystore_label = unicode_property('13')
    signature = unicode_property('14')

    def __init__(self, version=1, category=None, link=None,
                 content_type=None, markdown_short_description=None, markdown_full_description=None,
                 creation_date=None, start_date=None, end_date=None, keystore_label=None, signature=None, **kwargs):
        self.version = version
        self.category = _convert_to_unicode(category)
        self.link = _convert_to_unicode(link)
        self.content_type = _convert_to_unicode(content_type)
        self.markdown_short_description = _convert_to_unicode(markdown_short_description)
        self.markdown_full_description = _convert_to_unicode(markdown_full_description)
        self.creation_date = _convert_to_unicode(creation_date)
        self.start_date = _convert_to_unicode(start_date)
        self.end_date = _convert_to_unicode(end_date)
        self.keystore_label = _convert_to_unicode(keystore_label)
        self.signature = _convert_to_unicode(signature)


class IYOSeeDocument(TO):
    username = unicode_property('1')
    globalid = unicode_property('2')
    uniqueid = unicode_property('3')
    versions = typed_property('4', IYOSeeDocumenVersion, True)

    def __init__(self, username=None, globalid=None, uniqueid=None, versions=None, **kwargs):
        self.username = _convert_to_unicode(username)
        self.globalid = _convert_to_unicode(globalid)
        self.uniqueid = _convert_to_unicode(uniqueid)
        if not versions:
            versions = []
        self.versions = [IYOSeeDocumenVersion(**v) for v in versions]


class IYOSeeDocumentView(TO):
    username = unicode_property('1')
    globalid = unicode_property('2')
    uniqueid = unicode_property('3')
    version = long_property('4')
    category = unicode_property('5')
    link = unicode_property('6')
    content_type = unicode_property('7')
    markdown_short_description = unicode_property('8')
    markdown_full_description = unicode_property('9')
    creation_date = unicode_property('10')
    start_date = unicode_property('11')
    end_date = unicode_property('12')
    keystore_label = unicode_property('13')
    signature = unicode_property('14')

    def __init__(self, username=None, globalid=None, uniqueid=None, version=1, category=None, link=None,
                 content_type=None, markdown_short_description=None, markdown_full_description=None,
                 creation_date=None, start_date=None, end_date=None, keystore_label=None, signature=None, **kwargs):
        self.username = _convert_to_unicode(username)
        self.globalid = _convert_to_unicode(globalid)
        self.uniqueid = _convert_to_unicode(uniqueid)
        self.version = version
        self.category = _convert_to_unicode(category)
        self.link = _convert_to_unicode(link)
        self.content_type = _convert_to_unicode(content_type)
        self.markdown_short_description = _convert_to_unicode(markdown_short_description)
        self.markdown_full_description =_convert_to_unicode( markdown_full_description)
        self.creation_date = _convert_to_unicode(creation_date)
        self.start_date = _convert_to_unicode(start_date)
        self.end_date = _convert_to_unicode(end_date)
        self.keystore_label = _convert_to_unicode(keystore_label)
        self.signature = _convert_to_unicode(signature)
