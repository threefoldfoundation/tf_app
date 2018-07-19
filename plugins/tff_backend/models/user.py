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

from google.appengine.ext import ndb

from enum import IntEnum
from framework.models.common import NdbModel
from plugins.tff_backend.plugin_consts import NAMESPACE


class KYCStatus(IntEnum):
    DENIED = -10
    UNVERIFIED = 0  # Not verified, and not applied to be verified yet
    PENDING_SUBMIT = 10  # KYC flow has been sent to the user
    SUBMITTED = 20  # KYC flow has been set by user
    # Admin verified the info sent in by the user, completed any missing data
    # Info is now ready to be checked to Onfido
    INFO_SET = 30
    PENDING_APPROVAL = 40  # API call to Onfido done, admin has to mark user as approved/denied now
    VERIFIED = 50  # Approved by admin


KYC_STATUSES = map(int, KYCStatus)


class KYCStatusUpdate(NdbModel):
    comment = ndb.StringProperty()
    author = ndb.StringProperty()
    timestamp = ndb.DateTimeProperty(auto_now_add=True)
    from_status = ndb.IntegerProperty(choices=KYC_STATUSES)
    to_status = ndb.IntegerProperty(choices=KYC_STATUSES)


class KYCInformation(NdbModel):
    NAMESPACE = NAMESPACE
    status = ndb.IntegerProperty(choices=KYC_STATUSES)
    updates = ndb.LocalStructuredProperty(KYCStatusUpdate, repeated=True, compressed=True)
    applicant_id = ndb.StringProperty()
    utility_bill_url = ndb.StringProperty()
    utility_bill_verified = ndb.BooleanProperty(default=False)

    def set_status(self, new_status, author, comment=None):
        self.updates.append(KYCStatusUpdate(from_status=self.status,
                                            to_status=new_status,
                                            author=author,
                                            comment=comment))
        self.status = new_status


class TffProfileInfo(NdbModel):
    NAMESPACE = NAMESPACE
    email = ndb.StringProperty()
    name = ndb.StringProperty(indexed=False)
    language = ndb.StringProperty(indexed=False)
    avatar_url = ndb.StringProperty(indexed=False)


class TffProfile(NdbModel):
    NAMESPACE = NAMESPACE
    app_user = ndb.UserProperty()
    referrer_user = ndb.UserProperty()
    referrer_username = ndb.StringProperty()
    kyc = ndb.StructuredProperty(KYCInformation)  # type: KYCInformation
    info = ndb.StructuredProperty(TffProfileInfo)  # type: TffProfileInfo

    @property
    def username(self):
        return self.key.id().decode('utf8')

    @property
    def referral_code(self):
        from plugins.tff_backend.bizz.user import user_code
        return user_code(self.username)

    @classmethod
    def create_key(cls, username):
        return ndb.Key(cls, username, namespace=NAMESPACE)

    def to_dict(self, extra_properties=None, include=None, exclude=None):
        return super(TffProfile, self).to_dict(extra_properties or ['username', 'referral_code'], include, exclude)

    @classmethod
    def list_by_email(cls, email):
        return cls.query().filter(cls.info.email == email)


class ProfilePointer(NdbModel):
    NAMESPACE = NAMESPACE

    username = ndb.StringProperty()

    @property
    def user_code(self):
        return self.key.string_id().decode('utf8')

    @classmethod
    def create_key(cls, username):
        from plugins.tff_backend.bizz.user import user_code
        return ndb.Key(cls, user_code(username), namespace=NAMESPACE)

    @classmethod
    def get_by_user_code(cls, user_code):
        return ndb.Key(cls, user_code, namespace=NAMESPACE).get()
