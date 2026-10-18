import React from 'react';
import { 
  Cloud, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Server, 
  CheckCircle2, 
  HardDrive,
  Download,
  Trash2,
  Users,
  Database
} from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
  onRegister: () => void;
  onExploreArchitecture: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSignIn,
  onRegister,
  onExploreArchitecture,
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-6 lg:px-12 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Cloud className="w-5 h-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            CloudShare
          </span>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
            AWS S3
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
          <a href="#architecture" className="hover:text-indigo-600 transition-colors">Architecture</a>
          <a href="#team" className="hover:text-indigo-600 transition-colors">Team</a>
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onSignIn}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onRegister}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 pt-16 pb-20 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Distributed Systems &amp; Cloud Computing (DSCC) MCA Mini Project</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight text-balance">
            Your Files. Securely Stored. Isolated &amp; Encrypted on AWS S3.
          </h1>

          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A functional cloud file management application demonstrating centralized cloud storage using <strong>Amazon Web Services (Amazon S3)</strong>, Python FastAPI, SQLite, and Boto3 with user-scoped isolation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onRegister}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Sign In to Dashboard</span>
            </button>
            <button
              onClick={onExploreArchitecture}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
            >
              <Server className="w-4 h-4 text-slate-500" />
              <span>Project Details</span>
            </button>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Private S3 Bucket
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> AES-256 Server-Side Encryption
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> SigV4 Presigned Downloads
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Multi-Tenant User Isolation
            </span>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="px-6 lg:px-12 py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Core Capabilities
            </h2>
            <p className="text-2xl font-bold tracking-tight text-slate-900">
              Built for Real AWS S3 Operations
            </p>
            <p className="text-xs text-slate-500">
              Engineered with clean architectural principles for distributed cloud systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">S3 Multipart Streaming</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct file uploads to a private Amazon S3 bucket with strict file extension filtering and a 50 MB size limit.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">AES-256 Server-Side Encryption</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every uploaded object is encrypted at rest using Amazon S3 Managed Keys (SSE-S3 AES-256) automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">SigV4 Presigned Downloads</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Downloads are authorized via temporary 15-minute AWS Signature Version 4 presigned URLs. The bucket stays completely private.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">SQLite User Isolation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Registered user accounts and files are stored in a persistent SQLite database with hashed passwords and JWT token verification.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Safe Deletion &amp; Quotas</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Permanent deletion removes both the object from Amazon S3 and its metadata from the database, instantly freeing quota.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-300 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">FastAPI &amp; Boto3 Backend</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-performance Python ASGI backend using FastAPI, Pydantic v2 schemas, and official AWS SDK Boto3.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="px-6 lg:px-12 py-16 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            System Architecture
          </h2>
          <p className="text-2xl font-bold tracking-tight text-slate-900">
            Three-Tier Cloud Storage Model
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">Tier 1: Client</span>
            <h4 className="text-sm font-bold text-slate-900">React 19 + TypeScript</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Responsive SaaS user interface built with Vite and Tailwind CSS. Authenticates users with JWT and issues multipart uploads.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700">Tier 2: Application</span>
            <h4 className="text-sm font-bold text-slate-900">FastAPI + SQLite</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Handles JWT authentication, PBKDF2 password hashing, file type/size validation, and user database isolation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">Tier 3: Cloud Storage</span>
            <h4 className="text-sm font-bold text-slate-900">Amazon S3 Standard</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Private object storage bucket with Server-Side Encryption (SSE-S3 AES-256) and Block Public Access enabled.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="px-6 lg:px-12 py-16 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700 text-indigo-300 text-xs font-medium">
            <Users className="w-3.5 h-3.5" />
            <span>Project Developers</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Developed by Romana Jagirdar, Gauri Kangle &amp; Om Mahadik
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Master of Computer Applications (MCA) · Distributed Systems and Cloud Computing (DSCC) Mini Project demonstrating practical Amazon Web Services implementation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <div className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-left">
              <p className="text-xs font-semibold text-white">Romana Jagirdar</p>
            </div>
            <div className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-left">
              <p className="text-xs font-semibold text-white">Gauri Kangle</p>
            </div>
            <div className="px-5 py-3 rounded-xl bg-slate-800 border border-slate-700 text-left">
              <p className="text-xs font-semibold text-white">Om Mahadik</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 lg:px-12 border-t border-slate-200/80 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>&copy; 2026 CloudShare — AWS S3 File Storage System. Developed by Romana Jagirdar, Gauri Kangle and Om Mahadik.</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onSignIn} className="hover:text-indigo-600 transition-colors">Sign In</button>
          <button onClick={onRegister} className="hover:text-indigo-600 transition-colors">Register</button>
          <button onClick={onExploreArchitecture} className="hover:text-indigo-600 transition-colors">About Project</button>
        </div>
      </footer>
    </div>
  );
};
