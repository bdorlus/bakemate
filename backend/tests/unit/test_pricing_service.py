import asyncio
from uuid import uuid4
from unittest.mock import AsyncMock, MagicMock, patch

from app.models.pricing_config import (
    PricingConfiguration,
    PricingConfigurationUpdate,
)
from app.models.user import User
from app.services.pricing_service import PricingService


def test_get_pricing_configuration_returns_config():
    session = MagicMock()
    user_id = uuid4()
    config = PricingConfiguration(
        user_id=user_id, hourly_rate=20.0, overhead_per_month=100.0
    )
    session.exec.return_value.first.return_value = config
    service = PricingService(session=session)
    user = User(id=user_id, email="user@example.com", hashed_password="x")

    result = asyncio.run(service.get_pricing_configuration(current_user=user))

    assert result is config


def test_create_or_update_pricing_configuration_updates_existing():
    session = MagicMock()
    repo = AsyncMock()
    user_id = uuid4()
    existing = PricingConfiguration(
        user_id=user_id, hourly_rate=25.0, overhead_per_month=100.0
    )
    updated = PricingConfiguration(
        user_id=user_id, hourly_rate=30.0, overhead_per_month=100.0
    )
    repo.update.return_value = updated
    with patch("app.services.pricing_service.SQLiteRepository", return_value=repo):
        service = PricingService(session=session)
    service.get_pricing_configuration = AsyncMock(return_value=existing)
    user = User(id=user_id, email="user@example.com", hashed_password="x")
    update_in = PricingConfigurationUpdate(hourly_rate=30.0)

    result = asyncio.run(
        service.create_or_update_pricing_configuration(
            config_in=update_in, current_user=user
        )
    )

    repo.update.assert_awaited_once_with(db_obj=existing, obj_in=update_in)
    assert result is updated


def test_create_or_update_pricing_configuration_creates_new():
    session = MagicMock()
    repo = AsyncMock()
    user_id = uuid4()
    new_config = PricingConfiguration(
        user_id=user_id, hourly_rate=40.0, overhead_per_month=100.0
    )
    repo.create.return_value = new_config
    with patch("app.services.pricing_service.SQLiteRepository", return_value=repo):
        service = PricingService(session=session)
    user = User(id=user_id, email="user@example.com", hashed_password="x")
    service.get_pricing_configuration = AsyncMock(return_value=None)
    update_in = PricingConfigurationUpdate(hourly_rate=40.0)

    result = asyncio.run(
        service.create_or_update_pricing_configuration(
            config_in=update_in, current_user=user
        )
    )

    repo.create.assert_awaited_once()
    create_call = repo.create.await_args
    assert create_call.kwargs["obj_in"].user_id == user.id
    assert result is new_config
