import asyncio
from datetime import datetime, timedelta
from uuid import uuid4
from unittest.mock import AsyncMock, MagicMock

from app.models.calendar import CalendarEvent, CalendarEventCreate
from app.models.order import Order
from app.models.user import User
from app.services.calendar_service import CalendarService


def _build_user() -> User:
    return User(id=uuid4(), email="test@example.com", hashed_password="x")


def _build_service() -> CalendarService:
    return CalendarService(session=MagicMock())


def test_create_calendar_event_uses_repo_create():
    user = _build_user()
    service = _build_service()
    service.calendar_event_repo = AsyncMock()
    event_in = CalendarEventCreate(
        user_id=user.id,
        title="Meeting",
        start_datetime=datetime.utcnow(),
        end_datetime=datetime.utcnow() + timedelta(hours=1),
    )
    expected = CalendarEvent(
        user_id=user.id,
        title=event_in.title,
        start_datetime=event_in.start_datetime,
        end_datetime=event_in.end_datetime,
    )
    service.calendar_event_repo.create.return_value = expected

    result = asyncio.run(
        service.create_calendar_event(event_in=event_in, current_user=user)
    )

    service.calendar_event_repo.create.assert_awaited_once_with(obj_in=event_in)
    assert result is expected


def test_get_calendar_event_by_id_filters_by_user():
    user = _build_user()
    service = _build_service()
    service.calendar_event_repo = AsyncMock()

    event = CalendarEvent(
        user_id=user.id,
        title="Title",
        start_datetime=datetime.utcnow(),
        end_datetime=datetime.utcnow(),
    )
    service.calendar_event_repo.get.return_value = event
    result = asyncio.run(
        service.get_calendar_event_by_id(event_id=uuid4(), current_user=user)
    )
    assert result is event

    service.calendar_event_repo.get.return_value = CalendarEvent(
        user_id=uuid4(),
        title="Other",
        start_datetime=datetime.utcnow(),
        end_datetime=datetime.utcnow(),
    )
    result_none = asyncio.run(
        service.get_calendar_event_by_id(event_id=uuid4(), current_user=user)
    )
    assert result_none is None


def test_get_calendar_events_by_user():
    user = _build_user()
    service = _build_service()
    service.calendar_event_repo = AsyncMock()
    event = CalendarEvent(
        user_id=user.id,
        title="T",
        start_datetime=datetime.utcnow(),
        end_datetime=datetime.utcnow(),
    )
    service.calendar_event_repo.get_multi.return_value = [event]
    events = asyncio.run(
        service.get_calendar_events_by_user(
            current_user=user,
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=1),
        )
    )
    assert events == [event]


def test_update_calendar_event():
    user = _build_user()
    service = _build_service()
    service.calendar_event_repo = AsyncMock()
    db_event = CalendarEvent(
        id=uuid4(),
        user_id=user.id,
        title="Old",
        start_datetime=datetime.utcnow(),
        end_datetime=datetime.utcnow(),
    )
    service.calendar_event_repo.get.return_value = db_event
    service.calendar_event_repo.update.return_value = db_event
    result = asyncio.run(
        service.update_calendar_event(
            event_id=db_event.id,
            event_in=CalendarEventCreate(
                user_id=user.id,
                title="New",
                start_datetime=db_event.start_datetime,
                end_datetime=db_event.end_datetime,
            ),
            current_user=user,
        )
    )
    assert result.title == "Old"


def test_delete_calendar_event():
    user = _build_user()
    service = _build_service()
    service.calendar_event_repo = AsyncMock()
    db_event = CalendarEvent(
        id=uuid4(),
        user_id=user.id,
        title="Old",
        start_datetime=datetime.utcnow(),
        end_datetime=datetime.utcnow(),
    )
    service.calendar_event_repo.get.return_value = db_event
    service.calendar_event_repo.delete.return_value = db_event
    result = asyncio.run(
        service.delete_calendar_event(event_id=db_event.id, current_user=user)
    )
    assert result is db_event


def test_auto_populate_order_due_dates_creates_event():
    user = _build_user()
    session = MagicMock()
    session.exec.return_value.first.return_value = None
    service = CalendarService(session=session)
    service.create_calendar_event = AsyncMock()
    order = Order(
        id=uuid4(),
        user_id=user.id,
        order_number="123",
        due_date=datetime.utcnow(),
    )
    asyncio.run(service.auto_populate_order_due_dates(order=order, current_user=user))
    service.create_calendar_event.assert_awaited_once()


def test_sync_with_google_calendar():
    user = _build_user()
    service = _build_service()
    asyncio.run(service.sync_with_google_calendar(current_user=user))
