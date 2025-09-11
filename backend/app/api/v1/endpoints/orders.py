from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Query,
    Body,
    Header,
    Response,
    UploadFile,
    File,
)
from typing import List, Optional
from uuid import UUID

from sqlmodel import Session, select
import stripe  # For webhook verification if not done by a library

from app.repositories.sqlite_adapter import get_session
from app.services.order_service import OrderService, QuoteService
from app.models.order import (
    Order,
    OrderCreate,
    OrderRead,
    OrderUpdate,
    OrderStatus,
    PaymentStatus,
    Quote,
    QuoteCreate,
    QuoteRead,
    QuoteUpdate,
    QuoteStatus,
)  # Added Quote models
from app.models.user import User
from app.models.contact import Contact
from app.auth.dependencies import get_current_active_user
from app.core.config import settings

router = APIRouter()

# --- Order Endpoints --- #


@router.post("/", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def create_order(
    *,
    session: Session = Depends(get_session),
    order_in: OrderCreate,
    current_user: User = Depends(get_current_active_user),
):
    if order_in.user_id != current_user.id:
        pass  # Assuming service handles or pre-validated
    order_service = OrderService(session=session)
    new_order = await order_service.create_order(
        order_in=order_in, current_user=current_user
    )
    return new_order


@router.get("/", response_model=List[OrderRead])
async def read_orders(
    *,
    session: Session = Depends(get_session),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    status_filter: Optional[OrderStatus] = Query(None, alias="status"),
    current_user: User = Depends(get_current_active_user),
):
    order_service = OrderService(session=session)
    orders = await order_service.get_orders_by_user(
        current_user=current_user, skip=skip, limit=limit, status=status_filter
    )
    return orders


@router.get("/{order_id}", response_model=OrderRead)
async def read_order(
    *,
    session: Session = Depends(get_session),
    order_id: UUID,
    current_user: User = Depends(get_current_active_user),
):
    order_service = OrderService(session=session)
    order = await order_service.get_order_by_id(
        order_id=order_id, current_user=current_user
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found or not owned by user",
        )
    return order


@router.put("/{order_id}", response_model=OrderRead)
async def update_order(
    *,
    session: Session = Depends(get_session),
    order_id: UUID,
    order_in: OrderUpdate,
    current_user: User = Depends(get_current_active_user),
):
    order_service = OrderService(session=session)
    updated_order = await order_service.update_order(
        order_id=order_id, order_in=order_in, current_user=current_user
    )
    if not updated_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found or not owned by user",
        )
    return updated_order


@router.delete("/{order_id}", response_model=OrderRead)
async def delete_order(
    *,
    session: Session = Depends(get_session),
    order_id: UUID,
    current_user: User = Depends(get_current_active_user),
):
    order_service = OrderService(session=session)
    deleted_order = await order_service.delete_order(
        order_id=order_id, current_user=current_user
    )
    if not deleted_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found or not owned by user",
        )
    return deleted_order


# --- Quote Endpoints --- #


@router.post("/quotes/", response_model=QuoteRead, status_code=status.HTTP_201_CREATED)
async def create_quote(
    *,
    session: Session = Depends(get_session),
    quote_in: QuoteCreate,
    current_user: User = Depends(get_current_active_user),
):
    if quote_in.user_id != current_user.id:
        pass  # Assuming service handles or pre-validated
    quote_service = QuoteService(session=session)
    new_quote = await quote_service.create_quote(
        quote_in=quote_in, current_user=current_user
    )
    return new_quote


@router.get("/quotes/", response_model=List[QuoteRead])
async def read_quotes(
    *,
    session: Session = Depends(get_session),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    status_filter: Optional[QuoteStatus] = Query(None, alias="status"),
    current_user: User = Depends(get_current_active_user),
):
    quote_service = QuoteService(session=session)
    quotes = await quote_service.get_quotes_by_user(
        current_user=current_user, skip=skip, limit=limit, status=status_filter
    )
    return quotes


@router.get("/quotes/{quote_id}", response_model=QuoteRead)
async def read_quote(
    *,
    session: Session = Depends(get_session),
    quote_id: UUID,
    current_user: User = Depends(get_current_active_user),
):
    quote_service = QuoteService(session=session)
    quote = await quote_service.get_quote_by_id(
        quote_id=quote_id, current_user=current_user
    )
    if not quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quote not found or not owned by user",
        )
    return quote


@router.put("/quotes/{quote_id}", response_model=QuoteRead)
async def update_quote(
    *,
    session: Session = Depends(get_session),
    quote_id: UUID,
    quote_in: QuoteUpdate,
    current_user: User = Depends(get_current_active_user),
):
    quote_service = QuoteService(session=session)
    updated_quote = await quote_service.update_quote(
        quote_id=quote_id, quote_in=quote_in, current_user=current_user
    )
    if not updated_quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quote not found or not owned by user",
        )
    return updated_quote


@router.delete("/quotes/{quote_id}", response_model=QuoteRead)
async def delete_quote(
    *,
    session: Session = Depends(get_session),
    quote_id: UUID,
    current_user: User = Depends(get_current_active_user),
):
    quote_service = QuoteService(session=session)
    deleted_quote = await quote_service.delete_quote(
        quote_id=quote_id, current_user=current_user
    )
    if not deleted_quote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quote not found or not owned by user",
        )
    return deleted_quote


@router.post("/quotes/{quote_id}/convert-to-order", response_model=OrderRead)
async def convert_quote_to_order(
    *,
    session: Session = Depends(get_session),
    quote_id: UUID,
    current_user: User = Depends(get_current_active_user),
):
    order_service = OrderService(
        session=session
    )  # OrderService contains the conversion logic
    converted_order = await order_service.convert_quote_to_order(
        quote_id=quote_id, current_user=current_user
    )
    if not converted_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not convert quote to order. Quote might not be found, not owned, or not in an acceptable status.",
        )
    return converted_order


# --- Stripe Related Endpoints --- #


@router.post("/{order_id}/create-payment-intent", response_model=dict)
async def create_payment_intent_for_order(
    *,
    session: Session = Depends(get_session),
    order_id: UUID,
    current_user: User = Depends(get_current_active_user),
):
    order_service = OrderService(session=session)
    order = await order_service.get_order_by_id(
        order_id=order_id, current_user=current_user
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )
    if order.payment_status == PaymentStatus.PAID_IN_FULL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is already paid in full.",
        )

    client_secret = await order_service.create_stripe_payment_intent(
        order_id=order_id, current_user=current_user
    )
    if not client_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create payment intent",
        )
    return {"client_secret": client_secret}


@router.post("/webhooks/stripe", include_in_schema=False)
async def stripe_webhook(
    request_body: bytes = Body(...),
    stripe_signature: Optional[str] = Header(None, alias="Stripe-Signature"),
    session: Session = Depends(get_session),
):
    if not stripe_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe-Signature header",
        )

    order_service = OrderService(session=session)
    try:
        event_payload = request_body.decode("utf-8")
        success = await order_service.handle_stripe_webhook(
            payload=event_payload, signature=stripe_signature
        )
        if success:
            return {"status": "success"}
        else:
            print("Stripe webhook processing failed internally.")
            return {"status": "internal error, but acknowledged"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid payload: {e}"
        )
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid signature: {e}"
        )
    except Exception as e:
        print(f"Generic error processing Stripe webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook processing error",
        )


# --- Invoice and Client Portal Endpoints (Placeholders) --- #


@router.get(
    "/{order_id}/invoice/pdf"
)  # Removed response_class=bytes to use FastAPI Response directly
async def get_order_invoice_pdf(
    *,
    session: Session = Depends(get_session),
    order_id: UUID,
    current_user: User = Depends(get_current_active_user),
):
    order_service = OrderService(session=session)
    pdf_bytes = await order_service.generate_invoice_pdf(
        order_id=order_id, current_user=current_user
    )
    if not pdf_bytes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not generate PDF or order not found.",
        )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=invoice_order_{order_id}.pdf"
        },
    )


@router.get("/{order_id}/client-portal-url", response_model=dict)
async def get_client_portal_url_for_order(
    *,
    session: Session = Depends(get_session),
    order_id: UUID,
    current_user: User = Depends(get_current_active_user),
):
    order_service = OrderService(session=session)
    url = await order_service.get_client_portal_url(
        order_id=order_id, current_user=current_user
    )
    if not url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not generate portal URL or order not found.",
        )
    return {"url": url}


@router.post("/import", response_model=dict)
async def import_orders_from_csv(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    """
    Import orders from CSV located under `tmp/import_data/*Orders*.csv`.
    Skips rows marked as quotes. Avoids duplicates by `order_number`.
    """
    import csv
    from datetime import datetime, timezone
    from pathlib import Path
    from sqlmodel import select

    def resolve_import_dir() -> Path:
        candidates = [
            Path("tmp/import_data"),
            Path(__file__).resolve().parents[5] / "tmp/import_data",
            Path(__file__).resolve().parents[4] / "tmp/import_data",
        ]
        for p in candidates:
            if p.exists():
                return p
        return candidates[0]

    def parse_date(value: str):
        value = (value or "").strip()
        for fmt in ("%m/%d/%Y", "%Y-%m-%d"):
            try:
                return datetime.strptime(value, fmt)
            except Exception:
                continue
        raise ValueError(f"Unrecognized date format: {value}")

    def to_float(x: str) -> float:
        x = (x or "").replace(",", "").strip()
        try:
            return float(x) if x else 0.0
        except Exception:
            return 0.0

    def none_if_null(x: str | None) -> str | None:
        if x is None:
            return None
        s = x.strip()
        return None if s.upper() == "NULL" or s == "" else s

    def status_from_row(row: dict) -> OrderStatus:
        status_raw = (row.get("OrderStatusId") or "").strip()
        if status_raw == "2":
            return OrderStatus.CONFIRMED
        if status_raw == "3":
            return OrderStatus.IN_PROGRESS
        if status_raw == "4":
            return OrderStatus.COMPLETED
        if status_raw == "5":
            return OrderStatus.CANCELLED
        return OrderStatus.INQUIRY

    def status_from_row(row: dict) -> OrderStatus:
        is_quote = (row.get("IsQuote") or "0").strip()
        if is_quote in ("1", "true", "True"):
            # These will be skipped by caller, default here not used
            return OrderStatus.INQUIRY
        status_raw = (row.get("OrderStatusId") or "").strip()
        # Basic mapping fallback
        if status_raw == "2":
            return OrderStatus.CONFIRMED
        if status_raw == "3":
            return OrderStatus.IN_PROGRESS
        if status_raw == "4":
            return OrderStatus.COMPLETED
        if status_raw == "5":
            return OrderStatus.CANCELLED
        return OrderStatus.INQUIRY

    import_dir = resolve_import_dir()
    matches = list(import_dir.glob("*Orders*.csv"))
    if not matches:
        return {"imported": 0, "skipped": 0, "errors": ["No Orders CSV found."], "files": []}

    imported = 0
    skipped = 0
    errors: list[str] = []
    files: list[str] = []

    for file_path in matches:
        files.append(str(file_path))
        try:
            with open(file_path, "r", encoding="utf-8-sig", newline="") as f:
                reader = csv.DictReader(f)
                for idx, row in enumerate(reader, start=2):
                    try:
                        # Skip quotes
                        if (row.get("IsQuote") or "0").strip() in ("1", "true", "True"):
                            skipped += 1
                            continue

                        order_number = (row.get("OrderNumber") or "").strip()
                        if not order_number:
                            skipped += 1
                            errors.append(f"{file_path.name} line {idx}: Missing OrderNumber")
                            continue

                        # Duplicate check
                        stmt = select(Order).where(Order.order_number == order_number, Order.user_id == current_user.id)
                        existing = session.exec(stmt).first()
                        if existing:
                            skipped += 1
                            continue

                        order_date = parse_date(row.get("OrderDate", ""))
                        # Normalize to timezone-aware UTC if naive
                        if order_date.tzinfo is None:
                            order_date = order_date.replace(tzinfo=timezone.utc)

                        due_date = order_date  # default fallback

                        subtotal = to_float(row.get("SubTotalAmount"))
                        discount = to_float(row.get("DiscountAmount"))
                        total = to_float(row.get("TotalAmount"))
                        delivery_fee = to_float(row.get("SetupDeliveryAmount"))
                        tax = (
                            to_float(row.get("ShippingTaxAmount"))
                            + to_float(row.get("TaxAmount1"))
                            + to_float(row.get("TaxAmount2"))
                            + to_float(row.get("TaxAmount3"))
                            + to_float(row.get("TaxAmount4"))
                            + to_float(row.get("TaxAmount5"))
                        )

                        # Resolve or create Contact
                        contact_name = none_if_null(row.get("Contact"))
                        contact_email = none_if_null(row.get("ContactEmail"))
                        contact_company = none_if_null(row.get("ContactCompany"))

                        existing_contact = None
                        if contact_email:
                            stmt_c = select(Contact).where(
                                Contact.user_id == current_user.id,
                                Contact.email == contact_email,
                            )
                            existing_contact = session.exec(stmt_c).first()
                        if existing_contact is None and contact_name:
                            parts = contact_name.split()
                            first = parts[0] if parts else None
                            last = " ".join(parts[1:]) if len(parts) > 1 else None
                            stmt_c2 = select(Contact).where(
                                Contact.user_id == current_user.id,
                                Contact.first_name == first,
                                Contact.last_name == last,
                                Contact.company_name == contact_company,
                            )
                            existing_contact = session.exec(stmt_c2).first()
                        customer_id = None
                        if existing_contact is None and (contact_name or contact_email or contact_company):
                            parts = (contact_name or "").split()
                            first = parts[0] if parts else None
                            last = " ".join(parts[1:]) if len(parts) > 1 else None
                            new_contact = Contact(
                                user_id=current_user.id,
                                first_name=first,
                                last_name=last,
                                company_name=contact_company,
                                email=contact_email,
                            )
                            session.add(new_contact)
                            session.commit()
                            session.refresh(new_contact)
                            customer_id = new_contact.id
                        elif existing_contact is not None:
                            customer_id = existing_contact.id

                        db_order = Order(
                            user_id=current_user.id,
                            order_number=order_number,
                            customer_id=customer_id,
                            customer_name=contact_name,
                            customer_company=contact_company,
                            customer_email=contact_email,
                            status=status_from_row(row),
                            payment_status=PaymentStatus.UNPAID,
                            order_date=order_date,
                            due_date=due_date,
                            delivery_method=None,
                            delivery_fee=delivery_fee or 0,
                            subtotal=subtotal,
                            tax=tax,
                            discount_amount=discount or 0,
                            total_amount=total or max(0.0, subtotal + tax - discount),
                            event_type=(row.get("EventType") or None),
                            theme_details=(row.get("ThemeDetails") or None),
                            notes_to_customer=None,
                            internal_notes=(row.get("Notes") or None),
                        )

                        session.add(db_order)
                        session.commit()
                        session.refresh(db_order)
                        imported += 1
                    except Exception as e:
                        session.rollback()
                        skipped += 1
                        errors.append(f"{file_path.name} line {idx}: {e}")
        except Exception as e:
            errors.append(f"Failed to process {file_path.name}: {e}")

    return {"imported": imported, "skipped": skipped, "errors": errors, "files": files}


@router.post("/import-file", response_model=dict)
async def import_orders_file(
    *,
    session: Session = Depends(get_session),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    """
    Import orders from an uploaded CSV file.
    """
    import csv, io
    from datetime import datetime, timezone

    def parse_date(value: str):
        value = (value or "").strip()
        for fmt in ("%m/%d/%Y", "%Y-%m-%d"):
            try:
                return datetime.strptime(value, fmt)
            except Exception:
                continue
        raise ValueError(f"Unrecognized date format: {value}")

    def to_float(x: str) -> float:
        x = (x or "").replace(",", "").strip()
        try:
            return float(x) if x else 0.0
        except Exception:
            return 0.0

    def none_if_null(x: str | None) -> str | None:
        if x is None:
            return None
        s = x.strip()
        return None if s.upper() == "NULL" or s == "" else s

    imported = 0
    skipped = 0
    errors: list[str] = []

    order_service = OrderService(session=session)
    text_stream = io.TextIOWrapper(file.file, encoding="utf-8")
    reader = csv.DictReader(text_stream)
    for idx, row in enumerate(reader, start=2):
        try:
            if (row.get("IsQuote") or "0").strip() in ("1", "true", "True"):
                skipped += 1
                continue
            order_number = (row.get("OrderNumber") or "").strip()
            if not order_number:
                skipped += 1
                errors.append(f"line {idx}: Missing OrderNumber")
                continue
            # Duplicate check
            stmt = select(Order).where(Order.order_number == order_number, Order.user_id == current_user.id)
            if session.exec(stmt).first():
                skipped += 1
                continue

            order_date = parse_date(row.get("OrderDate", ""))
            if order_date.tzinfo is None:
                order_date = order_date.replace(tzinfo=timezone.utc)
            due_date = order_date

            subtotal = to_float(row.get("SubTotalAmount"))
            discount = to_float(row.get("DiscountAmount"))
            total = to_float(row.get("TotalAmount"))
            delivery_fee = to_float(row.get("SetupDeliveryAmount"))
            tax = (
                to_float(row.get("ShippingTaxAmount"))
                + to_float(row.get("TaxAmount1"))
                + to_float(row.get("TaxAmount2"))
                + to_float(row.get("TaxAmount3"))
                + to_float(row.get("TaxAmount4"))
                + to_float(row.get("TaxAmount5"))
            )

            # Contact linking
            contact_name = none_if_null(row.get("Contact"))
            contact_email = none_if_null(row.get("ContactEmail"))
            contact_company = none_if_null(row.get("ContactCompany"))

            existing_contact = None
            if contact_email:
                stmt_c = select(Contact).where(
                    Contact.user_id == current_user.id,
                    Contact.email == contact_email,
                )
                existing_contact = session.exec(stmt_c).first()
            if existing_contact is None and contact_name:
                parts = contact_name.split()
                first = parts[0] if parts else None
                last = " ".join(parts[1:]) if len(parts) > 1 else None
                stmt_c2 = select(Contact).where(
                    Contact.user_id == current_user.id,
                    Contact.first_name == first,
                    Contact.last_name == last,
                    Contact.company_name == contact_company,
                )
                existing_contact = session.exec(stmt_c2).first()
            customer_id = None
            if existing_contact is None and (contact_name or contact_email or contact_company):
                parts = (contact_name or "").split()
                first = parts[0] if parts else None
                last = " ".join(parts[1:]) if len(parts) > 1 else None
                new_contact = Contact(
                    user_id=current_user.id,
                    first_name=first,
                    last_name=last,
                    company_name=contact_company,
                    email=contact_email,
                )
                session.add(new_contact)
                session.commit()
                session.refresh(new_contact)
                customer_id = new_contact.id
            elif existing_contact is not None:
                customer_id = existing_contact.id

            db_order = Order(
                user_id=current_user.id,
                order_number=order_number,
                customer_id=customer_id,
                customer_name=contact_name,
                customer_company=contact_company,
                customer_email=contact_email,
                status=status_from_row(row),
                payment_status=PaymentStatus.UNPAID,
                order_date=order_date,
                due_date=due_date,
                delivery_fee=delivery_fee or 0,
                subtotal=subtotal,
                tax=tax,
                discount_amount=discount or 0,
                total_amount=total or max(0.0, subtotal + tax - discount),
                event_type=(row.get("EventType") or None),
                theme_details=(row.get("ThemeDetails") or None),
                internal_notes=(row.get("Notes") or None),
            )
            session.add(db_order)
            session.commit()
            session.refresh(db_order)
            imported += 1
        except Exception as e:
            session.rollback()
            skipped += 1
            errors.append(f"line {idx}: {e}")

    return {"imported": imported, "skipped": skipped, "errors": errors}
