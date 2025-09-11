import asyncio
from types import SimpleNamespace
from uuid import uuid4

from app.models.contact import Contact
from app.models.user import User
from app.services.marketing.marketing_service import (
    MarketingSegment,
    MarketingService,
)


class StubExecResult:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return self._rows


class SeqSession:
    def __init__(self, results):
        self._results = list(results)

    def exec(self, *_args, **_kwargs):
        return StubExecResult(self._results.pop(0))


def test_get_contacts_for_top_customers_segment():
    user = User(id=uuid4(), email="baker@example.com", hashed_password="x")
    contact = Contact(id=uuid4(), user_id=user.id, email="c@example.com")
    session = SeqSession(
        [
            [SimpleNamespace(customer_email="c@example.com")],
            [contact],
        ]
    )

    service = MarketingService(session=session)
    contacts = asyncio.run(
        service.get_contacts_for_segment(
            segment_type=MarketingSegment.TOP_CUSTOMERS, current_user=user
        )
    )

    assert contacts == [contact]


def test_send_campaign_to_segment_dispatches_email():
    user = User(id=uuid4(), email="baker@example.com", hashed_password="x")
    contact = Contact(id=uuid4(), user_id=user.id, email="c@example.com")
    session = SeqSession(
        [
            [SimpleNamespace(customer_email="c@example.com")],
            [contact],
        ]
    )
    service = MarketingService(session=session)

    sent = []

    class StubEmailService:
        async def send_email(
            self, *, to_email, subject_template, html_template, environment
        ):
            sent.append(to_email)

    service.email_service = StubEmailService()

    result = asyncio.run(
        service.send_campaign_to_segment(
            segment_type=MarketingSegment.TOP_CUSTOMERS,
            subject="Hi",
            html_content="<p>Hi</p>",
            current_user=user,
        )
    )

    assert sent == [contact.email]
    assert result["sent_count"] == 1


def test_get_basic_campaign_template_renders_content():
    service = MarketingService(session=SeqSession([]))

    html = service.get_basic_campaign_template(
        title="Title",
        body_paragraph="Body",
        cta_text="Click",
        cta_url="http://example.com",
        shop_name="BakeMate",
    )

    assert "Title" in html
    assert "Click" in html


def test_get_contacts_for_dormant_customers_segment():
    user = User(id=uuid4(), email="baker@example.com", hashed_password="x")
    contact = Contact(id=uuid4(), user_id=user.id, email="old@example.com")
    session = SeqSession(
        [
            ["old@example.com", "recent@example.com"],
            ["recent@example.com"],
            [contact],
        ]
    )
    service = MarketingService(session=session)
    contacts = asyncio.run(
        service.get_contacts_for_segment(
            segment_type=MarketingSegment.DORMANT_CUSTOMERS, current_user=user
        )
    )

    assert contacts == [contact]
