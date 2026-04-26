from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from app.services.intent_service import intent_service

router = APIRouter(tags=["intent"])

class IntentRequest(BaseModel):
    text: str
    session_id: str = "default-session"

class IntentResponse(BaseModel):
    intent: str
    confidence: float
    entities: Dict[str, Any] = {}
    suggested_responses: List[str] = []
    workflow_steps: List[str] = []

@router.post("/detect-intent", response_model=IntentResponse)
def detect_intent(payload: IntentRequest):
    try:
        result = intent_service.detect(payload.text)
        return IntentResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

@router.post("/generate-response")
def generate_response(payload: Dict):
    try:
        result = intent_service.generate_response(
            customer_text_english=payload.get("customer_text_english", ""),
            intent=payload.get("intent", "general_bank_query"),
            response_language=payload.get("response_language", "hi"),
            staff_reply_text=payload.get("staff_reply_text"),
        )
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
