from app.core.config import settings
from app.services.banking_glossary import preprocess_text


class TranslationService:
    def translate_text(self, text: str, source_lang: str, target_lang: str, intent: str = None) -> dict:
        if source_lang == target_lang or not text.strip():
            return {"translated_text": text, "detected_terms": []}

        # Preprocess text with banking glossary
        processed_text, detected_terms = preprocess_text(text, intent)

        try:
            from deep_translator import GoogleTranslator
            translated = GoogleTranslator(source=source_lang, target=target_lang).translate(processed_text)
            return {"translated_text": translated, "detected_terms": detected_terms}
        except Exception:
            return {"translated_text": text, "detected_terms": detected_terms}  # fallback: return original


translation_service = TranslationService()
