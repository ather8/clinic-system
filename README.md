# Clinic System

A mobile-first clinic management system with a patient portal, staff dashboard, and AI-assisted clinical tools.

Built as a full rebuild of an earlier prototype — Django REST Framework backend, React + Vite frontend, installable as a PWA, and wrapped as a native Android app via Capacitor.

**Live:** https://clinic-system.up.railway.app

## Tech stack

**Backend**

- Django 5 + Django REST Framework
- PostgreSQL
- JWT authentication (`djangorestframework-simplejwt`)
- Automatic JWT refresh on 401 (silent access-token renewal via the refresh token, with request de-duplication for concurrent failures)
- Google Gemini (`gemini-2.0-flash`) via the `google-genai` SDK, for AI features
- Tesseract OCR (`pytesseract`)
- Deployed on Railway (Docker)

**Frontend**

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- PWA (installable, offline-capable app shell via `vite-plugin-pwa`)
- `lucide-react` for icons
- Deployed on Railway (Docker + Nginx)

**Mobile**

- Capacitor (Android wrapper around the built web app)
- `@capacitor/push-notifications` (device registration in place; FCM setup pending)

## Features

- **Auth & roles** — JWT-based login/register, five roles (admin, doctor, nurse, receptionist, patient), role-based permissions enforced on every endpoint
- **Patients** — staff CRUD, patient self-service profile view
- **Appointments** — staff booking + patient self-booking, automatic doctor double-booking prevention
- **Billing** — invoices with line items, paid/unpaid workflow, staff-only
- **Notifications** — per-user in-app feed with unread badge, live updates
- **AI triage chat** — multi-turn symptom-checking conversation with department suggestions
- **AI report summarization** — structured summaries of medical report text
- **OCR** — extract text from scanned documents/images

## Project structure

```
clinic-system/
├── backend/          # Django + DRF API
│   ├── config/       # settings, root urls
│   ├── accounts/      # custom User model, auth endpoints, permissions
│   ├── patients/
│   ├── appointments/
│   ├── billing/
│   ├── notifications/ # includes DeviceToken for push notifications
│   └── ai_features/
├── frontend/         # React + Vite + Tailwind PWA
│   ├── android/       # Capacitor-generated native Android project
│   └── src/
│       ├── pages/
│       ├── components/
│       └── lib/       # api client, auth context, types
└── docker-compose.yml # local multi-service dev (optional alternative to running each separately)
```

## Getting started (local development)

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 15+
- [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki) (for the OCR feature)
- A [Gemini API key](https://aistudio.google.com/apikey) (for AI features)

### Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
```

Create a Postgres database and user:

```sql
CREATE DATABASE clinic_db;
CREATE USER clinic_user WITH PASSWORD 'clinic_pass';
GRANT ALL ON SCHEMA public TO clinic_user;
```

> Note: if you ever drop and recreate the database, you'll need to rerun the `GRANT ALL ON SCHEMA public` line — schema grants don't persist across a fresh `CREATE DATABASE`.

Create `backend/.env`:

```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
DATABASE_URL=postgres://clinic_user:clinic_pass@localhost:5432/clinic_db
GEMINI_API_KEY=your-gemini-key
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
```

Run migrations and start the server:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API available at `http://localhost:8000`. Admin panel at `http://localhost:8000/admin`.

### Frontend setup

```bash
cd frontend
npm install
```

This project uses **two env files** depending on target:

- `frontend/.env` — local browser development, points at your local Django server
- `frontend/.env.production` — used automatically by `npm run build` (production mode), points at the deployed backend. Needed for building the mobile app, since a phone can't reach your machine's `localhost`.

Create `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8000
```

Create `frontend/.env.production`:

```
VITE_API_BASE_URL=https://clinic-system-production-f3a8.up.railway.app
```

Run the dev server:

```bash
npm run dev
```

App available at `http://localhost:5173`.

### Building for production (PWA)

PWA features (install prompt, offline shell caching) only activate on a production build:

```bash
npm run build
npm run preview
```

## Deployment (Railway)

Three services: PostgreSQL, backend (Django, Dockerfile-based), frontend (React build served via Nginx, Dockerfile-based).

**Backend service**

- Root directory: `backend`
- Env vars: `SECRET_KEY`, `DEBUG=False`, `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `CORS_ALLOWED_ORIGINS` (exact frontend domain, no trailing slash), `ALLOWED_HOSTS` (backend's own domain, no scheme/slash), `GEMINI_API_KEY`, `TESSERACT_CMD=/usr/bin/tesseract`
- The Dockerfile's `CMD` runs migrations then starts gunicorn, reading `$PORT` from Railway automatically — no custom start command needed in the Railway dashboard

**Frontend service**

- Root directory: `frontend`
- Build-time env var: `VITE_API_BASE_URL` (real backend URL) — Railway passes dashboard variables as Docker build args automatically
- Nginx serves the built SPA with client-side routing support (`try_files ... /index.html`) and `index.html` set to never cache, so users always get the latest build after a deploy

**Creating a superuser on a deployed instance:** use the Postgres service's `DATABASE_PUBLIC_URL` (not the internal one) to connect from your local machine:

```bash
$env:DATABASE_URL = "<DATABASE_PUBLIC_URL from Railway>"
python manage.py createsuperuser
```

## Mobile app (Android via Capacitor)

The React app is wrapped natively using Capacitor, bundling the built web assets locally (fully offline-capable shell, not just a remote webview).

```bash
cd frontend
npm run build          # uses .env.production automatically
npx cap sync android
npx cap run android     # requires a connected device or emulator, and ANDROID_HOME/JAVA_HOME set up
```

**Requirements:** Android SDK (via Android Studio, or command-line tools), JDK 21 (Capacitor's current Android tooling requires 21, not just any JDK), a physical device with USB debugging enabled or an emulator.

**Push notifications:** `@capacitor/push-notifications` is installed and device tokens are collected via `POST /api/notifications/register-device/`, but Firebase Cloud Messaging (needed to actually _send_ pushes) isn't set up yet.

iOS build requires a Mac with Xcode — not currently set up.

## API overview

| Endpoint                                     | Description                               |
| -------------------------------------------- | ----------------------------------------- |
| `POST /api/auth/register/`                   | Create a patient account                  |
| `POST /api/auth/login/`                      | Get JWT access/refresh tokens             |
| `GET /api/auth/me/`                          | Current user info                         |
| `GET /api/auth/doctors/`                     | List doctor-role users                    |
| `GET/POST /api/patients/`                    | Staff-only patient CRUD                   |
| `GET /api/patients/me/`                      | Patient's own profile                     |
| `GET/POST /api/appointments/`                | Staff-only appointment CRUD               |
| `GET/POST /api/appointments/me/`             | Patient's own appointments                |
| `GET/POST /api/billing/invoices/`            | Staff-only invoices                       |
| `POST /api/billing/invoices/{id}/mark_paid/` | Mark an invoice paid                      |
| `GET /api/notifications/`                    | Current user's notifications              |
| `POST /api/notifications/{id}/mark_read/`    | Mark a notification read                  |
| `GET /api/notifications/unread_count/`       | Unread count for the nav badge            |
| `POST /api/notifications/register-device/`   | Register a push notification device token |
| `POST /api/ai/chat/sessions/`                | Start a triage chat session               |
| `POST /api/ai/chat/sessions/{id}/messages/`  | Send a chat message                       |
| `POST /api/ai/summary/`                      | Summarize report text                     |
| `POST /api/ai/ocr/extract/`                  | Extract text from an uploaded image       |

## Known limitations / not yet built

- OCR extracted text isn't saved back to a patient's record automatically — it's a standalone tool
- PWA/mobile app cache the app shell only, not offline data sync/writes
- Push notifications collect device tokens but don't yet send anything (FCM setup pending)
- No iOS build yet (requires a Mac)
- `docker-compose.yml` exists for local multi-service testing but isn't the primary local dev path (see "Getting started" above for running services individually)
