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
        query += " AND staff_id=%s"
        params.append(staff_id)
    if branch_id:
        query += " AND branch_id=%s"
        params.append(branch_id)
    query += " ORDER BY timestamp DESC LIMIT %s"
    params.append(limit)
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params)
            rows = cursor.fetchall()
    finally:
        conn.close()
    return {"interactions": [dict(r) for r in rows]}

@router.get("/analytics")
def get_analytics(branch_id: Optional[str] = Query(None)):
    conn = get_connection()
    params = []
    where = ""
    if branch_id:
        where = "WHERE branch_id=%s"
        params.append(branch_id)

    try:
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT COUNT(*) as c FROM interactions {where}", params)
            total = cursor.fetchone()["c"]
            
            cursor.execute(
                f"SELECT intent, COUNT(*) as count FROM interactions {where} GROUP BY intent ORDER BY count DESC",
                params
            )
            intents = cursor.fetchall()
            
            cursor.execute(
                f"SELECT language, COUNT(*) as count FROM interactions {where} GROUP BY language",
                params
            )
            languages = cursor.fetchall()
            
            cursor.execute(
                f"SELECT DATE(timestamp) as day, COUNT(*) as count FROM interactions {where} GROUP BY day ORDER BY day DESC LIMIT 7",
                params
            )
            daily = cursor.fetchall()
    finally:
        conn.close()
    return {
        "total_interactions": total,
        "by_intent": [dict(r) for r in intents],
        "by_language": [dict(r) for r in languages],
        "daily_counts": [dict(r) for r in daily],
    }
