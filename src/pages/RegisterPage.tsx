import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { CloudShareAPI } from '../services/api';
import { AuthResponse } from '../types';
import { AuthLayout } from '../components/AuthLayout';

interface RegisterPageProps {
  onSuccess: (auth: AuthResponse) => void;
  onNavigateToLogin: () => void;
  onNavigateToHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onNavigateToLogin,
  onNavigateToHome,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPasswordValid = password.length >= 6;
  const isConfirmMatching = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await CloudShareAPI.register(trimmedName, trimmedEmail, password, confirmPassword);
      onSuccess(res);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout onNavigateToHome={onNavigateToHome} pageType="register">
      <div className="w-full">
        {/* Card Box */}
        <div className="theme-bg-surface rounded-3xl p-6 sm:p-8 border theme-border shadow-xl backdrop-blur-sm space-y-6 transition-colors duration-200">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl theme-badge border text-[var(--accent-primary)] mb-1 shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight theme-text-primary">
              Create an Account
            </h2>
            <p className="text-xs theme-text-secondary">
              Register to securely store, download, and manage files on Amazon S3.
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
            {/* Full Name */}
            <div className="space-y-1.5">
              <label 
                htmlFor="register-fullname" 
                className="block text-xs font-semibold theme-text-primary"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted pointer-events-none" />
                <input
                  id="register-fullname"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="e.g. Romana Jagirdar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-11 pl-10 pr-4 text-xs theme-input rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label 
                htmlFor="register-email" 
                className="block text-xs font-semibold theme-text-primary"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted pointer-events-none" />
                <input
                  id="register-email"
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

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="register-password" 
                  className="block text-xs font-semibold theme-text-primary"
                >
                  Password
                </label>
                {password.length > 0 && (
                  <span className={`text-[10px] font-medium flex items-center gap-1 ${
                    isPasswordValid ? 'text-[var(--accent-primary)]' : 'theme-text-muted'
                  }`}>
                    {isPasswordValid && <Check className="w-3 h-3" />}
                    Min 6 characters
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted pointer-events-none" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="At least 6 characters"
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="register-confirm-password" 
                  className="block text-xs font-semibold theme-text-primary"
                >
                  Confirm Password
                </label>
                {confirmPassword.length > 0 && (
                  <span className={`text-[10px] font-medium flex items-center gap-1 ${
                    isConfirmMatching ? 'text-[var(--accent-primary)]' : 'text-[var(--danger-primary)]'
                  }`}>
                    {isConfirmMatching ? (
                      <>
                        <Check className="w-3 h-3" />
                        Passwords match
                      </>
                    ) : (
                      'Does not match'
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted pointer-events-none" />
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full h-11 pl-10 pr-10 text-xs theme-input rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:theme-text-primary focus:outline-none transition-colors cursor-pointer p-1"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-xs font-semibold rounded-xl shadow-md theme-btn-primary transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none group mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login link */}
          <div className="pt-2 text-center text-xs theme-text-secondary border-t theme-border">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-semibold text-[var(--accent-primary)] hover:underline cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] rounded"
            >
              Sign in to your account
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
