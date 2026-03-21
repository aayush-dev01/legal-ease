"""Legacy alias — use services.email_sender instead."""

from services.email_sender import send_report_email

__all__ = ["send_report_email"]
