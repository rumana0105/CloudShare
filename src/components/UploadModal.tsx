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
}

const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'csv', 'xls', 'xlsx', 'ppt', 'pptx'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Upload to Amazon S3</h3>
            <p className="text-xs text-slate-500">Secure storage with AES-256 Server-Side Encryption</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successFile ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Upload Completed Successfully!</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                File <span className="font-medium text-slate-700">{successFile.name}</span> has been securely stored in your private Amazon S3 bucket.
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-left text-xs space-y-1.5 font-mono">
                <div className="text-slate-600 truncate">
                  <span className="text-slate-400">S3 Key:</span> {successFile.s3Key}
                </div>
                <div className="text-slate-600">
                  <span className="text-slate-400">Encryption:</span> {successFile.s3Encryption}
                </div>
                <div className="text-slate-600">
                  <span className="text-slate-400">Size:</span> {formatBytes(successFile.size)}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Upload Another File
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
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
                  dragActive
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : selectedFile
                    ? 'border-emerald-500/80 bg-emerald-50/20'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.csv,.xls,.xlsx,.ppt,.pptx"
                  className="hidden"
                />

                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>

                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{formatBytes(selectedFile.size)}</p>
                    <span className="inline-block text-[11px] text-emerald-600 font-medium">Ready to upload</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-800">
                      Drag &amp; drop your file here, or <span className="text-indigo-600 font-semibold underline underline-offset-2">browse files</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Supports PDF, Word, Excel, PPT, CSV, Images, and Text files up to 50 MB
                    </p>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between text-xs text-slate-700 font-medium">
                    <span>Streaming chunks to S3 bucket...</span>
                    <span className="font-mono tabular-nums">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" /> Applying AES-256 Server-Side Encryption
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Security Banner */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-500 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Files are stored privately in S3. Public bucket access is strictly blocked.</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isUploading}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartUpload}
                  disabled={!selectedFile || isUploading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-xs transition-colors"
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
