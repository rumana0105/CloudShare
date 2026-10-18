import uuid
import re
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from app.models.schemas import FileItem, FileListResponse, DownloadResponse, DeleteResponse
from app.services.s3_service import S3Service
from app.core.config import settings
from app.routes.auth import get_current_user
from app.db.database import DatabaseManager

router = APIRouter(prefix="/files", tags=["S3 File Management"])

@router.post("/upload", response_model=FileItem)
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Uploads a file to the private Amazon S3 bucket with Server-Side Encryption (AES256).
    Associates the file record with the authenticated user in SQLite.
    """
    filename = file.filename or "unnamed_file"
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type .{ext}. Allowed extensions: {', '.join(sorted(settings.ALLOWED_EXTENSIONS))}"
        )

    content = await file.read()
    file_size = len(content)

    if file_size > settings.MAX_FILE_SIZE_BYTES:
        max_mb = settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {max_mb} MB"
        )

    # Scoped S3 Key under uploads/{user_id}/
    user_id = current_user["id"]
    clean_name = re.sub(r"[^a-zA-Z0-9._-]", "_", filename)
    file_id = f"f-{uuid.uuid4().hex[:8]}"
    s3_key = f"uploads/{user_id}/{file_id}_{clean_name}"
    content_type = file.content_type or "application/octet-stream"
    upload_timestamp = datetime.now(timezone.utc).isoformat()

    try:
        s3_res = S3Service.upload_file(content, s3_key, content_type)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Amazon S3 upload failed: {str(e)}"
        )

    etag = s3_res.get("etag")

    # Persist in SQLite
    db_file = DatabaseManager.create_file(
        file_id=file_id,
        user_id=user_id,
        file_name=filename,
        s3_key=s3_key,
        s3_bucket=settings.AWS_S3_BUCKET,
        s3_region=settings.AWS_REGION,
        file_size=file_size,
        content_type=content_type,
        upload_timestamp=upload_timestamp,
        etag=etag
    )

    return FileItem(
        file_id=db_file["file_id"],
        file_name=db_file["file_name"],
        s3_key=db_file["s3_key"],
        s3_bucket=db_file["s3_bucket"],
        s3_region=db_file["s3_region"],
        file_size=db_file["file_size"],
        content_type=db_file["content_type"],
        upload_timestamp=db_file["upload_timestamp"],
        etag=db_file.get("etag")
    )

@router.get("", response_model=FileListResponse)
def list_files(current_user: dict = Depends(get_current_user)):
    """
    Lists all active files uploaded by the authenticated user.
    Excludes files belonging to other users.
    """
    user_id = current_user["id"]
    user_files = DatabaseManager.list_user_files(user_id)

    files_list: list[FileItem] = []
    total_size = 0

    for f in user_files:
        files_list.append(FileItem(
            file_id=f["id"],
            file_name=f["file_name"],
            s3_key=f["s3_key"],
            s3_bucket=f["s3_bucket"],
            s3_region=f["s3_region"],
            file_size=f["file_size"],
            content_type=f["content_type"],
            upload_timestamp=f["upload_timestamp"],
            etag=f.get("etag")
        ))
        total_size += f["file_size"]

    return FileListResponse(
        files=files_list,
        total_files=len(files_list),
        total_size_bytes=total_size
    )

@router.get("/{file_id}/download", response_model=DownloadResponse)
def download_file(file_id: str, current_user: dict = Depends(get_current_user)):
    """
    Generates a secure SigV4 Presigned URL to download the file directly from S3.
    Verifies that the requested file belongs to the authenticated user.
    """
    user_id = current_user["id"]
    file_record = DatabaseManager.get_user_file_by_id(file_id, user_id)
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or access denied."
        )

    try:
        url = S3Service.generate_presigned_download_url(
            s3_key=file_record["s3_key"],
            original_filename=file_record["file_name"],
            expires_in_seconds=900
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to generate S3 download URL: {str(e)}"
        )

    return DownloadResponse(
        download_url=url,
        expires_in_seconds=900,
        file_name=file_record["file_name"]
    )

@router.delete("/{file_id}", response_model=DeleteResponse)
def delete_file(file_id: str, current_user: dict = Depends(get_current_user)):
    """
    Permanently deletes a file from the Amazon S3 bucket and SQLite database.
    Verifies that the file belongs to the authenticated user.
    """
    user_id = current_user["id"]
    file_record = DatabaseManager.get_user_file_by_id(file_id, user_id)
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or access denied."
        )

    # Delete from S3
    try:
        S3Service.delete_object(file_record["s3_key"])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to delete object from Amazon S3: {str(e)}"
        )

    # Delete from SQLite
    DatabaseManager.delete_user_file(file_id, user_id)

    return DeleteResponse(
        message=f"File '{file_record['file_name']}' deleted successfully from Amazon S3.",
        file_id=file_id
    )
