# AWS IAM Least-Privilege Permissions Policy — CloudShare

This document specifies the minimal least-privilege IAM policy required for the **CloudShare — AWS S3 File Storage System** backend.

By using an **IAM User** (for local development) or an **IAM Instance Profile** (if running on EC2), you avoid needing broad administrative access.

---

## 1. Minimal IAM Policy for Amazon S3: `CloudShare-S3-Policy`

In the [AWS IAM Console](https://console.aws.amazon.com/iam/), create a new policy named `CloudShare-S3-Policy` with the following JSON:

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

> **Note**: Replace `cloudshare-dscc-storage-production` with your actual S3 bucket name if different.

---

## 2. Using with Local Development (IAM User)

1. In IAM Console, choose **Users** &gt; **Create user** (e.g. `cloudshare-dev-user`).
2. Attach policy directly: `CloudShare-S3-Policy`.
3. Create an Access Key under **Security credentials** &gt; **Access keys** (select "Application running outside AWS").
4. Add the Access Key ID and Secret Access Key to `backend/.env`.

---

## 3. Using with Amazon EC2 (IAM Instance Profile)

1. In IAM Console, choose **Roles** &gt; **Create role**.
2. Trusted entity type: **AWS service** &gt; **EC2**.
3. Attach policy: `CloudShare-S3-Policy`.
4. Role name: `CloudShare-EC2-Role`.
5. Attach this role to your EC2 instance via **Actions** &gt; **Security** &gt; **Modify IAM role**.
6. When using an IAM Role on EC2, Boto3 automatically retrieves temporary credentials from the EC2 Instance Metadata Service (IMDS). You do not need to set `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` in `backend/.env`.
