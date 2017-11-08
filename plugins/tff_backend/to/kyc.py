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
from framework.to import TO
from mcfw.properties import unicode_property, typed_property, unicode_list_property, long_property


class TruliooRequiredPropertiesTO(TO):
    title = unicode_property('title')
    type = unicode_property('type')
    properties = typed_property('properties', dict)
    required = unicode_list_property('required')


class TruliooProperties(TO):
    """
    Args:
        PersonInfo(TruliooRequiredPropertiesTO)
        Location(TruliooRequiredPropertiesTO)
        Communication(TruliooRequiredPropertiesTO)
        DriverLicence(TruliooRequiredPropertiesTO)
        NationalIds(TruliooRequiredPropertiesTO)
        Passport(TruliooRequiredPropertiesTO)
        Document(TruliooRequiredPropertiesTO)
        CountrySpecific(TruliooRequiredPropertiesTO)
    """
    PersonInfo = typed_property('PersonInfo', TruliooRequiredPropertiesTO)
    Location = typed_property('Location', TruliooRequiredPropertiesTO)
    Communication = typed_property('Communication', TruliooRequiredPropertiesTO)
    DriverLicence = typed_property('DriverLicence', TruliooRequiredPropertiesTO)
    NationalIds = typed_property('NationalIds', TruliooRequiredPropertiesTO)
    Passport = typed_property('Passport', TruliooRequiredPropertiesTO)
    Document = typed_property('Document', TruliooRequiredPropertiesTO)
    CountrySpecific = typed_property('CountrySpecific', TruliooRequiredPropertiesTO)


class TruliooDataFieldsTO(TO):
    """
    Args:
        title(unicode)
        type(unicode)
        properties(TruliooProperties)
    """
    title = unicode_property('title')
    type = unicode_property('type')
    properties = typed_property('properties', TruliooProperties)


class SetKYCPayloadTO(TO):
    status = long_property('status')
    comment = unicode_property('comment')
    data = typed_property('data', dict)


class TffProfileTO(TO):
    username = unicode_property('username')
    app_user = unicode_property('app_user')
    referrer_user = unicode_property('referrer_user')
    referrer_username = unicode_property('referrer_username')
    kyc = typed_property('kyc', dict)
