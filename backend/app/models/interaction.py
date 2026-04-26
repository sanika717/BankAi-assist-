from dataclasses import dataclass
from typing import Optional

@dataclass
class Interaction:
    id: int
    session_id: str
    branch_id: Optional[str]
    staff_id: Optional[str]
    language: Optional[str]
    customer_transcript: Optional[str]
    english_transcript: Optional[str]
    intent: Optional[str]
    confidence: Optional[float]
    staff_response: Optional[str]
    customer_response: Optional[str]
    summary: Optional[str]
    timestamp: str
