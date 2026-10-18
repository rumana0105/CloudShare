import React from 'react';
import { 
  Cloud, 
  Search, 
  Info,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { User } from '../types';

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 md:px-8 backdrop-blur-md">
      {/* Brand & Developers Info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-slate-900 tracking-tight">CloudShare</span>
              <span className="px-1.5 py-0.2 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded">
                AWS S3
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-500 font-medium">
              MCA DSCC · Romana Jagirdar, Gauri Kangle &amp; Om Mahadik
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex-1 max-w-md mx-4 hidden sm:block">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search files by name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-9.5 pr-4 text-xs bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 text-slate-800 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <span>Upload File</span>
        </button>

        {/* About Project Button */}
        <button
          onClick={onOpenAbout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">About</span>
        </button>

        {/* User Badge & Logout */}
        <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs" title={user.email}>
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
