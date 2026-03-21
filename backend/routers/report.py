"""
LegalEase AI – /api/report Router
Retrieve stored reports by ID and download PDFs.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
import os
from services.storage_service import get_report, list_reports

router = APIRouter()


@router.get("/report/{report_id}")
def get_report_data(report_id: str):
    """Return full report JSON by ID."""
    report = get_report(report_id.upper())
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report["data"]


@router.get("/report/{report_id}/pdf")
def download_pdf(report_id: str):
    """Download the PDF for a report."""
    pdf_path = f"generated_reports/{report_id.upper()}.pdf"
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF not found")
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"LegalEase-Report-{report_id.upper()}.pdf",
    )


@router.get("/reports")
def get_all_reports():
    """List recent reports."""
    return list_reports(limit=50)
