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
import logging
from datetime import datetime

from mcfw.restapi import rest, GenericRESTRequestHandler
from mcfw.rpc import returns, arguments
from plugins.tff_backend.bizz.nodes.stats import save_node_stats
from plugins.tff_backend.to.nodes import UpdateNodeStatusTO


@rest('/nodes/<node_id:[^/]+>/status', 'put', [], silent=True)
@returns()
@arguments(node_id=unicode, data=UpdateNodeStatusTO)
def api_save_node_stats(node_id, data):
    logging.debug(GenericRESTRequestHandler.getCurrentRequest().body)
    return save_node_stats(node_id, data, datetime.now())

