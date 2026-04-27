"""
OCR Service for document field extraction using local pytesseract OCR.
"""

from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

# Field mapping for different document types
FIELD_EXTRACTION_CONFIG = {
    "aadhaar": {
        "required_fields": ["aadhaarNumber", "name", "dob"],
        "optional_fields": ["address"],
    },
    "pan": {
        "required_fields": ["panNumber", "name"],
        "optional_fields": ["dob"],
    },
    "income_proof": {
        "required_fields": ["salarySlip", "monthlyIncome", "employer"],
        "optional_fields": ["employment_type"],
    },
    "bank_statement": {
        "required_fields": ["accountNumber", "averageBalance"],
        "optional_fields": ["accountType"],
    },
}


def extract_fields_from_document(file_path: str, document_type: str) -> Dict[str, Optional[str]]:
    """
    Extract fields from document using local pytesseract OCR.
    """
    if document_type not in FIELD_EXTRACTION_CONFIG:
        logger.warning(f"Unknown document type: {document_type}")
        return {}

    try:
        if _detect_ocr_method() != "pytesseract":
            logger.warning("Local pytesseract OCR is not configured or installed.")
            return {}
        return _extract_with_pytesseract(file_path, document_type)
    except Exception as e:
        logger.error(f"Error extracting fields from {document_type}: {str(e)}")
        return {}


def _detect_ocr_method() -> str:
    """Detect whether local pytesseract is available."""
    try:
        import pytesseract  # noqa: F401
        return "pytesseract"
    except ImportError:
        return "disabled"


def _extract_with_pytesseract(file_path: str, document_type: str) -> Dict[str, Optional[str]]:
    """Extract fields using pytesseract (local OCR)."""
    try:
        from PIL import Image
        import pytesseract

        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)

        return _parse_extracted_text(text, document_type)
    except Exception as e:
        logger.error(f"Pytesseract extraction failed: {str(e)}")
        return {}


def _parse_extracted_text(text: str, document_type: str) -> Dict[str, Optional[str]]:
    """Parse OCR text output and extract relevant fields."""
    import re

    fields = {}
    config = FIELD_EXTRACTION_CONFIG.get(document_type, {})

    # Simple pattern matching - can be enhanced with ML
    patterns = {
        "aadhaarNumber": r"(\d{4}\s\d{4}\s\d{4}|\d{12})",
        "panNumber": r"([A-Z]{5}[0-9]{4}[A-Z]{1})",
        "name": r"(?:name|नाम)[:\s]*([A-Za-z\s]+)(?:\n|$)",
        "dob": r"(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})",
        "monthlyIncome": r"(?:salary|income|ctc)[:\s]*(?:rs\.?|₹)?\s*([0-9,]+)",
        "employer": r"(?:company|employer)[:\s]*([A-Za-z\s&]+)(?:\n|$)",
        "accountNumber": r"(?:account|acc)[:\s]*([0-9]{8,20})",
        "address": r"(?:address)[:\s]*([A-Za-z0-9,\s]+)(?:\n|$)",
    }

    for field in config.get("required_fields", []) + config.get("optional_fields", []):
        pattern = patterns.get(field)
        if pattern:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                fields[field] = match.group(1).strip()

    return fields