import asyncio
from uuid import uuid4

import pytest
from fastapi import HTTPException, status

from app.models.shop.shop_configuration import (
    ShopConfiguration,
    ShopConfigurationCreate,
    ShopConfigurationUpdate,
    ShopProduct,
    ShopStatus,
)
from app.models.user import User
from app.services.shop.shop_service import ShopService
from app.core.config import settings


class StubExecResult:
    def __init__(self, row):
        self._row = row

    def first(self):
        return self._row


class StubSession:
    def __init__(self, row=None):
        self._row = row

    def exec(self, *_args, **_kwargs):
        return StubExecResult(self._row)

    def add(self, *_args, **_kwargs):
        pass

    def commit(self):
        pass

    def refresh(self, *_args, **_kwargs):
        pass


def test_get_shop_configuration_by_user():
    user_id = uuid4()
    shop = ShopConfiguration(id=uuid4(), user_id=user_id, shop_slug="myslug")
    service = ShopService(session=StubSession(shop))
    current_user = User(id=user_id, email="baker@example.com", hashed_password="x")

    result = asyncio.run(
        service.get_shop_configuration_by_user(current_user=current_user)
    )

    assert result == shop


def test_get_embed_snippet_checks_owner():
    user_id = uuid4()
    shop = ShopConfiguration(id=uuid4(), user_id=user_id, shop_slug="slug")
    service = ShopService(session=StubSession())
    object.__setattr__(settings, "SERVER_HOST", "http://testserver")

    async def fake_get_shop_configuration_by_slug(*, shop_slug):
        return shop

    service.get_shop_configuration_by_slug = fake_get_shop_configuration_by_slug

    snippet = asyncio.run(
        service.get_embed_snippet(
            shop_slug="slug",
            current_user=User(id=user_id, email="a@b.com", hashed_password="x"),
        )
    )
    assert "slug" in snippet

    empty = asyncio.run(
        service.get_embed_snippet(
            shop_slug="slug",
            current_user=User(id=uuid4(), email="c@d.com", hashed_password="y"),
        )
    )
    assert empty == ""


def test_create_shop_configuration_rejects_duplicate_slug():
    user_id = uuid4()
    existing = ShopConfiguration(id=uuid4(), user_id=user_id, shop_slug="dup")
    service = ShopService(session=StubSession(existing))
    shop_in = ShopConfigurationCreate(user_id=user_id, shop_slug="dup")
    current_user = User(id=user_id, email="baker@example.com", hashed_password="x")

    with pytest.raises(HTTPException) as exc:
        asyncio.run(
            service.create_shop_configuration(
                shop_config_in=shop_in, current_user=current_user
            )
        )

    assert exc.value.status_code == status.HTTP_400_BAD_REQUEST


def test_create_shop_configuration_persists_and_returns():
    user_id = uuid4()

    class Session:
        def exec(self, *_args, **_kwargs):
            return StubExecResult(None)

        def add(self, obj):
            self.added = obj

        def commit(self):
            pass

        def refresh(self, obj):
            pass

    session = Session()
    service = ShopService(session=session)
    shop_in = ShopConfigurationCreate(user_id=user_id, shop_slug="fresh")
    current_user = User(id=user_id, email="baker@example.com", hashed_password="x")

    created = asyncio.run(
        service.create_shop_configuration(
            shop_config_in=shop_in, current_user=current_user
        )
    )

    assert created.shop_slug == "fresh"
    assert session.added is created


def test_get_shop_configuration_by_slug_returns_config():
    shop = ShopConfiguration(id=uuid4(), user_id=uuid4(), shop_slug="slug")
    service = ShopService(session=StubSession(shop))

    result = asyncio.run(service.get_shop_configuration_by_slug(shop_slug="slug"))

    assert result == shop


def test_get_public_shop_view_returns_products():
    product = ShopProduct(recipe_id=uuid4(), name="Bread", price=3.0)
    shop = ShopConfiguration(
        id=uuid4(),
        user_id=uuid4(),
        shop_slug="slug",
        status=ShopStatus.ACTIVE,
        allow_online_orders=True,
        shop_name="Bakery",
    )
    shop.products_json = [product.dict()]
    service = ShopService(session=StubSession())

    async def fake_get_shop_configuration_by_slug(*, shop_slug):
        return shop

    service.get_shop_configuration_by_slug = fake_get_shop_configuration_by_slug

    public = asyncio.run(service.get_public_shop_view(shop_slug="slug"))

    assert public.products[0].name == "Bread"
    assert public.shop_name == "Bakery"


def test_update_shop_configuration_changes_name():
    user_id = uuid4()
    shop = ShopConfiguration(
        id=uuid4(), user_id=user_id, shop_slug="slug", shop_name="Old"
    )

    class Session:
        def get(self, model, id):
            return shop

        def add(self, obj):
            pass

        def commit(self):
            pass

        def refresh(self, obj):
            pass

    service = ShopService(session=Session())

    updated = asyncio.run(
        service.update_shop_configuration(
            shop_config_id=shop.id,
            shop_config_in=ShopConfigurationUpdate(shop_name="New"),
            current_user=User(
                id=user_id, email="baker@example.com", hashed_password="x"
            ),
        )
    )

    assert updated.shop_name == "New"


def test_delete_shop_configuration_removes_config():
    user_id = uuid4()
    shop = ShopConfiguration(id=uuid4(), user_id=user_id, shop_slug="slug")

    class Session:
        def __init__(self):
            self.deleted = False

        def get(self, model, id):
            return shop

        def delete(self, obj):
            self.deleted = True

        def commit(self):
            pass

    session = Session()
    service = ShopService(session=session)

    result = asyncio.run(
        service.delete_shop_configuration(
            shop_config_id=shop.id,
            current_user=User(id=user_id, email="a@b.com", hashed_password="x"),
        )
    )

    assert result == shop
    assert session.deleted
