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
from google.appengine.api import urlfetch
from google.appengine.ext import ndb
from google.appengine.ext.deferred import deferred

from mcfw.consts import DEBUG
from mcfw.rpc import arguments
from plugins.tff_backend.bizz.gcs import upload_to_gcs
from plugins.tff_backend.bizz.rogerthat import create_error_message
from plugins.tff_backend.models.user import KYCStatus, TffProfile


@ndb.transactional()
def save_utility_bill(url, profile_key):
    from plugins.tff_backend.bizz.user import store_kyc_in_user_data
    result = urlfetch.fetch(url)  # type: urlfetch._URLFetchResult
    if result.status_code != 200:
        raise Exception('Invalid status %s %s' % (result.status_code, result.content))
    profile = profile_key.get()  # type: TffProfile
    content_type = result.headers.get('Content-Type', 'image/jpeg')
    filename = 'users/%s/utility_bill.jpeg' % profile.username
    profile.kyc.utility_bill_url = upload_to_gcs(filename, result.content, content_type)
    profile.put()
    deferred.defer(store_kyc_in_user_data, profile.app_user, _transactional=ndb.in_transaction())


@arguments(profile=TffProfile)
def validate_kyc_status(profile):
    if profile.kyc:
        status = profile.kyc.status
        if status not in (KYCStatus.UNVERIFIED, KYCStatus.PENDING_SUBMIT):
            message = None
            if status == KYCStatus.DENIED:
                message = 'Sorry, we are regrettably not able to accept you as a customer.'
            elif status == KYCStatus.PENDING_APPROVAL or status == KYCStatus.SUBMITTED:
                message = 'We already have the information we currently need to pass on to our KYC provider.' \
                          ' We will contact you if we need more info.' \
                          ' Please contact us if you want to update your information.'
            elif status == KYCStatus.VERIFIED:
                message = 'You have already been verified, so you do not need to enter this process again. Thank you!'
            if not DEBUG:
                return create_error_message(message)
    return profile
