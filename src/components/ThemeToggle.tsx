import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border theme-border theme-bg-surface hover:theme-bg-elevated transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] shadow-2xs ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-[var(--accent-primary)] transition-transform duration-300 rotate-0 hover:-rotate-12" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold theme-text-secondary select-none">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};
