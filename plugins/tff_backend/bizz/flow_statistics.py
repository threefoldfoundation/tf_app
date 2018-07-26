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
from framework.utils import try_or_defer
from mcfw.exceptions import HttpNotFoundException
from mcfw.properties import object_factory
from mcfw.rpc import arguments, parse_complex_value
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.rogerthat_api.to.messaging.flow import MessageFlowStepTO, FormFlowStepTO, FLOW_STEP_MAPPING
from plugins.rogerthat_api.to.messaging.service_callback_results import FlowMemberResultCallbackResultTO, \
    FlowCallbackResultTypeTO, FormCallbackResultTypeTO, MessageCallbackResultTypeTO
from plugins.tff_backend.bizz.email import send_emails_to_support
from plugins.tff_backend.bizz.iyo.utils import get_username
from plugins.tff_backend.bizz.user import get_tff_profile
from plugins.tff_backend.firebase import put_firebase_data
from plugins.tff_backend.models.statistics import FlowRun, FlowRunStatus, FlowRunStatistics, StepStatistics
from plugins.tff_backend.to.dashboard import TickerEntryTO, TickerEntryType
from plugins.tff_backend.utils import get_key_name_from_key_string


@ndb.non_transactional()
def _create_flow_run(flow_run_key, tag, message_flow_name, user_details, timestamp):
    return FlowRun(key=flow_run_key,
                   tag=tag,
                   flow_name=message_flow_name,
                   start_date=datetime.utcfromtimestamp(timestamp),
                   user=get_username(user_details),
                   status=FlowRunStatus.STARTED)


@ndb.transactional(xg=True)
@arguments(parent_message_key=unicode, steps=[(MessageFlowStepTO, FormFlowStepTO)], end_id=unicode, tag=unicode,
           flush_id=unicode, flush_message_flow_id=unicode, user_details=UserDetailsTO, timestamp=(int, long),
           next_step=FlowMemberResultCallbackResultTO)
def save_flow_statistics(parent_message_key, steps, end_id, tag, flush_id, flush_message_flow_id, user_details,
                         timestamp, next_step):
    message_flow_name = get_key_name_from_key_string(flush_message_flow_id)
    flow_run_key = FlowRun.create_key(parent_message_key)
    flow_run = flow_run_key.get()  # type: FlowRun
    if not flow_run:
        if not message_flow_name:
            logging.warn('Ignoring callback since we could not determine the message flow name')
            return
        flow_run_status = FlowRunStatus.STARTED
        flow_run = _create_flow_run(flow_run_key, tag, message_flow_name, user_details, timestamp)
    else:
        # In case one statistics task runs before the other
        steps = merge_steps(flow_run, steps)
        if len(flow_run.steps) > len(steps):
            logging.info('Ignoring callback since all steps have already been saved')
            return
        # Once canceled or finished, always canceled or finished. Rest can still be changed.
        if flow_run.status not in (FlowRunStatus.CANCELED, FlowRunStatus.FINISHED):
            if 'cancel' in flush_id:
                flow_run_status = FlowRunStatus.CANCELED
            elif (end_id and not next_step) or 'flush_monitoring_end' in flush_id:
                flow_run_status = FlowRunStatus.FINISHED
            else:
                flow_run_status = FlowRunStatus.IN_PROGRESS
        else:
            flow_run_status = flow_run.status
    next_step_id = None
    if next_step:
        if isinstance(next_step.value, FlowCallbackResultTypeTO):
            next_step_id = next_step.value.tag or next_step.value.flow
        elif isinstance(next_step.value, (FormCallbackResultTypeTO, MessageCallbackResultTypeTO)):
            next_step_id = next_step and next_step.value.step_id
        else:
            raise Exception('Unknown callback result %s', next_step)
    calculate_flow_run_statistics(flow_run, timestamp, steps, flow_run_status, flush_id, next_step_id)
    flow_run.populate(status=flow_run_status, steps=[s.to_dict() for s in steps])
    flow_run.put()
    try_or_defer(save_flow_run_status_to_firebase, flow_run.key)


def save_flow_run_status_to_firebase(flow_run_key):
    flow_run = flow_run_key.get()  # type: FlowRun
    ticker_entry = get_flow_run_ticker_entry(flow_run)
    put_firebase_data('/dashboard/flows/%s.json' % flow_run.flow_name, {flow_run.id: flow_run.status})
    put_firebase_data('/dashboard/ticker/%s.json' % ticker_entry.id, ticker_entry.to_dict())


def get_flow_run_ticker_entry(flow_run):
    # type: (FlowRun) -> TickerEntryTO
    data = flow_run.to_dict(include=['flow_name', 'status'])
    last_step = None
    if flow_run.steps:
        step = flow_run.steps[-1]
        # Don't return sensitive data such as the form value
        last_step = {
            'step_id': step['step_id'],
            'answer_id': step['answer_id'],
            'button': step['button']
        }

    data.update({
        'last_step': last_step,
    })
    date = flow_run.statistics.last_step_date.isoformat().decode('utf-8') + u'Z'
    return TickerEntryTO(id='flow-%s' % flow_run.id, date=date, data=data, type=TickerEntryType.FLOW.value)


def merge_steps(flow_run, new_steps):
    # In case of sub flows, new_steps won't contain steps from the previous flow.
    steps = parse_complex_value(object_factory('step_type', FLOW_STEP_MAPPING), flow_run.steps, True)
    saved_step_ids = [step.step_id for step in steps]
    for step in new_steps:
        if step.step_id not in saved_step_ids:
            steps.append(step)
    return steps


def calculate_flow_run_statistics(flow_run, timestamp, steps, flow_run_status, flush_id, next_step):
    # type: (FlowRun, long, list[FormFlowStepTO]) -> FlowRun
    last_step_date = datetime.utcfromtimestamp(timestamp)
    total_time = int((last_step_date - flow_run.start_date).total_seconds())
    # A 'finished' flow can still have a next step, by naming the monitoring flush 'flush_monitoring_end'
    if not next_step and flow_run_status in (FlowRunStatus.STARTED, FlowRunStatus.IN_PROGRESS, FlowRunStatus.FINISHED):
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
    if start_date:
        qry = FlowRun.list_by_start_date(start_date)
    elif flow_name:
        qry = FlowRun.list_by_flow_name(flow_name)
    else:
        qry = FlowRun.list()
    return qry.fetch_page(page_size, start_cursor=ndb.Cursor(urlsafe=cursor))


def list_flow_runs_by_user(username, cursor, page_size):
    return FlowRun.list_by_user(username).fetch_page(page_size, start_cursor=ndb.Cursor(urlsafe=cursor))


def get_flow_run(flow_run_id):
    # type: (unicode) -> FlowRun
    flow_run = FlowRun.create_key(flow_run_id).get()
    if not flow_run:
        raise HttpNotFoundException('flow_run_not_found', {'flow_run_id': flow_run_id})
    return flow_run


def list_distinct_flows():
    return FlowRun.list_distinct_flows()


def check_stuck_flows():
    fifteen_minutes_ago = datetime.now() - relativedelta.relativedelta(minutes=15)
    run_job(_get_stalled_flows, [fifteen_minutes_ago], _set_flow_run_as_stalled, [])


def should_notify_for_flow(flow_run):
    # type: (FlowRun) -> bool
    if flow_run.status != FlowRunStatus.STALLED:
        logging.info('Not notifying of stalled flow %s because status != stalled', flow_run.id)
        return False
    # Ensure no unnecessary messages are sent in case user started this same flow again in the meantime
    newest_key = FlowRun.list_by_user_and_flow(flow_run.flow_name, flow_run.user).fetch(1, keys_only=True)[0]
    if flow_run.id != newest_key.id():
        logging.info('Not notifying of stalled flow, user has restarted this flow. Newer flow key: %s', newest_key.id())
        return False
    if len(flow_run.steps) < 2:
        logging.info('Not notifying of stalled flow, flow only had one step')
        return False
    return True


def notify_stalled_flow_run(flow_run_key):
    flow_run = flow_run_key.get()  # type: FlowRun
    if not should_notify_for_flow(flow_run):
        return
    url = get_base_url() + '/flow-statistics/%s/%s' % (flow_run.flow_name, flow_run.id),
    subject = 'Stalled flow %s' % flow_run.flow_name
    profile = get_tff_profile(flow_run.user)
    body = 'User %s appears to be stuck in the %s flow. Click the following link to check the details: %s' % (
        profile.info.name, flow_run.flow_name, url)
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
    flow_run.put()
    deferred.defer(notify_stalled_flow_run, flow_run_key, _transactional=True)
    deferred.defer(save_flow_run_status_to_firebase, flow_run_key, _transactional=True)
