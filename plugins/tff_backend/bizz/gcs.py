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

from google.appengine.api.app_identity import app_identity

import cloudstorage
from cloudstorage.common import local_api_url
from mcfw.consts import DEBUG

_default_bucket = None


def _get_default_bucket():
    global _default_bucket
    if _default_bucket:
        return _default_bucket
    _default_bucket = app_identity.get_default_gcs_bucket_name()
    return _default_bucket


def upload_to_gcs(filename, file_data, content_type, bucket=None):
    if not bucket:
        bucket = _get_default_bucket()
    file_path = '/%s/%s' % (bucket, filename)
    with cloudstorage.open(file_path, 'w', content_type=content_type) as f:
        f.write(file_data)
    return get_serving_url(filename, bucket)


def get_serving_url(filename, bucket=None):
    # type: (unicode) -> unicode
    if not bucket:
        bucket = _get_default_bucket()
    if DEBUG:
        return '%s/%s/%s' % (local_api_url(), bucket, filename)
    return 'https://storage.googleapis.com/%s/%s' % (bucket, filename)
