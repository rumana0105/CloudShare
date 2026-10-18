# Amazon EC2 Deployment Guide — CloudShare

This guide walks through deploying the Python FastAPI backend onto an Amazon EC2 instance.

---

## 1. Launch EC2 Instance

1. Open [Amazon EC2 Console](https://console.aws.amazon.com/ec2/).
2. Click **Launch instance**.
3. **Name**: `CloudShare-FastAPI-Server`.
4. **AMI**: Amazon Linux 2023 AMI (or Ubuntu 24.04 LTS).
5. **Instance type**: `t3.micro` or `t4g.micro` (Free tier eligible).
6. **Key pair**: Create or select an existing SSH key pair.
7. **Network settings (Security Group)**:
   - Allow SSH (Port 22) from your IP.
   - Allow HTTP (Port 80) from Anywhere (0.0.0.0/0).
   - Allow Custom TCP (Port 8000) from Anywhere (or reverse-proxy via Port 80).
8. **IAM Instance Profile**: Select `CloudShare-EC2-Role` (See `aws/iam-permissions.md`).
9. Click **Launch instance**.

---

## 2. Server Setup via SSH

SSH into the newly created EC2 instance:

```bash
ssh -i your-key.pem ec2-user@<YOUR-EC2-PUBLIC-IP>
```

Update system packages and install Python 3.12 & Git:

```bash
sudo dnf update -y
sudo dnf install -y python3.12 python3.12-pip git
```

Clone or transfer the project files:

```bash
git clone <YOUR-REPO-URL> cloudshare
cd cloudshare/backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

---

## 3. Create Systemd Service for FastAPI

Create a service file at `/etc/systemd/system/cloudshare.service`:

```ini
[Unit]
Description=CloudShare FastAPI Backend Service
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/cloudshare/backend
ExecStart=/home/ec2-user/cloudshare/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable cloudshare
sudo systemctl start cloudshare
sudo systemctl status cloudshare
```

---

## 4. Test Backend Connectivity

From your local machine or browser:
```bash
curl http://<YOUR-EC2-PUBLIC-IP>:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "CloudShare FastAPI Backend Running",
  "aws_configured": true,
  "s3_bucket": "cloudshare-dscc-storage-production",
  "region": "ap-south-1"
}
```
