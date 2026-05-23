# 🚀 INDIAIN

INDIAIN is an AI-powered Career Intelligence & Placement Readiness platform focused on helping students and early professionals assess skills, improve resumes, verify profiles, and find better job matches.

This README has been updated to list the modules and features that exist in the current workspace, plus exact run/setup instructions for local development (Windows & POSIX).

**Summary of what's included (so far)**
- **Backend (FastAPI):** core API and AI integrations located in `backend/`.
- **Frontend (React + Vite + Tailwind):** single-page app under `indiain-frontend/`.
- **Database:** SQLAlchemy models with helpers in `backend/` and migrations/initialization scripts.

**Quick status:** Most core endpoints and AI helpers are implemented in `backend/`. Frontend pages and services call the backend API via `indiain-frontend/src/services/api.js`.

**Environment variables used (set these before running backend):**
- `DATABASE_URL` — SQLAlchemy connection string (e.g. `sqlite:///test.db` or Postgres URL)
- `GOOGLE_API_KEY` — required for AI calls (Gemini via `google.genai` client)
- `APP_ID`, `APP_KEY` (or `YOUR_APP_ID`, `YOUR_APP_KEY`) — Adzuna / job API keys used in some endpoints

**Modules / files implemented (brief description)**

- `backend/main.py` — Main FastAPI application. Implements user registration/login, profile management, resume upload, ATS checks, AI resume review, cover-letter generation, tailor resume, career roadmap creation, job recommendations, market trends, readiness/placement score endpoints, roadmap endpoints, verification endpoints (GitHub/LeetCode), chatbot endpoint, and many helper routes.

- `backend/ai_resume_analyzer.py` — Wraps Google GenAI (Gemini) to generate AI-driven resume review, interview questions, tailored resume JSON, cover letters, and career roadmaps. Handles quota/error messages and returns structured JSON where required.

- `backend/ats_advanced.py` — Resume text extraction (pdfminer) and ATS scoring utilities (skill detection, experience/education detection, ATS score calculation and feedback generation).

- `backend/job_recommender.py` — Simple role/job recommender using `job_roles.py` role definitions and skill matching logic.

- `backend/job_roles.py` — In-repo list of sample roles and their expected skills (Backend, Frontend, Data Analyst, ML Engineer).

- `backend/database.py` — SQLAlchemy engine / session factory and `Base` declarative base. Reads `DATABASE_URL` from environment.

- `backend/models.py` — SQLAlchemy ORM models: `User`, `Profile`, `Resume`, `Job`, `Role`, `JobApplication`, `Roadmap`, `RoadmapTask`, plus simple skill mapping tables.

- `backend/schemas.py` — Pydantic schemas used by some endpoints (`ProfileCreate`, `SkillAdd`).

- `backend/initialize_db.py` — Helper script to create DB tables from models (`Base.metadata.create_all`).

- `backend/list_models.py` — Small script to list available GenAI models via `google.genai` client (debug/inspection).

- `backend/migrate_db.py`, `backend/test.db`, and `backend/resumes/` — helper files/artifacts; `migrate_db.py` can be used for DB migration logic (review before running).

- `indiain-frontend/` — React/Vite app. Key parts:
	- `src/App.jsx` — main router and protected routes
	- `src/services/api.js` — axios instance for backend calls and auth token handling
	- `src/pages/` — many feature pages implemented: `AIReview.jsx`, `ATSChecker.jsx`, `CareerRoadmap.jsx`, `CoverLetterGenerator.jsx`, `Dashboard.jsx`, `JobDetail.jsx`, `JobRecommendations.jsx`, `Login.jsx`, `MarketTrends.jsx`, `ProfileEngine.jsx`, `ReadinessDashboard.jsx`, `ResumeBuilder.jsx`, `ResumeUpload.jsx`, `RoleAnalysis.jsx`, `Signup.jsx`, `ProtectedRoute.jsx`.
	- `src/components/` — UI components including `AppLayout.jsx`, `Chatbot.jsx`, `Navbar.jsx`.

**Implemented features (high-level)**
- User auth (register/login) and token-based protected endpoints.
- Profile creation and update.
- Resume upload and PDF text extraction.
- ATS scoring and feedback (simple keyword matching & length scoring).
- AI resume review, interview question generation, tailored resumes, cover letters and career roadmaps (via `google.genai`).
- Job fetching from Adzuna (requires API keys) and simple smart matching based on detected skills.
- Placement readiness and readiness breakdown metrics.
- Roadmap creation, task CRUD for generated roadmaps.
- GitHub & LeetCode verification endpoints (fetch public repo and solved counts).
- Market trends endpoint (Adzuna-based heuristic time-series)

**Local setup & run (Windows & POSIX)**

Backend (recommended: Python 3.10+)

1. Create and activate a virtual environment

Windows (PowerShell):

```powershell
cd backend
python -m venv venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
venv\\Scripts\\Activate.ps1
```

Windows (cmd):

```cmd
cd backend
python -m venv venv
venv\\Scripts\\activate.bat
```

macOS / Linux:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies (create `requirements.txt` if missing)

```bash
pip install -r requirements.txt
```

3. Configure environment variables (example `.env`)

Create a `.env` file in `backend/` with:

```
DATABASE_URL=sqlite:///test.db
GOOGLE_API_KEY=your_google_api_key_here
APP_ID=your_adzuna_app_id
APP_KEY=your_adzuna_app_key
```

4. Initialize the DB (will create tables):

```bash
python initialize_db.py
```

5. Run the backend

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend (Node + npm)

1. Install dependencies and run dev server

```bash
cd ../indiain-frontend
npm install
npm run dev
```

2. Frontend expects API at `VITE_API_BASE_URL` or defaults to `http://127.0.0.1:8000`.

**Important notes & safety**
- The AI features use `google.genai` — make sure `GOOGLE_API_KEY` is set and you have quota.
- `APP_ID`/`APP_KEY` are used to call Adzuna job search APIs — supply them to enable live job fetching.
- The current resume/ATS implementations are intentionally simple (keyword matching). For production, replace with robust NLP pipelines and secure file storage.

**What I updated in this README**
- Added an explicit list of implemented backend modules and frontend pages.
- Added concrete Windows & POSIX setup steps and environment variables.
- Summarized implemented endpoints & features to match the current codebase.

If you want, I can:
- Add a `requirements.txt` with the detected Python dependencies.
- Add a `CONTRIBUTING.md` or `DEVELOPMENT.md` with more detailed run/debug instructions.
- Create a simple `docker-compose.yml` to run the API + DB locally.

---

Thank you — tell me if you want README text in Hindi or any extra sections added.
