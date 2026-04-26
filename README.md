# BankAssist AI — Multilingual Banking Voice Assistant

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env .env  # edit OPENAI_API_KEY if you have one
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### Demo Login
- Email: `staff@bank.com`
- Password: `demo1234`

## Demo Mode
Leave `OPENAI_API_KEY` blank in `.env` — the app runs fully in demo mode with mock AI responses.

## Project Structure
```
backend/
  app/
    core/config.py       ← env + settings
    database/db.py       ← SQLite init
    routes/              ← FastAPI routers
    services/            ← AI service logic
    main.py              ← app entry point
  .env                   ← environment config
  requirements.txt

frontend/
  src/
    App.jsx              ← root with router + auth
    main.jsx             ← entry point
    routes/AppRoutes.jsx ← route definitions
    pages/               ← Dashboard, Assistant, History, Analytics, Settings, Login
    components/          ← Navbar, Sidebar, cards
    context/AuthContext  ← auth state
    services/api.js      ← API client
