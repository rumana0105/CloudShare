import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { UploadModal } from './components/UploadModal';
import { AboutModal } from './components/AboutModal';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CloudFile, DashboardStats, User, AuthResponse } from './types';
import { CloudShareAPI, authSession } from './services/api';

type AppView = 'landing' | 'login' | 'register' | 'dashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authSession.getUser());
  const [currentView, setCurrentView] = useState<AppView>(() => {
    return authSession.isAuthenticated() ? 'dashboard' : 'landing';
  });

  // App Data State (Real user files & stats only)
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalFiles: 0,
    storageUsedBytes: 0,
    storageLimitBytes: 5 * 1024 * 1024 * 1024,
  });

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = useCallback(async () => {
    if (!authSession.isAuthenticated()) return;

    setIsLoading(true);
    setLoadError(null);
    try {
      const [s3Files, s3Stats] = await Promise.all([
        CloudShareAPI.getFiles(),
        CloudShareAPI.getDashboardStats(),
      ]);

      setFiles(s3Files);
      setStats(s3Stats);
      setLoadError(null);
    } catch (err: unknown) {
      console.error('Failed to load user files from storage:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to connect to backend';
      
      if (errMsg.toLowerCase().includes('session expired') || errMsg.toLowerCase().includes('unauthenticated')) {
        authSession.clearSession();
        setCurrentUser(null);
        setCurrentView('login');
        showToast('Your session has expired. Please sign in again.');
        return;
      }

      setLoadError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync session on mount
  useEffect(() => {
    if (authSession.isAuthenticated()) {
      CloudShareAPI.getMe()
        .then((user) => {
          setCurrentUser(user);
          loadData();
        })
        .catch(() => {
          authSession.clearSession();
          setCurrentUser(null);
          setCurrentView('login');
        });
    }
  }, [loadData]);

  // Auth Handlers
  const handleAuthSuccess = (auth: AuthResponse) => {
    setCurrentUser(auth.user);
    setCurrentView('dashboard');
    showToast(`Welcome back, ${auth.user.full_name}!`);
    loadData();
  };

  const handleLogout = () => {
    CloudShareAPI.logout();
    setCurrentUser(null);
    setFiles([]);
    setStats({
      totalFiles: 0,
      storageUsedBytes: 0,
      storageLimitBytes: 5 * 1024 * 1024 * 1024,
    });
    setCurrentView('login');
    showToast('Signed out of your CloudShare account.');
  };

  // File Handlers
  const handleUploadSuccess = (uploaded: CloudFile) => {
    showToast(`File "${uploaded.name}" uploaded to Amazon S3 successfully.`);
    loadData();
  };

  const handleDownloadFile = async (file: CloudFile) => {
    try {
      showToast(`Generating secure SigV4 Presigned URL for "${file.name}"...`);
      const { url } = await CloudShareAPI.downloadFile(file);

      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Download failed');
    }
  };

  const handleDeleteFile = async (file: CloudFile) => {
    try {
      await CloudShareAPI.deleteFile(file.id);
      showToast(`Deleted "${file.name}" permanently from Amazon S3.`);
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  // View: Landing Page
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onSignIn={() => setCurrentView('login')}
          onRegister={() => setCurrentView('register')}
          onExploreArchitecture={() => setIsAboutOpen(true)}
        />
        <AboutModal
          isOpen={isAboutOpen}
          onClose={() => setIsAboutOpen(false)}
        />
      </>
    );
  }

  // View: Login Page
  if (currentView === 'login') {
    return (
      <LoginPage
        onSuccess={handleAuthSuccess}
        onNavigateToRegister={() => setCurrentView('register')}
        onNavigateToHome={() => setCurrentView('landing')}
      />
    );
  }

  // View: Register Page
  if (currentView === 'register') {
    return (
      <RegisterPage
        onSuccess={handleAuthSuccess}
        onNavigateToLogin={() => setCurrentView('login')}
        onNavigateToHome={() => setCurrentView('landing')}
      />
    );
  }

  // View: Dashboard (Authenticated)
  return (
    <div className="min-h-screen theme-bg-page theme-text-primary flex flex-col transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl theme-bg-elevated theme-text-primary text-xs font-medium shadow-xl border theme-border animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={currentUser || { id: '', full_name: 'Guest', email: '' }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <DashboardPage
          user={currentUser || { id: '', full_name: 'User', email: '' }}
          stats={stats}
          files={files}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isLoading}
          error={loadError}
          onRetry={loadData}
          onLogout={handleLogout}
          onOpenUpload={() => setIsUploadOpen(true)}
          onDownloadFile={handleDownloadFile}
          onDeleteFile={handleDeleteFile}
          onOpenAbout={() => setIsAboutOpen(true)}
        />
      </main>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Footer */}
      <footer className="py-4 text-center text-xs theme-text-muted border-t theme-border theme-bg-surface/50 transition-colors duration-200">
        CloudShare — AWS S3 File Storage System · Developed by Romana Jagirdar, Gauri Kangle and Om Mahadik
      </footer>
    </div>
  );
}
