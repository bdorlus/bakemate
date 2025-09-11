import asyncio
from uuid import uuid4

from sqlmodel import SQLModel, Session, create_engine

from app.models.user import UserCreate
from app.services.user_service import UserService


def _build_service():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(engine)
    session = Session(engine)
    return UserService(session=session), session


def test_create_and_get_user():
    service, _ = _build_service()
    user_create = UserCreate(email="alice@example.com", password="secret")
    user = asyncio.run(service.create_user(user_create))

    fetched_email = asyncio.run(service.get_user_by_email("alice@example.com"))
    fetched_id = asyncio.run(service.get_user_by_id(user.id))

    assert fetched_email.id == user.id == fetched_id.id
    assert user.hashed_password != "secret"


def test_authenticate_user():
    service, _ = _build_service()
    user_create = UserCreate(email="bob@example.com", password="topsecret")
    asyncio.run(service.create_user(user_create))

    assert asyncio.run(service.authenticate_user("bob@example.com", "topsecret"))
    assert asyncio.run(service.authenticate_user("bob@example.com", "wrong")) is None


def test_verify_user_email():
    service, session = _build_service()
    user_create = UserCreate(email="carol@example.com", password="pass")
    user = asyncio.run(service.create_user(user_create))

    user.is_active = False
    session.add(user)
    session.commit()
    session.refresh(user)

    verified = asyncio.run(service.verify_user_email(user.id))
    assert verified and verified.is_active


def test_send_verification_email(capsys):
    service, _ = _build_service()
    user_id = uuid4()
    asyncio.run(
        service.send_verification_email(
            "test@example.com", user_id=user_id, token="abc"
        )
    )
    out = capsys.readouterr().out
    assert str(user_id) in out
