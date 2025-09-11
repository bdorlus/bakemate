import asyncio
from datetime import datetime, timedelta, date
from uuid import uuid4

from app.models.task import Task, TaskStatus, TaskCreate
from app.models.order import Order, OrderStatus
from app.models.user import User
from app.services.task_service import TaskService


class StubExecResult:
    def __init__(self, rows):
        self._rows = rows

    def all(self):
        return self._rows


class StubSession:
    def __init__(self, rows):
        self._rows = rows

    def exec(self, *_args, **_kwargs):
        return StubExecResult(self._rows)


def test_weekly_digest_sends_email():
    user_id = uuid4()
    user = User(id=user_id, email="baker@example.com", hashed_password="x")

    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())
    due_dt = datetime.combine(start_of_week + timedelta(days=1), datetime.min.time())

    task = Task(
        id=uuid4(),
        user_id=user_id,
        title="Prepare icing",
        status=TaskStatus.PENDING,
        due_date=due_dt,
        priority=0,
    )
    order = Order(
        id=uuid4(),
        user_id=user_id,
        order_number="O1",
        due_date=due_dt,
        status=OrderStatus.IN_PROGRESS,
        order_date=due_dt,
    )

    service = TaskService(session=StubSession([order]))

    async def fake_get_tasks_by_user(*_args, **_kwargs):
        return [task]

    sent = {}

    async def fake_send_email_with_template_async(
        *, email_to, subject_template_str, html_template_name, environment
    ):
        sent["email"] = email_to

    service.get_tasks_by_user = fake_get_tasks_by_user
    service.email_service.send_email_with_template_async = (
        fake_send_email_with_template_async
    )

    asyncio.run(service.send_weekly_digest_email(user))

    assert sent["email"] == user.email


def test_weekly_digest_skips_when_empty():
    user = User(id=uuid4(), email="baker@example.com", hashed_password="x")

    service = TaskService(session=StubSession([]))

    async def fake_get_tasks_by_user(*_args, **_kwargs):
        return []

    called = {}

    async def fake_send_email_with_template_async(*_args, **_kwargs):
        called["called"] = True

    service.get_tasks_by_user = fake_get_tasks_by_user
    service.email_service.send_email_with_template_async = (
        fake_send_email_with_template_async
    )

    asyncio.run(service.send_weekly_digest_email(user))

    assert "called" not in called


def test_create_and_get_task_by_id():
    user_id = uuid4()
    user = User(id=user_id, email="baker@example.com", hashed_password="x")
    task_in = TaskCreate(user_id=user_id, title="Mix batter")
    created_task = Task(id=uuid4(), user_id=user_id, title="Mix batter")

    class StubRepo:
        async def create(self, obj_in):
            return created_task

        async def get(self, id):
            return created_task

    service = TaskService(session=StubSession([]))
    service.task_repo = StubRepo()

    result = asyncio.run(service.create_task(task_in=task_in, current_user=user))
    assert result == created_task

    fetched = asyncio.run(
        service.get_task_by_id(task_id=created_task.id, current_user=user)
    )
    assert fetched == created_task


def test_get_task_by_id_wrong_user_returns_none():
    user = User(id=uuid4(), email="baker@example.com", hashed_password="x")
    other_task = Task(id=uuid4(), user_id=uuid4(), title="Decorate")

    class StubRepo:
        async def get(self, id):
            return other_task

    service = TaskService(session=StubSession([]))
    service.task_repo = StubRepo()

    fetched = asyncio.run(
        service.get_task_by_id(task_id=other_task.id, current_user=user)
    )
    assert fetched is None
