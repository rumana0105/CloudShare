import sqlite3
import os
from typing import Optional, Dict, Any, List
from app.core.config import settings

def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection with row factory enabled."""
    db_path = settings.DATABASE_PATH
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes SQLite database tables for users and uploaded files."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    # Files Table (User-scoped S3 metadata)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS files (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            file_name TEXT NOT NULL,
            s3_key TEXT NOT NULL,
            s3_bucket TEXT NOT NULL,
            s3_region TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            content_type TEXT NOT NULL,
            upload_timestamp TEXT NOT NULL,
            etag TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    """)

    conn.commit()
    conn.close()

class DatabaseManager:
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, full_name, email, created_at FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def create_user(user_id: str, full_name: str, email: str, hashed_password: str, created_at: str) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (id, full_name, email, hashed_password, created_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, full_name.strip(), email.strip().lower(), hashed_password, created_at)
        )
        conn.commit()
        conn.close()
        return {
            "id": user_id,
            "full_name": full_name.strip(),
            "email": email.strip().lower(),
            "created_at": created_at
        }

    @staticmethod
    def create_file(
        file_id: str,
        user_id: str,
        file_name: str,
        s3_key: str,
        s3_bucket: str,
        s3_region: str,
        file_size: int,
        content_type: str,
        upload_timestamp: str,
        etag: Optional[str] = None
    ) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO files (id, user_id, file_name, s3_key, s3_bucket, s3_region, file_size, content_type, upload_timestamp, etag)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (file_id, user_id, file_name, s3_key, s3_bucket, s3_region, file_size, content_type, upload_timestamp, etag))
        conn.commit()
        conn.close()
        return {
            "file_id": file_id,
            "user_id": user_id,
            "file_name": file_name,
            "s3_key": s3_key,
            "s3_bucket": s3_bucket,
            "s3_region": s3_region,
            "file_size": file_size,
            "content_type": content_type,
            "upload_timestamp": upload_timestamp,
            "etag": etag
        }

    @staticmethod
    def list_user_files(user_id: str) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM files WHERE user_id = ? ORDER BY upload_timestamp DESC",
            (user_id,)
        )
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    @staticmethod
    def get_user_file_by_id(file_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM files WHERE id = ? AND user_id = ?",
            (file_id, user_id)
        )
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    @staticmethod
    def delete_user_file(file_id: str, user_id: str) -> bool:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "DELETE FROM files WHERE id = ? AND user_id = ?",
            (file_id, user_id)
        )
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return deleted

    @staticmethod
    def get_user_stats(user_id: str) -> Dict[str, int]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT COUNT(*) as count, COALESCE(SUM(file_size), 0) as total_bytes FROM files WHERE user_id = ?",
            (user_id,)
        )
        row = cursor.fetchone()
        conn.close()
        return {
            "total_files": row["count"] if row else 0,
            "storage_used_bytes": row["total_bytes"] if row else 0
        }
