import os
from pathlib import Path
from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parents[3] / ".env"
load_dotenv(dotenv_path=_env_path)


class Settings:
    app_name: str = "GenAI Banking Voice Assistant"
    version: str = "2.0.0"

    cors_origins: str = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
    )
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")

    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    whisper_model: str = os.getenv("WHISPER_MODEL", "whisper-1")
    temp_audio_dir: str = os.getenv("TEMP_AUDIO_DIR", "/tmp/bankassist_audio")

    @property
    def demo_mode(self) -> bool:
        return not bool(self.openai_api_key)


settings = Settings()
