# CloudShare — AWS S3 File Storage System

**Master of Computer Applications (MCA) · Distributed Systems & Cloud Computing (DSCC) Mini Project**

### Project Developers:
* **Romana Jagirdar**
* **Gauri Kangle**
* **Om Mahadik**
* **Institution**: Master of Computer Applications (MCA)
* **Subject**: Distributed Systems and Cloud Computing (DSCC)

---

## A. Project Overview

**CloudShare — AWS S3 File Storage System** is a secure, multi-tenant cloud storage web application designed to demonstrate the practical application of distributed cloud storage principles using **Amazon Simple Storage Service (Amazon S3)**, **FastAPI (Python)**, and **React + TypeScript**.

### Why Amazon S3?
Traditional client-server systems that save uploaded files to local disk drives or SQL database blobs face disk exhaustion, high I/O latency, complex backup procedures, and single points of failure. Amazon S3 provides:
1. **High Durability & Availability**: 99.999999999% (11 9s) of data durability across multiple Availability Zones.
2. **Server-Side Encryption (SSE-S3 AES-256)**: Automatic data-at-rest encryption using 256-bit Advanced Encryption Standard keys managed by AWS.
3. **Secure Delegation via SigV4 Presigned URLs**: Clients download files through time-limited (15-minute) cryptographic URLs directly authorized by AWS Signature Version 4 without requiring the S3 bucket to be publicly accessible.
4. **Separation of Concerns**: Metadata and authentication records live in persistent structured storage, while heavy object binaries reside in elastic cloud object storage.

### What Runs Locally vs. What Runs on AWS
* **Runs Locally / On Server**:
  * **Frontend (React 19 + TypeScript + Vite)**: Responsive SaaS user interface for account authentication, drag-and-drop file upload, file search, and storage usage visualization. Proxies `/api` to FastAPI on port 8000.
  * **Backend (Python FastAPI on port 8000)**: Sole backend for the application. Verifies JWT tokens, hashes passwords with PBKDF2-HMAC-SHA256, validates file sizes/extensions, and orchestrates AWS Boto3 API calls.
  * **Database (SQLite)**: Stores registered user accounts and user-isolated file ownership records in `cloudshare.db` (`users` and `files` tables).
* **Runs on AWS Cloud**:
  * **Amazon S3**: Private bucket (`cloudshare-dscc-storage-production`) storing encrypted files under user-namespaced keys (`uploads/{user_id}/{file_id}_{clean_filename}`).

---

## B. Prerequisites

Before installing and configuring the application locally, ensure your computer has the following tools installed:

1. **Python**: Version **3.10, 3.11, 3.12, or 3.13**
   * Check version: `python --version`
2. **Node.js**: Version **18.x, 20.x, 22.x, or 24.x** with **npm**
   * Check version: `node -v` and `npm -v`
3. **AWS Account**: An active AWS account with permissions to create and manage an Amazon S3 bucket (or AWS Academy / Learner Lab).
4. **AWS CLI** (Recommended for local credentials):
   * Install from [aws.amazon.com/cli](https://aws.amazon.com/cli/)
   * Check version: `aws --version`

---

## C. Exact Project Structure

```text
├── README.md                      # Comprehensive project & AWS setup documentation
├── index.html                     # HTML5 single-page application entry point
├── package.json                   # Frontend dependencies (React 19, Lucide, Tailwind v4, Vite 8)
├── tsconfig.json                  # TypeScript compiler configuration
├── vite.config.ts                 # Vite bundler configuration (proxies /api -> http://127.0.0.1:8000)
├── server.ts                      # Legacy Express server (kept for historical reference; not used by npm run dev)
├── backend/                       # Python FastAPI Backend (Sole API Backend)
│   ├── requirements.txt           # Python packages (FastAPI, uvicorn, boto3, pyjwt, email-validator)
│   ├── .env                       # Backend active environment variables (credentials kept out of Git)
│   ├── .env.example               # Backend environment variables template
│   ├── test_api_endpoints.py      # Automated integration test suite
│   ├── cloudshare.db              # SQLite persistent database (users & files tables)
│   └── app/
│       ├── main.py                # FastAPI app entry point, CORS, and /api routers
│       ├── core/
│       │   ├── config.py          # App settings (Pydantic BaseSettings, CORS validator)
│       │   └── security.py        # PBKDF2 password hashing & signed JWT generation
│       ├── db/
│       │   └── database.py        # SQLite schema initialization (users and files tables)
│       ├── models/
│       │   └── schemas.py         # Pydantic v2 schemas for requests & responses
│       ├── routes/
│       │   ├── auth.py            # User registration, login, and /api/auth/me routes
│       │   ├── files.py           # S3 upload, list, presigned download, delete
│       │   └── dashboard.py       # User-scoped storage statistics
│       └── services/
│           └── s3_service.py      # Boto3 AWS S3 SDK wrapper (upload, presign, delete)
├── aws/
│   ├── s3-setup.md                # Dedicated Amazon S3 configuration guide
│   ├── iam-permissions.md         # AWS IAM least-privilege policy guide
│   └── ec2-deployment.md          # Amazon EC2 production deployment guide
└── src/                           # React 19 + TypeScript Frontend
    ├── main.tsx                   # React root entry point
    ├── App.tsx                    # Main application controller & view router
    ├── index.css                  # Global styles & Tailwind CSS v4 directives
    ├── types/
    │   └── index.ts               # TypeScript data interfaces (User, CloudFile, etc.)
    ├── services/
    │   └── api.ts                 # API client (calls /api/* proxied to FastAPI)
    ├── components/
    │   ├── Navbar.tsx             # Navigation bar with user pill and sign out
    │   ├── UploadModal.tsx        # Drag-and-drop file upload modal with validation
    │   └── AboutModal.tsx         # DSCC project & architecture information modal
    └── pages/
        ├── LandingPage.tsx        # Public landing page with features & team credits
        ├── LoginPage.tsx          # User sign-in page with validation & show/hide password
        ├── RegisterPage.tsx       # User registration page with email & password confirmation
        └── DashboardPage.tsx      # Authenticated user dashboard with file table & quota
```

---

## D. Amazon S3 Setup (Step-by-Step)

Follow these exact steps in the AWS Management Console to set up your private bucket:

### Step 1: Create the Private S3 Bucket
1. Open the [Amazon S3 Console](https://console.aws.amazon.com/s3/).
2. Click **Create bucket**.
3. **Bucket name**: Enter a unique name, e.g., `cloudshare-dscc-storage-production` (or `cloudshare-dscc-<your-name>`).
4. **AWS Region**: Select `ap-south-1` (Asia Pacific - Mumbai) or your closest region.
5. **Block Public Access settings for this bucket**:
   - Keep **Block all public access** checked (**ON**).
   - Check the acknowledgement box confirming that the bucket will be private.
6. **Bucket Versioning**: Keep **Disabled**.
7. **Default encryption**:
   - Encryption type: **Server-side encryption with Amazon S3 managed keys (SSE-S3)**.
   - Bucket Key: **Enable**.
8. Click **Create bucket**.

### Step 2: Configure Bucket CORS (Cross-Origin Resource Sharing)
If you plan to allow direct browser presigned URL transfers, configure CORS:
1. In the S3 Console, click on your newly created bucket.
2. Select the **Permissions** tab and scroll to **Cross-origin resource sharing (CORS)**.
3. Click **Edit** and paste:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173"
    ],
    "ExposeHeaders": ["ETag", "x-amz-server-side-encryption"],
    "MaxAgeSeconds": 3000
  }
]
```
4. Click **Save changes**.

### Step 3: Verify Bucket Creation
Run via AWS CLI:
```bash
aws s3 ls
```
Your bucket should appear in the output list.

---

## E. AWS IAM Permissions and Credentials

### Minimum IAM Permissions Policy
Create an IAM Policy named `CloudShare-S3-Policy` with only the required S3 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3ObjectLevelOperations",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:AbortMultipartUpload"
      ],
      "Resource": "arn:aws:s3:::cloudshare-dscc-storage-production/*"
    },
    {
      "Sid": "S3BucketLevelOperations",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::cloudshare-dscc-storage-production"
    }
  ]
}
```

### Local Development Credentials Configuration
1. In the [AWS IAM Console](https://console.aws.amazon.com/iam/), create an **IAM User** (e.g. `cloudshare-developer`).
2. Attach the `CloudShare-S3-Policy` created above.
3. Under the user's **Security credentials** tab, click **Create access key** and select **Application running outside AWS**.
4. Configure your credentials using one of two secure methods:
   * **Method A (AWS CLI Profile - Recommended)**:
     ```bash
     aws configure
     # AWS Access Key ID [None]: <your-access-key-id>
     # AWS Secret Access Key [None]: <your-secret-access-key>
     # Default region name [None]: ap-south-1
     # Default output format [None]: json
     ```
   * **Method B (Backend Environment File)**:
     Add the keys directly to `backend/.env`.

### EC2 Production IAM Role (No Hardcoded Keys)
If deploying the backend to an Amazon EC2 instance, attach an IAM Role containing `CloudShare-S3-Policy` to the instance. The AWS SDK (Boto3) will automatically retrieve temporary credentials from the EC2 Instance Metadata Service (IMDS).

> **CRITICAL SECURITY RULES**:
> 1. **Never use AWS root account access keys.**
> 2. **Never commit `.env` files or AWS keys to GitHub or public repositories.**
> 3. **Never expose AWS keys in React/TypeScript client-side code.**

---

## F. Backend Configuration (Python FastAPI)

The Python FastAPI backend is located in the `backend/` directory. It is the sole API backend for the application.

### Step 1: Create and Activate Python Virtual Environment

* **On Windows (PowerShell)**:
  ```powershell
  cd backend
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```
  *(If PowerShell script execution is restricted, run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` or activate via `.\venv\Scripts\activate.bat`)*

* **On Windows (Command Prompt)**:
  ```cmd
  cd backend
  python -m venv venv
  venv\Scripts\activate.bat
  ```

* **On macOS / Linux**:
  ```bash
  cd backend
  python3 -m venv venv
  source venv/bin/activate
  ```

### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure `.env`
The template file is located at `backend/.env.example`.
```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On macOS / Linux:
cp .env.example .env
```

### Step 4: Environment Variables Reference

| Variable | Description | Example Value |
|---|---|---|
| `AWS_REGION` | AWS region where your S3 bucket resides | `ap-south-1` |
| `AWS_S3_BUCKET` | Exact name of your private Amazon S3 bucket | `cloudshare-dscc-storage-production` |
| `AWS_ACCESS_KEY_ID` | IAM User Access Key ID (optional if using `aws configure`) | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | IAM User Secret Access Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_SESSION_TOKEN` | (Optional) Temporary session token for AWS Academy / Learner Lab | `IQoJb3JpZ2luX2Vj...` |
| `JWT_SECRET` | Secret key for signing authentication tokens | `cloudshare-dscc-super-secret-key-2026-romana-gauri` |
| `JWT_ALGORITHM` | Algorithm for JWT tokens | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Session validity duration in minutes | `1440` (24 hours) |
| `DATABASE_PATH` | Path to persistent SQLite database file | `cloudshare.db` |
| `BACKEND_HOST` | Host address to bind FastAPI | `0.0.0.0` |
| `BACKEND_PORT` | Port for FastAPI server | `8000` |
| `ALLOWED_ORIGINS` | Permitted frontend origins for CORS | `http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173` |
| `MAX_FILE_SIZE_MB` | Maximum allowed upload size in megabytes | `50` |

### Step 5: Start the FastAPI Server (Terminal 1)
```powershell
# From the backend directory with venv activated:
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Or directly from project root:
```powershell
backend\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

### Step 6: Verify Backend Health & API Docs
* **Interactive Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
* **API Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

When running locally without real AWS credentials, the endpoint accurately responds:
```json
{
  "status": "warning",
  "message": "FastAPI is running, but Amazon S3 bucket is not accessible or AWS credentials not set.",
  "s3_configured": false,
  "s3_bucket": "cloudshare-dscc-storage-production",
  "s3_accessible": false,
  "region": "ap-south-1",
  "database_status": "SQLite Database Connected (users & files)"
}
```
When valid AWS credentials and an accessible S3 bucket are configured, it responds:
```json
{
  "status": "healthy",
  "message": "CloudShare S3 Backend Online",
  "s3_configured": true,
  "s3_bucket": "cloudshare-dscc-storage-production",
  "s3_accessible": true,
  "region": "ap-south-1",
  "database_status": "SQLite Database Connected (users & files)"
}
```

### Step 7: Run Backend Automated Integration Tests
You can verify SQLite persistence, password hashing, JWT security, user isolation, and route validation anytime by running:
```powershell
cd backend
.\venv\Scripts\python.exe test_api_endpoints.py
```

---

## G. Frontend Configuration (React 19 + TypeScript + Vite)

The frontend is built using **React 19**, **TypeScript**, and **Vite**. It communicates exclusively with the FastAPI backend via a configured Vite proxy (`/api` &rarr; `http://127.0.0.1:8000`).

### Step 1: Install Dependencies
Open a **second terminal** in the project root directory:
```powershell
npm install
```

### Step 2: Start Frontend Development Server (Terminal 2)
```powershell
npm run dev
```
The application will launch on [http://localhost:5173](http://localhost:5173).
* All API requests made by the frontend (such as `/api/auth/login`, `/api/health`, `/api/files`) are automatically proxied by Vite to the FastAPI backend running on `http://127.0.0.1:8000`.

### Step 3: Run Type Checking & Production Build
```powershell
# Type checking
npm run lint

# Production build
npm run build
```
Build outputs are generated in the `dist/` directory.

---

## H. Running the Complete System (Quick Reference)

To run the full stack during local development or viva presentation, open **two separate Windows terminals**:

```text
┌────────────────────────────────────────────────────────┐
│ TERMINAL 1: FastAPI Backend (Port 8000)                │
├────────────────────────────────────────────────────────┤
│ cd backend                                             │
│ .\venv\Scripts\Activate.ps1                            │
│ uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ TERMINAL 2: Vite React Frontend (Port 5173)            │
├────────────────────────────────────────────────────────┤
│ npm run dev                                            │
│ (Open http://localhost:5173 in browser)               │
└────────────────────────────────────────────────────────┘
```

---

## I. Authentication Database Setup (SQLite)

The application uses **SQLite** for multi-tenant user isolation and file ownership tracking.

### Why SQLite?
1. **Zero External Server Overhead**: Runs embedded inside the Python backend and Node process without requiring a separate database server.
2. **ACID Compliant**: Provides reliable transactional integrity for account creation and file metadata writes.
3. **Persistent File Storage**: Saved in `cloudshare.db` (for FastAPI) and `data/db.json` (for integrated development).

### Tables Created Automatically on Startup:
* **`users` Table**:
  * `id`: Unique user identifier (`u-<hex>`)
  * `full_name`: User's full display name
  * `email`: Unique lowercase email address
  * `hashed_password`: PBKDF2-HMAC-SHA256 hash with random 16-byte salt (format: `salt:hash`)
  * `created_at`: ISO-8601 registration timestamp
* **`files` Table**:
  * `id`: Unique file ID (`f-<hex>`)
  * `user_id`: Foreign key linked to `users(id)`
  * `file_name`: Original client file name
  * `s3_key`: Namespaced S3 path (`uploads/{user_id}/{file_id}_{clean_name}`)
  * `s3_bucket`: S3 bucket name
  * `s3_region`: AWS region
  * `file_size`: Size in bytes
  * `content_type`: MIME type
  * `upload_timestamp`: ISO-8601 upload timestamp
  * `etag`: MD5 checksum computed from upload

### Password Hashing Details:
* Algorithm: **PBKDF2-HMAC-SHA256**
* Iterations: **100,000**
* Salt: **16 cryptographically random bytes**
* Plaintext passwords are never stored or logged.

---

## J. Comprehensive Testing Checklist

Execute these 14 verification scenarios to ensure your local installation and AWS S3 configuration are functioning properly:

1. **Register a New Account**:
   * Navigate to `/register`, enter Full Name, Email, and Password. Submit.
   * *Expected*: Account is created, JWT token is issued, and you are redirected to the Dashboard.
2. **Prevent Duplicate Email Registration**:
   * Attempt to register again with the same email.
   * *Expected*: Form rejects with HTTP 409 "An account with email '...' already exists."
3. **Log In with Valid Credentials**:
   * Log out, then enter your registered email and password.
   * *Expected*: Successfully authenticates and opens the Dashboard.
4. **Attempt Login with Invalid Credentials**:
   * Enter the correct email with an incorrect password.
   * *Expected*: Error banner displays "Invalid email or password."
5. **Access Protected APIs Without Logging In**:
   * Open a private terminal and execute: `curl http://localhost:8000/files`
   * *Expected*: Returns HTTP 401 Unauthorized with "Authentication required. Please sign in."
6. **Upload a Real File**:
   * Click "Upload File" in the dashboard. Select a valid PDF or PNG file under 50 MB.
   * *Expected*: Progress bar fills, file is streamed to S3 with SSE-S3 AES-256 encryption, and success card appears.
7. **Confirm File in AWS S3 Console**:
   * Log into AWS S3 Console &gt; open your bucket &gt; browse `uploads/<your-user-id>/`.
   * *Expected*: The uploaded file object is present in S3 with AES256 server-side encryption indicated.
8. **Confirm File in Dashboard Table**:
   * View the dashboard.
   * *Expected*: The file appears in the table with correct filename, size in KB/MB, upload date, and encryption badge.
9. **Download File via Presigned URL**:
   * Click the Download button on the uploaded file row.
   * *Expected*: Backend generates a SigV4 presigned URL with a 15-minute expiry, and the file downloads locally.
10. **Verify Presigned URL Expiration**:
    * Copy the download URL and wait 15 minutes.
    * *Expected*: After 15 minutes, opening the URL returns an AWS `<RequestHasExpired>` XML error.
11. **Delete File Permanently**:
    * Click the Trash icon on the file and confirm deletion in the modal.
    * *Expected*: Object is removed from the S3 bucket and database, and the storage count decrements immediately.
12. **Confirm Object Removed from S3**:
    * Refresh the AWS S3 Console.
    * *Expected*: The object no longer exists in the bucket.
13. **Multi-Tenant User Isolation**:
    * Register a second user account (`user2@example.com`). Log into User 2's dashboard.
    * *Expected*: User 2 sees an empty dashboard ("Your Amazon S3 storage is currently empty") and cannot view or download User 1's files.
14. **Error Handling on AWS Failure**:
    * Temporarily put an invalid bucket name in `backend/.env` or revoke network access.
    * *Expected*: The dashboard displays a clear error notice explaining the connection issue rather than displaying fake/demo data.

---

## K. Troubleshooting Guide

### 1. AWS Credentials Not Found
* **Symptoms**: Backend returns `botocore.exceptions.NoCredentialsError: Unable to locate credentials`.
* **Fix**: Run `aws configure` in your terminal to set your AWS Access Key ID and Secret Access Key, or set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `backend/.env`.

### 2. S3 AccessDenied (HTTP 403)
* **Symptoms**: Uploads or downloads fail with `botocore.exceptions.ClientError: An error occurred (AccessDenied)`.
* **Fix**: Verify that your IAM User or Role has `s3:PutObject`, `s3:GetObject`, and `s3:ListBucket` permissions attached for your specific bucket ARN. (See Section E).

### 3. NoSuchBucket (HTTP 404)
* **Symptoms**: Error message states `The specified bucket does not exist`.
* **Fix**: Ensure the `AWS_S3_BUCKET` in `backend/.env` matches the exact name created in the AWS S3 Console, and verify that `AWS_REGION` matches the bucket's region.

### 4. Backend Connection Refused
* **Symptoms**: Frontend displays "Backend server is not reachable" or "Failed to connect to backend".
* **Fix**: Ensure the FastAPI server is running (`uvicorn app.main:app --port 8000`) and that port 8000 is not blocked by a local firewall.

### 5. Unsupported File Type
* **Symptoms**: Upload modal displays "Unsupported file type".
* **Fix**: CloudShare accepts `.pdf`, `.docx`, `.xlsx`, `.pptx`, `.png`, `.jpg`, `.csv`, and `.txt`. Files with other extensions (e.g., `.exe`, `.sh`) are rejected by design for security.

### 6. File Exceeds 50 MB
* **Symptoms**: HTTP 413 Payload Too Large.
* **Fix**: The project enforces a 50 MB quota limit per file. Choose a file below 50 MB.

---

## L. Security & Cost Best Practices

1. **Always Keep S3 Block Public Access Enabled**:
   * Never disable Block Public Access. CloudShare achieves 100% private security by utilizing temporary AWS Signature Version 4 presigned URLs.
2. **AWS Free Tier Awareness**:
   * The AWS Free Tier provides **5 GB of S3 Standard storage**, **20,000 GET requests**, and **2,000 PUT requests** per month free for 12 months.
3. **Resource Cleanup**:
   * To avoid any recurring AWS charges after completing your project presentation or viva:
     1. Open the [Amazon S3 Console](https://console.aws.amazon.com/s3/).
     2. Select your bucket &gt; click **Empty** &gt; type `permanently delete`.
     3. Click **Delete bucket** &gt; type the bucket name &gt; click **Delete**.
     4. Delete any IAM access keys created for the project.

---

## License & Academic Disclaimer

This project is developed solely for educational purposes as part of the Master of Computer Applications (MCA) curriculum for the **Distributed Systems and Cloud Computing (DSCC)** mini project by **Romana Jagirdar**, **Gauri Kangle**, and **Om Mahadik**. All cloud operations interact with real Amazon Web Services infrastructure.
