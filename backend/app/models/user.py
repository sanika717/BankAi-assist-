from dataclasses import dataclass

@dataclass
class User:
    id: int
    username: str
    full_name: str
    branch_id: str
    role: str
    created_at: str
