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
import { ThemeToggle } from '../components/ThemeToggle';

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
    <div className="min-h-screen theme-bg-page theme-text-primary flex flex-col justify-between transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-4 border-b theme-border theme-bg-surface/95 px-6 lg:px-12 backdrop-blur-md transition-colors duration-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl theme-btn-primary flex items-center justify-center shadow-xs">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight theme-text-primary">
            CloudShare
          </span>
          <span className="text-[10px] font-bold theme-badge px-2 py-0.5 rounded border uppercase tracking-wider">
            AWS S3
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold theme-text-secondary">
          <a href="#features" className="hover:text-[var(--accent-primary)] transition-colors">Features</a>
          <a href="#architecture" className="hover:text-[var(--accent-primary)] transition-colors">Architecture</a>
          <a href="#team" className="hover:text-[var(--accent-primary)] transition-colors">Team</a>
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <button
            onClick={onSignIn}
            className="px-3.5 py-1.5 text-xs font-semibold theme-text-secondary hover:theme-text-primary transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onRegister}
            className="px-4 py-2 text-xs font-semibold rounded-xl shadow-xs theme-btn-primary cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 pt-16 pb-20 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full theme-badge text-xs font-medium border shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Distributed Systems &amp; Cloud Computing (DSCC) MCA Mini Project</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight theme-text-primary leading-tight text-balance">
            Your Files. Securely Stored. Isolated &amp; Encrypted on AWS S3.
          </h1>

          <p className="text-base theme-text-secondary max-w-2xl mx-auto leading-relaxed">
            A functional cloud file management application demonstrating centralized cloud storage using <strong>Amazon Web Services (Amazon S3)</strong>, Python FastAPI, SQLite, and Boto3 with user-scoped isolation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onRegister}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl shadow-md theme-btn-primary cursor-pointer"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border theme-border theme-btn-secondary cursor-pointer"
            >
              <Lock className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Sign In to Dashboard</span>
            </button>
            <button
              onClick={onExploreArchitecture}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold theme-text-secondary hover:theme-text-primary rounded-xl transition-all cursor-pointer"
            >
              <Server className="w-4 h-4 theme-text-muted" />
              <span>Project Details</span>
            </button>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs theme-text-secondary">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)]" /> Private S3 Bucket
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)]" /> AES-256 Server-Side Encryption
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)]" /> SigV4 Presigned Downloads
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)]" /> Multi-Tenant User Isolation
            </span>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="px-6 lg:px-12 py-16 theme-bg-surface border-y theme-border transition-colors">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
              Core Capabilities
            </h2>
            <p className="text-2xl font-bold tracking-tight theme-text-primary">
              Built for Real AWS S3 Operations
            </p>
            <p className="text-xs theme-text-secondary">
              Engineered with clean architectural principles for distributed cloud systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl theme-bg-subtle border theme-border hover:border-[var(--accent-primary)] transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl theme-badge border flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-sm font-bold theme-text-primary">S3 Multipart Streaming</h3>
              <p className="text-xs theme-text-secondary leading-relaxed">
                Direct file uploads to a private Amazon S3 bucket with strict file extension filtering and a 50 MB size limit.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl theme-bg-subtle border theme-border hover:border-[var(--accent-primary)] transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl theme-badge border flex items-center justify-center">
                <Lock className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-sm font-bold theme-text-primary">AES-256 Server-Side Encryption</h3>
              <p className="text-xs theme-text-secondary leading-relaxed">
                Every uploaded object is encrypted at rest using Amazon S3 Managed Keys (SSE-S3 AES-256) automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl theme-bg-subtle border theme-border hover:border-[var(--accent-primary)] transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl theme-badge border flex items-center justify-center">
                <Download className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-sm font-bold theme-text-primary">SigV4 Presigned Downloads</h3>
              <p className="text-xs theme-text-secondary leading-relaxed">
                Downloads are authorized via temporary 15-minute AWS Signature Version 4 presigned URLs. The bucket stays completely private.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl theme-bg-subtle border theme-border hover:border-[var(--accent-primary)] transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl theme-badge border flex items-center justify-center">
                <Database className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-sm font-bold theme-text-primary">SQLite User Isolation</h3>
              <p className="text-xs theme-text-secondary leading-relaxed">
                Registered user accounts and files are stored in a persistent SQLite database with hashed passwords and JWT token verification.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl theme-bg-subtle border theme-border hover:border-[var(--accent-primary)] transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl theme-badge border flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-sm font-bold theme-text-primary">Safe Deletion &amp; Quotas</h3>
              <p className="text-xs theme-text-secondary leading-relaxed">
                Permanent deletion removes both the object from Amazon S3 and its metadata from the database, instantly freeing quota.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl theme-bg-subtle border theme-border hover:border-[var(--accent-primary)] transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl theme-badge border flex items-center justify-center">
                <Server className="w-5 h-5 text-[var(--accent-primary)]" />
              </div>
              <h3 className="text-sm font-bold theme-text-primary">FastAPI &amp; Boto3 Backend</h3>
              <p className="text-xs theme-text-secondary leading-relaxed">
                High-performance Python ASGI backend using FastAPI, Pydantic v2 schemas, and official AWS SDK Boto3.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="px-6 lg:px-12 py-16 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
            System Architecture
          </h2>
          <p className="text-2xl font-bold tracking-tight theme-text-primary">
            Three-Tier Cloud Storage Model
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl theme-bg-surface border theme-border shadow-xs space-y-3">
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded theme-badge border">Tier 1: Client</span>
            <h4 className="text-sm font-bold theme-text-primary">React 19 + TypeScript</h4>
            <p className="text-xs theme-text-secondary leading-relaxed">
              Responsive SaaS user interface built with Vite and Tailwind CSS. Authenticates users with JWT and issues multipart uploads.
            </p>
          </div>

          <div className="p-6 rounded-2xl theme-bg-surface border theme-border shadow-xs space-y-3">
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded theme-badge border">Tier 2: Application</span>
            <h4 className="text-sm font-bold theme-text-primary">FastAPI + SQLite</h4>
            <p className="text-xs theme-text-secondary leading-relaxed">
              Handles JWT authentication, PBKDF2 password hashing, file type/size validation, and user database isolation.
            </p>
          </div>

          <div className="p-6 rounded-2xl theme-bg-surface border theme-border shadow-xs space-y-3">
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded theme-badge border">Tier 3: Cloud Storage</span>
            <h4 className="text-sm font-bold theme-text-primary">Amazon S3 Standard</h4>
            <p className="text-xs theme-text-secondary leading-relaxed">
              Private object storage bucket with Server-Side Encryption (SSE-S3 AES-256) and Block Public Access enabled.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="px-6 lg:px-12 py-16 theme-bg-surface border-t theme-border transition-colors">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full theme-badge text-xs font-medium border">
            <Users className="w-3.5 h-3.5" />
            <span>Project Developers</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight theme-text-primary">
            Developed by Romana Jagirdar, Gauri Kangle &amp; Om Mahadik
          </h2>

          <p className="text-xs sm:text-sm theme-text-secondary max-w-xl mx-auto leading-relaxed">
            Master of Computer Applications (MCA) · Distributed Systems and Cloud Computing (DSCC) Mini Project demonstrating practical Amazon Web Services implementation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <div className="px-5 py-3 rounded-xl theme-bg-elevated border theme-border text-left shadow-2xs">
              <p className="text-xs font-semibold theme-text-primary">Romana Jagirdar</p>
            </div>
            <div className="px-5 py-3 rounded-xl theme-bg-elevated border theme-border text-left shadow-2xs">
              <p className="text-xs font-semibold theme-text-primary">Gauri Kangle</p>
            </div>
            <div className="px-5 py-3 rounded-xl theme-bg-elevated border theme-border text-left shadow-2xs">
              <p className="text-xs font-semibold theme-text-primary">Om Mahadik</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 lg:px-12 border-t theme-border theme-bg-surface text-xs theme-text-muted flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <span>&copy; 2026 CloudShare — AWS S3 File Storage System. Developed by Romana Jagirdar, Gauri Kangle and Om Mahadik.</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onSignIn} className="hover:text-[var(--accent-primary)] transition-colors cursor-pointer">Sign In</button>
          <button onClick={onRegister} className="hover:text-[var(--accent-primary)] transition-colors cursor-pointer">Register</button>
          <button onClick={onExploreArchitecture} className="hover:text-[var(--accent-primary)] transition-colors cursor-pointer">About Project</button>
        </div>
      </footer>
    </div>
  );
};
