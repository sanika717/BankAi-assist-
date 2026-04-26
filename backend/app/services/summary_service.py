import json
from typing import Any, Dict, List

from app.core.config import settings
from app.services.translate_service import translation_service


class SummaryService:
    def __init__(self):
        self.client = None
        if settings.openai_api_key:
            from openai import OpenAI
            self.client = OpenAI(api_key=settings.openai_api_key)

    def summarize(self, history: List[Dict[str, Any]], customer_language: str) -> Dict[str, str]:
        text_blob = "\n".join(
            [f"{item.get('speaker', 'unknown')}: {item.get('text', '')}" for item in history]
        )
        if self.client:
            try:
                resp = self.client.chat.completions.create(
                    model=settings.openai_model,
                    response_format={"type": "json_object"},
                    messages=[
                        {"role": "system", "content": "Summarize this banking conversation in bullet points for staff handoff. Return JSON with key summary_english."},
                        {"role": "user", "content": text_blob},
                    ],
                    temperature=0.2,
                )
                data = json.loads(resp.choices[0].message.content or "{}")
                summary_english = data.get("summary_english", "No summary available.")
            except Exception:
                summary_english = "Conversation covered customer banking request, verification guidance, and next steps."
        else:
            summary_english = (
                "• Customer inquired about banking services\n"
                "• Staff verified customer identity\n"
                "• Next steps and documentation requirements explained\n"
                "• Follow-up reference provided"
            )

        summary_local = translation_service.translate_text(summary_english, "en", customer_language)
        return {
            "summary_english": summary_english,
            "summary_customer_language": summary_local,
            "customer_language": customer_language,
        }


summary_service = SummaryService()
