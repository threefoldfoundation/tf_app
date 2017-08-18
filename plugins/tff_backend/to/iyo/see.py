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


from mcfw.properties import unicode_property, typed_property, long_property
from plugins.tff_backend.to import convert_to_unicode, TO


class IYOSeeDocumenVersion(TO):
    version = long_property('1')
    category = unicode_property('2')
    link = unicode_property('3')
    content_type = unicode_property('4')
    markdown_short_description = unicode_property('5')
    markdown_full_description = unicode_property('6')
    creation_date = unicode_property('7')
    start_date = unicode_property('8')
    end_date = unicode_property('9')
    keystore_label = unicode_property('10')
    signature = unicode_property('11')

    def __init__(self, version=1, category=None, link=None, content_type=None, markdown_short_description=None,
                 markdown_full_description=None, creation_date=None, start_date=None, end_date=None,
                 keystore_label=None, signature=None, **kwargs):
        self.version = version
        self.category = convert_to_unicode(category)
        self.link = convert_to_unicode(link)
        self.content_type = convert_to_unicode(content_type)
        self.markdown_short_description = convert_to_unicode(markdown_short_description)
        self.markdown_full_description = convert_to_unicode(markdown_full_description)
        self.creation_date = convert_to_unicode(creation_date)
        self.start_date = convert_to_unicode(start_date)
        self.end_date = convert_to_unicode(end_date)
        self.keystore_label = convert_to_unicode(keystore_label)
        self.signature = convert_to_unicode(signature)


class IYOSeeDocument(TO):
    username = unicode_property('1')
    globalid = unicode_property('2')
    uniqueid = unicode_property('3')
    versions = typed_property('4', IYOSeeDocumenVersion, True)

    def __init__(self, username=None, globalid=None, uniqueid=None, versions=None, **kwargs):
        self.username = convert_to_unicode(username)
        self.globalid = convert_to_unicode(globalid)
        self.uniqueid = convert_to_unicode(uniqueid)
        if not versions:
            versions = []
        self.versions = [IYOSeeDocumenVersion(**v) for v in versions]


class IYOSeeDocumentView(IYOSeeDocumenVersion):
    username = unicode_property('51')
    globalid = unicode_property('52')
    uniqueid = unicode_property('53')

    def __init__(self, username=None, globalid=None, uniqueid=None, version=1, category=None, link=None,
                 content_type=None, markdown_short_description=None, markdown_full_description=None,
                 creation_date=None, start_date=None, end_date=None, keystore_label=None, signature=None, **kwargs):
        super(IYOSeeDocumentView, self).__init__(version, category, link, content_type, markdown_short_description,
                                                 markdown_full_description, creation_date, start_date, end_date,
                                                 keystore_label, signature, **kwargs)
        self.username = convert_to_unicode(username)
        self.globalid = convert_to_unicode(globalid)
        self.uniqueid = convert_to_unicode(uniqueid)
