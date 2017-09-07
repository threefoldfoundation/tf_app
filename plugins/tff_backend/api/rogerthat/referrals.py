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
from mcfw.rpc import returns, arguments
from plugins.rogerthat_api.to import UserDetailsTO
from plugins.tff_backend.bizz.global_stats import ApiCallException
from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
from plugins.tff_backend.models.user import Profile, ProfilePointer


@returns(unicode)
@arguments(params=dict, user_detail=UserDetailsTO)
def api_set_referral(params, user_detail):
    def trans():
        code = params.get("code")
        if not code:
            raise ApiCallException(u'Unknown invitation code received') 
        
        pp = ProfilePointer.get_by_user_code(code)
        if not pp:
            raise ApiCallException(u'Unknown invitation code received') 
        
        username = get_iyo_username(user_detail)
        if username == pp.username:
            raise ApiCallException(u'You can\'t use your own invitation code') 
                
        my_profile = Profile.create_key(username).get()
        if not my_profile:
            raise ApiCallException(u'We were unable to find your profile')
        
        if my_profile.referrer:
            raise ApiCallException(u'You already set your referrer')
        
        referrer_profile = Profile.create_key(pp.username).get()
        if not referrer_profile:
            raise ApiCallException(u'We were unable to find your referrer\'s profile')
        
        my_profile.referrer = referrer_profile.app_user
        my_profile.put()
    
        # todo roles
        
    ndb.transaction(trans, xg=True)
    return u"You successfully joined the ThreeFold community. Welcome aboard!"
    
