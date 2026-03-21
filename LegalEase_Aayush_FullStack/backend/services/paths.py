"""
Resolved paths for the backend (PDF output, etc.) so behavior does not depend on process cwd.
"""

from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
GENERATED_REPORTS_DIR = BACKEND_ROOT / "generated_reports"


def ensure_generated_reports_dir() -> None:
    GENERATED_REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def pdf_path_for_report_id(report_id: str) -> str:
    return str(GENERATED_REPORTS_DIR / f"{report_id.upper()}.pdf")
