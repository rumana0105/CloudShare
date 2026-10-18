import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from app.core.config import settings
import mimetypes

def get_s3_client():
    kwargs = {
        "region_name": settings.AWS_REGION,
        "config": Config(signature_version="s3v4")
    }
    if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
        kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
        kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY
        if settings.AWS_SESSION_TOKEN:
            kwargs["aws_session_token"] = settings.AWS_SESSION_TOKEN
    return boto3.client("s3", **kwargs)

class S3Service:
    @staticmethod
    def check_connection() -> bool:
        """Verifies if the S3 bucket exists and is accessible."""
        try:
            s3 = get_s3_client()
            s3.head_bucket(Bucket=settings.AWS_S3_BUCKET)
            return True
        except Exception:
            return False

    @staticmethod
    def upload_file(file_content: bytes, s3_key: str, content_type: str) -> dict:
        """
        Uploads a file object to the private S3 bucket with Server-Side Encryption (AES256).
        """
        s3 = get_s3_client()
        try:
            response = s3.put_object(
                Bucket=settings.AWS_S3_BUCKET,
                Key=s3_key,
                Body=file_content,
                ContentType=content_type,
                ServerSideEncryption="AES256"
            )
            return {
                "etag": response.get("ETag", "").strip('"'),
                "s3_key": s3_key
            }
        except ClientError as e:
            raise RuntimeError(f"S3 Upload failed: {e.response['Error']['Message']}")

    @staticmethod
    def list_objects(prefix: str = "uploads/") -> list[dict]:
        """
        Lists all uploaded objects from the private S3 bucket.
        Calculates file sizes and timestamps directly from S3 metadata.
        """
        s3 = get_s3_client()
        try:
            paginator = s3.get_paginator("list_objects_v2")
            pages = paginator.paginate(Bucket=settings.AWS_S3_BUCKET, Prefix=prefix)
            items = []
            for page in pages:
                for obj in page.get("Contents", []):
                    key = obj["Key"]
                    if key.endswith("/"):
                        continue
                    
                    # Extract original filename
                    raw_filename = key.split("/")[-1]
                    # If prefixed with unique hash like "1a2b3c_report.pdf", clean it for display
                    display_name = raw_filename
                    if "_" in raw_filename:
                        parts = raw_filename.split("_", 1)
                        if len(parts[0]) == 6 or len(parts[0]) == 8:
                            display_name = parts[1]

                    content_type, _ = mimetypes.guess_type(raw_filename)

                    items.append({
                        "file_id": key,
                        "file_name": display_name,
                        "s3_key": key,
                        "s3_bucket": settings.AWS_S3_BUCKET,
                        "s3_region": settings.AWS_REGION,
                        "file_size": obj["Size"],
                        "content_type": content_type or "application/octet-stream",
                        "upload_timestamp": obj["LastModified"].isoformat(),
                        "etag": obj.get("ETag", "").strip('"')
                    })
            
            # Sort newest upload first
            items.sort(key=lambda x: x["upload_timestamp"], reverse=True)
            return items
        except ClientError as e:
            raise RuntimeError(f"S3 list objects failed: {e.response['Error']['Message']}")

    @staticmethod
    def generate_presigned_download_url(s3_key: str, original_filename: str, expires_in_seconds: int = 900) -> str:
        """
        Generates an authenticated S3 Presigned URL using AWS Signature Version 4.
        Valid for 15 minutes by default.
        """
        s3 = get_s3_client()
        safe_filename = original_filename.replace('"', '').replace('\n', '').replace('\r', '').strip()
        safe_expires = max(60, min(expires_in_seconds, 604800))
        try:
            url = s3.generate_presigned_url(
                ClientMethod="get_object",
                Params={
                    "Bucket": settings.AWS_S3_BUCKET,
                    "Key": s3_key,
                    "ResponseContentDisposition": f'attachment; filename="{safe_filename}"'
                },
                ExpiresIn=safe_expires
            )
            return url
        except ClientError as e:
            raise RuntimeError(f"Presigned URL generation failed: {e.response['Error']['Message']}")

    @staticmethod
    def delete_object(s3_key: str) -> bool:
        """Permanently deletes an object from the S3 bucket."""
        s3 = get_s3_client()
        try:
            s3.delete_object(Bucket=settings.AWS_S3_BUCKET, Key=s3_key)
            return True
        except ClientError as e:
            raise RuntimeError(f"S3 delete failed: {e.response['Error']['Message']}")
