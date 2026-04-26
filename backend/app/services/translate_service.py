from app.core.config import settings


class TranslationService:
    def translate_text(self, text: str, source_lang: str, target_lang: str) -> str:
        if source_lang == target_lang or not text.strip():
            return text
        try:
            from deep_translator import GoogleTranslator
            return GoogleTranslator(source=source_lang, target=target_lang).translate(text)
        except Exception:
            return text  # fallback: return original


translation_service = TranslationService()
