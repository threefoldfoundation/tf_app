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
import datetime
import json
import logging
from collections import defaultdict

from mcfw.consts import DEBUG
from mcfw.properties import object_factory
from mcfw.rpc import arguments, returns
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.rogerthat_api.to.messaging.flow import FLOW_STEP_MAPPING, FormFlowStepTO
from plugins.rogerthat_api.to.messaging.forms import FormResultTO, UnicodeWidgetResultTO, LongWidgetResultTO
from plugins.rogerthat_api.to.messaging.service_callback_results import FlowMemberResultCallbackResultTO, \
    TYPE_FLOW, FlowCallbackResultTypeTO
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
from plugins.tff_backend.bizz.rogerthat import create_error_message
from plugins.tff_backend.bizz.user import get_tff_profile, generate_kyc_flow
from plugins.tff_backend.models.user import KYCStatus, KYCDataFields
from plugins.tff_backend.plugin_consts import KYC_FLOW_PART_2_TAG
from plugins.tff_backend.utils import get_step


class InvalidKYCStatusException(Exception):
    def __init__(self, status):
        self.status = status
        msg = 'Invalid KYC status %s' % status
        super(InvalidKYCStatusException, self).__init__(msg)


@returns(FlowMemberResultCallbackResultTO)
@arguments(message_flow_run_id=unicode, member=unicode, steps=[object_factory('step_type', FLOW_STEP_MAPPING)],
           end_id=unicode, end_message_flow_id=unicode, parent_message_key=unicode, tag=unicode, result_key=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, service_identity=unicode, user_details=[UserDetailsTO],
           flow_params=unicode)
def kyc_part_1(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag,
               result_key, flush_id, flush_message_flow_id, service_identity, user_details, flow_params):
    iyo_username = get_iyo_username(user_details[0])
    if not iyo_username:
        logging.error('No username found for user %s', user_details[0])
        return create_error_message(FlowMemberResultCallbackResultTO())
    result = _validate_kyc_status(iyo_username)
    if isinstance(result, FlowMemberResultCallbackResultTO):
        return result
    step = get_step(steps, 'message_nationality') or get_step(steps, 'message_nationality_with_vibration')
    assert isinstance(step, FormFlowStepTO)
    assert isinstance(step.form_result, FormResultTO)
    assert isinstance(step.form_result.result, UnicodeWidgetResultTO)
    country_code = step.form_result.result.value
    xml, flow_params = generate_kyc_flow(country_code, iyo_username)
    result = FlowCallbackResultTypeTO(flow=xml, tag=KYC_FLOW_PART_2_TAG, force_language=None,
                                      flow_params=json.dumps(flow_params))
    return FlowMemberResultCallbackResultTO(type=TYPE_FLOW, value=result)


@returns(FlowMemberResultCallbackResultTO)
@arguments(message_flow_run_id=unicode, member=unicode, steps=[object_factory('step_type', FLOW_STEP_MAPPING)],
           end_id=unicode, end_message_flow_id=unicode, parent_message_key=unicode, tag=unicode, result_key=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, service_identity=unicode, user_details=[UserDetailsTO],
           flow_params=unicode)
def kyc_part_2(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag,
               result_key, flush_id, flush_message_flow_id, service_identity, user_details, flow_params):
    # Get all information
    datafields = defaultdict(dict)
    for step in steps:
        step_id_split = step.step_id.split('_')
        if step_id_split[0] == 'message':
            if len(step_id_split) == 3:
                category = step_id_split[1]  # e.g. 'PersonalInfo'
                prop = step_id_split[2]  # e.g. 'FirstSurName'
                # NationalIds should be a list
                if category == 'NationalIds':
                    if not datafields[category]:
                        datafields[category] = [{}]
                    datafields[category][0][prop] = step.form_result.result
                if isinstance(step.form_result.result, UnicodeWidgetResultTO):
                    # Since this isn't actually the Mrz1 value, but an url to a picture, add 'Picture' to the property.
                    # Mrz1 and Mrz2 need to be manually set by admins by copying the MRZ from the pics on the dashboard.
                    if prop in ('Mrz1', 'Mrz2'):
                        prop += 'Picture'
                    datafields[category][prop] = step.form_result.result.value.strip()
                elif isinstance(step.form_result.result, LongWidgetResultTO):
                    # date step
                    date = datetime.datetime.utcfromtimestamp(step.form_result.value)
                    if prop == 'DayOfBirth':
                        datafields[category]['DayOfBirth'] = date.day
                        datafields[category]['MonthOfBirth'] = date.month
                        datafields[category]['YearOfBirth'] = date.year
                    elif category == 'DayOfExpiry':
                        datafields[category]['DayOfExpiry'] = date.day
                        datafields[category]['MonthOfExpiry'] = date.month
                        datafields[category]['YearOfExpiry'] = date.year
                    else:
                        logging.warn('Ignoring LongWidgetResultTO step %s', step)
                else:
                    logging.warn('Ignoring step %s', step)
    parsed_flow_params = json.loads(flow_params)
    national_id = parsed_flow_params.get('NationalIds_Type')
    if national_id and datafields['NationalIds']:
        datafields['NationalIds'][0]['Type'] = national_id
    username = get_iyo_username(user_details[0])
    if not username:
        logging.error('Could not find username for user %s!' % user_details[0])
        return create_error_message(FlowMemberResultCallbackResultTO())
    result = _validate_kyc_status(username)
    if isinstance(result, FlowMemberResultCallbackResultTO):
        return result
    profile = get_tff_profile(username)
    profile.kyc.pending_information = KYCDataFields(country_code=parsed_flow_params['country_code'],
                                                    data=datafields)
    profile.kyc.set_status(KYCStatus.SUBMITTED.value, username)
    profile.kyc.verified_information = KYCDataFields()
    profile.put()


def _validate_kyc_status(username):
    profile = get_tff_profile(username)
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
                return create_error_message(FlowMemberResultCallbackResultTO(), message)
    return profile
