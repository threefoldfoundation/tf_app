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

from google.appengine.api import search

from framework.utils import chunks


def sanitise_search_query(query, filters):
    """
        Sanitises search query so it doesn't contain syntax errors.
        Allows users to search by entering key:value in their search term.
    Args:
        query (unicode)
        filters (dict)
    Returns:
        unicode
    """
    query = query or ''
    filters = filters or {}
    split = query.split()
    for s in split:
        if ':' in s:
            res = s.split(':')
            filters[res[0]] = res[1]
            query = query.replace(s, '')
    filtered_query = query
    for key, value in filters.iteritems():
        if value is not None and key:
            filtered_query += ' %s:%s' % (key, value)
    return filtered_query.strip()


def remove_all_from_index(index):
    # type: (search.Index) -> long
    total = 0
    while True:
        result = index.search(search.Query(u'', options=search.QueryOptions(ids_only=True, limit=1000)))
        if not result.results:
            break
        logging.debug('Deleting %d documents from %s' % (len(result.results), index))
        total += len(result.results)
        for rpc in [index.delete_async([r.doc_id for r in chunk]) for chunk in chunks(result.results, 200)]:
            rpc.get_result()
    logging.info('Deleted %d documents from %s', total, index)
    return total
