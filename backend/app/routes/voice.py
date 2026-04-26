import os
from pathlib import Path
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from app.services.speech_service import speech_service

router = APIRouter(tags=["voice"])

@router.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    session_id: str = Form(default="default-session"),
    language_hint: str = Form(default=""),
):
    try:
        text = await speech_service.speech_to_text(audio, language_hint)
        return {"transcript": text, "session_id": session_id}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

@router.post("/text-to-speech")
async def text_to_speech(
    text: str = Form(...),
    language_code: str = Form(default="hi"),
    session_id: str = Form(default="default-session"),
):
    try:
        output_path = speech_service.text_to_speech(text, language_code)
        return FileResponse(
            path=output_path,
            media_type="audio/mpeg",
            filename=Path(output_path).name,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
