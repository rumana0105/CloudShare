import React from 'react';
import { 
  Cloud, 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Sparkles,
  Users
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AuthVisual } from './AuthVisual';

interface AuthLayoutProps {
  children: React.ReactNode;
  onNavigateToHome: () => void;
  pageType: 'login' | 'register';
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  onNavigateToHome,
  pageType,
}) => {
  return (
    <div className="min-h-screen w-full theme-bg-page theme-text-primary flex flex-col lg:grid lg:grid-cols-12 transition-colors duration-200">
      
      {/* ================= LEFT PANEL: BRANDING & VISUALS ================= */}
      <aside className="lg:col-span-6 xl:col-span-7 theme-bg-elevated theme-text-primary relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 border-b lg:border-b-0 lg:border-r theme-border transition-colors duration-200">
        {/* Subtle ambient gradient highlights */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-[var(--accent-primary)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-[var(--accent-primary)]/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Header: Brand & Project Pill */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={onNavigateToHome}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] rounded-xl p-1"
          >
            <div className="w-10 h-10 rounded-xl theme-btn-primary flex items-center justify-center shadow-md shadow-[var(--accent-primary)]/20 group-hover:scale-105 transition-transform duration-200">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight theme-text-primary group-hover:text-[var(--accent-primary)] transition-colors">
                  CloudShare
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold theme-badge rounded border uppercase tracking-wider">
                  AWS S3
                </span>
              </div>
              <p className="text-[11px] theme-text-secondary font-medium">
                Distributed Systems &amp; Cloud Computing
              </p>
            </div>
          </button>

          {/* Mobile Theme Toggle in top header */}
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>

        {/* Center Content: Slogan, Illustration & Features */}
        <div className="relative z-10 my-8 lg:my-auto max-w-xl mx-auto w-full text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full theme-badge text-xs font-semibold border shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)] animate-pulse" />
            <span>Next-Gen Cloud File Infrastructure</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold tracking-tight theme-text-primary leading-tight">
              Secure AWS S3 Object Storage with Zero Public Access
            </h1>
            <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed max-w-lg mx-auto lg:mx-0">
              Enterprise-grade multi-tenant file management. Files are streamed to private Amazon S3 buckets with AES-256 server-side encryption and retrieved via time-limited SigV4 signed presigned URLs.
            </p>
          </div>

          {/* Interactive Cloud Visual (Desktop & Tablet) */}
          <div className="hidden sm:block pt-2">
            <AuthVisual />
          </div>

          {/* Feature Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
            <div className="p-3.5 rounded-2xl theme-bg-surface border theme-border shadow-2xs backdrop-blur-xs">
              <div className="flex items-center gap-2 text-[var(--accent-primary)] text-xs font-bold mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Private Bucket</span>
              </div>
              <p className="text-[11px] theme-text-secondary leading-snug">
                100% private S3 bucket with strict Block Public Access.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl theme-bg-surface border theme-border shadow-2xs backdrop-blur-xs">
              <div className="flex items-center gap-2 text-[var(--accent-primary)] text-xs font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AES-256</span>
              </div>
              <p className="text-[11px] theme-text-secondary leading-snug">
                Automatic SSE-S3 encryption applied to every stored object.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl theme-bg-surface border theme-border shadow-2xs backdrop-blur-xs">
              <div className="flex items-center gap-2 text-[var(--accent-primary)] text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SigV4 URLs</span>
              </div>
              <p className="text-[11px] theme-text-secondary leading-snug">
                15-minute expiring signed cryptographic download links.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Left Attribution */}
        <div className="relative z-10 pt-4 border-t theme-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs theme-text-secondary">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span className="text-[11px] font-medium">
              Developed by <strong className="theme-text-primary font-semibold">Romana Jagirdar</strong>, <strong className="theme-text-primary font-semibold">Gauri Kangle</strong> &amp; <strong className="theme-text-primary font-semibold">Om Mahadik</strong>
            </span>
          </div>
          <span className="text-[10px] theme-text-muted uppercase tracking-wider font-mono">
            MCA DSCC Mini Project
          </span>
        </div>
      </aside>

      {/* ================= RIGHT PANEL: AUTHENTICATION FORM ================= */}
      <main className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 theme-bg-page transition-colors duration-200">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-6 sm:pb-8">
          <button
            onClick={onNavigateToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary hover:text-[var(--accent-primary)] transition-colors group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] rounded-lg px-2 py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to CloudShare</span>
          </button>

          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle showLabel={true} />
          </div>
        </div>

        {/* Center Form Card */}
        <div className="my-auto w-full max-w-md mx-auto">
          {children}
        </div>

        {/* Footer Attribution */}
        <footer className="pt-8 text-center text-xs theme-text-muted border-t theme-border transition-colors duration-200">
          <p className="leading-relaxed">
            &copy; 2026 CloudShare — AWS S3 File Storage System. Developed by Romana Jagirdar, Gauri Kangle and Om Mahadik.
          </p>
        </footer>
      </main>
    </div>
  );
};
