import psycopg2
from psycopg2.extras import RealDictCursor
from pathlib import Path
from app.core.config import settings

def get_connection():
    conn = psycopg2.connect(
        dbname=settings.db_name,
        user=settings.db_user,
        password=settings.db_password,
        host=settings.db_host,
        port=settings.db_port,
        cursor_factory=RealDictCursor
    )
    return conn

def init_db():
    conn = get_connection()
    try:
        with conn.cursor() as c:
            c.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    full_name TEXT,
                    branch_id VARCHAR DEFAULT 'BR001',
                    role VARCHAR DEFAULT 'staff',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS password_reset_tokens (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    token TEXT UNIQUE NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    used INTEGER DEFAULT 0,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            """)
            c.execute("""
                CREATE TABLE IF NOT EXISTS interactions (
                    id SERIAL PRIMARY KEY,
                    session_id VARCHAR NOT NULL,
                    branch_id VARCHAR,
                    staff_id VARCHAR,
                    language VARCHAR,
                    customer_transcript TEXT,
                    english_transcript TEXT,
                    intent VARCHAR,
                    confidence REAL,
                    staff_response TEXT,
                    customer_response TEXT,
                    summary TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            # seed demo user
            import hashlib
            pw = hashlib.sha256("demo1234".encode()).hexdigest()
            c.execute("INSERT INTO users (username, password_hash, full_name, branch_id, role) VALUES (%s,%s,%s,%s,%s) ON CONFLICT (username) DO NOTHING",
                      ("staff@bank.com", pw, "Demo Staff", "BR001", "staff"))
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
