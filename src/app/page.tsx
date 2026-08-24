'use client';

import { useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { FirebaseAuthProvider, useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import IntroAnimation from '@/components/intro/IntroAnimation';
import LandingPage from '@/components/landing/LandingPage';
import LoginPage from '@/components/auth/LoginPage';
import AppShell from '@/components/app/AppShell';
import DashboardPage from '@/components/dashboard/DashboardPage';
import ChatPage from '@/components/chat/ChatPage';
import AnalyticsPage from '@/components/analytics/AnalyticsPage';
import PlayerExplorerPage from '@/components/players/PlayerExplorerPage';
import MatchExplorerPage from '@/components/matches/MatchExplorerPage';
import ComparePage from '@/components/compare/ComparePage';
import SettingsPage from '@/components/settings/SettingsPage';

const APP_VIEWS = ['dashboard', 'chat', 'analytics', 'players', 'matches', 'compare', 'settings'] as const;

function AppContent() {
  const { view } = useAppStore();

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    chat: <ChatPage />,
    analytics: <AnalyticsPage />,
    players: <PlayerExplorerPage />,
    matches: <MatchExplorerPage />,
    compare: <ComparePage />,
    settings: <SettingsPage />,
  };

  return (
    <AppShell>
      {pages[view] || <DashboardPage />}
    </AppShell>
  );
}

function AppRouter() {
  const { view, setView, setUser, setIsAuthenticated } = useAppStore();
  const { user, loading: authLoading } = useFirebaseAuth();

  const isAuthenticated = !!user;

  // Sync Firebase auth state to Zustand store
  useEffect(() => {
    if (user) {
      setUser({
        name: user.name,
        email: user.email,
        image: user.image,
        favoriteTeam: user.favoriteTeam,
        favoritePlayer: user.favoritePlayer,
      });
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [user, setUser, setIsAuthenticated]);

  // Restore intro state on mount
  useEffect(() => {
    const introShown = sessionStorage.getItem('criciq-intro-shown');
    if (introShown) {
      setView('landing');
    }
  }, [setView]);

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem('criciq-intro-shown', 'true');
    setView('landing');
  }, [setView]);

  const handleEnterApp = useCallback(() => {
    if (isAuthenticated) {
      setView('dashboard');
    } else {
      setView('login');
    }
  }, [isAuthenticated, setView]);

  // Guard: redirect to login if trying to access app without auth
  const effectiveView = (() => {
    if (APP_VIEWS.includes(view as typeof APP_VIEWS[number]) && !isAuthenticated) {
      return 'login';
    }
    return view;
  })();

  // Don't render app views while auth is still loading
  if (authLoading && !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {effectiveView === 'intro' && (
          <IntroAnimation key="intro" onComplete={handleIntroComplete} />
        )}
        {effectiveView === 'landing' && (
          <LandingPage key="landing" onEnterApp={handleEnterApp} />
        )}
        {effectiveView === 'login' && (
          <LoginPage key="login" />
        )}
        {APP_VIEWS.includes(effectiveView as typeof APP_VIEWS[number]) && (
          <AppContent key="app" />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <FirebaseAuthProvider>
      <AppRouter />
    </FirebaseAuthProvider>
  );
}