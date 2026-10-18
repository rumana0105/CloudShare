import os
import sys
import tempfile
import sqlite3
from fastapi.testclient import TestClient

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.core.config import settings
from app.db.database import get_db_connection

def test_full_api_suite():
    client = TestClient(app)

    print("\n--- 1. Testing Health Endpoint ---")
    res = client.get("/api/health")
    assert res.status_code == 200
    health_data = res.json()
    assert "status" in health_data
    assert "s3_bucket" in health_data
    assert health_data["s3_configured"] is False
    assert health_data["database_status"].startswith("SQLite")
    print("[PASS] Health endpoint returned 200 with accurate status")

    print("\n--- 2. Testing Registration Validations ---")
    # Password mismatch
    res = client.post("/api/auth/register", json={
        "full_name": "Test User",
        "email": "test@example.com",
        "password": "Password123!",
        "confirm_password": "DifferentPassword!"
    })
    assert res.status_code == 400
    assert "Passwords do not match" in res.json()["detail"]
    print("[PASS] Password mismatch rejected with 400")

    # Short password
    res = client.post("/api/auth/register", json={
        "full_name": "Test User",
        "email": "test@example.com",
        "password": "123",
        "confirm_password": "123"
    })
    assert res.status_code == 422 # Pydantic min_length validation
    print("[PASS] Short password rejected with 422")

    print("\n--- 3. Testing Successful Registration & Password Hashing ---")
    user1_data = {
        "full_name": "Romana Jagirdar",
        "email": "romana.test@cloudshare.edu",
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!"
    }
    res = client.post("/api/auth/register", json=user1_data)
    assert res.status_code == 201
    auth1 = res.json()
    assert "access_token" in auth1
    assert auth1["token_type"] == "bearer"
    assert auth1["user"]["full_name"] == "Romana Jagirdar"
    assert auth1["user"]["email"] == "romana.test@cloudshare.edu"
    token1 = auth1["access_token"]
    user1_id = auth1["user"]["id"]
    print(f"[PASS] Registered User 1 (ID: {user1_id}) successfully")

    # Verify password was hashed in SQLite (PBKDF2 with salt)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT hashed_password FROM users WHERE id = ?", (user1_id,))
    row = cursor.fetchone()
    conn.close()
    assert row is not None
    stored_hash = row["hashed_password"]
    assert ":" in stored_hash
    salt, hash_part = stored_hash.split(":", 1)
    assert len(salt) == 32 # 16 bytes in hex
    assert len(hash_part) == 64 # sha256 32 bytes in hex
    assert "SecurePassword123!" not in stored_hash
    print("[PASS] Password stored securely using PBKDF2-HMAC-SHA256 with unique salt")

    # Duplicate registration rejection
    res = client.post("/api/auth/register", json=user1_data)
    assert res.status_code == 409
    assert "already exists" in res.json()["detail"]
    print("[PASS] Duplicate email rejected with 409")

    print("\n--- 4. Testing Login & Authentication ---")
    # Invalid password
    res = client.post("/api/auth/login", json={
        "email": "romana.test@cloudshare.edu",
        "password": "WrongPassword!"
    })
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]
    print("[PASS] Wrong password rejected with 401")

    # Non-existent email
    res = client.post("/api/auth/login", json={
        "email": "nobody@cloudshare.edu",
        "password": "AnyPassword!"
    })
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]
    print("[PASS] Non-existent user rejected with 401")

    # Correct password
    res = client.post("/api/auth/login", json={
        "email": "romana.test@cloudshare.edu",
        "password": "SecurePassword123!"
    })
    assert res.status_code == 200
    login_data = res.json()
    assert "access_token" in login_data
    assert login_data["user"]["id"] == user1_id
    token1 = login_data["access_token"]
    print("[PASS] Successful login returned signed JWT")

    print("\n--- 5. Testing Protected /api/auth/me Endpoint ---")
    # Without token
    res = client.get("/api/auth/me")
    assert res.status_code == 401
    print("[PASS] Unauthenticated request rejected with 401")

    # With invalid token
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer fake.tampered.token"})
    assert res.status_code == 401
    print("[PASS] Tampered JWT token rejected with 401")

    # With valid token
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token1}"})
    assert res.status_code == 200
    me = res.json()
    assert me["id"] == user1_id
    assert me["email"] == "romana.test@cloudshare.edu"
    print("[PASS] Authenticated user profile retrieved successfully")

    print("\n--- 6. Testing Dashboard Stats & File Listing (User 1) ---")
    res = client.get("/api/dashboard/stats", headers={"Authorization": f"Bearer {token1}"})
    assert res.status_code == 200
    stats = res.json()
    assert stats["total_files"] == 0
    assert stats["storage_used_bytes"] == 0
    assert stats["storage_limit_bytes"] == 5 * 1024 * 1024 * 1024
    print("[PASS] User 1 stats: 0 files, 0 bytes used")

    res = client.get("/api/files", headers={"Authorization": f"Bearer {token1}"})
    assert res.status_code == 200
    files_list = res.json()
    assert files_list["total_files"] == 0
    assert len(files_list["files"]) == 0
    print("[PASS] User 1 file list is empty")

    print("\n--- 7. Testing Multi-Tenant User Isolation (User 2) ---")
    user2_data = {
        "full_name": "Gauri Kangle",
        "email": "gauri.test@cloudshare.edu",
        "password": "GauriPassword456!",
        "confirm_password": "GauriPassword456!"
    }
    res = client.post("/api/auth/register", json=user2_data)
    assert res.status_code == 201
    token2 = res.json()["access_token"]
    user2_id = res.json()["user"]["id"]
    assert user2_id != user1_id
    print(f"[PASS] Registered User 2 (ID: {user2_id}) successfully")

    res = client.get("/api/dashboard/stats", headers={"Authorization": f"Bearer {token2}"})
    assert res.status_code == 200
    assert res.json()["total_files"] == 0
    print("[PASS] User 2 isolated with independent quota and stats")

    print("\n--- 8. Testing File Upload Validation & Real S3 Handling ---")
    # Unsupported extension
    fake_exe = ("malware.exe", b"fake binary content", "application/x-msdownload")
    res = client.post("/api/files/upload",
        files={"file": fake_exe},
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert res.status_code == 400
    assert "Unsupported file type" in res.json()["detail"]
    print("[PASS] Disallowed file extension (.exe) rejected with 400")

    # Real S3 call without AWS credentials (must report 502 Bad Gateway, not fake success!)
    valid_doc = ("test_document.txt", b"Hello CloudShare S3", "text/plain")
    res = client.post("/api/files/upload",
        files={"file": valid_doc},
        headers={"Authorization": f"Bearer {token1}"}
    )
    # Since AWS credentials are not set on this machine, S3 upload fails with 502
    assert res.status_code == 502
    assert "Amazon S3 upload failed" in res.json()["detail"]
    print("[PASS] S3 upload correctly attempts real S3 and returns 502 error when AWS credentials/bucket not configured (NO fake success!)")

    # Clean up test records to keep database clean
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("DELETE FROM files")
    c.execute("DELETE FROM users")
    conn.commit()
    conn.close()
    print("[PASS] Cleaned up test database (0 users, 0 files)")

    print("\nAll API tests PASSED successfully!")

if __name__ == "__main__":
    test_full_api_suite()
