"""
LegalEase AI – Report Storage Service
Stores and retrieves analysis reports using SQLite.
"""

import sqlite3
import json
import os
from datetime import datetime
from typing import Optional

DB_PATH = os.getenv("DB_PATH", "legalease.db")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables if they don't exist."""
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id          TEXT PRIMARY KEY,
                created_at  TEXT NOT NULL,
                idea        TEXT NOT NULL,
                location    TEXT NOT NULL,
                scale       TEXT NOT NULL,
                mode        TEXT NOT NULL,
                data        TEXT NOT NULL,
                pdf_path    TEXT
            )
        """)
        conn.commit()


def save_report(report_id: str, idea: str, location: str, scale: str, mode: str, data: dict, pdf_path: str = None):
    init_db()
    with get_conn() as conn:
        conn.execute(
            """INSERT OR REPLACE INTO reports
               (id, created_at, idea, location, scale, mode, data, pdf_path)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (report_id, datetime.utcnow().isoformat(), idea, location, scale, mode,
             json.dumps(data), pdf_path)
        )
        conn.commit()


def get_report(report_id: str) -> Optional[dict]:
    init_db()
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM reports WHERE id = ?", (report_id,)).fetchone()
    if not row:
        return None
    result = dict(row)
    result["data"] = json.loads(result["data"])
    return result


def list_reports(limit: int = 20) -> list:
    init_db()
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, created_at, idea, location, scale FROM reports ORDER BY created_at DESC LIMIT ?",
            (limit,)
        ).fetchall()
    return [dict(r) for r in rows]
