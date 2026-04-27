import json
import uuid
from typing import Any, Dict, List

from app.core.config import settings
from app.services.translate_service import translation_service


class SummaryService:
    def __init__(self):
        self.client = None
        if settings.openai_api_key:
            from openai import OpenAI
            self.client = OpenAI(api_key=settings.openai_api_key)

    def _format_document_lists(self, required_documents: List[Dict[str, Any]], document_statuses: Dict[str, str]):
        verified = [doc["label"] for doc in required_documents if document_statuses.get(doc["id"]) == "Stored"]
        missing = [doc["label"] for doc in required_documents if document_statuses.get(doc["id"]) != "Stored"]
        return verified, missing

    def summarize(
        self,
        history: List[Dict[str, Any]],
        customer_language: str,
        intent: str = "general_bank_query",
        customer_transcript: str = "",
        english_transcript: str = "",
        staff_response: str = "",
        customer_response: str = "",
        required_documents: List[Dict[str, Any]] = None,
        document_statuses: Dict[str, str] = None,
        eligibility_result: str = "",
        next_action: str = "",
        reference_number: str = None,
        confidence: float = None,
    ) -> Dict[str, Any]:
        required_documents = required_documents or []
        document_statuses = document_statuses or {}
        verified_docs, missing_docs = self._format_document_lists(required_documents, document_statuses)
        reference_number = reference_number or f"REF-{uuid.uuid4().hex[:8].upper()}"
        text_blob = "\n".join(
            [f"{item.get('speaker', 'unknown')}: {item.get('text', '')}" for item in history]
        )

        fallback_summary = [
            f"Intent detected: {intent.replace('_', ' ')}",
            f"Verified documents: {', '.join(verified_docs) or 'None'}",
            f"Missing documents: {', '.join(missing_docs) or 'None'}",
            f"Eligibility result: {eligibility_result or 'Pending assessment'}",
            f"Next action: {next_action or 'Follow up with the customer and complete remaining requirements'}",
            f"Reference number: {reference_number}",
        ]
        summary_english = "\n".join([f"• {line}" for line in fallback_summary])

        if self.client:
            try:
                prompt = (
                    "You are a banking assistant creating a handoff summary. "
                    "Summarize the conversation clearly in bullet points and include the following fields: "
                    "Intent detected, Verified documents, Missing documents, Eligibility result, Next action, Reference number. "
                    "Return valid JSON with keys: summary_english, intent, verified_documents, missing_documents, "
                    "eligibility_result, next_action, reference_number."
                )
                details = (
                    f"Conversation:\n{text_blob}\n\n"
                    f"Customer transcript: {customer_transcript}\n"
                    f"Translated text: {english_transcript}\n"
                    f"Staff response: {staff_response}\n"
                    f"Customer response: {customer_response}\n"
                    f"Intent: {intent}\n"
                    f"Verified documents: {', '.join(verified_docs) or 'None'}\n"
                    f"Missing documents: {', '.join(missing_docs) or 'None'}\n"
                    f"Eligibility result: {eligibility_result or 'Pending'}\n"
                    f"Next action: {next_action or 'Follow up with customer'}\n"
                    f"Reference number: {reference_number}\n"
                )
                resp = self.client.chat.completions.create(
                    model=settings.openai_model,
                    response_format={"type": "json_object"},
                    messages=[
                        {"role": "system", "content": prompt},
                        {"role": "user", "content": details},
                    ],
                    temperature=0.2,
                )
                data = json.loads(resp.choices[0].message.content or "{}")
                summary_english = data.get("summary_english", summary_english)
                intent = data.get("intent", intent)
                verified_docs = data.get("verified_documents", verified_docs)
                missing_docs = data.get("missing_documents", missing_docs)
                eligibility_result = data.get("eligibility_result", eligibility_result)
                next_action = data.get("next_action", next_action)
                reference_number = data.get("reference_number", reference_number)
            except Exception:
                pass

        translated = translation_service.translate_text(summary_english, "en", customer_language)
        summary_local = translated.get("translated_text", summary_english) if isinstance(translated, dict) else translated
        return {
            "summary_english": summary_english,
            "summary_customer_language": summary_local,
            "customer_language": customer_language,
            "intent": intent,
            "verified_documents": verified_docs,
            "missing_documents": missing_docs,
            "eligibility_result": eligibility_result,
            "next_action": next_action,
            "reference_number": reference_number,
        }


summary_service = SummaryService()
