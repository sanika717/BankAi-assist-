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

@router.post("/generate-summary")
def generate_summary(payload: SummaryRequest):
    try:
        result = summary_service.summarize(
            payload.conversation_history, payload.customer_language
        )
        # Save interaction to DB
        conn = get_connection()
        conn.execute("""
            INSERT INTO interactions
            (session_id, branch_id, staff_id, language, intent, summary, timestamp)
            VALUES (?,?,?,?,?,?,datetime('now'))
        """, (
            payload.session_id,
            payload.branch_id,
            payload.staff_id,
            payload.customer_language,
            payload.intent,
            result.get("summary_english", ""),
        ))
        conn.commit()
        conn.close()
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
