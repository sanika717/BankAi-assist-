import hashlib
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.db import get_connection

router = APIRouter(tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user_id: str
    full_name: str
    branch_id: str
    role: str

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    conn = get_connection()
    pw_hash = hashlib.sha256(payload.password.encode()).hexdigest()
    row = conn.execute(
        "SELECT * FROM users WHERE username=? AND password_hash=?",
        (payload.username, pw_hash)
    ).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # simple token: base64 of user id (replace with JWT in production)
    import base64, json
    token_payload = json.dumps({"user_id": str(row["id"]), "username": row["username"]})
    token = base64.b64encode(token_payload.encode()).decode()
    return LoginResponse(
        token=token,
        user_id=str(row["id"]),
        full_name=row["full_name"] or row["username"],
        branch_id=row["branch_id"],
        role=row["role"],
    )
