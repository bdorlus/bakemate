import asyncio
import importlib
from datetime import date
from io import BytesIO
from uuid import uuid4
from unittest.mock import AsyncMock, MagicMock

import pytest
from starlette.datastructures import UploadFile

from app.models.expense import (
    Expense,
    ExpenseCategory,
    ExpenseCreate,
    ExpenseUpdate,
)
from app.models.user import User


def _load_service(monkeypatch, tmp_path):
    monkeypatch.setenv("APP_FILES_DIR", str(tmp_path))
    module = importlib.reload(importlib.import_module("app.services.expense_service"))

    class _UUID:
        @staticmethod
        def uuid4():
            return uuid4()

    monkeypatch.setattr(module, "UUID", _UUID)
    return module.ExpenseService


def test_create_expense_persists_to_session(monkeypatch, tmp_path):
    ExpenseService = _load_service(monkeypatch, tmp_path)
    session = MagicMock()
    service = ExpenseService(session=session)
    user = User(id=uuid4(), email="user@example.com", hashed_password="x")
    expense_in = ExpenseCreate(
        user_id=user.id, date=date.today(), description="Flour", amount=5.0
    )

    result = asyncio.run(
        service.create_expense(expense_in=expense_in, current_user=user)
    )

    session.add.assert_called_once()
    session.commit.assert_called_once()
    session.refresh.assert_called_once_with(result)
    assert result.user_id == user.id
    assert result.amount == 5.0


def test_get_expense_by_id_enforces_user(monkeypatch, tmp_path):
    ExpenseService = _load_service(monkeypatch, tmp_path)
    service = ExpenseService(session=MagicMock())
    service.expense_repo = AsyncMock()
    user = User(id=uuid4(), email="user@example.com", hashed_password="x")

    expense = Expense(
        user_id=user.id, date=date.today(), description="Coffee", amount=3.0
    )
    service.expense_repo.get.return_value = expense
    result = asyncio.run(
        service.get_expense_by_id(expense_id=uuid4(), current_user=user)
    )
    assert result is expense

    other_expense = Expense(
        user_id=uuid4(), date=date.today(), description="Tea", amount=2.0
    )
    service.expense_repo.get.return_value = other_expense
    result_none = asyncio.run(
        service.get_expense_by_id(expense_id=uuid4(), current_user=user)
    )
    assert result_none is None


def test_create_expense_saves_receipt(monkeypatch, tmp_path):
    ExpenseService = _load_service(monkeypatch, tmp_path)
    session = MagicMock()
    service = ExpenseService(session=session)
    user = User(id=uuid4(), email="user@example.com", hashed_password="x")
    expense_in = ExpenseCreate(
        user_id=user.id,
        date=date.today(),
        description="Sugar",
        amount=2.5,
        category=ExpenseCategory.SUPPLIES,
    )
    upload = UploadFile(filename="r.txt", file=BytesIO(b"data"))

    result = asyncio.run(
        service.create_expense(
            expense_in=expense_in, current_user=user, receipt_file=upload
        )
    )

    session.add.assert_called_once()
    session.commit.assert_called_once()
    assert result.receipt_filename == "r.txt"
    assert result.receipt_s3_key is not None


def test_get_expenses_by_user_builds_filters(monkeypatch, tmp_path):
    ExpenseService = _load_service(monkeypatch, tmp_path)
    service = ExpenseService(session=MagicMock())
    service.expense_repo = AsyncMock()
    service.expense_repo.get_multi = AsyncMock(return_value=[])
    user = User(id=uuid4(), email="u@example.com", hashed_password="x")
    start = date(2024, 1, 1)
    end = date(2024, 12, 31)

    asyncio.run(
        service.get_expenses_by_user(
            current_user=user,
            category=ExpenseCategory.FEES,
            start_date=start,
            end_date=end,
            skip=5,
            limit=10,
        )
    )

    service.expense_repo.get_multi.assert_awaited_once()
    call_args = service.expense_repo.get_multi.call_args.kwargs
    assert call_args["filters"]["user_id"] == user.id
    assert call_args["filters"]["category"] == ExpenseCategory.FEES
    assert call_args["filters"]["date__gte"] == start
    assert call_args["filters"]["date__lte"] == end
    assert call_args["skip"] == 5
    assert call_args["limit"] == 10
    assert call_args["sort_by"] == "date"


def test_update_expense_replaces_receipt(monkeypatch, tmp_path):
    ExpenseService = _load_service(monkeypatch, tmp_path)
    session = MagicMock()
    service = ExpenseService(session=session)
    user = User(id=uuid4(), email="user@example.com", hashed_password="x")

    old_file = tmp_path / "old.txt"
    old_file.write_text("old")
    expense = Expense(
        id=uuid4(),
        user_id=user.id,
        date=date.today(),
        description="Coffee",
        amount=3.0,
        receipt_s3_key=str(old_file),
    )
    service.expense_repo = AsyncMock()
    service.expense_repo.get = AsyncMock(return_value=expense)

    update_in = ExpenseUpdate(description="Latte", amount=4.0)
    new_upload = UploadFile(filename="new.txt", file=BytesIO(b"new"))

    result = asyncio.run(
        service.update_expense(
            expense_id=expense.id,
            expense_in=update_in,
            current_user=user,
            receipt_file=new_upload,
        )
    )

    session.add.assert_called_once()
    session.commit.assert_called_once()
    assert result.description == "Latte"
    assert not old_file.exists()
