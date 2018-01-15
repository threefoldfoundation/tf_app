# -*- coding: utf-8 -*-
# Copyright 2018 GIG Technology NV
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
# @@license_version:1.4@@
import logging
from datetime import datetime

from google.appengine.ext import ndb, deferred

import dateutil
from dateutil import relativedelta
from framework.bizz.job import run_job
from framework.consts import get_base_url
from mcfw.exceptions import HttpNotFoundException
from mcfw.rpc import arguments
from plugins.its_you_online_auth.bizz.profile import get_profile
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.rogerthat_api.to.messaging.flow import MessageFlowStepTO, FormFlowStepTO
from plugins.rogerthat_api.to.messaging.service_callback_results import FlowMemberResultCallbackResultTO
from plugins.tff_backend.bizz.email import send_emails_to_support
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
from plugins.tff_backend.models.statistics import FlowRun, FlowRunStatus, FlowRunStatistics, StepStatistics
from plugins.tff_backend.utils import get_key_name_from_key_string


def _create_flow_run(flow_run_key, tag, message_flow_name, user_details, timestamp):
    return FlowRun(key=flow_run_key,
                   tag=tag,
                   flow_name=message_flow_name,
                   start_date=datetime.utcfromtimestamp(timestamp),
                   user=get_iyo_username(user_details),
                   status=FlowRunStatus.STARTED)


@arguments(parent_message_key=unicode, steps=[(MessageFlowStepTO, FormFlowStepTO)], end_id=unicode, tag=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, user_details=UserDetailsTO, timestamp=(int, long),
           next_step=FlowMemberResultCallbackResultTO)
def save_flow_statistics(parent_message_key, steps, end_id, tag, flush_id, flush_message_flow_id, user_details,
                         timestamp, next_step):
    message_flow_name = get_key_name_from_key_string(flush_message_flow_id)
    flow_run_key = FlowRun.create_key(parent_message_key)
    flow_run = flow_run_key.get()  # type: FlowRun
    if not flow_run:
        flow_run_status = FlowRunStatus.STARTED
        flow_run = _create_flow_run(flow_run_key, tag, message_flow_name, user_details, timestamp)
    else:
        # In case one statistics task runs before the other
        if len(flow_run.steps) > len(steps):
            return
        if 'cancel' in flush_id:
            flow_run_status = FlowRunStatus.CANCELED
        elif end_id and not next_step:
            flow_run_status = FlowRunStatus.FINISHED
        else:
            flow_run_status = FlowRunStatus.IN_PROGRESS
    next_step_id = next_step and next_step.value.step_id
    calculate_flow_run_statistics(flow_run, timestamp, steps, flow_run_status, flush_id, next_step_id)
    flow_run.populate(status=flow_run_status, steps=[s.to_dict() for s in steps])
    flow_run.put()


def calculate_flow_run_statistics(flow_run, timestamp, steps, flow_run_status, flush_id, next_step):
    # type: (FlowRun, long, list[FormFlowStepTO]) -> FlowRun
    last_step_date = datetime.utcfromtimestamp(timestamp)
    total_time = int((last_step_date - flow_run.start_date).total_seconds())
    if not next_step and flow_run_status in (FlowRunStatus.STARTED, FlowRunStatus.IN_PROGRESS):
        next_step = flush_id.replace('flush_monitoring_', '')
    steps_statistics = []
    for step in steps:  # type: FormFlowStepTO
        time_taken = step.acknowledged_timestamp - step.received_timestamp
        if time_taken < 0:
            time_taken = 0
        steps_statistics.append(StepStatistics(time_taken=time_taken))
    flow_run.statistics = FlowRunStatistics(
        last_step_date=last_step_date,
        next_step=next_step,
        total_time=total_time,
        steps=steps_statistics
    )
    return flow_run


def list_flow_runs(cursor, page_size, flow_name, start_date):
    start_date = start_date and dateutil.parser.parse(start_date.replace('Z', ''))
    if start_date and flow_name:
        qry = FlowRun.list_by_start_date(flow_name, start_date)
    elif flow_name:
        qry = FlowRun.list_by_flow_name(flow_name)
    else:
        qry = FlowRun.list()
    return qry.fetch_page(page_size, start_cursor=ndb.Cursor(urlsafe=cursor))


def get_flow_run(flow_run_id):
    # type: (unicode) -> FlowRun
    flow_run = FlowRun.create_key(flow_run_id).get()
    if not flow_run:
        raise HttpNotFoundException('flow_run_not_found', {'flow_run_id': flow_run_id})
    return flow_run


def list_distinct_flows():
    return FlowRun.list_distinct_flows()


def check_stuck_flows():
    fifteen_minutes_ago = datetime.now() - relativedelta.relativedelta(minutes=15 * 0)
    run_job(_get_stalled_flows, [fifteen_minutes_ago], _set_flow_run_as_stalled, [])


def notify_stalled_flow_run(flow_run_key):
    flow_run = flow_run_key.get()  # type: FlowRun
    if flow_run.status != FlowRunStatus.STALLED:
        logging.info('Not notifying of stalled flow %s because status != stalled', flow_run_key.id())
        return
    # Ensure no unnecessary messages are sent in case user started this same flow again in the meantime
    newest_key = FlowRun.list_by_user_and_flow(flow_run.flow_name, flow_run.user).fetch(1, keys_only=True)[0]
    if flow_run_key.id() != newest_key.id():
        logging.info('Not notifying of stalled flow, user has restarted this flow. Newer flow key: %s', newest_key.id())
        return
    url = get_base_url() + '/flow-statistics/%s/%s' % (flow_run.flow_name, flow_run.id),
    subject = 'Stalled flow %s' % flow_run.flow_name
    profile = get_profile(flow_run.user)
    body = 'User %s appears to be stuck in the %s flow. Click the following link to check the details: %s' % (
        profile.full_name or profile.username, flow_run.flow_name, url)
    send_emails_to_support(subject, body)


def _get_stalled_flows(fifteen_minutes_ago):
    return FlowRun.list_by_status_and_last_step_date(FlowRunStatus.IN_PROGRESS, fifteen_minutes_ago)


@ndb.transactional()
def _set_flow_run_as_stalled(flow_run_key):
    flow_run = flow_run_key.get()  # type: FlowRun
    if flow_run.status != FlowRunStatus.IN_PROGRESS:
        logging.debug('Ignoring updated flow run %s', flow_run)
        return
    flow_run.status = FlowRunStatus.STALLED
    logging.warn('Updating %s', flow_run)
    flow_run.put()
    deferred.defer(notify_stalled_flow_run, flow_run_key, _transactional=True)
