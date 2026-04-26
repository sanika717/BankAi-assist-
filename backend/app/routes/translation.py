from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.translate_service import translation_service

router = APIRouter(tags=["translation"])

class TranslateRequest(BaseModel):
    text: str
    source_language: str = "hi"
    target_language: str = "en"

class TranslateResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str

@router.post("/translate", response_model=TranslateResponse)
def translate(payload: TranslateRequest):
    try:
        result = translation_service.translate_text(
            payload.text, payload.source_language, payload.target_language
        )
        return TranslateResponse(
            translated_text=result,
            source_language=payload.source_language,
            target_language=payload.target_language,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
