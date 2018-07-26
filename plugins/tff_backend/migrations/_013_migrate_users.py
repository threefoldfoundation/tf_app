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

from google.appengine.api import users
from google.appengine.ext import ndb

from plugins.rogerthat_api.api import friends
from plugins.rogerthat_api.to.friends import ServiceFriendTO
from plugins.tff_backend.bizz import get_rogerthat_api_key
from plugins.tff_backend.models.user import TffProfile, TffProfileInfo
from plugins.tff_backend.utils.app import get_human_user_from_app_user


def migrate(dry_run=False):
    return migrate_profiles(dry_run)


def migrate_profiles(dry_run):
    from plugins.its_you_online_auth.models import Profile
    profiles = Profile.query().fetch(None)
    keys = [TffProfile.create_key(profile.username) for profile in profiles]
    tff_profiles = {p.username: p for p in ndb.get_multi(keys) if p}
    rogerthat_friends = {f.email: f for f in friends.list(get_rogerthat_api_key()).friends}
    to_put = []
    missing_profiles = []
    not_friends = []
    for profile in profiles:
        tff_profile = tff_profiles.get(profile.username)  # type: TffProfile
        user_email = get_human_user_from_app_user(users.User(profile.app_email)).email()
        rogerthat_friend = rogerthat_friends.get(user_email)  # type: ServiceFriendTO
        if not tff_profile:
            missing_profiles.append(profile.username)
            continue
        if not tff_profile.info:
            tff_profile.info = TffProfileInfo()
        tff_profile.info.email = profile.email
        tff_profile.info.name = profile.full_name
        if rogerthat_friend:
            if not tff_profile.info.name:
                tff_profile.info.name = rogerthat_friend.name
            tff_profile.info.language = rogerthat_friend.language
            tff_profile.info.avatar_url = rogerthat_friend.avatar
        else:
            not_friends.append(profile)
        to_put.append(tff_profile)
    if not dry_run:
        ndb.put_multi(to_put)
    return {
        'missing_profiles': missing_profiles,
        'not_friends': not_friends,
        'to_put': [p.info for p in to_put]
    }
