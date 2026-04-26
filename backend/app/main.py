from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.db import init_db
from app.routes.auth import router as auth_router
from app.routes.voice import router as voice_router
from app.routes.translation import router as translation_router
from app.routes.intent import router as intent_router
from app.routes.summary import router as summary_router
from app.routes.history import router as history_router

app = FastAPI(
    title="GenAI Banking Voice Assistant",
    version="2.0.0",
    description="Multilingual AI-powered customer support assistant for bank branches.",
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    mode = "DEMO (no OpenAI key)" if settings.demo_mode else "LIVE (OpenAI connected)"
    print(f"✅ BankAssist AI v{settings.version} started — Mode: {mode}")
    print(f"   CORS origins: {origins}")

app.include_router(auth_router)
app.include_router(voice_router)
app.include_router(translation_router)
app.include_router(intent_router)
app.include_router(summary_router)
app.include_router(history_router)

@app.get("/health", tags=["system"])
def health():
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.version,
        "demo_mode": settings.demo_mode,
        "ai_features": "disabled — add OPENAI_API_KEY to .env" if settings.demo_mode else "enabled",
    }

@app.get("/", tags=["system"])
def root():
    return {
        "message": "BankAssist AI API is running.",
        "docs": "/docs",
        "health": "/health",
    }
