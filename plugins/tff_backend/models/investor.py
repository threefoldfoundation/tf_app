from google.appengine.ext import ndb

from framework.models.common import NdbModel
from framework.utils import now
from plugins.tff_backend.plugin_consts import NAMESPACE


class InvestmentAgreement(NdbModel):
    NAMESPACE = NAMESPACE
    PER_PAGE = 50
    STATUS_CANCELED = -1
    STATUS_CREATED = 0
    STATUS_SIGNED = 1
    STATUS_PAID = 2

    def _compute_token_count(self):
        return round(float(self.token_amount) / pow(10, self.token_precision), self.token_precision)

    app_user = ndb.UserProperty()
    amount = ndb.FloatProperty(indexed=False)
    token = ndb.StringProperty(indexed=False)
    token_count = ndb.ComputedProperty(_compute_token_count, indexed=False)
    token_amount = ndb.IntegerProperty(indexed=False, default=0)
    token_precision = ndb.IntegerProperty(indexed=False, default=0)
    currency = ndb.StringProperty(indexed=False)
    name = ndb.StringProperty(indexed=False)
    address = ndb.StringProperty(indexed=False)

    iyo_see_id = ndb.StringProperty(indexed=False)
    signature_payload = ndb.StringProperty(indexed=False)
    signature = ndb.StringProperty(indexed=False)

    status = ndb.IntegerProperty(default=STATUS_CREATED)
    creation_time = ndb.IntegerProperty()
    sign_time = ndb.IntegerProperty()
    paid_time = ndb.IntegerProperty()
    cancel_time = ndb.IntegerProperty()
    modification_time = ndb.IntegerProperty()

    def _pre_put_hook(self):
        self.modification_time = now()

    @property
    def iyo_username(self):
        from plugins.tff_backend.bizz.iyo.utils import get_iyo_username
        return get_iyo_username(self.app_user)

    @property
    def id(self):
        return self.key.id()

    @classmethod
    def create_key(cls, subscription_id):
        return ndb.Key(cls, subscription_id, namespace=NAMESPACE)

    @classmethod
    def list(cls):
        return cls.query()

    @classmethod
    def list_by_status(cls, status):
        return cls.query() \
            .filter(cls.status == status)

    @classmethod
    def list_by_user(cls, app_user):
        return cls.query() \
            .filter(cls.app_user == app_user)

    @classmethod
    def list_by_status_and_user(cls, app_user, statuses):
        # type: (users.User, int) -> list[InvestmentAgreement]
        statuses = [statuses] if isinstance(statuses, int) else statuses
        return [investment for investment in cls.list_by_user(app_user) if investment.status in statuses]

    @classmethod
    def fetch_page(cls, cursor=None, status=None):
        # type: (unicode) -> tuple[list[InvestmentAgreement], ndb.Cursor, bool]
        qry = cls.list_by_status(status) if status is not None else cls.list()
        return qry \
            .order(-cls.modification_time) \
            .fetch_page(cls.PER_PAGE, start_cursor=ndb.Cursor(urlsafe=cursor))
