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
import base64
import json
import logging

from framework.plugin_loader import get_config
from mcfw.cache import cached
from mcfw.rpc import arguments, returns, parse_complex_value
from plugins.rogerthat_api.exceptions import BusinessException
from plugins.tff_backend.configuration import TffConfiguration
from plugins.tff_backend.plugin_consts import NAMESPACE
from plugins.tff_backend.to.kyc import TruliooDataFieldsTO, TruliooRequiredPropertiesTO
from truliooapiclient import Client, VerifyRequest, DataFields, VerifyResult, TransactionRecordResult, Record, \
    DatasourceResult, RecordStatus

TRULIOO_PRODUCT = 'Identity Verification'

field_mapping = {
    'FirstName': 'FirstGivenName',
    'LastName': 'FirstSurName'
}


def get_trulioo_client():
    config = get_config(NAMESPACE)
    assert isinstance(config, TffConfiguration)
    client = Client()
    auth_header = 'Basic %s' % base64.b64encode('%s:%s' % (config.trulioo.username, config.trulioo.password))
    client.api.set_auth_header(auth_header)
    return client


def verify_info(country, info):
    """
    Use sparingly as this is a costly, paid API call.

    Args:
        country (str)
        info (DataFields)
    """
    # type: (str, DataFields) -> VerifyResult
    assert isinstance(info, DataFields)
    consents = get_consents(country)
    request = VerifyRequest.create(AcceptTruliooTermsAndConditions=True, CleansedAddress=True,
                                   ConfigurationName=TRULIOO_PRODUCT, ConsentForDataSources=consents,
                                   CountryCode=country, DataFields=info, VerboseMode=False)
    return VerifyResult(get_trulioo_client().api.verifications.Verify(request).json())


def get_all_countries():
    # type: () -> list[unicode]
    return get_trulioo_client().api.configuration.GetCountryCodes(TRULIOO_PRODUCT).json()


def get_required_info_for_country(country):
    # type: (basestring) -> TruliooDataFieldsTO
    response = json.loads(_get_required_info_for_country(country))
    required_fields = parse_complex_value(TruliooDataFieldsTO, response, False)
    if 'CountrySpecific' in response['properties']:
        # For some reason CountrySpecific has a subproperty '<countrycode>', remove this unnecessary nesting
        properties = response['properties']['CountrySpecific'][country]
        required_fields.properties.CountrySpecific = parse_complex_value(TruliooRequiredPropertiesTO, properties, False)
    return required_fields


@cached(1, 86400)
@returns(unicode)
@arguments(country=unicode)
def _get_required_info_for_country(country):
    return get_trulioo_client().api.configuration.GetFields(TRULIOO_PRODUCT, country).text


def get_consents(country):
    # type: (basestring) -> list[str]
    return json.loads(_get_consents(country))


@cached(1, 86400)
@returns(unicode)
@arguments(country=unicode)
def _get_consents(country):
    return get_trulioo_client().api.configuration.GetConsents(TRULIOO_PRODUCT, country).text


def get_transaction_record(transaction_record_id):
    # type: (unicode) -> TransactionRecordResult
    result = get_trulioo_client().api.verifications.GetTransactionRecordVerbose(transaction_record_id).json()
    return TransactionRecordResult(result)


def get_verified_profile_information(transaction_id):
    # type: (unicode) -> dict
    transaction = get_transaction_record(transaction_id)
    logging.debug('Transaction from trulioo: %s', transaction.as_dict())
    record = transaction.Record
    information = {}

    for input_field in transaction.InputFields:
        if _has_match(record, input_field.FieldName):
            information[field_mapping.get(input_field.FieldName, input_field.FieldName)] = input_field.Value
    for result in record.DatasourceResults:
        for field in result.AppendedFields:
            if field.FieldName == 'IsDeceased' and field.Data:
                raise BusinessException('Cannot store verified information for deceased person')
    return information


@arguments(record=Record, input_field=unicode)
def _has_match(record, input_field):
    # type: (Record, unicode) -> bool
    for result in record.DatasourceResults:
        assert isinstance(result, DatasourceResult)
        for field in result.DatasourceFields:
            if _is_same_field(field.FieldName, input_field):
                if field.Status == RecordStatus.match.value:
                    return True
    logging.debug('Skipping unmatched field %s', input_field)
    return False


def _is_same_field(field_name, input_field):
    same = field_name == input_field
    # For some reason some fields have a different name here
    if not same and input_field in field_mapping:
        return field_name == field_mapping[input_field]
    return same
