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
import time
from collections import defaultdict
from datetime import datetime

from dateutil.relativedelta import relativedelta
from mcfw.rpc import arguments, returns
from plugins.rogerthat_api.to.installation import InstallationLogTO, InstallationTO
from plugins.tff_backend.bizz.flow_statistics import get_flow_run_ticker_entry
from plugins.tff_backend.bizz.installations import list_installations, get_ticker_entry_for_installation
from plugins.tff_backend.firebase import put_firebase_data, remove_firebase_data
from plugins.tff_backend.models.statistics import FlowRun
from plugins.tff_backend.to.dashboard import TickerEntryTO


@returns([TickerEntryTO])
def rebuild_flow_stats(start_date):
    # type: (datetime) -> list[TickerEntryTO]
    stats_per_flow_name = defaultdict(dict)
    ticker_entries = []
    for flow_run in FlowRun.list_by_start_date(start_date):  # type: FlowRun
        stats_per_flow_name[flow_run.flow_name][flow_run.id] = flow_run.status
        ticker_entries.append(get_flow_run_ticker_entry(flow_run))
    put_firebase_data('/dashboard/flows.json', stats_per_flow_name)
    return ticker_entries


def rebuild_installation_stats(date):
    cursor = None
    max_timestamp = time.mktime(date.timetuple())
    has_more = True
    # keys = possible values of InstallationTO.status
    firebase_data = {
        'started': {},
        'in_progress': {},
        'finished': {}
    }
    ticker_entries = []
    while has_more:
        installation_list = list_installations(page_size=1000, cursor=cursor)
        cursor = installation_list.cursor
        if not installation_list.more:
            has_more = False
        for installation in installation_list.results:
            if installation.timestamp <= max_timestamp:
                has_more = False
            else:
                firebase_data[installation.id] = installation.status
                # timestamp might not be the most accurate but good enough
                ticker_entries.append(get_ticker_entry_for_installation(installation, []))
    put_firebase_data('/dashboard/installations.json', firebase_data)
    return ticker_entries


@arguments(installation=InstallationTO, logs=[InstallationLogTO])
def update_firebase_installation(installation, logs):
    # type: (InstallationTO, list[InstallationLogTO]) -> None
    ticker_entry = get_ticker_entry_for_installation(installation, logs)
    put_firebase_data('/dashboard/installations/%s.json' % installation.id, installation.status)
    put_firebase_data('/dashboard/ticker/%s.json' % ticker_entry.id, ticker_entry.to_dict())


def rebuild_firebase_data():
    # Removes all /dashboard data from firebase and rebuilds it
    # Shouldn't be ran more than once a month if all goes well
    ticker_entries = []
    remove_firebase_data('dashboard.json')
    date = datetime.now() - relativedelta(days=7)
    ticker_entries.extend(rebuild_installation_stats(date))
    ticker_entries.extend(rebuild_flow_stats(date))
    put_firebase_data('/dashboard/ticker.json', {entry.id: entry.to_dict() for entry in ticker_entries})
