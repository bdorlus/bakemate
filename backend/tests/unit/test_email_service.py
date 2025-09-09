import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from app.core.config import settings
from app.services.email_service import EmailService


def test_send_email_async_skips_when_api_key_missing(monkeypatch):
    monkeypatch.setattr(settings, "SENDGRID_API_KEY", "YOUR_SENDGRID_API_KEY_HERE")
    service = EmailService()
    with patch("app.services.email_service.SendGridAPIClient") as mock_client:
        result = asyncio.run(
            service.send_email_async("to@example.com", "Subject", "<p>Body</p>")
        )
    mock_client.assert_not_called()
    assert result is True


def test_send_email_with_template_calls_send():
    service = EmailService()
    service.send_email_async = AsyncMock(return_value=True)
    environment = {"name": "Tester", "verification_link": "https://example.com"}
    result = asyncio.run(
        service.send_email_with_template_async(
            "to@example.com", "Hello {name}", "tpl.html", environment=environment
        )
    )
    assert result is True
    service.send_email_async.assert_awaited_once()
    args, kwargs = service.send_email_async.call_args
    assert kwargs["subject"] == "Hello Tester"
    assert environment["verification_link"] in kwargs["html_content"]


def test_send_email_with_template_defaults_environment():
    service = EmailService()
    service.send_email_async = AsyncMock(return_value=True)
    result = asyncio.run(
        service.send_email_with_template_async(
            "to@example.com", "Hello", "tpl.html", environment=None
        )
    )
    assert result is True
    service.send_email_async.assert_awaited_once()


def test_send_email_with_template_reset_password():
    service = EmailService()
    service.send_email_async = AsyncMock(return_value=True)
    env = {"reset_password_link": "https://reset"}
    result = asyncio.run(
        service.send_email_with_template_async(
            "to@example.com", "Reset", "tpl.html", environment=env
        )
    )
    assert result is True
    service.send_email_async.assert_awaited_once()


def test_send_email_async_success(monkeypatch):
    monkeypatch.setattr(settings, "SENDGRID_API_KEY", "test-key")
    mock_client = MagicMock()
    mock_client.send.return_value = MagicMock(status_code=202)
    with patch(
        "app.services.email_service.SendGridAPIClient", return_value=mock_client
    ):
        service = EmailService()
        result = asyncio.run(
            service.send_email_async("to@example.com", "Subject", "<p>Body</p>")
        )
    assert result is True
    mock_client.send.assert_called_once()


def test_send_email_async_handles_exception(monkeypatch):
    monkeypatch.setattr(settings, "SENDGRID_API_KEY", "test-key")
    mock_client = MagicMock()
    mock_client.send.side_effect = Exception("boom")
    with patch(
        "app.services.email_service.SendGridAPIClient", return_value=mock_client
    ):
        service = EmailService()
        result = asyncio.run(
            service.send_email_async("to@example.com", "Subject", "<p>Body</p>")
        )
    assert result is False
