"""
LegalEase AI – India
FastAPI Backend Entry Point
"""

from dotenv import load_dotenv
import os

# Load .env before anything else
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

gemini_api_key = os.getenv("GEMINI_API_KEY", "").strip()
if not gemini_api_key or gemini_api_key == "YOUR_GEMINI_API_KEY_HERE":
    raise RuntimeError(
        "GEMINI_API_KEY is missing or empty in backend/.env. "
        "Please set a valid Gemini API key before starting the backend."
    )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from routers import analyze, report

app = FastAPI(
    title="LegalEase AI – India",
    description="AI-powered legal compliance engine for Indian businesses",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")
app.include_router(report.router,  prefix="/api")

# Serve generated PDFs
os.makedirs("generated_reports", exist_ok=True)
app.mount("/reports", StaticFiles(directory="generated_reports"), name="reports")

@app.get("/health")
def health():
    return {"status": "ok", "service": "LegalEase AI Backend"}
