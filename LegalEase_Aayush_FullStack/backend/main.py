"""
LegalEase AI – India
FastAPI Backend Entry Point
"""

from dotenv import load_dotenv
import os

# Load .env before anything else
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routers import analyze, report
from services.paths import GENERATED_REPORTS_DIR, ensure_generated_reports_dir
from models.schemas import AnalyzeResponse

app = FastAPI(
    title="LegalEase AI – India",
    description="AI-powered legal compliance engine for Indian businesses",
    version="1.0.0",
)

# Cannot use allow_origins=["*"] with allow_credentials=True — browsers block it.
# List dev origins explicitly so fetch from Vite (any port) still works when using absolute API URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    # Any localhost / 127.0.0.1 port (e.g. custom Vite port) when using absolute API URL
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")
app.include_router(report.router,  prefix="/api")

# Optional alias for clients that POST to /analyze (same handler as POST /api/analyze)
app.add_api_route(
    "/analyze",
    analyze.analyze,
    methods=["POST"],
    response_model=AnalyzeResponse,
)

# Serve generated PDFs (same directory as /api/report/{id}/pdf)
ensure_generated_reports_dir()
app.mount("/reports", StaticFiles(directory=str(GENERATED_REPORTS_DIR)), name="reports")

@app.get("/health")
def health():
    return {"status": "ok", "service": "LegalEase AI Backend"}
