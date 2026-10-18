import { CloudFile, DashboardStats, FileCategory, User, AuthResponse, BackendHealth } from '../types';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function getFileCategory(fileName: string, mimeType?: string): FileCategory {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['pdf', 'doc', 'docx', 'odt'].includes(ext)) return 'document';
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
  if (['ppt', 'pptx'].includes(ext)) return 'presentation';
  if (['txt', 'md', 'json', 'yaml', 'xml'].includes(ext)) return 'text';
  return 'other';
}

const STORAGE_LIMIT_DEFAULT = 5 * 1024 * 1024 * 1024; // 5 GB standard project quota
const TOKEN_KEY = 'cloudshare_jwt_token';
const USER_KEY = 'cloudshare_user_profile';

class AuthSessionManager {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setSession(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }
}

export const authSession = new AuthSessionManager();

// Base API URL: relative path `/api` proxied by Vite to FastAPI backend (http://127.0.0.1:8000)
const API_BASE_URL = '/api';

export const CloudShareAPI = {
  // ==================== AUTHENTICATION ====================

  async register(
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        email,
        password,
        confirm_password: confirmPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || `Registration failed (HTTP ${res.status})`);
    }

    authSession.setSession(data.access_token, data.user);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || `Login failed (HTTP ${res.status})`);
    }

    authSession.setSession(data.access_token, data.user);
    return data;
  },

  async getMe(): Promise<User> {
    const token = authSession.getToken();
    if (!token) throw new Error('Unauthenticated');

    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      authSession.clearSession();
      throw new Error('Session expired. Please sign in again.');
    }

    if (!res.ok) {
      throw new Error('Failed to retrieve user profile.');
    }

    const user = await res.json();
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  logout(): void {
    authSession.clearSession();
  },

  // ==================== HEALTH ====================

  async checkBackendHealth(): Promise<BackendHealth> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) {
        const data = await res.json();
        return {
          available: true,
          message: data.message,
          s3Configured: data.s3_configured,
          s3Bucket: data.s3_bucket,
          s3Accessible: data.s3_accessible,
          region: data.region,
          databaseStatus: data.database_status,
        };
      }
      return {
        available: false,
        message: `HTTP ${res.status}: ${res.statusText}`,
      };
    } catch {
      return {
        available: false,
        message: 'Backend server is not reachable.',
      };
    }
  },

  // ==================== FILES ====================

  async getFiles(): Promise<CloudFile[]> {
    const token = authSession.getToken();
    if (!token) throw new Error('Authentication required. Please sign in.');

    const res = await fetch(`${API_BASE_URL}/files`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      authSession.clearSession();
      throw new Error('Session expired. Please sign in again.');
    }

    if (!res.ok) {
      let detail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson.detail) detail = errJson.detail;
      } catch {}
      throw new Error(`Failed to query storage: ${detail}`);
    }

    const data = await res.json();
    return (data.files || []).map((f: Record<string, unknown>) => ({
      id: String(f.file_id),
      name: String(f.file_name),
      size: Number(f.file_size || 0),
      contentType: String(f.content_type || 'application/octet-stream'),
      category: getFileCategory(String(f.file_name), String(f.content_type)),
      s3Key: String(f.s3_key),
      s3Bucket: String(f.s3_bucket),
      s3Region: String(f.s3_region || 'ap-south-1'),
      s3Encryption: 'SSE-S3 AES-256',
      etag: f.etag ? String(f.etag) : undefined,
      uploadedAt: String(f.upload_timestamp || new Date().toISOString()),
    }));
  },

  async uploadFile(file: File, onProgress?: (pct: number) => void): Promise<CloudFile> {
    const token = authSession.getToken();
    if (!token) throw new Error('Authentication required. Please sign in.');

    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`File size (${formatBytes(file.size)}) exceeds maximum limit of 50 MB.`);
    }

    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/files/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            resolve({
              id: res.file_id,
              name: res.file_name,
              size: res.file_size,
              contentType: res.content_type,
              category: getFileCategory(res.file_name, res.content_type),
              s3Key: res.s3_key,
              s3Bucket: res.s3_bucket,
              s3Region: res.s3_region || 'ap-south-1',
              s3Encryption: 'SSE-S3 AES-256',
              etag: res.etag,
              uploadedAt: res.upload_timestamp || new Date().toISOString(),
            });
          } catch {
            reject(new Error('Invalid response format from server.'));
          }
        } else if (xhr.status === 401) {
          authSession.clearSession();
          reject(new Error('Session expired. Please sign in again.'));
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData.detail || `Upload failed with HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with HTTP ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during file upload to storage.'));
      xhr.send(formData);
    });
  },

  async downloadFile(file: CloudFile): Promise<{ url: string; isBlob: boolean }> {
    const token = authSession.getToken();
    if (!token) throw new Error('Authentication required. Please sign in.');

    const res = await fetch(`${API_BASE_URL}/files/${file.id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      authSession.clearSession();
      throw new Error('Session expired. Please sign in again.');
    }

    if (!res.ok) {
      let detail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson.detail) detail = errJson.detail;
      } catch {}
      throw new Error(`Failed to generate secure download URL: ${detail}`);
    }

    const data = await res.json();
    return { url: data.download_url, isBlob: false };
  },

  async deleteFile(fileId: string): Promise<void> {
    const token = authSession.getToken();
    if (!token) throw new Error('Authentication required. Please sign in.');

    const res = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      authSession.clearSession();
      throw new Error('Session expired. Please sign in again.');
    }

    if (!res.ok) {
      let detail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson.detail) detail = errJson.detail;
      } catch {}
      throw new Error(`Failed to delete object: ${detail}`);
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const token = authSession.getToken();
    if (!token) throw new Error('Authentication required. Please sign in.');

    const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      authSession.clearSession();
      throw new Error('Session expired. Please sign in again.');
    }

    if (!res.ok) {
      throw new Error('Failed to fetch dashboard statistics.');
    }

    const data = await res.json();
    return {
      totalFiles: data.total_files || 0,
      storageUsedBytes: data.storage_used_bytes || 0,
      storageLimitBytes: data.storage_limit_bytes || STORAGE_LIMIT_DEFAULT,
    };
  },
};
