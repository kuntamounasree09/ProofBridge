# ProofBridge

AI-powered evidence and case-management platform. Organize service problems, analyze documents, identify missing evidence, and generate actionable resolution workflows.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  AI Service │
│  Next.js    │     │  Express    │     │   FastAPI   │
│  :3000      │     │  :5000      │     │   :8000     │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │ PostgreSQL  │
                    │ proofbridge │
                    └─────────────┘
```

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Python 3.11+
- Gemini API key ([Google AI Studio](https://aistudio.google.com/apikey))

## Setup

### 1. Database

```bash
createdb proofbridge
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secret

npm install
npm run migrate
npm run dev
```

### 3. AI Service

```bash
cd ai-service
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GEMINI_API_KEY

uvicorn main:app --reload --port 8000
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **User authentication** — Register, login, JWT-protected routes
- **Case management** — Create and track compliance/service cases
- **Document upload** — Upload TXT, PDF, DOCX with drag-and-drop and voice notes
- **AI analysis** — Automatic evidence analysis via Gemini (NLP + LLM)
- **Action plans** — Generate resolution workflows from evidence
- **Activity history** — Timestamped timeline of all case actions
- **Voice assistant** — Text-to-speech and speech-to-text (Web Speech API + AI chat)
- **Multilingual UI** — English and Hindi (easily extensible via `frontend/i18n/locales/`)
- **Dark / light mode** — Theme toggle with system preference detection
- **Professional UI** — Sidebar navigation, workflow progress tracker, responsive design

## Tech Stack (Placement Highlights)

| Area | Technologies |
|------|-------------|
| Full Stack | Next.js 16, Express, TypeScript, PostgreSQL, REST APIs, JWT Auth |
| AI/ML | Gemini LLM, document text extraction (PDF/DOCX), NLP analysis, voice AI chat |
| Engineering | Migrations, E2E tests (Playwright), env-based config, modular architecture |
| Workflow | Documents → AI processing → Gap analysis → Action plan → Progress tracking |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/auth/profile` | Get current user |
| GET/POST | `/api/cases` | List/create cases |
| GET | `/api/cases/:id` | Get case details |
| GET | `/api/cases/:id/history` | Get case activity timeline |
| POST | `/api/documents/upload` | Upload document (multipart) |
| GET | `/api/documents/case/:caseId` | List case documents |
| GET | `/api/action-plans/case/:caseId` | Get latest action plan |
| POST | `/api/action-plans/case/:caseId/generate` | Generate action plan |
| POST | `/api/ai/chat` | Voice assistant chat (case context) |

## Testing

### E2E (Playwright)

```bash
cd frontend
npx playwright install
npm run test:e2e
```

For full authenticated flow tests, set environment variables:

```bash
E2E_TEST_EMAIL=you@example.com E2E_TEST_PASSWORD=yourpassword npm run test:e2e
```

### Database cleanup

Remove duplicate documents and empty cases:

```bash
cd backend
npm run cleanup
```

## Project Structure

```
ProofBridge/
├── frontend/          Next.js 16 app (App Router + Tailwind v4)
├── backend/           Express + TypeScript API
│   ├── migrations/    SQL schema migrations
│   └── scripts/       migrate & cleanup utilities
└── ai-service/        FastAPI + Gemini integration
```

## Environment Variables

See `.env.example` in each service directory.
