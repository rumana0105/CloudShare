import os
from typing import Any
from pydantic import field_validator
from pydantic_settings import BaseSettings

# Absolute path to backend directory
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ENV_PATH = os.path.join(BACKEND_DIR, ".env")

class Settings(BaseSettings):
    AWS_REGION: str = "ap-south-1"
    AWS_S3_BUCKET: str = "cloudshare-dscc-storage-production"
    
    # AWS Credentials (Optional if running on EC2 with IAM instance profile or ~/.aws/credentials)
    AWS_ACCESS_KEY_ID: str | None = None
    AWS_SECRET_ACCESS_KEY: str | None = None
    AWS_SESSION_TOKEN: str | None = None
    
    # Authentication & JWT
    JWT_SECRET: str = "cloudshare-dscc-super-secret-key-2026-romana-gauri"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    # Persistent Database (SQLite)
    DATABASE_PATH: str = os.path.join(BACKEND_DIR, "cloudshare.db")

    MAX_FILE_SIZE_BYTES: int = 50 * 1024 * 1024  # 50 MB
    ALLOWED_EXTENSIONS: set[str] = {
        "pdf", "doc", "docx", "txt", "jpg", "jpeg", "png", "csv", "xls", "xlsx", "ppt", "pptx"
    }
    
    ALLOWED_ORIGINS: list[str] | str = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]

    @field_validator("ALLOWED_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173"
        ]

    @field_validator("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_SESSION_TOKEN", mode="before")
    @classmethod
    def clean_aws_credentials(cls, v: Any) -> str | None:
        if isinstance(v, str):
            v_clean = v.strip()
            if not v_clean or "YOUR_AWS" in v_clean or "MY_" in v_clean:
                return None
            return v_clean
        return v

    class Config:
        env_file = (ENV_PATH, ".env")
        extra = "allow"

settings = Settings()
