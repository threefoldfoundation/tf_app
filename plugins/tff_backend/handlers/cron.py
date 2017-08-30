from plugins.rogerthat_api.api import friends
from plugins.tff_backend.bizz import get_rogerthat_api_key
import webapp2


class RebuildSyncedRolesHandler(webapp2.RequestHandler):
    def get(self):
        api_key = get_rogerthat_api_key()
        friends.rebuild_synced_roles(api_key, members=[], service_identities=[])
