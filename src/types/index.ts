export type FileCategory = 'document' | 'image' | 'spreadsheet' | 'presentation' | 'text' | 'other';

export interface User {
  id: string;
  full_name: string;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CloudFile {
  id: string;
  name: string;
  size: number; // in bytes
  contentType: string;
  category: FileCategory;
  s3Key: string;
  s3Bucket: string;
  s3Region: string;
  s3Encryption: string;
  etag?: string;
  uploadedAt: string;
  downloadUrl?: string;
}

export interface DashboardStats {
  totalFiles: number;
  storageUsedBytes: number;
  storageLimitBytes: number;
}

export interface BackendHealth {
  available: boolean;
  message?: string;
  s3Configured?: boolean;
  s3Bucket?: string;
  s3Accessible?: boolean;
  region?: string;
  databaseStatus?: string;
}
