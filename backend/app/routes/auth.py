import base64
import hashlib
import json
import os
import sqlite3
from datetime import datetime, timedelta

import jwt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.config import settings
from app.database.db import get_connection

router = APIRouter(tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    full_name: str | None = None
    branch_id: str | None = "BR001"
    role: str | None = "staff"

class ForgotPasswordRequest(BaseModel):
    username: str

class ResetPasswordRequest(BaseModel):
    username: str
    token: str
    new_password: str

class LoginResponse(BaseModel):
    token: str
    user_id: str
    full_name: str
    branch_id: str
    role: str

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def build_login_response(row):
    return LoginResponse(
        token=create_access_token({"user_id": str(row["id"]), "username": row["username"]}),
        user_id=str(row["id"]),
        full_name=row["full_name"] or row["username"],
        branch_id=row["branch_id"],
        role=row["role"],
    )

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    conn = get_connection()
    pw_hash = hash_password(payload.password)
    row = conn.execute(
        "SELECT * FROM users WHERE username=? AND password_hash=?",
        (payload.username, pw_hash),
    ).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return build_login_response(row)

@router.post("/register", response_model=LoginResponse)
def register(payload: RegisterRequest):
    conn = get_connection()
    pw_hash = hash_password(payload.password)
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, password_hash, full_name, branch_id, role) VALUES (?,?,?,?,?)",
            (payload.username, pw_hash, payload.full_name, payload.branch_id, payload.role),
        )
        conn.commit()
        user_id = cursor.lastrowid
        row = conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")
    conn.close()
    return build_login_response(row)

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    conn = get_connection()
    row = conn.execute("SELECT id FROM users WHERE username=?", (payload.username,)).fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")

    reset_token = base64.urlsafe_b64encode(os.urandom(24)).decode().rstrip("=")
    expires_at = (datetime.utcnow() + timedelta(minutes=30)).isoformat()
    conn.execute(
        "INSERT INTO password_reset_tokens (user_id, token, expires_at, used) VALUES (?, ?, ?, 0)",
        (row["id"], reset_token, expires_at),
    )
    conn.commit()
    conn.close()

    if settings.demo_mode:
        print(f"[DEBUG] Password reset token for {payload.username}: {reset_token}")

    return {
        "detail": "Password reset email has been sent.",
        "reset_token": reset_token if settings.demo_mode else None,
    }

@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest):
    conn = get_connection()
    row = conn.execute(
        "SELECT prt.user_id, prt.expires_at, prt.used FROM password_reset_tokens prt "
        "JOIN users u ON prt.user_id=u.id "
        "WHERE u.username=? AND prt.token=? AND prt.used=0",
        (payload.username, payload.token),
    ).fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if datetime.fromisoformat(row["expires_at"]) < datetime.utcnow():
        conn.close()
        raise HTTPException(status_code=400, detail="Expired reset token")

    pw_hash = hash_password(payload.new_password)
    conn.execute("UPDATE users SET password_hash=? WHERE id=?", (pw_hash, row["user_id"]))
    conn.execute("UPDATE password_reset_tokens SET used=1 WHERE token=?", (payload.token,))
    conn.commit()
    conn.close()

    return {"detail": "Password reset successfully."}
