import base64
import hashlib
import json
import os
import psycopg2
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
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM users WHERE username=%s AND password_hash=%s",
                (payload.username, pw_hash),
            )
            row = cursor.fetchone()
    finally:
        conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return build_login_response(row)

@router.post("/register", response_model=LoginResponse)
def register(payload: RegisterRequest):
    conn = get_connection()
    pw_hash = hash_password(payload.password)
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO users (username, password_hash, full_name, branch_id, role) VALUES (%s,%s,%s,%s,%s) RETURNING id",
                (payload.username, pw_hash, payload.full_name, payload.branch_id, payload.role),
            )
            user_id = cursor.fetchone()["id"]
            cursor.execute("SELECT * FROM users WHERE id=%s", (user_id,))
            row = cursor.fetchone()
            conn.commit()
    except psycopg2.IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Username already exists")
    finally:
        conn.close()
    return build_login_response(row)

@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE username=%s", (payload.username,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="User not found")
        
            reset_token = base64.urlsafe_b64encode(os.urandom(24)).decode().rstrip("=")
            expires_at = (datetime.utcnow() + timedelta(minutes=30)).isoformat()
            cursor.execute(
                "INSERT INTO password_reset_tokens (user_id, token, expires_at, used) VALUES (%s, %s, %s, 0)",
                (row["id"], reset_token, expires_at),
            )
            conn.commit()
    except HTTPException:
        conn.rollback()
        raise
    finally:
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
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT prt.user_id, prt.expires_at, prt.used FROM password_reset_tokens prt "
                "JOIN users u ON prt.user_id=u.id "
                "WHERE u.username=%s AND prt.token=%s AND prt.used=0",
                (payload.username, payload.token),
            )
            row = cursor.fetchone()

            if not row:
                raise HTTPException(status_code=400, detail="Invalid or expired reset token")

            # Ensure row["expires_at"] is handled gracefully whether returned as datetime or string
            expires_at_val = row["expires_at"] if isinstance(row["expires_at"], datetime) else datetime.fromisoformat(str(row["expires_at"]))
            if expires_at_val < datetime.utcnow():
                raise HTTPException(status_code=400, detail="Expired reset token")

            pw_hash = hash_password(payload.new_password)
            cursor.execute("UPDATE users SET password_hash=%s WHERE id=%s", (pw_hash, row["user_id"]))
            cursor.execute("UPDATE password_reset_tokens SET used=1 WHERE token=%s", (payload.token,))
            conn.commit()
    except HTTPException:
        conn.rollback()
        raise
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    return {"detail": "Password reset successfully."}
