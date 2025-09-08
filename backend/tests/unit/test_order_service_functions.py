import datetime

from app.services.order_service_functions import (
    apply_discount,
    calculate_delivery_fee,
    calculate_order_tax,
    calculate_order_total,
    validate_order_data,
)


def test_calculate_order_total():
    items = [
        {"quantity": 2, "unit_price": 3.5},
        {"quantity": 1, "unit_price": 4.0},
    ]
    assert calculate_order_total(items) == 11.0


def test_apply_discount_percentage():
    assert apply_discount(100.0, "percentage", 10.0) == 90.0


def test_apply_discount_fixed():
    assert apply_discount(100.0, "fixed", 15.0) == 85.0


def test_apply_discount_invalid_type():
    assert apply_discount(100.0, "unknown", 5.0) == 100.0


def test_calculate_order_tax():
    assert calculate_order_tax(100.0, 0.07) == 7.0


def test_calculate_delivery_fee():
    assert calculate_delivery_fee(10.0) == 10.0


def test_validate_order_data():
    valid = {
        "customer_name": "Alice",
        "customer_email": "alice@example.com",
        "delivery_date": datetime.date.today(),
        "delivery_address": "123 St",
        "items": [
            {"recipe_id": "r1", "quantity": 1, "unit_price": 2.0},
        ],
    }
    assert validate_order_data(valid)

    invalid = {**valid, "items": []}
    assert not validate_order_data(invalid)
