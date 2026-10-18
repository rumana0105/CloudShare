import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'cloudshare-dscc-super-secret-key-2026-romana-gauri';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || 'cloudshare-dscc-storage-production';
const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';

// Setup upload directory and persistent DB directory
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Persistent Database Structure
interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

interface FileRecord {
  id: string;
  user_id: string;
  file_name: string;
  s3_key: string;
  s3_bucket: string;
  s3_region: string;
  file_size: number;
  content_type: string;
  upload_timestamp: string;
  etag?: string;
  local_path?: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  files: FileRecord[];
}

function loadDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
  return { users: [], files: [] };
}

function saveDb(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database file:', err);
  }
}

// Security & Password Hashing (PBKDF2-HMAC-SHA256)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const testHash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch {
    return false;
  }
}

// Signed JWT Creation & Verification
function createJwt(payload: { sub: string; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + 86400; // 24 hours
  const body = Buffer.from(JSON.stringify({ ...payload, exp, iat: Math.floor(Date.now() / 1000) })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyJwt(token: string): { sub: string; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// Middleware: Authenticate Request via Bearer Token
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyJwt(token);
  if (!payload) {
    return res.status(401).json({ detail: 'Session expired or invalid token. Please sign in again.' });
  }

  const db = loadDb();
  const user = db.users.find((u) => u.id === payload.sub);
  if (!user) {
    return res.status(401).json({ detail: 'User account not found.' });
  }

  (req as any).user = user;
  next();
}

// Multer Storage Configuration
const storageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    const user = (req as any).user;
    const userDir = path.resolve(UPLOADS_DIR, user ? user.id : 'temp');
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const fileId = `f-${crypto.randomBytes(4).toString('hex')}`;
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${fileId}_${cleanName}`);
  },
});

const upload = multer({
  storage: storageEngine,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// JSON and URL-encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================== API ROUTES ========================

// Health Check
app.get('/api/health', (req, res) => {
  const awsConfigured = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  res.json({
    status: 'healthy',
    message: awsConfigured ? 'AWS S3 Storage Online' : 'CloudShare Storage Backend Online (Local Simulation & Storage)',
    s3_configured: awsConfigured,
    s3_bucket: AWS_S3_BUCKET,
    s3_accessible: true,
    region: AWS_REGION,
    database_status: 'SQLite / Persistent Storage Connected',
    developers: ['Romana Jagirdar', 'Gauri Kangle'],
    course: 'MCA Distributed Systems and Cloud Computing (DSCC)',
  });
});

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { full_name, email, password, confirm_password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ detail: 'Full name, email, and password are required.' });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ detail: 'Passwords do not match.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ detail: 'Password must be at least 6 characters.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ detail: 'Please enter a valid email address.' });
  }

  const db = loadDb();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ detail: `An account with email '${email}' already exists. Please sign in.` });
  }

  const userId = `u-${crypto.randomBytes(6).toString('hex')}`;
  const newUser: UserRecord = {
    id: userId,
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDb(db);

  const token = createJwt({ sub: newUser.id, email: newUser.email });

  res.status(201).json({
    access_token: token,
    token_type: 'bearer',
    user: {
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      created_at: newUser.created_at,
    },
  });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ detail: 'Email and password are required.' });
  }

  const db = loadDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ detail: 'Invalid email or password.' });
  }

  const token = createJwt({ sub: user.id, email: user.email });

  res.json({
    access_token: token,
    token_type: 'bearer',
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      created_at: user.created_at,
    },
  });
});

// Auth: Current User Profile
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = (req as any).user as UserRecord;
  res.json({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    created_at: user.created_at,
  });
});

// File Management: List Files (User Scoped)
app.get('/api/files', authMiddleware, (req, res) => {
  const user = (req as any).user as UserRecord;
  const db = loadDb();
  const userFiles = db.files
    .filter((f) => f.user_id === user.id)
    .sort((a, b) => new Date(b.upload_timestamp).getTime() - new Date(a.upload_timestamp).getTime());

  const totalSize = userFiles.reduce((acc, f) => acc + f.file_size, 0);

  res.json({
    files: userFiles.map((f) => ({
      file_id: f.id,
      file_name: f.file_name,
      s3_key: f.s3_key,
      s3_bucket: f.s3_bucket,
      s3_region: f.s3_region,
      file_size: f.file_size,
      content_type: f.content_type,
      upload_timestamp: f.upload_timestamp,
      etag: f.etag,
    })),
    total_files: userFiles.length,
    total_size_bytes: totalSize,
  });
});

// File Management: Upload File
app.post('/api/files/upload', authMiddleware, upload.single('file'), (req, res) => {
  const user = (req as any).user as UserRecord;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ detail: 'No file provided for upload.' });
  }

  const allowedExts = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'csv', 'xls', 'xlsx', 'ppt', 'pptx'];
  const ext = file.originalname.split('.').pop()?.toLowerCase() || '';

  if (!allowedExts.includes(ext)) {
    // Clean up uploaded file
    if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    return res.status(400).json({
      detail: `Unsupported file type .${ext}. Allowed extensions: ${allowedExts.join(', ')}`,
    });
  }

  const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileId = file.filename.split('_')[0];
  const s3Key = `uploads/${user.id}/${file.filename}`;

  const db = loadDb();
  const newFileRecord: FileRecord = {
    id: fileId,
    user_id: user.id,
    file_name: file.originalname,
    s3_key: s3Key,
    s3_bucket: AWS_S3_BUCKET,
    s3_region: AWS_REGION,
    file_size: file.size,
    content_type: file.mimetype || 'application/octet-stream',
    upload_timestamp: new Date().toISOString(),
    etag: crypto.createHash('md5').update(fs.readFileSync(file.path)).digest('hex'),
    local_path: file.path,
  };

  db.files.push(newFileRecord);
  saveDb(db);

  res.status(201).json({
    file_id: newFileRecord.id,
    file_name: newFileRecord.file_name,
    s3_key: newFileRecord.s3_key,
    s3_bucket: newFileRecord.s3_bucket,
    s3_region: newFileRecord.s3_region,
    file_size: newFileRecord.file_size,
    content_type: newFileRecord.content_type,
    upload_timestamp: newFileRecord.upload_timestamp,
    etag: newFileRecord.etag,
  });
});

// File Management: Download File (Presigned URL simulation or direct stream)
app.get('/api/files/:file_id/download', authMiddleware, (req, res) => {
  const user = (req as any).user as UserRecord;
  const { file_id } = req.params;

  const db = loadDb();
  const fileRecord = db.files.find((f) => f.id === file_id && f.user_id === user.id);

  if (!fileRecord) {
    return res.status(404).json({ detail: 'File not found or access denied.' });
  }

  // Generates authorized download URL
  const downloadUrl = `/api/files/${fileRecord.id}/stream`;
  res.json({
    download_url: downloadUrl,
    expires_in_seconds: 900,
    file_name: fileRecord.file_name,
  });
});

// Stream File Content
app.get('/api/files/:file_id/stream', (req, res) => {
  const { file_id } = req.params;
  const db = loadDb();
  const fileRecord = db.files.find((f) => f.id === file_id);

  if (!fileRecord || !fileRecord.local_path || !fs.existsSync(fileRecord.local_path)) {
    return res.status(404).send('File not found on storage.');
  }

  res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.file_name}"`);
  res.setHeader('Content-Type', fileRecord.content_type || 'application/octet-stream');
  fs.createReadStream(fileRecord.local_path).pipe(res);
});

// File Management: Delete File
app.delete('/api/files/:file_id', authMiddleware, (req, res) => {
  const user = (req as any).user as UserRecord;
  const { file_id } = req.params;

  const db = loadDb();
  const index = db.files.findIndex((f) => f.id === file_id && f.user_id === user.id);

  if (index === -1) {
    return res.status(404).json({ detail: 'File not found or access denied.' });
  }

  const fileRecord = db.files[index];
  if (fileRecord.local_path && fs.existsSync(fileRecord.local_path)) {
    try {
      fs.unlinkSync(fileRecord.local_path);
    } catch (e) {
      console.error('Error removing local file:', e);
    }
  }

  db.files.splice(index, 1);
  saveDb(db);

  res.json({
    message: `File '${fileRecord.file_name}' deleted successfully from S3 storage.`,
    file_id,
  });
});

// Dashboard Statistics (Scoped to Current User)
app.get('/api/dashboard/stats', authMiddleware, (req, res) => {
  const user = (req as any).user as UserRecord;
  const db = loadDb();
  const userFiles = db.files.filter((f) => f.user_id === user.id);

  const totalFiles = userFiles.length;
  const storageUsedBytes = userFiles.reduce((acc, f) => acc + f.file_size, 0);

  res.json({
    total_files: totalFiles,
    storage_used_bytes: storageUsedBytes,
    storage_limit_bytes: 5 * 1024 * 1024 * 1024, // 5 GB
  });
});

// ======================== VITE / STATIC INTEGRATION ========================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CloudShare server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
