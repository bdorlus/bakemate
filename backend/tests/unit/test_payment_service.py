from datetime import datetime
from app.services.payment_service import calculate_scheduled_payment


def test_calculate_full_payment():
    expected_date = datetime.now().date()
    amount, due_date = calculate_scheduled_payment(100, "full", expected_date)
    assert amount == 100
    assert due_date == expected_date


def test_calculate_deposit_payment():
    delivery_date = datetime(2025, 1, 1).date()
    amount, due_date = calculate_scheduled_payment(200, "deposit", delivery_date)
    assert amount == 50
    assert due_date == delivery_date


def test_calculate_split_payment():
    delivery_date = datetime(2025, 1, 1).date()
    amount, due_date = calculate_scheduled_payment(200, "split", delivery_date)
    assert amount == 100
    assert due_date == delivery_date


def test_calculate_default_payment():
    expected_date = datetime.now().date()
    amount, due_date = calculate_scheduled_payment(150, "unknown", expected_date)
    assert amount == 150
    assert due_date == expected_date
