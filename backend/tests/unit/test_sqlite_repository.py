import asyncio
from uuid import UUID, uuid4
from unittest.mock import patch

from sqlmodel import Field, SQLModel, create_engine

from app.repositories.sqlite_adapter import SQLiteRepository


class Item(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    user_id: UUID


class ItemCreate(SQLModel):
    name: str
    user_id: UUID


def test_sqlite_repository_crud_operations():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False})
    SQLModel.metadata.create_all(engine)
    with patch("app.repositories.sqlite_adapter.engine", engine):
        with patch(
            "app.repositories.sqlite_adapter.jsonable_encoder",
            lambda x: x.model_dump(),
        ):
            repo = SQLiteRepository(Item)
            user_id = uuid4()
            item_in = ItemCreate(name="Test", user_id=user_id)
            created = asyncio.run(repo.create(obj_in=item_in))
            fetched = asyncio.run(repo.get(id=created.id))
            assert fetched.name == "Test"
            updated = asyncio.run(
                repo.update(db_obj=created, obj_in={"name": "Updated"})
            )
            assert updated.name == "Updated"
            by_attr = asyncio.run(
                repo.get_by_attribute(attribute_name="name", attribute_value="Updated")
            )
            assert by_attr.id == created.id
            multi = asyncio.run(repo.get_multi())
            assert len(multi) == 1
            multi_attr = asyncio.run(
                repo.get_multi_by_attribute(
                    attribute_name="user_id", attribute_value=user_id
                )
            )
            assert len(multi_attr) == 1
            deleted = asyncio.run(repo.delete(id=created.id))
            assert deleted.id == created.id
            assert asyncio.run(repo.get(id=created.id)) is None
