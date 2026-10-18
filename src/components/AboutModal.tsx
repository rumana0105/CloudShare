import React from 'react';
import { 
  X, 
  Cloud, 
  HardDrive, 
  Lock, 
  CheckCircle2, 
  Users, 
  GraduationCap, 
  Server, 
  ShieldCheck, 
  Database,
  Key
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">About CloudShare</h2>
              <p className="text-xs text-slate-500">CloudShare — AWS S3 File Storage System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm">
          {/* Team and Course Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>Academic Mini Project</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Master of Computer Applications (MCA)
              </h3>
              <p className="text-xs text-slate-600">
                Subject: Distributed Systems and Cloud Computing (DSCC)
              </p>
            </div>
            <div className="sm:border-l sm:border-indigo-200 sm:pl-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Project Developers:</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">1. Romana Jagirdar</p>
              <p className="text-xs font-semibold text-slate-900">2. Gauri Kangle</p>
              <p className="text-xs font-semibold text-slate-900">3. Om Mahadik</p>
            </div>
          </div>

          {/* Project Objective */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Project Objective
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              CloudShare is a functional cloud file management and storage system developed to demonstrate core distributed computing and cloud storage principles using <strong>Amazon Web Services (Amazon S3)</strong>. Authenticated users can upload files to a private S3 bucket, view their uploaded files, download files securely via <strong>AWS SigV4 Presigned URLs</strong>, and permanently delete files.
            </p>
          </div>

          {/* High-Level Architecture Flow */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              System Architecture &amp; Data Flow
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-sans">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <span><strong>User Browser (React 19 + TypeScript)</strong>: User signs in with JWT and uploads file.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-sans">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <span><strong>FastAPI Backend (Python 3.10+ &amp; Boto3)</strong>: Verifies JWT, validates file type and size (&le;50MB), streams to S3.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-sans">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">3</span>
                <span><strong>SQLite Database</strong>: Stores user accounts with PBKDF2 hashed passwords and user-scoped file metadata.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-sans">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">4</span>
                <span><strong>Amazon S3 Bucket</strong>: Encrypts objects at rest using AES-256 Server-Side Encryption (SSE-S3).</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-sans">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">5</span>
                <span><strong>Authorized Download</strong>: Backend issues AWS SigV4 Presigned URL (15-min expiry) for direct, private retrieval.</span>
              </div>
            </div>
          </div>

          {/* Key Cloud Engineering Principles */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cloud Security &amp; Distributed Principles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Private S3 Bucket</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Block Public Access is strictly enabled. Objects cannot be accessed anonymously over the public web.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SSE-S3 AES-256</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Server-side encryption protects data at rest automatically with AWS managed encryption keys.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  <span>SigV4 Presigned URLs</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Temporary time-limited signed URLs allow authorized downloads without exposing AWS credentials to clients.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  <span>Multi-Tenant User Isolation</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Each user account is authenticated via JWT and can only view, download, or delete their own uploaded files.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs text-slate-500">
            CloudShare — AWS S3 File Storage System · Developed by Romana Jagirdar, Gauri Kangle and Om Mahadik
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
