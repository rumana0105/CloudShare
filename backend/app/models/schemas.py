from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

# User & Auth Schemas
class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    confirm_password: str = Field(..., min_length=6, max_length=128)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# S3 File Management Schemas
class FileItem(BaseModel):
    file_id: str
    file_name: str
    s3_key: str
    s3_bucket: str
    s3_region: str
    file_size: int
    content_type: str
    upload_timestamp: str
    etag: Optional[str] = None

class FileListResponse(BaseModel):
    files: List[FileItem]
    total_files: int
    total_size_bytes: int

class DownloadResponse(BaseModel):
    download_url: str
    expires_in_seconds: int
    file_name: str

class DeleteResponse(BaseModel):
    message: str
    file_id: str

class DashboardStatsResponse(BaseModel):
    total_files: int
    storage_used_bytes: int
    storage_limit_bytes: int

class HealthResponse(BaseModel):
    status: str
    message: str
    s3_configured: bool
    s3_bucket: str
    s3_accessible: bool
    region: str
    database_status: str
