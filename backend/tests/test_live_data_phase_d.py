"""Phase (d): enquiry name+phone-only flow, honeypot, migration, notifications."""

import pytest
from fastapi import HTTPException

from app.routers import enquiries as enq
from app.schemas.schemas import EnquiryCreate


def _body(**overrides):
    base = {
        "type": "FLIGHT",
        "customer_name": "Aarav Sharma",
        "phone": "9876543210",
        "email": None,
        "consent": True,
    }
    base.update(overrides)
    return EnquiryCreate(**base)


def test_name_phone_only_passes():
    out = enq.validate_enquiry_input(_body())
    assert out["phone"] == "+919876543210"
    assert out["email"] is None


def test_optional_email_validated_when_given():
    out = enq.validate_enquiry_input(_body(email="a@b.co"))
    assert out["email"] == "a@b.co"
    with pytest.raises(HTTPException) as e:
        enq.validate_enquiry_input(_body(email="not-an-email"))
    assert e.value.status_code == 400


def test_invalid_phone_rejected():
    from pydantic import ValidationError

    for bad in ["123", "1234567890", "+1 555 123 4567"]:
        # Rejected either at the schema boundary or by phone validation.
        try:
            body = _body(phone=bad)
        except ValidationError:
            continue
        with pytest.raises(HTTPException) as e:
            enq.validate_enquiry_input(body)
        assert e.value.status_code == 400


def test_missing_consent_rejected():
    with pytest.raises(HTTPException) as e:
        enq.validate_enquiry_input(_body(consent=False))
    assert "contacted" in e.value.detail


def test_honeypot_rejected_generically():
    assert enq.honeypot_tripped(_body(website="http://spam.example")) is True
    assert enq.honeypot_tripped(_body()) is False
    with pytest.raises(HTTPException) as e:
        enq.validate_enquiry_input(_body(website="bot"))
    assert e.value.status_code == 400
    # Generic message reveals nothing about the honeypot.
    assert "honeypot" not in e.value.detail.lower()
    assert "bot" not in e.value.detail.lower()


def test_preferred_contact_time_passthrough():
    out = enq.validate_enquiry_input(_body(preferred_contact_time="Evenings after 7pm"))
    assert out["preferred_contact_time"] == "Evenings after 7pm"
    assert enq.validate_enquiry_input(_body())["preferred_contact_time"] is None


def test_migration_0003_up_down():
    import importlib

    mod = importlib.import_module("migrations.versions.0003_enquiry_contact_optional")
    assert mod.revision == "0003_enquiry_contact_optional"
    assert mod.down_revision == "0002_enquiries"

    calls = []

    class FakeOp:
        @staticmethod
        def alter_column(table, column, **kwargs):
            calls.append(("alter_column", table, column, kwargs))

        @staticmethod
        def add_column(table, column):
            calls.append(("add_column", table, getattr(column, "name", "?")))

        @staticmethod
        def drop_column(table, column):
            calls.append(("drop_column", table, column))

        @staticmethod
        def execute(sql):
            calls.append(("execute", sql))

    m3 = importlib.import_module("migrations.versions.0003_enquiry_contact_optional")

    orig_op = m3.op
    m3.op = FakeOp
    try:
        m3.upgrade()
        assert ("add_column", "enquiries", "preferred_contact_time") in calls
        alter = [c for c in calls if c[0] == "alter_column" and c[2] == "email"]
        assert alter and alter[0][3].get("nullable") is True

        calls.clear()
        m3.downgrade()
        assert ("drop_column", "enquiries", "preferred_contact_time") in calls
        assert any(c[0] == "execute" and "email" in c[1] for c in calls)
        alter = [c for c in calls if c[0] == "alter_column" and c[2] == "email"]
        assert alter and alter[0][3].get("nullable") is False
    finally:
        m3.op = orig_op


def test_confirmation_skipped_without_email():
    import asyncio

    from app.services import notifications

    result = asyncio.run(notifications.send_customer_confirmation("", "TFC-2026-000001", "FLIGHT"))
    assert result["emailed"] is False


def test_enquiry_model_allows_null_email():
    from app.models.models import Enquiry

    assert Enquiry.__table__.c.email.nullable is True
    assert Enquiry.__table__.c.preferred_contact_time.nullable is True
