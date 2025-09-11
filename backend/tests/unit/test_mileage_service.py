import asyncio
import uuid
from datetime import date

from sqlmodel import Session, create_engine, SQLModel

from app.models.mileage import MileageLog, MileageLogCreate, MileageLogUpdate
from app.models.user import User
from app.services.mileage_service import MileageService
from app.core.config import settings


def _build_service() -> MileageService:
    engine = create_engine("sqlite://")
    session = Session(engine)
    return MileageService(session=session)


def _build_user() -> User:
    return User(id=uuid.uuid4(), email="test@example.com", hashed_password="x")


def test_calculate_reimbursement_with_explicit_rate():
    service = _build_service()
    user = _build_user()
    result = asyncio.run(
        service._calculate_reimbursement(distance=10, rate=0.5, current_user=user)
    )
    assert result == 5.0


def test_calculate_reimbursement_with_default_rate(monkeypatch):
    service = _build_service()
    user = _build_user()
    monkeypatch.setattr(
        settings.__class__, "DEFAULT_MILEAGE_REIMBURSEMENT_RATE", 0.3, raising=False
    )
    result = asyncio.run(
        service._calculate_reimbursement(distance=10, rate=None, current_user=user)
    )
    assert result == 3.0


def test_create_mileage_log_persists_and_calculates():
    engine = create_engine("sqlite://")
    SQLModel.metadata.create_all(engine)
    session = Session(engine)
    service = MileageService(session=session)
    user = _build_user()
    object.__setattr__(settings, "DEFAULT_MILEAGE_REIMBURSEMENT_RATE", 0.5)
    log_in = MileageLogCreate(user_id=user.id, distance=10, date=date.today())

    created = asyncio.run(service.create_mileage_log(log_in=log_in, current_user=user))

    assert created.reimbursement_amount == 5.0


def test_get_mileage_logs_by_user_builds_filters():
    class Repo:
        async def get_multi(self, *, filters, skip, limit, sort_by, sort_desc):
            self.captured = filters
            return []

    service = MileageService(session=Session(create_engine("sqlite://")))
    repo = Repo()
    service.mileage_repo = repo
    user = _build_user()

    asyncio.run(
        service.get_mileage_logs_by_user(
            current_user=user, start_date=date(2024, 1, 1), purpose="biz"
        )
    )

    assert repo.captured["user_id"] == user.id
    assert repo.captured["date__gte"] == date(2024, 1, 1)
    assert repo.captured["purpose"] == "biz"


def test_update_mileage_log_recalculates():
    user = _build_user()
    log = MileageLog(
        id=uuid.uuid4(),
        user_id=user.id,
        distance=5,
        reimbursement_rate=0.5,
        reimbursement_amount=2.5,
    )

    class Repo:
        async def get(self, *, id):
            return log

    class SessionStub:
        def add(self, obj):
            pass

        def commit(self):
            pass

        def refresh(self, obj):
            pass

    service = MileageService(session=SessionStub())
    service.mileage_repo = Repo()

    updated = asyncio.run(
        service.update_mileage_log(
            log_id=log.id,
            log_in=MileageLogUpdate(distance=10),
            current_user=user,
        )
    )

    assert updated.distance == 10
    assert updated.reimbursement_amount == 5.0


def test_delete_mileage_log_removes_log():
    user = _build_user()
    log = MileageLog(id=uuid.uuid4(), user_id=user.id, distance=5)

    class Repo:
        async def get(self, *, id):
            return log

        async def delete(self, *, id):
            self.deleted = True
            return log

    service = MileageService(session=Session(create_engine("sqlite://")))
    repo = Repo()
    service.mileage_repo = repo

    deleted = asyncio.run(service.delete_mileage_log(log_id=log.id, current_user=user))

    assert deleted == log
    assert repo.deleted
