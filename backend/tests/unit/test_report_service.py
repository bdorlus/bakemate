import asyncio
import uuid
from datetime import date
from decimal import Decimal
from enum import Enum
from types import SimpleNamespace
from unittest.mock import MagicMock

from app.models.ingredient import Ingredient
from app.models.recipe import Recipe
from app.models.user import User
from app.models.order import OrderItem
from app.services.report_service import ReportService


class Unit(str, Enum):
    kg = "kg"


def _build_service(results):
    session = MagicMock()
    exec_result = MagicMock()
    exec_result.all.return_value = results
    session.exec.return_value = exec_result
    return ReportService(session=session)


def _build_user() -> User:
    return User(id=uuid.uuid4(), email="test@example.com", hashed_password="x")


def test_generate_low_stock_report_json():
    user = _build_user()
    low = Ingredient(
        name="Flour",
        unit=Unit.kg,
        user_id=user.id,
        cost=1.0,
        quantity_on_hand=1,
        low_stock_threshold=5,
    )
    service = _build_service([low])

    report = asyncio.run(service.generate_low_stock_report(current_user=user))
    assert len(report) == 1
    assert report[0]["ingredient_name"] == "Flour"
    assert report[0]["shortfall"] == 4.0


def test_generate_low_stock_report_csv_and_stream():
    user = _build_user()
    ingredient = Ingredient(
        name="Butter",
        unit=Unit.kg,
        user_id=user.id,
        cost=1.0,
        quantity_on_hand=2,
        low_stock_threshold=3,
    )
    service = _build_service([ingredient])

    csv_io = asyncio.run(
        service.generate_low_stock_report(current_user=user, output_format="csv")
    )
    csv_content = csv_io.getvalue().splitlines()
    assert csv_content[0].startswith("ingredient_name,unit")
    assert "Butter" in csv_content[1]

    response = service.stream_csv_report(csv_io, "low_stock.csv")
    assert (
        response.headers["Content-Disposition"] == "attachment; filename=low_stock.csv"
    )


def test_generate_sales_by_product_report_json_and_csv():
    user = _build_user()
    row = SimpleNamespace(
        product_name="Cake",
        total_quantity_sold=5,
        total_revenue_generated=Decimal("20"),
    )
    service = _build_service([row])

    report = asyncio.run(
        service.generate_sales_by_product_report(
            current_user=user,
            start_date=date.today(),
            end_date=date.today(),
        )
    )
    assert report[0]["product_name"] == "Cake"
    assert report[0]["total_quantity_sold"] == 5
    assert report[0]["total_revenue_generated"] == 20.0

    csv_io = asyncio.run(
        service.generate_sales_by_product_report(
            current_user=user,
            start_date=date.today(),
            end_date=date.today(),
            output_format="csv",
        )
    )
    csv_lines = csv_io.getvalue().splitlines()
    assert csv_lines[0].startswith("product_name,total_quantity_sold")
    assert "Cake" in csv_lines[1]


def test_generate_pdf_report_placeholder():
    service = _build_service([])
    pdf_bytes = asyncio.run(
        service.generate_pdf_report_placeholder("demo", {"foo": "bar"})
    )
    assert b"PDF generation for demo" in pdf_bytes


def _build_pl_service() -> ReportService:
    session = MagicMock()
    session.exec.side_effect = [
        MagicMock(scalar_one_or_none=MagicMock(return_value=Decimal("100"))),
        MagicMock(scalar_one_or_none=MagicMock(return_value=Decimal("30"))),
        MagicMock(scalar_one_or_none=MagicMock(return_value=Decimal("10"))),
        MagicMock(
            all=MagicMock(return_value=[(SimpleNamespace(value="rent"), Decimal("10"))])
        ),
    ]
    return ReportService(session=session)


def test_generate_profit_and_loss_report_json_and_csv():
    user = _build_user()
    service = _build_pl_service()
    setattr(Recipe, "cost_price", 0)
    setattr(OrderItem, "recipe_id", None)

    report = asyncio.run(
        service.generate_profit_and_loss_report(
            current_user=user,
            start_date=date.today(),
            end_date=date.today(),
        )
    )
    assert report["total_revenue"] == 100.0
    assert report["cost_of_goods_sold"] == 30.0
    assert report["gross_profit"] == 70.0
    assert report["operating_expenses"]["total"] == 10.0
    assert report["net_profit"] == 60.0

    service = _build_pl_service()
    csv_io = asyncio.run(
        service.generate_profit_and_loss_report(
            current_user=user,
            start_date=date.today(),
            end_date=date.today(),
            output_format="csv",
        )
    )
    csv_lines = csv_io.getvalue().splitlines()
    assert csv_lines[0].startswith("metric,amount")
    assert "Net Profit" in csv_lines[-1]
