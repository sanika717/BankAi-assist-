from fastapi import APIRouter, File, Form, HTTPException, UploadFile
import tempfile
import os
from app.services.ocr_service import extract_fields_from_document

router = APIRouter(tags=["ocr"])

@router.post("/ocr/extract")
async def extract_document_fields(
    file: UploadFile = File(...),
    document_type: str = Form(...),
):
    if not document_type:
        raise HTTPException(status_code=400, detail="Missing document_type")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing uploaded file")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1] or ".png") as tmp:
            tmp_path = tmp.name
            content = await file.read()
            tmp.write(content)
            tmp.flush()

        fields = extract_fields_from_document(tmp_path, document_type)
        return {"status": "success", "fields": fields}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OCR extraction failed: {exc}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

    return {"status": "success", "fields": fields}
