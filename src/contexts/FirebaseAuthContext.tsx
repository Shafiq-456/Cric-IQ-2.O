'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured, googleProvider } from '@/lib/firebase';

export interface CricIQUser {
  uid: string;
  name: string;
  email: string;
  image?: string;
  isGuest: boolean;
  favoriteTeam: string;
  favoritePlayer: string;
  idToken?: string; // Firebase ID token — used for authenticated API calls
}

interface AuthContextType {
  user: CricIQUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isFirebaseReady: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => void;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>; // Fresh token for API calls
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

/**
 * Calls /api/user/sync to create-or-update the User record in the database.
 * Silently ignores failures — auth still works even if DB sync fails.
 */
async function syncUserWithDatabase(firebaseUser: FirebaseUser): Promise<void> {
  try {
    const idToken = await firebaseUser.getIdToken();
    const res = await fetch('/api/user/sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      console.warn('[CricIQ] User sync failed:', res.status, await res.text());
    }
  } catch (err) {
    // Don't block auth flow if sync fails (e.g. offline)
    console.warn('[CricIQ] User sync network error:', err);
  }
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

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        // Sync user record to DB on every auth state resolution
        // (handles returning users who were already signed in)
        syncUserWithDatabase(fbUser);

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
        localStorage.removeItem('criciq-guest');
      } else {
        const guestData = localStorage.getItem('criciq-guest');
        if (guestData) {
          try { setUser(JSON.parse(guestData)); }
          catch { setUser(null); }
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
      throw new Error(
        'Firebase is not configured. Add your NEXT_PUBLIC_FIREBASE_* keys to .env and restart the dev server.'
      );
    }

    const result = await signInWithPopup(auth, googleProvider);

    // Explicitly sync after sign-in popup completes
    // (onAuthStateChanged will also fire, but this ensures it happens before UI navigates)
    await syncUserWithDatabase(result.user);

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
    setFirebaseUser(null);
    localStorage.removeItem('criciq-auth');
    localStorage.removeItem('criciq-guest');
    sessionStorage.removeItem('criciq-intro-shown');
  }, [firebaseUser]);

  /**
   * Returns a fresh Firebase ID token for making authenticated API requests.
   * Firebase automatically refreshes the token if it's near expiry.
   */
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!firebaseUser) return null;
    try {
      return await firebaseUser.getIdToken();
    } catch {
      return null;
    }
  }, [firebaseUser]);

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      isFirebaseReady: isFirebaseConfigured,
      signInWithGoogle,
      signInAsGuest,
      logout,
      getIdToken,
    }}>
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