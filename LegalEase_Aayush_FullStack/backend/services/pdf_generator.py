"""
LegalEase analysis PDF — entry point used by /api/analyze.
Delegates to ReportLab implementation in pdf_service.py.
"""

from services.pdf_service import generate_pdf


def generate_analysis_pdf(report_data: dict, output_path: str) -> str:
    data = dict(report_data)
    data.setdefault("report_title", "LegalEase Analysis Report")
    return generate_pdf(data, output_path)
