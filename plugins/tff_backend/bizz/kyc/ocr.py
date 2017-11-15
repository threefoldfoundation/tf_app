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
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.insta
# See the License for the specific language governing permissions and
# limitations under the License.
#
# @@license_version:1.3@@
import base64
import json
import logging
import re

from google.appengine.api import urlfetch
from google.appengine.ext import ndb
from google.appengine.ext.deferred import deferred

from framework.plugin_loader import get_config
from framework.to import TO
from mcfw.properties import unicode_property, typed_property, long_property
from mcfw.rpc import arguments
from plugins.rogerthat_api.exceptions import BusinessException
from plugins.tff_backend.models.user import TffProfile
from plugins.tff_backend.plugin_consts import NAMESPACE


class Vertices(TO):
    x = long_property('x')
    y = long_property('y')


class BoundingPoly(TO):
    vertices = typed_property('vertices', Vertices, True)  # type: Vertices


class TextAnnotations(TO):
    locale = unicode_property('locale')
    description = unicode_property('description')
    # boundingPoly = typed_property('boundingPoly', BoundingPoly)  # type: BoundingPoly


def detect_text(base64_image):
    # type: (unicode) -> list[TextAnnotations]
    logging.info('Size of base64 image: %s', len(base64_image))
    api_key = get_config(NAMESPACE)
    url = 'https://vision.googleapis.com/v1/images:annotate?key=%s' % api_key.cloud_vision_api_key
    body = {
        'requests': [{
            'image': {'content': base64_image},
            'features': [{'type': 'DOCUMENT_TEXT_DETECTION'}]
        }]
    }
    headers = {
        'Content-Type': 'application/json'
    }
    response = urlfetch.fetch(url, json.dumps(body), urlfetch.POST, headers, deadline=30)
    if response.status_code != 200:
        logging.warn(response.content)
        raise BusinessException('Error while detecting text: %s\n%s', response.status_code, response.content)
    logging.debug('Response from Google vision: %s', response.content)
    response_content = json.loads(response.content)
    if 'responses' in response_content and response_content['responses']:
        text_annotations = response_content.get('responses')[0].get('textAnnotations', [])
    else:
        text_annotations = []
    return [TextAnnotations.from_dict(text_annotation) for text_annotation in text_annotations]


def detect_text_by_url(url):
    image = _download_image(url)
    logging.info('Size of image: %s', len(image))
    return detect_text(base64.b64encode(image))


@arguments(profile_key=ndb.Key)
def process_kyc_result(profile_key):
    # type: (ndb.Key) -> None
    profile = profile_key.get()  # type: TffProfile
    assert isinstance(profile, TffProfile)
    if not profile.kyc.pending_information:
        return
    picture_properties = ['Mrz1Picture', 'Mrz2Picture']
    mrz = None
    for prop in picture_properties:
        if prop in profile.kyc.pending_information.data.get('Passport', {}):
            text_annotations = detect_text_by_url(profile.kyc.pending_information.data['Passport'][prop])
            mrz = _get_mrz_from_text(text_annotations[0].description)
            if mrz:
                break
    if mrz:
        deferred.defer(_store_mrz, profile.key, mrz[0], mrz[1])
    else:
        logging.info('No MRZ found in KYC pictures')


@ndb.transactional()
@arguments(profile_key=ndb.Key, mrz_line_1=unicode, mrz_line_2=unicode)
def _store_mrz(profile_key, mrz_line_1, mrz_line_2):
    profile = profile_key.get()
    profile.kyc.pending_information.data['Passport']['Mrz1'] = mrz_line_1
    profile.kyc.pending_information.data['Passport']['Mrz2'] = mrz_line_2
    profile.put()


def _download_image(url):
    logging.debug('Downloading %s', url)
    response = urlfetch.fetch(url, deadline=30)
    if response.status_code != 200:
        raise BusinessException('Error while downloading %s: %s\n%s', url, response.status_code, response.content)
    return response.content


def _get_mrz_from_text(text):
    """
    Finds the MRZ using regex to find the last line (which is the easiest to parse), and returning the previous 2 lines.

    Args:
        text(unicode): Text which may contain a MRZ
    Returns:
        tuple(unicode)
    """
    text_split = text.replace(' ', '').split()
    mrz_line_3_re = re.compile('([A-Z]+)(<([A-Z]+))*<<([A-Z]+)(<([A-Z]+))*<*')
    for i, text in enumerate(text_split):
        result = mrz_line_3_re.match(text)
        if result:
            return text_split[i - 2], text_split[i - 1], text
