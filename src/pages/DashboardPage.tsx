import React, { useState, useMemo } from 'react';
import { 
  HardDrive, 
  UploadCloud, 
  Download, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  Presentation, 
  File, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Lock, 
  ShieldCheck, 
  AlertTriangle,
  Info,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { CloudFile, DashboardStats, User } from '../types';
import { formatBytes } from '../services/api';

interface DashboardPageProps {
  user: User;
  stats: DashboardStats;
  files: CloudFile[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onLogout: () => void;
  onOpenUpload: () => void;
  onDownloadFile: (file: CloudFile) => void;
  onDeleteFile: (file: CloudFile) => void;
  onOpenAbout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  stats,
  files,
  searchQuery,
  onSearchChange,
  isLoading = false,
  error = null,
  onRetry,
  onLogout,
  onOpenUpload,
  onDownloadFile,
  onDeleteFile,
  onOpenAbout,
}) => {
  const [fileToDelete, setFileToDelete] = useState<CloudFile | null>(null);

  // Filter files by search query with strict deduplication
  const filteredFiles = useMemo(() => {
    const uniqueMap = new Map<string, CloudFile>();
    for (const f of files) {
      const key = f.id || f.s3Key;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, f);
      }
    }
    const uniqueFiles = Array.from(uniqueMap.values());

    if (!searchQuery.trim()) return uniqueFiles;
    const q = searchQuery.toLowerCase();
    return uniqueFiles.filter(
      (f) => f.name.toLowerCase().includes(q) || f.s3Key.toLowerCase().includes(q)
    );
  }, [files, searchQuery]);

  const effectiveTotalFiles = stats.totalFiles > 0 ? stats.totalFiles : filteredFiles.length;
  const effectiveStorageUsed = stats.storageUsedBytes > 0 
    ? stats.storageUsedBytes 
    : filteredFiles.reduce((acc, f) => acc + f.size, 0);

  const usagePercent = Math.min(
    100,
    Math.round((effectiveStorageUsed / (stats.storageLimitBytes || 1)) * 100)
  );

  const getFileIcon = (cat: string) => {
    switch (cat) {
      case 'document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-purple-600" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'presentation':
        return <Presentation className="w-5 h-5 text-pink-600" />;
      default:
        return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with User Info and Logout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b theme-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight theme-text-primary">
            AWS S3 File Storage Dashboard
          </h1>
          <p className="text-xs theme-text-muted mt-0.5">
            CloudShare — AWS S3 File Storage System · Developed by Romana Jagirdar, Gauri Kangle and Om Mahadik
          </p>
        </div>

        {/* User Pill & Logout Button */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 theme-bg-surface border theme-border rounded-xl theme-text-primary text-xs font-medium flex items-center gap-2 shadow-2xs">
            <div className="w-5 h-5 rounded-full theme-badge flex items-center justify-center font-bold text-[10px]">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate max-w-[140px] sm:max-w-[200px]">
              <span className="font-semibold theme-text-primary">{user.full_name}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-colors cursor-pointer"
            title="Sign out of your account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Error Banner when Backend / AWS fails */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 space-y-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-bold text-rose-950 dark:text-rose-200">Storage Connection Notice</h4>
              <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed font-mono">
                {error}
              </p>
              <div className="text-[11px] text-rose-700 dark:text-rose-400 pt-1">
                <strong>Troubleshooting Guide for College Viva / Local Run:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                  <li>Ensure the backend is running (<code className="font-mono bg-rose-100 dark:bg-rose-900/60 px-1 rounded">uvicorn app.main:app --port 8000</code> or Node dev server).</li>
                  <li>Verify AWS credentials (<code className="font-mono bg-rose-100 dark:bg-rose-900/60 px-1 rounded">AWS_ACCESS_KEY_ID</code>, <code className="font-mono bg-rose-100 dark:bg-rose-900/60 px-1 rounded">AWS_SECRET_ACCESS_KEY</code>) or EC2 IAM Role.</li>
                  <li>Verify that the S3 bucket <code className="font-mono bg-rose-100 dark:bg-rose-900/60 px-1 rounded">cloudshare-dscc-storage-production</code> exists in your AWS region.</li>
                </ul>
              </div>
            </div>
          </div>

          {onRetry && (
            <div className="flex items-center gap-2 pt-1 border-t border-rose-200/80 dark:border-rose-900/60 justify-end">
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="theme-bg-surface p-5 rounded-2xl border theme-border h-32 flex flex-col justify-between">
                <div className="h-4 theme-bg-elevated rounded w-1/2" />
                <div className="h-7 theme-bg-elevated rounded w-3/4" />
                <div className="h-3 theme-bg-subtle rounded w-2/3" />
              </div>
            ))}
          </div>
          <div className="theme-bg-surface p-6 rounded-2xl border theme-border h-72" />
        </div>
      ) : (
        <>
          {/* Main 3 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Files Card */}
            <div className="theme-bg-surface p-5 rounded-2xl border theme-border shadow-xs flex flex-col justify-between transition-colors">
              <div className="flex items-center justify-between theme-text-muted mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Files</span>
                <div className="w-8 h-8 rounded-xl theme-badge flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold theme-text-primary font-mono tabular-nums">
                {effectiveTotalFiles}
              </div>
              <div className="text-[11px] theme-text-muted mt-2">
                <span>Active files belonging to {user.full_name}</span>
              </div>
            </div>

            {/* Storage Used Card */}
            <div className="theme-bg-surface p-5 rounded-2xl border theme-border shadow-xs flex flex-col justify-between transition-colors">
              <div className="flex items-center justify-between theme-text-muted mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Storage Used</span>
                <div className="w-8 h-8 rounded-xl theme-badge flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold theme-text-primary font-mono tabular-nums">
                {formatBytes(effectiveStorageUsed)}
              </div>
              <div className="text-[11px] theme-text-muted mt-2 flex items-center justify-between">
                <span>{usagePercent}% of {formatBytes(stats.storageLimitBytes)} quota</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">SSE-S3 AES-256</span>
              </div>
            </div>

            {/* Cloud Storage Architecture Card */}
            <div className="theme-bg-surface p-5 rounded-2xl border theme-border shadow-xs flex flex-col justify-between transition-colors">
              <div className="flex items-center justify-between theme-text-muted mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Storage Architecture</span>
                <div className="w-8 h-8 rounded-xl theme-badge flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold theme-text-primary flex items-center gap-1">
                  <span>Amazon S3 Standard</span>
                </div>
                <p className="text-[11px] theme-text-muted leading-snug">
                  Private bucket with Block Public Access and SigV4 Presigned URL access.
                </p>
              </div>
              <div className="text-[11px] font-semibold mt-2">
                <button 
                  onClick={onOpenAbout} 
                  className="hover:underline flex items-center gap-1 cursor-pointer"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <span>View Project Architecture</span>
                  <Info className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Upload Drop Area */}
          <div
            onClick={onOpenUpload}
            className="theme-bg-surface hover:theme-bg-subtle p-6 rounded-2xl border-2 border-dashed theme-border cursor-pointer flex flex-col items-center justify-center text-center transition-all group shadow-xs"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="w-12 h-12 rounded-2xl theme-badge flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs mb-2">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold theme-text-primary group-hover:text-[var(--accent-primary)] transition-colors">
              Upload File to Amazon S3
            </h3>
            <p className="text-xs theme-text-muted max-w-md mt-1 mb-3 leading-relaxed">
              Supports documents, spreadsheets, presentations, and images up to 50 MB. Encrypted using Server-Side AES-256 encryption.
            </p>
            <button className="theme-btn-primary px-4 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer">
              Choose File to Upload
            </button>
          </div>

          {/* Search bar on mobile */}
          <div className="sm:hidden">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
              <input
                type="text"
                placeholder="Search files by name..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="theme-input w-full h-10 pl-10 pr-4 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Uploaded Files Table */}
          <div className="theme-bg-surface rounded-2xl border theme-border shadow-xs overflow-hidden transition-colors">
            <div className="p-4 sm:p-5 border-b theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold theme-text-primary">
                  Uploaded File Records
                </h3>
                <p className="text-xs theme-text-muted">
                  Private Amazon S3 bucket storage with server-side AES-256 encryption
                </p>
              </div>

              <div className="text-xs font-mono theme-text-muted">
                Total Files: <strong className="theme-text-primary">{filteredFiles.length}</strong>
              </div>
            </div>

            {filteredFiles.length === 0 ? (
              <div className="p-12 text-center theme-text-muted space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl theme-badge flex items-center justify-center">
                  <File className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold theme-text-primary">
                    {searchQuery ? 'No matching files found' : 'Your Amazon S3 storage is currently empty'}
                  </p>
                  <p className="text-xs theme-text-muted mt-1 max-w-sm mx-auto leading-relaxed">
                    {searchQuery
                      ? `No files matched "${searchQuery}". Try searching with a different filename.`
                      : 'No files have been uploaded to your account yet. Click "Upload File" above to store your first document.'}
                  </p>
                </div>
                {!searchQuery && (
                  <button
                    onClick={onOpenUpload}
                    className="theme-btn-primary px-4 py-2 text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                  >
                    Upload First File
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="theme-bg-elevated border-b theme-border theme-text-muted font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-[38%]">File Name</th>
                      <th className="py-3.5 px-4 w-[16%]">File Size</th>
                      <th className="py-3.5 px-4 w-[18%]">Upload Date</th>
                      <th className="py-3.5 px-4 w-[16%]">S3 Encryption</th>
                      <th className="py-3.5 px-4 w-[12%] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-border">
                    {filteredFiles.map((file) => (
                      <tr key={file.id} className="hover:theme-bg-subtle transition-colors">
                        <td className="py-3.5 px-4 font-medium theme-text-primary align-middle">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg theme-bg-elevated border theme-border flex items-center justify-center shrink-0">
                              {getFileIcon(file.category)}
                            </div>
                            <div className="truncate max-w-xs sm:max-w-md">
                              <p className="font-semibold theme-text-primary truncate" title={file.name}>{file.name}</p>
                              <p className="text-[10px] theme-text-muted font-mono truncate" title={file.s3Key}>{file.s3Key}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono theme-text-secondary whitespace-nowrap align-middle">
                          {formatBytes(file.size)}
                        </td>
                        <td className="py-3.5 px-4 theme-text-muted whitespace-nowrap align-middle">
                          {new Date(file.uploadedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap align-middle">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold font-mono theme-badge border">
                            <Lock className="w-2.5 h-2.5" />
                            {file.s3Encryption || 'SSE-S3 AES-256'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap align-middle">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => onDownloadFile(file)}
                              className="p-1.5 theme-text-muted hover:theme-text-primary hover:theme-bg-elevated rounded-lg transition-colors cursor-pointer"
                              title="Download via S3 Presigned URL"
                              aria-label="Download file"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setFileToDelete(file)}
                              className="p-1.5 theme-text-muted hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete from S3"
                              aria-label="Delete file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="theme-bg-surface rounded-2xl max-w-md w-full p-5 border theme-border shadow-xl space-y-4 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold theme-text-primary">Delete File from Amazon S3?</h3>
                <p className="text-xs theme-text-muted leading-relaxed">
                  Are you sure you want to permanently delete <strong className="theme-text-primary">{fileToDelete.name}</strong> ({formatBytes(fileToDelete.size)})?
                  This action removes the object directly from the private Amazon S3 bucket.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t theme-border">
              <button
                onClick={() => setFileToDelete(null)}
                className="theme-btn-secondary px-3.5 py-1.5 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = fileToDelete;
                  setFileToDelete(null);
                  onDeleteFile(target);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Yes, Delete from S3
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
