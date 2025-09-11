import datetime

from app.services.order_service_functions import (
    apply_discount,
    calculate_delivery_fee,
    calculate_order_tax,
    calculate_order_total,
    get_order_by_id,
    get_order_items,
    cancel_order,
    get_orders_by_date_range,
    update_order_status,
    validate_order_data,
)


def test_calculate_order_total():
    items = [
        {"quantity": 2, "unit_price": 3.5},
        {"quantity": 1, "unit_price": 4.0},
    ]
    assert calculate_order_total(items) == 11.0


def test_calculate_order_total_empty():
    assert calculate_order_total([]) == 0


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


class DummySession:
    def __init__(self, order=None, items=None):
        self.order = order
        self.items = items or []

    def get(self, model, id):
        return self.order

    def exec(self, statement):
        class Result:
            def __init__(self, items):
                self._items = items

            def all(self):
                return self._items

        return Result(self.items)

    def commit(self):
        pass

    def refresh(self, obj):
        pass


def test_get_order_by_id():
    order = object()
    session = DummySession(order=order)
    assert get_order_by_id("123", session) is order


def test_get_order_items():
    items = [object()]
    session = DummySession(items=items)
    assert get_order_items("123", session) == items


def test_cancel_order_updates_status():
    class Order:
        def __init__(self):
            self.status = "pending"

    order = Order()
    session = DummySession(order=order)
    result = cancel_order("123", session)
    assert result.status == "canceled"


def test_update_order_status():
    class Order:
        def __init__(self):
            self.status = "pending"

    order = Order()
    session = DummySession(order=order)
    result = update_order_status("123", "shipped", session)
    assert result.status == "shipped"


def test_get_orders_by_date_range():
    from datetime import datetime, timedelta, timezone

    items = [object()]
    session = DummySession(items=items)
    start = datetime.now(timezone.utc) - timedelta(days=1)
    end = datetime.now(timezone.utc) + timedelta(days=1)
    assert get_orders_by_date_range(start, end, session) == items
