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

from google.appengine.ext import ndb
from google.appengine.ext.deferred import deferred

from framework.consts import get_base_url
from mcfw.properties import object_factory
from mcfw.rpc import arguments, returns
from onfido import Applicant, Address
from onfido.rest import ApiException
from plugins.its_you_online_auth.bizz.profile import index_profile
from plugins.its_you_online_auth.models import Profile
from plugins.rogerthat_api.exceptions import BusinessException
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.rogerthat_api.to.messaging.flow import FLOW_STEP_MAPPING, FormFlowStepTO
from plugins.rogerthat_api.to.messaging.forms import FormResultTO, UnicodeWidgetResultTO, LongWidgetResultTO
from plugins.rogerthat_api.to.messaging.service_callback_results import FlowMemberResultCallbackResultTO, \
    TYPE_FLOW, FlowCallbackResultTypeTO
from plugins.tff_backend.bizz.email import send_emails_to_support
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
from plugins.tff_backend.bizz.kyc import save_utility_bill, validate_kyc_status
from plugins.tff_backend.bizz.kyc.onfido_bizz import update_applicant, create_applicant, upload_document
from plugins.tff_backend.bizz.rogerthat import create_error_message
from plugins.tff_backend.bizz.user import get_tff_profile, generate_kyc_flow, set_kyc_status
from plugins.tff_backend.models.user import KYCStatus
from plugins.tff_backend.plugin_consts import KYC_FLOW_PART_2_TAG, SCHEDULED_QUEUE
from plugins.tff_backend.to.user import SetKYCPayloadTO
from plugins.tff_backend.utils import get_step


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
        return create_error_message()
    if flush_id == 'flush_corporation':
        url = get_base_url() + '/users/%s' % iyo_username
        msg = """"User %s (%s) wants to be KYC approved using his partnership/corporation or trust""" % (
            iyo_username, url)
        send_emails_to_support('Corporation wants to sign up', msg)

    result = validate_kyc_status(get_tff_profile(iyo_username))
    if isinstance(result, FlowMemberResultCallbackResultTO):
        return result
    if flush_id == 'flush_corporation':
        return
    nationality_step = get_step(steps, 'message_nationality') or get_step(steps, 'message_nationality_with_vibration')
    assert isinstance(nationality_step, FormFlowStepTO)
    assert isinstance(nationality_step.form_result, FormResultTO)
    assert isinstance(nationality_step.form_result.result, UnicodeWidgetResultTO)
    country_step = get_step(steps, 'message_country')
    nationality = nationality_step.form_result.result.value
    country = country_step.form_result.result.value
    xml, flow_params = generate_kyc_flow(nationality, country, iyo_username)
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
    deferred.defer(_kyc_part_2, message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key,
                   tag, result_key, flush_id, flush_message_flow_id, service_identity, user_details, flow_params)


@ndb.transactional()
@returns(FlowMemberResultCallbackResultTO)
@arguments(message_flow_run_id=unicode, member=unicode, steps=[object_factory('step_type', FLOW_STEP_MAPPING)],
           end_id=unicode, end_message_flow_id=unicode, parent_message_key=unicode, tag=unicode, result_key=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, service_identity=unicode, user_details=[UserDetailsTO],
           flow_params=unicode)
def _kyc_part_2(message_flow_run_id, member, steps, end_id, end_message_flow_id, parent_message_key, tag,
                result_key, flush_id, flush_message_flow_id, service_identity, user_details, flow_params):
    parsed_flow_params = json.loads(flow_params)
    applicant = Applicant(nationality=parsed_flow_params['nationality'],
                          addresses=[Address(country=parsed_flow_params.get('country'))])
    documents = []
    username = get_iyo_username(user_details[0])
    if not username:
        logging.error('Could not find username for user %s!' % user_details[0])
        return create_error_message()
    profile = get_tff_profile(username)
    result = validate_kyc_status(profile)
    if isinstance(result, FlowMemberResultCallbackResultTO):
        return result

    def _set_attr(prop, value):
        if hasattr(applicant, prop):
            setattr(applicant, prop, value)
        elif prop.startswith('address_'):
            prop = prop.replace('address_', '')
            if prop == 'country':
                applicant.country = value
            setattr(applicant.addresses[0], prop, value)
        else:
            logging.warn('Ignoring unknown property %s with value %s', prop, value)
    for step in steps:
        # In case of the flowcode_check_skip_passport step
        if not isinstance(step, FormFlowStepTO):
            continue
        step_id_split = step.step_id.split('_', 1)
        if step_id_split[0] == 'message':
            prop = step_id_split[1]  # 'type' from one of plugins.tff_backend.consts.kyc.kyc_steps
            step_value = step.form_result.result.get_value()
            if prop.startswith('national_identity_card'):
                side = None
                if prop.endswith('front'):
                    side = 'front'
                elif prop.endswith('back'):
                    side = 'back'
                documents.append(
                    {'type': 'national_identity_card', 'side': side, 'value': step_value})
            elif prop == 'utility_bill':
                deferred.defer(save_utility_bill, step_value, profile.key, _transactional=True)
            elif prop.startswith('passport'):
                documents.append({'type': 'passport', 'value': step_value})
            elif isinstance(step.form_result.result, UnicodeWidgetResultTO):
                _set_attr(prop, step.form_result.result.value.strip())
            elif isinstance(step.form_result.result, LongWidgetResultTO):
                # date step
                date = datetime.datetime.utcfromtimestamp(step_value).strftime('%Y-%m-%d')
                _set_attr(prop, date)
            else:
                logging.info('Ignoring step %s', step)
    try:
        if profile.kyc.applicant_id:
            applicant = update_applicant(profile.kyc.applicant_id, applicant)
        else:
            applicant = create_applicant(applicant)
            profile.kyc.applicant_id = applicant.id
    except ApiException as e:
        if e.status in xrange(400, 499):
            raise BusinessException('Invalid status code from onfido: %s %s' % (e.status, e.body))
        raise
    for document in documents:
        deferred.defer(upload_document, applicant.id, document['type'], document['value'], document.get('side'),
                       _transactional=True)
    profile.kyc.set_status(KYCStatus.SUBMITTED.value, username)
    profile.put()
    deferred.defer(index_profile, Profile.create_key(username))

    # Automatically set status to PENDING_APPROVAL after 5 minutes
    payload = SetKYCPayloadTO(status=KYCStatus.PENDING_APPROVAL.value, comment='Verification started automatically')
    deferred.defer(_set_kyc_status, username, payload, current_user_id=username, _countdown=300, _queue=SCHEDULED_QUEUE)


def _set_kyc_status(username, payload, current_user_id):
    if get_tff_profile(username).kyc.status == KYCStatus.SUBMITTED:
        set_kyc_status(username, payload, current_user_id)
