from fastapi import APIRouter, Query
from typing import Optional
from app.database.db import get_connection

router = APIRouter(tags=["history"])

@router.get("/history")
def get_history(
    staff_id: Optional[str] = Query(None),
    branch_id: Optional[str] = Query(None),
    limit: int = Query(50),
):
    conn = get_connection()
    query = "SELECT * FROM interactions WHERE 1=1"
    params = []
    if staff_id:
        query += " AND staff_id=?"
        params.append(staff_id)
    if branch_id:
        query += " AND branch_id=?"
        params.append(branch_id)
    query += " ORDER BY timestamp DESC LIMIT ?"
    params.append(limit)
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return {"interactions": [dict(r) for r in rows]}

@router.get("/analytics")
def get_analytics(branch_id: Optional[str] = Query(None)):
    conn = get_connection()
    params = []
    where = ""
    if branch_id:
        where = "WHERE branch_id=?"
        params.append(branch_id)

    total = conn.execute(f"SELECT COUNT(*) as c FROM interactions {where}", params).fetchone()["c"]
    intents = conn.execute(
        f"SELECT intent, COUNT(*) as count FROM interactions {where} GROUP BY intent ORDER BY count DESC",
        params
    ).fetchall()
    languages = conn.execute(
        f"SELECT language, COUNT(*) as count FROM interactions {where} GROUP BY language",
        params
    ).fetchall()
    daily = conn.execute(
        f"SELECT date(timestamp) as day, COUNT(*) as count FROM interactions {where} GROUP BY day ORDER BY day DESC LIMIT 7",
        params
    ).fetchall()
    conn.close()
    return {
        "total_interactions": total,
        "by_intent": [dict(r) for r in intents],
        "by_language": [dict(r) for r in languages],
        "daily_counts": [dict(r) for r in daily],
    }
