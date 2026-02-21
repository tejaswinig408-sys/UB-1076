from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(os.environ.get("KRISHIRAKSHAK_DB_PATH", Path(__file__).resolve().parent / "krishirakshak.db"))


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


@contextmanager
def get_db() -> sqlite3.Connection: # type: ignore
    conn = _connect()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with get_db() as db:
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              email TEXT UNIQUE NOT NULL,
              name TEXT NOT NULL,
              password_hash TEXT NOT NULL,
              salt TEXT NOT NULL,
              created_at TEXT NOT NULL
            );
            """
        )
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS farm_profiles (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL,
              latitude REAL,
              longitude REAL,
              location_name TEXT,
              soil_type TEXT,
              ph REAL,
              nitrogen REAL,
              phosphorus REAL,
              potassium REAL,
              farm_size_acres REAL,
              irrigation_type TEXT,
              season TEXT,
              last_updated TEXT NOT NULL,
              FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """
        )
