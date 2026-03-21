"""
Send analysis PDF by email (SMTP). Configure via backend/.env.

Supports EMAIL_USER / EMAIL_PASS (or legacy SMTP_USER / SMTP_PASS).
Email is sent only when a recipient is provided and SMTP credentials are configured.

Set EMAIL_ENABLED=false to force-disable even if credentials exist.
"""

import os
import smtplib
import ssl
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USER = os.getenv("EMAIL_USER") or os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("EMAIL_PASS") or os.getenv("SMTP_PASS", "")
FROM_NAME = os.getenv("EMAIL_FROM_NAME", "LegalEase AI")
FROM_ADDR = os.getenv("EMAIL_FROM_ADDR") or SMTP_USER
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

_flag = os.getenv("EMAIL_ENABLED", "").strip().lower()
if _flag == "false":
    EMAIL_ENABLED = False
elif _flag == "true":
    EMAIL_ENABLED = True
else:
    EMAIL_ENABLED = bool(SMTP_USER and SMTP_PASS)


def send_report_email(
    to_email: str,
    report_id: str,
    business_name: str,
    pdf_path: str,
) -> bool:
    if not to_email or not str(to_email).strip():
        return False
    if not EMAIL_ENABLED:
        print("[email_sender] EMAIL_ENABLED is off — skipping email")
        return False
    if not SMTP_USER or not SMTP_PASS:
        print("[email_sender] EMAIL_USER/EMAIL_PASS (or SMTP_*) not set — skipping email")
        return False
    if not os.path.isfile(pdf_path):
        print(f"[email_sender] PDF not found at {pdf_path} — skipping email")
        return False

    report_url = f"{FRONTEND_URL}/report/{report_id}"
    to_email = str(to_email).strip()

    msg = MIMEMultipart("mixed")
    msg["Subject"] = "Your LegalEase Report"
    msg["From"] = f"{FROM_NAME} <{FROM_ADDR}>"
    msg["To"] = to_email

    body = (
        f"Hello,\n\n"
        f"Your LegalEase compliance report for \"{business_name}\" is attached (PDF).\n"
        f"Report ID: {report_id}\n"
        f"View online: {report_url}\n\n"
        f"This message was sent because you provided an email on LegalEase.\n"
        f"— LegalEase AI\n"
    )
    msg.attach(MIMEText(body, "plain", "utf-8"))

    with open(pdf_path, "rb") as f:
        pdf_part = MIMEApplication(f.read(), Name=f"LegalEase-{report_id}.pdf")
        pdf_part["Content-Disposition"] = (
            f'attachment; filename="LegalEase-{report_id}.pdf"'
        )
        msg.attach(pdf_part)

    try:
        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=ctx) as server:
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(FROM_ADDR or SMTP_USER, to_email, msg.as_string())
        print(f"[email_sender] Report email sent to {to_email} (report {report_id})")
        return True
    except Exception as e:
        print(f"[email_sender] Failed to send email: {e}")
        return False
