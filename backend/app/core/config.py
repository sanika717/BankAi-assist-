import os
from pathlib import Path
from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=_env_path)


class Settings:
    app_name: str = "GenAI Banking Voice Assistant"
    version: str = "2.0.0"

    cors_origins: str = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
    )
    openai_api_key: str = os.getenv("OPENAI_API_KEY") or os.getenv("GROQ_API_KEY", "")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")

    secret_key: str = os.getenv("SECRET_KEY", "vani-default-secret")
    algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    whisper_model: str = os.getenv("WHISPER_MODEL", "whisper-large-v3")
    temp_audio_dir: str = os.getenv("TEMP_AUDIO_DIR", "/tmp/vani_audio")

    @property
    def demo_mode(self) -> bool:
        return not bool(self.openai_api_key)


settings = Settings()
