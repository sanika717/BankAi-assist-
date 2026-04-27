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
    "fd": {
        "intent": "fixed_deposit_enquiry",
        "confidence": 0.96,
        "entities": {"product_type": "fixed_deposit"},
        "suggested_responses": [
            "Fixed deposit tenure options are available from 7 days to 10 years.",
            "Minimum deposit amount is required.",
            "Interest varies by tenure.",
        ],
        "workflow_steps": [
            "Verify Aadhaar",
            "Verify PAN",
            "Collect deposit amount",
            "Select tenure",
            "Generate FD receipt",
        ],
    },
    "kyc": {
        "intent": "kyc_update",
        "confidence": 0.95,
        "entities": {"update_type": "kyc"},
        "suggested_responses": [
            "KYC update is important for compliance. What documents do you have for verification?",
            "We need to update your KYC. Please bring your Aadhaar and PAN for verification.",
            "Let me guide you through the KYC update process to ensure your account remains active.",
        ],
        "workflow_steps": [
            "Verify current KYC documents",
            "Collect updated identification proofs",
            "Submit for KYC verification",
            "Confirm KYC update completion",
        ],
    },
    "emi": {
        "intent": "emi_enquiry",
        "confidence": 0.85,
        "entities": {"query_type": "emi_calculation"},
        "suggested_responses": [
            "I can help calculate your EMI. Please provide loan amount, interest rate, and tenure.",
            "EMI depends on principal, rate, and time. Let me compute it for you.",
            "Understanding EMI is important. Shall I explain the calculation and options?",
        ],
        "workflow_steps": [
            "Capture loan details (amount, rate, tenure)",
            "Calculate EMI and total interest",
            "Explain payment schedule options",
            "Provide EMI statement and payment instructions",
        ],
    },
    "transfer": {
        "intent": "fund_transfer_enquiry",
        "confidence": 0.87,
        "entities": {"transfer_type": "neft_rtgs"},
        "suggested_responses": [
            "I can assist with NEFT/RTGS transfers. What amount and beneficiary details do you have?",
            "Fund transfers via NEFT/RTGS are secure. Let me check the limits and charges.",
            "Please provide beneficiary account details for the transfer setup.",
        ],
        "workflow_steps": [
            "Verify sender account and balance",
            "Collect beneficiary details and transfer amount",
            "Initiate transfer and provide reference number",
            "Confirm transfer completion and provide receipt",
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
            self.client = OpenAI(
                api_key=settings.openai_api_key,
                base_url="https://api.groq.com/openai/v1",
            )

    def _keyword_intent(self, text: str) -> Optional[Dict[str, Any]]:
        text_lower = text.lower()
        if any(w in text_lower for w in ["fd", "fixed deposit", "deposit"]):
            return DEMO_INTENTS["fd"]
        if any(w in text_lower for w in ["kyc", "know your customer", "verification"]):
            return DEMO_INTENTS["kyc"]
        if any(w in text_lower for w in ["emi", "equated monthly installment"]):
            return DEMO_INTENTS["emi"]
        if any(w in text_lower for w in ["neft", "rtgs", "transfer", "fund transfer"]):
            return DEMO_INTENTS["transfer"]
        if any(w in text_lower for w in ["account", "open", "savings", "current account"]):
            return DEMO_INTENTS["account"]
        if any(w in text_lower for w in ["loan", "borrow", "credit"]):
            return DEMO_INTENTS["loan"]
        return None

    def detect(self, text: str) -> Dict[str, Any]:
        explicit_intent = self._keyword_intent(text)
        if explicit_intent:
            return explicit_intent

        if not self.client:
            return FALLBACK

        system = (
            "You are a banking assistant intent classifier. "
            "Analyze the text for banking terms and map to appropriate intents. "
            "Return JSON with keys: intent, confidence (0-1), entities, "
            "suggested_responses (list of 3), workflow_steps (list of 4). "
            "Intents: account_opening (for savings/current accounts), loan_enquiry (for loans/credit), "
            "fixed_deposit_enquiry (for FD/fixed deposits), kyc_update (for KYC/verification), "
            "emi_enquiry (for EMI calculations), fund_transfer_enquiry (for NEFT/RTGS/transfers), "
            "balance_query, card_issue, general_bank_query. "
            "Map terms like FD/fixed deposit to fixed_deposit_enquiry, KYC to kyc_update, "
            "EMI to emi_enquiry, NEFT/RTGS to fund_transfer_enquiry."
        )
        try:
            resp = self.client.chat.completions.create(
                model=settings.openai_model,
                response_format={"type": "json_object"},
                messages=[{"role": "system", "content": system}, {"role": "user", "content": text}],
                temperature=0.2,
            )
            result = json.loads(resp.choices[0].message.content or "{}")
            if result.get("intent") == "general_bank_query":
                return FALLBACK
            return result
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
