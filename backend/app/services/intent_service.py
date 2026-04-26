import json
from typing import Any, Dict, Optional

from app.core.config import settings
from app.services.translate_service import translation_service


DEMO_INTENTS = {
    "account": {
        "intent": "account_opening",
        "confidence": 0.92,
        "entities": {"account_type": "savings"},
        "suggested_responses": [
            "I'd be happy to help you open a new account. Please bring your Aadhaar card and PAN card.",
            "For account opening, we need KYC documents. Do you have them ready?",
            "Let me guide you through our account opening process step by step.",
        ],
        "workflow_steps": [
            "Verify customer identity (Aadhaar/PAN)",
            "Collect account opening form",
            "Complete KYC verification",
            "Issue account number and passbook",
        ],
    },
    "loan": {
        "intent": "loan_enquiry",
        "confidence": 0.88,
        "entities": {"loan_type": "personal"},
        "suggested_responses": [
            "I can provide information about our loan products. What type of loan are you interested in?",
            "Our loan interest rates start from 8.5% p.a. Shall I explain the eligibility criteria?",
            "Please share your income details so I can suggest the best loan option for you.",
        ],
        "workflow_steps": [
            "Capture loan type and amount required",
            "Verify income and employment documents",
            "Run eligibility check",
            "Submit application and provide reference number",
        ],
    },
}

FALLBACK = {
    "intent": "general_bank_query",
    "confidence": 0.65,
    "entities": {},
    "suggested_responses": [
        "I can help you with that. Could you share more details about your request?",
        "Let me verify your account and assist you with the banking service.",
        "Please provide your account number so I can look into this for you.",
    ],
    "workflow_steps": [
        "Authenticate customer identity",
        "Capture key details and documents",
        "Explain next steps and expected timeline",
        "Provide reference number for follow-up",
    ],
}


class IntentService:
    def __init__(self):
        self.client = None
        if settings.openai_api_key:
            from openai import OpenAI
            self.client = OpenAI(api_key=settings.openai_api_key)

    def detect(self, text: str) -> Dict[str, Any]:
        if not self.client:
            text_lower = text.lower()
            if any(w in text_lower for w in ["account", "open", "savings", "current"]):
                return DEMO_INTENTS["account"]
            if any(w in text_lower for w in ["loan", "borrow", "credit", "emi"]):
                return DEMO_INTENTS["loan"]
            return FALLBACK

        system = (
            "You are a banking assistant intent classifier. "
            "Return JSON with keys: intent, confidence (0-1), entities, "
            "suggested_responses (list of 3), workflow_steps (list of 4). "
            "Intents: account_opening, loan_enquiry, kyc_update, card_issue, balance_query, general_bank_query."
        )
        try:
            resp = self.client.chat.completions.create(
                model=settings.openai_model,
                response_format={"type": "json_object"},
                messages=[{"role": "system", "content": system}, {"role": "user", "content": text}],
                temperature=0.2,
            )
            return json.loads(resp.choices[0].message.content or "{}")
        except Exception:
            return FALLBACK

    def generate_response(
        self,
        customer_text_english: str,
        intent: str,
        response_language: str,
        staff_reply_text: Optional[str] = None,
    ) -> Dict[str, str]:
        fallback_english = (
            staff_reply_text
            or "Please reassure the customer, verify their identity, and provide the relevant bank process and timelines."
        )
        if self.client:
            system = (
                "You assist frontline bank staff. Return JSON with key 'staff_assist_english' only. "
                "Be concise, compliant, and actionable."
            )
            user = f"Intent: {intent}\nCustomer: {customer_text_english}\nStaff draft: {staff_reply_text or 'N/A'}"
            try:
                resp = self.client.chat.completions.create(
                    model=settings.openai_model,
                    response_format={"type": "json_object"},
                    messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
                    temperature=0.2,
                )
                data = json.loads(resp.choices[0].message.content or "{}")
                staff_assist = data.get("staff_assist_english", fallback_english)
            except Exception:
                staff_assist = fallback_english
        else:
            staff_assist = fallback_english

        customer_text = translation_service.translate_text(staff_assist, "en", response_language)
        return {
            "staff_assist_english": staff_assist,
            "customer_facing_text": customer_text,
            "response_language": response_language,
        }


intent_service = IntentService()
