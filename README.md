# Clinic System

A mobile-first clinic management system with a patient portal, staff dashboard, and AI-assisted clinical tools.

Built as a full rebuild of an earlier prototype — Django REST Framework backend, React + Vite frontend, installable as a PWA.

## Tech stack

**Backend**

- Django 5 + Django REST Framework
- PostgreSQL
- JWT authentication (`djangorestframework-simplejwt`)
- Google Gemini (`gemini-2.0-flash`) for AI features
- Tesseract OCR (`pytesseract`)

**Frontend**

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- PWA (installable, offline-capable app shell via `vite-plugin-pwa`)
- `lucide-react` for icons

## Features

- **Auth & roles** — JWT-based login/register, five roles (admin, doctor, nurse, receptionist, patient), role-based permissions enforced on every endpoint
- **Patients** — staff CRUD, patient self-service profile view
- **Appointments** — staff booking + patient self-booking, automatic doctor double-booking prevention
- **Billing** — invoices with line items, paid/unpaid workflow
- **Notifications** — per-user in-app feed with unread badge
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
│   ├── notifications/
│   └── ai_features/
└── frontend/         # React + Vite + Tailwind PWA
    └── src/
        ├── pages/
        ├── components/
        └── lib/       # api client, auth context, types
```

## Getting started

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

Create `backend/.env`:

```
SECRET_KEY=your-secret-key
DEBUG=True
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

Create `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8000
```

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

## API overview

| Endpoint                                     | Description                         |
| -------------------------------------------- | ----------------------------------- |
| `POST /api/auth/register/`                   | Create a patient account            |
| `POST /api/auth/login/`                      | Get JWT access/refresh tokens       |
| `GET /api/auth/me/`                          | Current user info                   |
| `GET/POST /api/patients/`                    | Staff-only patient CRUD             |
| `GET /api/patients/me/`                      | Patient's own profile               |
| `GET/POST /api/appointments/`                | Staff-only appointment CRUD         |
| `GET/POST /api/appointments/me/`             | Patient's own appointments          |
| `GET/POST /api/billing/invoices/`            | Staff-only invoices                 |
| `POST /api/billing/invoices/{id}/mark_paid/` | Mark an invoice paid                |
| `GET /api/notifications/`                    | Current user's notifications        |
| `POST /api/notifications/{id}/mark_read/`    | Mark a notification read            |
| `POST /api/ai/chat/sessions/`                | Start a triage chat session         |
| `POST /api/ai/chat/sessions/{id}/messages/`  | Send a chat message                 |
| `POST /api/ai/summary/`                      | Summarize report text               |
| `POST /api/ai/ocr/extract/`                  | Extract text from an uploaded image |

## Known limitations / not yet built

- No Docker Compose setup yet (planned for deployment, not local dev)
- No JWT access-token auto-refresh on the frontend (expired sessions currently require re-login)
- OCR extracted text isn't saved back to a patient's record automatically — it's a standalone tool
- PWA caches the app shell only, not offline data sync/writes
