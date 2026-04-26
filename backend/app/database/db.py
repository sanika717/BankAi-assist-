import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[3] / "banking_assistant.db"

def get_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT,
            branch_id TEXT DEFAULT 'BR001',
            role TEXT DEFAULT 'staff',
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            branch_id TEXT,
            staff_id TEXT,
            language TEXT,
            customer_transcript TEXT,
            english_transcript TEXT,
            intent TEXT,
            confidence REAL,
            staff_response TEXT,
            customer_response TEXT,
            summary TEXT,
            timestamp TEXT DEFAULT (datetime('now'))
        )
    """)
    # seed demo user
    import hashlib
    pw = hashlib.sha256("demo1234".encode()).hexdigest()
    c.execute("INSERT OR IGNORE INTO users (username, password_hash, full_name, branch_id, role) VALUES (?,?,?,?,?)",
              ("staff@bank.com", pw, "Demo Staff", "BR001", "staff"))
    conn.commit()
    conn.close()
