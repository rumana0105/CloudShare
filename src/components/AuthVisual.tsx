import React from 'react';
import { 
  Cloud, 
  Lock, 
  ShieldCheck, 
  Key, 
  FileText, 
  Database,
  ArrowUpRight,
  HardDrive
} from 'lucide-react';

export const AuthVisual: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto py-8 select-none">
      {/* Ambient background glow */}
      <div className="absolute inset-0 -m-6 bg-gradient-to-tr from-[var(--accent-primary)]/15 via-[var(--accent-primary)]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Illustration Container */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Outer Orbit Ring with theme border */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border theme-border flex items-center justify-center">
          {/* Inner dotted orbit */}
          <div className="absolute w-56 h-56 rounded-full border border-dashed border-[var(--accent-primary)]/30 animate-pulse-subtle" />

          {/* Center Cloud Core */}
          <div className="relative flex flex-col items-center justify-center">
            {/* Glowing backdrop */}
            <div className="absolute w-28 h-28 bg-[var(--accent-primary)]/20 rounded-3xl blur-xl" />
            
            {/* Core Card */}
            <div className="relative z-10 w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-hover)] p-0.5 shadow-2xl shadow-[var(--accent-primary)]/30">
              <div className="w-full h-full rounded-[22px] theme-bg-surface backdrop-blur-md flex flex-col items-center justify-center p-3 text-center transition-colors">
                <Cloud className="w-9 h-9 text-[var(--accent-primary)] drop-shadow-xs" />
                <span className="text-[10px] font-bold tracking-wider text-[var(--accent-primary)] uppercase mt-1">Amazon S3</span>
              </div>
            </div>
          </div>

          {/* Orbiting Badge 1: Private S3 Storage (Top-Left) */}
          <div className="absolute -top-3 -left-3 sm:-top-2 sm:-left-4 animate-float-slow">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl theme-bg-surface border theme-border shadow-md backdrop-blur-md">
              <div className="w-7 h-7 rounded-xl theme-badge border flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)]" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold theme-text-primary">Private Bucket</p>
                <p className="text-[9px] theme-text-muted">Block Public Access</p>
              </div>
            </div>
          </div>

          {/* Orbiting Badge 2: SSE-S3 AES-256 (Top-Right) */}
          <div className="absolute -top-2 -right-3 sm:-top-1 sm:-right-4 animate-float-reverse">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl theme-bg-surface border theme-border shadow-md backdrop-blur-md">
              <div className="w-7 h-7 rounded-xl theme-badge border flex items-center justify-center">
                <Lock className="w-4 h-4 text-[var(--accent-primary)]" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold theme-text-primary">SSE-S3</p>
                <p className="text-[9px] theme-text-muted">AES-256 At Rest</p>
              </div>
            </div>
          </div>

          {/* Orbiting Badge 3: SigV4 Presigned URLs (Bottom-Right) */}
          <div className="absolute -bottom-3 -right-3 sm:-bottom-2 sm:-right-4 animate-float-slow">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl theme-bg-surface border theme-border shadow-md backdrop-blur-md">
              <div className="w-7 h-7 rounded-xl theme-badge border flex items-center justify-center">
                <Key className="w-4 h-4 text-[var(--accent-primary)]" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold theme-text-primary">SigV4 URLs</p>
                <p className="text-[9px] theme-text-muted">15-min Expiring Links</p>
              </div>
            </div>
          </div>

          {/* Orbiting Badge 4: Multi-Tenant Files (Bottom-Left) */}
          <div className="absolute -bottom-3 -left-3 sm:-bottom-2 sm:-left-4 animate-float-reverse">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl theme-bg-surface border theme-border shadow-md backdrop-blur-md">
              <div className="w-7 h-7 rounded-xl theme-badge border flex items-center justify-center">
                <HardDrive className="w-4 h-4 text-[var(--accent-primary)]" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-bold theme-text-primary">Isolated Storage</p>
                <p className="text-[9px] theme-text-muted">User Prefix Scoped</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Mini File Tag Chips */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full theme-bg-surface border theme-border theme-text-secondary text-[11px] font-mono shadow-2xs">
            <FileText className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>project-spec.pdf</span>
            <span className="text-[9px] theme-text-muted">2.4 MB</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full theme-bg-surface border theme-border theme-text-secondary text-[11px] font-mono shadow-2xs">
            <Database className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>backup-s3.tar.gz</span>
            <span className="text-[9px] theme-text-muted">18.1 MB</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full theme-badge border text-[11px] font-mono shadow-2xs">
            <ArrowUpRight className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};
