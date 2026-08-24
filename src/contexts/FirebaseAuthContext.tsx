'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured, googleProvider } from '@/lib/firebase';

interface CricIQUser {
  uid: string;
  name: string;
  email: string;
  image?: string;
  isGuest: boolean;
  favoriteTeam: string;
  favoritePlayer: string;
}

interface AuthContextType {
  user: CricIQUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function restoreGuestSession(): CricIQUser | null {
  if (typeof window === 'undefined') return null;
  const guestData = localStorage.getItem('criciq-guest');
  if (guestData) {
    try { return JSON.parse(guestData); } catch { return null; }
  }
  return null;
}

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<CricIQUser | null>(restoreGuestSession);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        const cricIQUser: CricIQUser = {
          uid: fbUser.uid,
          name: fbUser.displayName || 'User',
          email: fbUser.email || '',
          image: fbUser.photoURL || undefined,
          isGuest: false,
          favoriteTeam: localStorage.getItem('criciq-fav-team') || 'India',
          favoritePlayer: localStorage.getItem('criciq-fav-player') || 'Virat Kohli',
        };
        setUser(cricIQUser);
        localStorage.setItem('criciq-auth', JSON.stringify(cricIQUser));
      } else {
        const guestData = localStorage.getItem('criciq-guest');
        if (guestData) {
          try {
            setUser(JSON.parse(guestData));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
          localStorage.removeItem('criciq-auth');
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth || !isFirebaseConfigured) {
      const mockGoogleUser: CricIQUser = {
        uid: `google-mock-${Date.now()}`,
        name: 'Google User',
        email: 'user.google@gmail.com',
        image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
        isGuest: false,
        favoriteTeam: localStorage.getItem('criciq-fav-team') || 'India',
        favoritePlayer: localStorage.getItem('criciq-fav-player') || 'Virat Kohli',
      };
      setUser(mockGoogleUser);
      localStorage.setItem('criciq-auth', JSON.stringify(mockGoogleUser));
      localStorage.removeItem('criciq-guest');
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const cricIQUser: CricIQUser = {
        uid: result.user.uid,
        name: result.user.displayName || 'User',
        email: result.user.email || '',
        image: result.user.photoURL || undefined,
        isGuest: false,
        favoriteTeam: localStorage.getItem('criciq-fav-team') || 'India',
        favoritePlayer: localStorage.getItem('criciq-fav-player') || 'Virat Kohli',
      };
      setUser(cricIQUser);
      localStorage.setItem('criciq-auth', JSON.stringify(cricIQUser));
      localStorage.removeItem('criciq-guest');
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === 'auth/popup-closed-by-user') return;
      if (err.code === 'auth/unauthorized-domain') {
        console.warn('Firebase: Unauthorized domain. Add this domain to Firebase Console > Auth > Authorized domains.');
      }
      
      // Fallback to mock Google user if sign-in fails
      const mockGoogleUser: CricIQUser = {
        uid: `google-mock-${Date.now()}`,
        name: 'Google User',
        email: 'user.google@gmail.com',
        image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
        isGuest: false,
        favoriteTeam: localStorage.getItem('criciq-fav-team') || 'India',
        favoritePlayer: localStorage.getItem('criciq-fav-player') || 'Virat Kohli',
      };
      setUser(mockGoogleUser);
      localStorage.setItem('criciq-auth', JSON.stringify(mockGoogleUser));
      localStorage.removeItem('criciq-guest');
    }
  }, []);

  const signInAsGuest = useCallback(() => {
    const guestUser: CricIQUser = {
      uid: `guest-${Date.now()}`,
      name: 'Guest User',
      email: 'guest@criciq.com',
      isGuest: true,
      favoriteTeam: 'India',
      favoritePlayer: 'Virat Kohli',
    };
    setUser(guestUser);
    localStorage.setItem('criciq-guest', JSON.stringify(guestUser));
    localStorage.setItem('criciq-auth', JSON.stringify(guestUser));
  }, []);

  const logout = useCallback(async () => {
    try {
      if (firebaseUser && auth) {
        await firebaseSignOut(auth);
      }
    } catch {
      // Ignore sign-out errors
    }
    setUser(null);
    localStorage.removeItem('criciq-auth');
    localStorage.removeItem('criciq-guest');
    sessionStorage.removeItem('criciq-intro-shown');
  }, [firebaseUser]);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signInWithGoogle, signInAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}

export type { CricIQUser };