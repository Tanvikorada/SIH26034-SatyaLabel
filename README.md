# SatyaLabel — Legal Metrology Compliance Checker

SatyaLabel is a Smart India Hackathon project focused on checking whether packaged commodities comply with the Legal Metrology (Packaged Commodities) Rules, 2011.

## What the project does

- Uploads product/label images
- Extracts declarations from packaged labels using OCR + AI-assisted fallback flows
- Validates mandatory fields against legal compliance rules
- Highlights violations with rule references and severity levels
- Generates PDF compliance reports for enforcement and review workflows
- Stores scan records and results in a searchable dashboard

## Repository structure

```text
satyalabel/
├── backend/                  # Express API, database models, OCR/extraction services, reporting
├── frontend/                 # Next.js app for upload, dashboard, history, and reports
├── docs/                     # Project documentation and legal rule references
├── .github/                  # CI workflow config
├── archive/                  # Historical debugging scripts, dumps, and old prototypes
├── setup.sh                  # Local setup script for Mac/Linux
├── setup.ps1                 # Local setup script for Windows
├── render.yaml               # Render deployment configuration
├── vercel.json               # Vercel frontend configuration
├── DEPLOYMENT_GUIDE.md       # Setup and deployment guide
├── DEPLOY_CHECKLIST.md       # Deployment automation status
├── .gitignore                # Ignore generated files and local env config
├── README.md                 # Project overview and repository guide
└── package.json              # Root utility metadata (not the app source of truth)
```

## Source of truth

The actual product code lives in:
- `backend/` for the server, rules engine, OCR pipeline, database, and report generation
- `frontend/` for the user-facing UI and dashboards

The root folder is intentionally kept clean and contains only setup, deployment, and documentation resources.

## Local setup

### Prerequisites

- Node.js 18+
- PostgreSQL
- Tesseract OCR installed and available in PATH
- A Gemini API key for AI fallback (optional but recommended)

### Quick start

```bash
# backend
cd backend
npm install
cp .env.example .env
# fill DB credentials and other env values
npm run dev

# frontend
cd ../frontend
npm install
npm run dev
```

Then open the frontend in the browser and upload package images for processing.

## Deployment

- Frontend: deploy to Vercel
- Backend: deploy to Render
- Database: PostgreSQL on Render or Neon

See `DEPLOYMENT_GUIDE.md` and `DEPLOY_CHECKLIST.md` for step-by-step deployment instructions.

## Notes on repository hygiene

This repository intentionally separates active source code from one-off exploratory artifacts. Historical debugging and experiment files are stored under `archive/legacy-scripts/` so that the project remains easier to maintain and present professionally without affecting the actual app functionality.
