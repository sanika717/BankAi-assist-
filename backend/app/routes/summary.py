from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, List
from app.services.summary_service import summary_service
from app.database.db import get_connection

router = APIRouter(tags=["summary"])

class SummaryRequest(BaseModel):
    conversation_history: List[Dict[str, Any]]
    customer_language: str = "hi"
    session_id: str = "default-session"
    staff_id: str = ""
    branch_id: str = ""
    intent: str = ""
    confidence: float = None
    customer_transcript: str = ""
    english_transcript: str = ""
    staff_response: str = ""
    customer_response: str = ""
    required_documents: List[Dict[str, Any]] = []
    document_statuses: Dict[str, str] = {}
    eligibility_result: str = ""
    next_action: str = ""
    reference_number: str = None

@router.post("/generate-summary")
def generate_summary(payload: SummaryRequest):
    try:
        result = summary_service.summarize(
            history=payload.conversation_history,
            customer_language=payload.customer_language,
            intent=payload.intent,
            customer_transcript=payload.customer_transcript,
            english_transcript=payload.english_transcript,
            staff_response=payload.staff_response,
            customer_response=payload.customer_response,
            required_documents=payload.required_documents,
            document_statuses=payload.document_statuses,
            eligibility_result=payload.eligibility_result,
            next_action=payload.next_action,
            reference_number=payload.reference_number,
            confidence=payload.confidence,
        )
        # Save interaction to DB
        conn = get_connection()
        conn.execute("""
            INSERT INTO interactions
            (session_id, branch_id, staff_id, language, customer_transcript, english_transcript,
             intent, confidence, staff_response, customer_response, summary, timestamp)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,datetime('now'))
        """, (
            payload.session_id,
            payload.branch_id,
            payload.staff_id,
            payload.customer_language,
            payload.customer_transcript,
            payload.english_transcript,
            payload.intent,
            payload.confidence,
            payload.staff_response,
            payload.customer_response,
            result.get("summary_english", ""),
        ))
        conn.commit()
        conn.close()
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
