import asyncio
import uuid
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from fastapi import HTTPException

from app.models.user import User
from app.models.order import OrderStatus, Order
from app.models.ingredient import Ingredient
from app.models.recipe import Recipe
from app.services.inventory.inventory_service import InventoryService


def _build_service(session: MagicMock) -> InventoryService:
    return InventoryService(session=session)


def test_update_ingredient_stock_increments_quantity():
    ingredient_id = uuid.uuid4()
    user_id = uuid.uuid4()

    ingredient = MagicMock()
    ingredient.id = ingredient_id
    ingredient.user_id = user_id
    ingredient.quantity_on_hand = Decimal("10")

    session = MagicMock()
    session.get.return_value = ingredient

    service = _build_service(session)

    with patch.object(
        InventoryService, "check_and_notify_low_stock", new=AsyncMock()
    ) as mock_check:
        result = asyncio.run(service.update_ingredient_stock(ingredient_id, 5, user_id))

    assert result.quantity_on_hand == Decimal("15")
    session.add.assert_called_once_with(ingredient)
    session.commit.assert_called_once()
    mock_check.assert_awaited_once_with(ingredient, user_id)


def test_update_ingredient_stock_returns_none_for_missing():
    session = MagicMock()
    session.get.return_value = None
    service = _build_service(session)
    result = asyncio.run(service.update_ingredient_stock(uuid.uuid4(), 5, uuid.uuid4()))
    assert result is None


def test_deduct_stock_for_order_wrong_status_returns_false():
    order = MagicMock()
    order.user_id = uuid.uuid4()
    order.status = OrderStatus.INQUIRY
    order.items = []

    session = MagicMock()
    session.get.return_value = order

    service = _build_service(session)

    result = asyncio.run(service.deduct_stock_for_order(uuid.uuid4(), order.user_id))

    assert result is False


def test_run_low_stock_check_for_user_returns_low_items():
    user = User(id=uuid.uuid4(), email="test@example.com", hashed_password="x")

    low = MagicMock()
    low.id = uuid.uuid4()
    low.name = "Flour"
    low.quantity_on_hand = Decimal("2")
    low.low_stock_threshold = Decimal("5")
    low.unit = "kg"

    ok = MagicMock()
    ok.id = uuid.uuid4()
    ok.name = "Sugar"
    ok.quantity_on_hand = Decimal("10")
    ok.low_stock_threshold = Decimal("5")
    ok.unit = "kg"

    exec_mock = MagicMock()
    exec_mock.all.return_value = [low, ok]

    session = MagicMock()
    session.exec.return_value = exec_mock

    service = _build_service(session)

    with patch.object(InventoryService, "check_and_notify_low_stock", new=AsyncMock()):
        result = asyncio.run(service.run_low_stock_check_for_user(user))

    assert len(result) == 1
    assert result[0]["name"] == "Flour"


def test_deduct_stock_for_order_deducts_ingredients():
    user_id = uuid.uuid4()

    ingredient = MagicMock()
    ingredient.id = uuid.uuid4()
    ingredient.user_id = user_id
    ingredient.quantity_on_hand = Decimal("10")

    link = MagicMock()
    link.ingredient_id = ingredient.id
    link.quantity_used = Decimal("2")

    recipe = MagicMock()
    recipe.id = uuid.uuid4()
    recipe.user_id = user_id

    order_item = MagicMock()
    order_item.recipe_id = recipe.id
    order_item.quantity = 1

    order = MagicMock()
    order.user_id = user_id
    order.status = OrderStatus.CONFIRMED
    order.items = [order_item]

    def get_side_effect(model, obj_id):
        if model is Order and obj_id == "order-id":
            return order
        if model is Recipe and obj_id == recipe.id:
            return recipe
        if model is Ingredient and obj_id == ingredient.id:
            return ingredient
        return None

    exec_mock = MagicMock()
    exec_mock.all.return_value = [link]

    session = MagicMock()
    session.get.side_effect = get_side_effect
    session.exec.return_value = exec_mock

    service = _build_service(session)

    with patch.object(InventoryService, "check_and_notify_low_stock", new=AsyncMock()):
        result = asyncio.run(service.deduct_stock_for_order("order-id", user_id))

    assert result is True
    assert ingredient.quantity_on_hand == Decimal("8")
    session.add.assert_called_with(ingredient)
    session.commit.assert_called_once()


def test_check_and_notify_low_stock_missing_config(monkeypatch):
    user_id = uuid.uuid4()
    ingredient = Ingredient(
        id=uuid.uuid4(),
        user_id=user_id,
        name="Flour",
        unit="kg",
        quantity_on_hand=Decimal("1"),
        low_stock_threshold=Decimal("5"),
    )
    user = User(id=user_id, email="baker@example.com", hashed_password="x")

    session = MagicMock()
    session.get.return_value = user

    service = _build_service(session)

    monkeypatch.setattr(
        "app.services.inventory.inventory_service.settings.SENDGRID_API_KEY",
        None,
    )
    monkeypatch.setattr(
        "app.services.inventory.inventory_service.settings.EMAIL_FROM",
        None,
    )

    asyncio.run(service.check_and_notify_low_stock(ingredient, user_id))
    session.get.assert_called_once_with(User, user_id)


def test_adjust_stock_api_handler_calls_update():
    ingredient_id = uuid.uuid4()
    user = User(id=uuid.uuid4(), email="", hashed_password="x")
    ingredient = MagicMock()

    service = _build_service(MagicMock())

    with patch.object(
        InventoryService,
        "update_ingredient_stock",
        new=AsyncMock(return_value=ingredient),
    ) as mock_update:
        result = asyncio.run(service.adjust_stock_api_handler(ingredient_id, 5, user))

    assert result is ingredient
    mock_update.assert_awaited_once()


def test_adjust_stock_api_handler_raises_for_missing():
    service = _build_service(MagicMock())
    with patch.object(
        InventoryService, "update_ingredient_stock", new=AsyncMock(return_value=None)
    ):
        with pytest.raises(HTTPException):
            asyncio.run(
                service.adjust_stock_api_handler(
                    uuid.uuid4(),
                    5,
                    User(id=uuid.uuid4(), email="", hashed_password="x"),
                )
            )
