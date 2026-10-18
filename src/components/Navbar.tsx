import React from 'react';
import { 
  Cloud, 
  Search, 
  Info,
  LogOut
} from 'lucide-react';
import { User } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  user: User;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenUpload: () => void;
  onOpenAbout: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  searchQuery,
  onSearchChange,
  onOpenUpload,
  onOpenAbout,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b theme-border theme-bg-surface/95 px-4 md:px-8 backdrop-blur-md transition-colors duration-200">
      {/* Brand & Developers Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl theme-btn-primary flex items-center justify-center shadow-xs">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold theme-text-primary tracking-tight">CloudShare</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold theme-badge rounded border uppercase tracking-wider">
                AWS S3
              </span>
            </div>
            <p className="hidden md:block text-[11px] theme-text-secondary font-medium">
              MCA DSCC · Romana Jagirdar, Gauri Kangle &amp; Om Mahadik
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
          <input
            type="text"
            placeholder="Search files by name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-9.5 pr-4 text-xs theme-input rounded-xl focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs theme-text-muted hover:theme-text-primary font-medium cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 theme-btn-primary"
        >
          <span>Upload File</span>
        </button>

        {/* About Project Button */}
        <button
          onClick={onOpenAbout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border theme-border theme-btn-secondary cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span className="hidden sm:inline">About</span>
        </button>

        {/* User Badge & Logout */}
        <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l theme-border">
          <div className="w-8 h-8 rounded-xl theme-bg-elevated border theme-border theme-text-primary flex items-center justify-center font-bold text-xs" title={user.email}>
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 theme-text-muted hover:text-[var(--danger-primary)] hover:bg-[var(--danger-bg)] rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
