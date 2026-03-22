# LegalEase AI – India (Full Stack)

> AI-powered legal co-founder for Indian entrepreneurs.
> **React frontend + Python FastAPI backend + Deterministic rule engine + PDF generation + SQLite storage.**

## Live App

Set this after you connect your own deployment.

---

## 🏗️ Architecture

```
Your Idea
    ↓
[React Frontend]  →  POST /api/analyze
    ↓
[FastAPI Backend]
    ├── 1. Category Detection      (Python — engines/rule_engine.py)
    ├── 2. License Mapping         (Python — deterministic rules)
    ├── 3. Risk Scoring            (Python — engines/risk_engine.py)
    ├── 4. Feasibility Scoring     (Python — deterministic)
    ├── 5. AI Enrichment           (Gemini API — services/ai_service.py)
    ├── 6. PDF Generation          (ReportLab — services/pdf_service.py)
    └── 7. SQLite Storage          (services/storage_service.py)
    ↓
Full JSON response + PDF file
```

---

## 📁 Project Structure

```
legalease-fullstack/
│
├── backend/
│   ├── main.py                        ← FastAPI app entry point
│   ├── requirements.txt               ← Python dependencies
│   ├── .env                           ← Your API key goes here
│   │
│   ├── models/
│   │   └── schemas.py                 ← Pydantic request/response models
│   │
│   ├── engines/
│   │   ├── rule_engine.py             ← Deterministic license mapping
│   │   └── risk_engine.py             ← Deterministic risk scoring (0-100)
│   │
│   ├── services/
│   │   ├── ai_service.py              ← Gemini API enrichment
│   │   ├── pdf_service.py             ← ReportLab PDF generation
│   │   └── storage_service.py        ← SQLite read/write
│   │
│   └── routers/
│       ├── analyze.py                 ← POST /api/analyze (main pipeline)
│       └── report.py                  ← GET /api/report/{id}
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env                           ← Backend URL config
│   └── src/
│       ├── main.jsx
│       └── App.jsx                    ← Full React UI
│
└── README.md
```

---

## 🚀 Setup & Run

### Step 1 — Get your free Gemini API key
1. Go to **https://aistudio.google.com/apikey**
2. Sign in with any Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

### Step 2 — Configure backend
Open `backend/.env` and paste your key:
```env
GEMINI_API_KEY=AIzaSy...your-actual-key...
BASE_URL=http://localhost:8000
DB_PATH=legalease.db
```

### Step 3 — Run the Python backend

```bash
cd backend

# Create virtual environment
python -m venv .venv_clean

# Activate it
# On Mac/Linux:
source .venv_clean/bin/activate
# On Windows:
.venv_clean\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
start_backend.cmd
```

Backend is now running at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

### Step 4 — Run the React frontend

```bash
# In a new terminal
cd frontend

npm install
npm run dev
```

Frontend is now running at: **http://localhost:5173**

---

## 🔌 API Endpoints

### `POST /api/analyze`
Main pipeline endpoint. Runs all 7 stages.

**Request:**
```json
{
  "idea": "Cloud kitchen in Mumbai delivering healthy tiffin meals",
  "location": "Maharashtra",
  "scale": "startup",
  "mode": "both"
}
```

**Response:**
```json
{
  "report_id": "A1B2C3D4",
  "business_name": "Mumbai Tiffin Cloud Kitchen",
  "category": "food",
  "summary": "...",
  "key_insight": "...",
  "feasibility": { "score": 68, "note": "...", "label": "Moderate" },
  "risk": { "score": 65, "note": "...", "label": "Medium Risk" },
  "compliance_complexity": { "score": 72, "note": "...", "label": "Complex" },
  "licenses": [...],
  "risks": [...],
  "action_plan": [...],
  "non_compliance_consequences": [...],
  "cost_estimates": [...],
  "risk_breakdown": [...],
  "follow_up_questions": [...],
  "pdf_url": "http://localhost:8000/reports/A1B2C3D4.pdf",
  "report_url": "http://localhost:8000/api/report/A1B2C3D4"
}
```

### `GET /api/report/{id}`
Retrieve any stored report by ID.

### `GET /api/report/{id}/pdf`
Download the PDF report.

### `GET /api/reports`
List all reports (for admin/debug).

### `GET /health`
Health check.

### `GET /docs`
Interactive Swagger UI — test all endpoints.

---

## 🧠 Python Engines Explained

### Rule Engine (`engines/rule_engine.py`)
- Contains **15+ license rule definitions** covering food, fintech, healthcare, education, manufacturing, export, real estate, logistics, tech, agriculture, retail, hospitality
- **State-specific rules** for Maharashtra, Delhi, Karnataka, Tamil Nadu, Gujarat, West Bengal, Kerala, Rajasthan, Telangana, UP
- Keyword + category matching — zero AI involved
- Fully deterministic and auditable

### Risk Engine (`engines/risk_engine.py`)
- Scores **5 risk dimensions**: Regulatory, Financial Penalty, Operational Compliance, Market & Competition, Legal Liability
- Base score from category × scale adjustment × mode adjustment × license count × high-risk keyword scan
- **High-risk keyword scanner**: alcohol (+20), crypto (+25), child/minor (+15), medicine (+10), etc.
- Returns overall score (0–100) + per-dimension breakdown

### PDF Service (`services/pdf_service.py`)
- **ReportLab**-powered — professional branded layout
- Cover page with business name + metadata
- Key insight callout box (gold)
- 3-column KPI score cards (color-coded)
- License cards with priority badges
- Risk bar chart (visual)
- Risk items with severity color coding
- Action plan with numbered steps
- Cost estimates table
- **QR code** linking to the online report
- Footer with disclaimer

---

## 🌐 Deploy for Free

### Backend — Railway.app (free tier)
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```
Set environment variable `GEMINI_API_KEY` in Railway dashboard.

### Frontend — Vercel (free)
```bash
cd frontend
# Update .env: VITE_API_BASE=https://your-railway-url.railway.app
npm run build
npx vercel --prod
```

---

## 🔑 Key Files to Edit

| File | What to change |
|------|---------------|
| `backend/.env` | Paste your Gemini API key |
| `frontend/.env` | Set `VITE_API_BASE` to your backend URL |
| `engines/rule_engine.py` | Add more license rules or categories |
| `engines/risk_engine.py` | Tune risk scores per category |
| `services/pdf_service.py` | Customize PDF branding/layout |

---

## ⚠️ Disclaimer
AI-generated legal information for educational purposes only. Not legal advice. Consult a qualified CA or lawyer before making business decisions.
