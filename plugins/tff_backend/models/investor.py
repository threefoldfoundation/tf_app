from google.appengine.ext import ndb

from framework.models.common import NdbModel
from framework.utils import now
from plugins.tff_backend.plugin_consts import NAMESPACE, FULL_CURRENCY_NAMES


class InvestmentAgreement(NdbModel):
    NAMESPACE = NAMESPACE
    PER_PAGE = 50
    STATUS_CANCELED = -1
    STATUS_CREATED = 0
    STATUS_SIGNED = 1
    STATUS_PAID = 2

    app_user = ndb.UserProperty()
    referrer = ndb.UserProperty(indexed=False)
    amount = ndb.IntegerProperty(indexed=False)
    token_count = ndb.IntegerProperty(indexed=False)
    currency = ndb.StringProperty(indexed=False, choices=FULL_CURRENCY_NAMES.keys())

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
    def create_key(cls, subscription_id=None):
        if subscription_id is None:
            subscription_id = cls.allocate_ids(1)[0]
        return ndb.Key(cls, subscription_id, namespace=NAMESPACE)

    @classmethod
    def list(cls):
        return cls.query()

    @classmethod
    def list_by_status(cls, status):
        return cls.query() \
            .filter(cls.status == status)

    @classmethod
    def fetch_page(cls, cursor=None, status=None):
        # type: (unicode) -> tuple[list[InvestmentAgreement], ndb.Cursor, bool]
        qry = cls.list_by_status(status) if status is not None else cls.list()
        return qry \
            .order(-cls.modification_time) \
            .fetch_page(cls.PER_PAGE, start_cursor=ndb.Cursor(urlsafe=cursor))
