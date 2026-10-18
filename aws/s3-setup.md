# Amazon S3 Setup Guide — CloudShare

This guide walks through configuring Amazon Simple Storage Service (Amazon S3) for the **CloudShare — AWS S3 File Storage System** project manually via the AWS Management Console or AWS CLI.

---

## 1. Create Private S3 Bucket

1. Open the [AWS S3 Console](https://console.aws.amazon.com/s3/).
2. Click **Create bucket**.
3. **Bucket name**: `cloudshare-dscc-storage-production` (or any globally unique name like `cloudshare-dscc-yourname`).
4. **AWS Region**: Select `ap-south-1` (Asia Pacific - Mumbai) or your preferred region.
5. **Block Public Access settings for this bucket**:
   - Keep **Block all public access** checked (ensures 100% private security).
   - Acknowledge that the bucket will be private.
6. **Bucket Versioning**: Keep **Disabled**.
7. **Default encryption**:
   - Encryption type: **Server-side encryption with Amazon S3 managed keys (SSE-S3)**.
   - Bucket Key: **Enable**.
8. Click **Create bucket**.

---

## 2. CORS (Cross-Origin Resource Sharing)

In CloudShare, uploads and downloads are handled securely via the backend FastAPI streaming and temporary presigned URLs. If your frontend communicates through the FastAPI server (`http://localhost:8000`), S3 CORS is not strictly needed. 

However, if you ever configure direct browser-to-S3 presigned URL downloads, apply this CORS rule:

1. Open your bucket in the S3 Console.
2. Select the **Permissions** tab.
3. Scroll down to **Cross-origin resource sharing (CORS)** and click **Edit**.
4. Enter:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"],
    "ExposeHeaders": ["ETag", "x-amz-server-side-encryption"],
    "MaxAgeSeconds": 3000
  }
]
```
5. Click **Save changes**.

---

## 3. Key Security Architecture

- **Private Bucket**: Block Public Access is strictly enabled. Objects are never accessible anonymously.
- **Server-Side Encryption**: Every file stored is encrypted at rest using AES-256 (`SSE-S3`).
- **SigV4 Presigned URLs**: Authorized downloads use time-limited presigned URLs (15-minute expiration).
- **User Object Isolation**: Files in S3 are namespaced under `uploads/{user_id}/{file_id}_{clean_name}` to guarantee data isolation between users.
