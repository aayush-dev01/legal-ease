"""
LegalEase AI – /api/analyze Router
Orchestrates: Rule Engine → Risk Engine → AI Enrichment → PDF → Storage → Email
"""

import uuid, os, time
from collections import defaultdict
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from models.schemas import AnalyzeRequest, AnalyzeResponse, ScoreDetail
from engines.rule_engine import detect_category, get_applicable_licenses, get_state_notes, calculate_compliance_complexity
from engines.risk_engine import calculate_risk_score, calculate_feasibility_score
from services.ai_service import enrich_with_ai
from services.pdf_generator import generate_analysis_pdf
from services.paths import ensure_generated_reports_dir, pdf_path_for_report_id
from services.storage_service import save_report
from services.email_sender import send_report_email
from services.analyzer import normalize_ai_enrichment

router = APIRouter()

BASE_URL     = os.getenv("BASE_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ── Simple in-memory rate limiter ─────────────────────────────────────────────
# Limits each IP to MAX_REQUESTS analyses per WINDOW_SECONDS
MAX_REQUESTS    = int(os.getenv("RATE_LIMIT_MAX", "5"))
WINDOW_SECONDS  = int(os.getenv("RATE_LIMIT_WINDOW", "3600"))  # 1 hour
_rate_store: dict = defaultdict(list)   # ip -> [timestamp, ...]

def _check_rate_limit(ip: str):
    now = time.time()
    window_start = now - WINDOW_SECONDS
    # Drop old entries
    _rate_store[ip] = [t for t in _rate_store[ip] if t > window_start]
    if len(_rate_store[ip]) >= MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Maximum {MAX_REQUESTS} analyses per hour per IP. Try again later."
        )
    _rate_store[ip].append(now)


def score_label(score: int, type_: str) -> str:
    if type_ == "risk":
        if score <= 30: return "Low Risk"
        if score <= 60: return "Medium Risk"
        return "High Risk"
    if type_ == "complexity":
        if score <= 30: return "Simple"
        if score <= 60: return "Moderate"
        return "Complex"
    if score >= 70: return "Viable"
    if score >= 45: return "Moderate"
    return "Challenging"


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    req: AnalyzeRequest,
    request: Request,
    background_tasks: BackgroundTasks,
):
    print(
        "[analyze] Incoming request:",
        {
            "idea_len": len(req.idea or ""),
            "location": req.location,
            "scale": req.scale,
            "mode": req.mode,
            "has_email": bool(req.email and str(req.email).strip()),
        },
    )
    # Rate limit by IP
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)

    report_id = str(uuid.uuid4())[:8].upper()

    # ── Step 1: Detect Category ───────────────────────────────────────────────
    category = detect_category(req.idea)

    # ── Step 2: Rule Engine → Licenses ───────────────────────────────────────
    licenses    = get_applicable_licenses(req.idea, category, req.location)
    state_notes = get_state_notes(req.location)

    # ── Step 3: Risk Score ────────────────────────────────────────────────────
    risk_score, risk_note, risk_breakdown = calculate_risk_score(
        req.idea, category, req.scale, req.mode, licenses
    )

    # ── Step 4: Feasibility + Compliance Complexity ───────────────────────────
    feasibility_score, feasibility_note = calculate_feasibility_score(
        category, req.scale, licenses, risk_score
    )
    compliance_complexity = calculate_compliance_complexity(licenses, category)
    complexity_note = (
        f"{len(licenses)} licenses required — "
        + ("high regulatory burden" if compliance_complexity > 60
           else "moderate compliance load" if compliance_complexity > 35
           else "manageable compliance requirements")
        + f" for a {category} business."
    )

    # ── Step 5: AI Enrichment ─────────────────────────────────────────────────
    try:
        ai_data = await enrich_with_ai(
            idea=req.idea, location=req.location, scale=req.scale, mode=req.mode,
            category=category, licenses=licenses, risk_score=risk_score,
            feasibility_score=feasibility_score, compliance_complexity=compliance_complexity,
            state_notes=state_notes,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    ai_data = normalize_ai_enrichment(ai_data)

    # ── Step 6: Assemble Full Report Data ─────────────────────────────────────
    # report_url points to the FRONTEND report viewer page (what QR opens)
    # pdf_url    points to the raw PDF file
    report_url = f"{FRONTEND_URL}/report/{report_id}"
    pdf_url    = f"{BASE_URL}/api/report/{report_id}/pdf"

    full_data = {
        "report_id":    report_id,
        "idea":         req.idea,
        "business_name":ai_data.get("business_name", "Business Analysis"),
        "category":     category,
        "summary":      ai_data.get("summary", ""),
        "key_insight":  ai_data.get("key_insight", ""),
        "location":     req.location,
        "scale":        req.scale,
        "mode":         req.mode,
        "feasibility": {
            "score": feasibility_score,
            "note":  feasibility_note,
            "label": score_label(feasibility_score, "feasibility"),
        },
        "risk": {
            "score": risk_score,
            "note":  risk_note,
            "label": score_label(risk_score, "risk"),
        },
        "compliance_complexity": {
            "score": compliance_complexity,
            "note":  complexity_note,
            "label": score_label(compliance_complexity, "complexity"),
        },
        "licenses":                    licenses,
        "risks":                       ai_data.get("risks", []),
        "action_plan":                 ai_data.get("action_plan", []),
        "non_compliance_consequences": ai_data.get("non_compliance_consequences", []),
        "cost_estimates":              ai_data.get("cost_estimates", []),
        "risk_breakdown":              risk_breakdown,
        "follow_up_questions":         ai_data.get("follow_up_questions", []),
        "report_url": report_url,
        "pdf_url":    pdf_url,
    }

    # ── Step 7: Generate PDF ──────────────────────────────────────────────────
    ensure_generated_reports_dir()
    pdf_path = pdf_path_for_report_id(report_id)
    try:
        generate_analysis_pdf(full_data, pdf_path)
    except Exception as e:
        print(f"PDF generation warning: {e}")
        full_data["pdf_url"] = None
        pdf_path = None

    # ── Step 8: Store in SQLite ───────────────────────────────────────────────
    save_report(
        report_id=report_id,
        idea=req.idea,
        location=req.location,
        scale=req.scale,
        mode=req.mode,
        data=full_data,
        pdf_path=pdf_path,
    )

    # ── Step 9: Send Email (non-fatal, optional) ──────────────────────────────
    if req.email and pdf_path:
        background_tasks.add_task(
            send_report_email,
            str(req.email).strip(),
            report_id,
            full_data["business_name"],
            pdf_path,
        )

    # ── Step 10: Build Response ───────────────────────────────────────────────
    response = AnalyzeResponse(
        report_id=report_id,
        business_name=full_data["business_name"],
        category=category,
        summary=full_data["summary"],
        key_insight=full_data["key_insight"],
        feasibility=ScoreDetail(**full_data["feasibility"]),
        risk=ScoreDetail(**full_data["risk"]),
        compliance_complexity=ScoreDetail(**full_data["compliance_complexity"]),
        licenses=licenses if licenses is not None else [],
        risks=ai_data.get("risks", []),
        action_plan=ai_data.get("action_plan", []),
        non_compliance_consequences=ai_data.get("non_compliance_consequences", []),
        cost_estimates=ai_data.get("cost_estimates", []),
        risk_breakdown=risk_breakdown if risk_breakdown is not None else [],
        follow_up_questions=ai_data.get("follow_up_questions", []),
        pdf_url=full_data.get("pdf_url"),
        report_url=report_url,
    )
    print("[analyze] Generated response report_id:", report_id, "category:", category)
    return response
