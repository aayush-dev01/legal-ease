# LegalEase AI

AI-powered legal intelligence platform for Indian founders.  
LegalEase turns a business idea into a structured compliance report with licenses, risks, action steps, document verification, downloadable reports, and founder-friendly workspace tools.

## Screenshots

### Analyze Flow
![Analyze Flow](docs/screenshots/analyze-page.png)

### Report Dashboard
![Report Dashboard](docs/screenshots/report-dashboard.png)

## What It Does

- Analyzes a startup or business idea with India-specific compliance logic
- Generates a full legal/compliance report with risks, licenses, costs, and actions
- Stores past reports for dashboard access and comparison
- Lets users upload and verify required documents in a document vault
- Exports polished PDF and Excel reports

## Stack

- Frontend: React + Vite
- Backend: FastAPI + Python
- Database: SQLite
- AI: Gemini for report enrichment, Groq for document verification
- Reports: ReportLab PDF + OpenPyXL Excel

## Run Locally

### Backend

```bash
cd backend
python -m venv .venv_clean
.venv_clean\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App URLs:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:8000`
- API Docs: `http://127.0.0.1:8000/docs`

## Key Features

- Business analysis dashboard
- Past reports and report comparison
- Compliance timeline and apply assistant
- Workspace task tracker
- Document vault with verification notes
- PDF and premium Excel export

## Disclaimer

LegalEase AI is an informational product and not a substitute for advice from a qualified lawyer, CA, or compliance professional.
