import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Loader2 
} from 'lucide-react';
import { CloudShareAPI } from '../services/api';
import { AuthResponse } from '../types';
import { AuthLayout } from '../components/AuthLayout';

interface LoginPageProps {
  onSuccess: (auth: AuthResponse) => void;
  onNavigateToRegister: () => void;
  onNavigateToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateToRegister,
  onNavigateToHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await CloudShareAPI.login(trimmedEmail, password);
      onSuccess(res);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout onNavigateToHome={onNavigateToHome} pageType="login">
      <div className="w-full">
        {/* Card Box */}
        <div className="theme-bg-surface rounded-3xl p-6 sm:p-8 border theme-border shadow-xl backdrop-blur-sm space-y-6 transition-colors duration-200">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl theme-badge border text-[var(--accent-primary)] mb-1 shadow-2xs">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight theme-text-primary">
              Welcome Back
            </h2>
            <p className="text-xs theme-text-secondary">
              Sign in to manage and download your private Amazon S3 files.
            </p>
          </div>

          {/* Error Feedback */}
          {errorMessage && (
            <div 
              role="alert"
              className="p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in transition-colors duration-200"
              style={{
                backgroundColor: 'var(--danger-bg)',
                borderColor: 'var(--danger-border)',
                borderWidth: '1px',
                color: 'var(--danger-text)',
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--danger-primary)' }} />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="login-email" 
                className="block text-xs font-semibold theme-text-primary"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-11 pl-10 pr-4 text-xs theme-input rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="login-password" 
                  className="block text-xs font-semibold theme-text-primary"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-11 pl-10 pr-10 text-xs theme-input rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:theme-text-primary focus:outline-none transition-colors cursor-pointer p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-xs font-semibold rounded-xl shadow-md theme-btn-primary transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none group mt-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register link */}
          <div className="pt-2 text-center text-xs theme-text-secondary border-t theme-border">
            <span>Don&apos;t have an account? </span>
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] rounded"
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
