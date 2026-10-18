import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Lock, 
  HardDrive 
} from 'lucide-react';
import { CloudShareAPI, formatBytes } from '../services/api';
import { CloudFile } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (file: CloudFile) => void;
  onRefresh?: () => void;
}

const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'csv', 'xls', 'xlsx', 'ppt', 'pptx'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  onRefresh,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successFile, setSuccessFile] = useState<CloudFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    setError(null);
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`Unsupported file type (.${ext}). Supported types: ${ALLOWED_EXTENSIONS.join(', ')}.`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size (${formatBytes(file.size)}) exceeds maximum limit of 50 MB.`);
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const uploaded = await CloudShareAPI.uploadFile(selectedFile, (pct) => {
        setProgress(pct);
      });
      setSuccessFile(uploaded);
      onUploadSuccess(uploaded);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSuccessFile(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDone = () => {
    handleReset();
    onClose();
    if (onRefresh) onRefresh();
  };

  const handleUploadAnother = () => {
    handleReset();
    if (onRefresh) onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg theme-bg-surface rounded-2xl shadow-xl border theme-border overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b theme-border">
          <div>
            <h3 className="text-base font-semibold theme-text-primary">Upload to Amazon S3</h3>
            <p className="text-xs theme-text-muted">Secure storage with AES-256 Server-Side Encryption</p>
          </div>
          <button
            onClick={handleDone}
            className="p-1.5 theme-text-muted hover:theme-text-primary rounded-lg hover:theme-bg-subtle transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successFile ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold theme-text-primary">Upload Completed Successfully!</h4>
              <p className="text-xs theme-text-muted max-w-sm mx-auto">
                File <span className="font-medium theme-text-primary">{successFile.name}</span> has been securely stored in your private Amazon S3 bucket.
              </p>

              <div className="p-3 theme-bg-elevated rounded-xl border theme-border text-left text-xs space-y-1.5 font-mono">
                <div className="theme-text-secondary truncate">
                  <span className="theme-text-muted">S3 Key:</span> {successFile.s3Key}
                </div>
                <div className="theme-text-secondary">
                  <span className="theme-text-muted">Encryption:</span> {successFile.s3Encryption}
                </div>
                <div className="theme-text-secondary">
                  <span className="theme-text-muted">Size:</span> {formatBytes(successFile.size)}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleUploadAnother}
                  className="flex-1 px-4 py-2 text-xs font-semibold theme-btn-secondary rounded-xl cursor-pointer"
                >
                  Upload Another File
                </button>
                <button
                  onClick={handleDone}
                  className="flex-1 px-4 py-2 text-xs font-semibold theme-btn-primary rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Drag Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragActive || selectedFile
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-light)]'
                    : 'theme-border hover:border-[var(--accent-primary)] theme-bg-subtle/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.csv,.xls,.xlsx,.ppt,.pptx"
                  className="hidden"
                />

                <div className="w-12 h-12 mx-auto mb-3 rounded-xl theme-badge flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>

                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold theme-text-primary truncate">{selectedFile.name}</p>
                    <p className="text-xs theme-text-muted font-mono">{formatBytes(selectedFile.size)}</p>
                    <span className="inline-block text-[11px] font-medium" style={{ color: 'var(--accent-primary)' }}>
                      Ready to upload
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-medium theme-text-primary">
                      Drag &amp; drop your file here, or <span className="font-semibold underline underline-offset-2" style={{ color: 'var(--accent-primary)' }}>browse files</span>
                    </p>
                    <p className="text-xs theme-text-muted">
                      Supports PDF, Word, Excel, PPT, CSV, Images, and Text files up to 50 MB
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 p-3 rounded-xl theme-bg-elevated border theme-border">
                  <div className="flex justify-between text-xs theme-text-primary font-medium">
                    <span>Streaming chunks to S3 bucket...</span>
                    <span className="font-mono tabular-nums">{progress}%</span>
                  </div>
                  <div className="w-full h-2 theme-bg-subtle rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-150"
                      style={{ width: `${progress}%`, backgroundColor: 'var(--accent-primary)' }}
                    />
                  </div>
                  <div className="text-[11px] theme-text-muted flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Applying AES-256 Server-Side Encryption
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Security Banner */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl theme-bg-subtle text-[11px] theme-text-muted border theme-border">
                <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-primary)' }} />
                <span>Files are stored privately in S3. Public bucket access is strictly blocked.</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t theme-border">
                <button
                  type="button"
                  onClick={handleDone}
                  disabled={isUploading}
                  className="theme-btn-secondary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartUpload}
                  disabled={!selectedFile || isUploading}
                  className="theme-btn-primary px-4 py-2 text-xs font-semibold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading to S3...' : 'Start Upload'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
