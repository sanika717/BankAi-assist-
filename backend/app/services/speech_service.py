import os
import uuid
from pathlib import Path

from app.core.config import settings


class SpeechService:
    def __init__(self):
        self.temp_dir = settings.temp_audio_dir
        Path(self.temp_dir).mkdir(parents=True, exist_ok=True)

    async def speech_to_text(self, audio_file, language_hint: str = "") -> str:
        if not settings.openai_api_key:
            return "[Demo Mode] Customer said: I would like to open a new savings account."

        from openai import OpenAI
        client = OpenAI(api_key=settings.openai_api_key)
        audio_bytes = await audio_file.read()
        tmp_path = Path(self.temp_dir) / f"stt_{uuid.uuid4().hex}.webm"
        tmp_path.write_bytes(audio_bytes)
        try:
            with open(tmp_path, "rb") as f:
                kwargs = {"model": settings.whisper_model, "file": f}
                if language_hint:
                    kwargs["language"] = language_hint
                transcript = client.audio.transcriptions.create(**kwargs)
            return transcript.text
        finally:
            tmp_path.unlink(missing_ok=True)

    def text_to_speech(self, text: str, language_code: str = "hi") -> str:
        output_path = str(Path(self.temp_dir) / f"tts_{uuid.uuid4().hex}.mp3")
        try:
            from gtts import gTTS
            tts = gTTS(text=text, lang=language_code)
            tts.save(output_path)
        except Exception:
            # create silent fallback
            Path(output_path).write_bytes(b"")
        return output_path


speech_service = SpeechService()
