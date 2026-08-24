'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { User, ArrowLeft, AlertCircle, ExternalLink } from 'lucide-react';
import { isFirebaseConfigured } from '@/lib/firebase';

/* Ball in Circle Frame for Login */
function LoginBallCircle() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: -10, y: 15 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      setTilt({ x: -10 - dy * 12, y: 15 + dx * 12 });
    };
    const onLeave = () => setTilt({ x: -10, y: 15 });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseleave', onLeave); };
  }, []);

  return (
    <div ref={ref} className="perspective-dramatic">
      <motion.div
        className="w-28 h-28 md:w-36 md:h-36 relative"
        animate={{ rotateX: tilt.x, rotateY: tilt.y, rotateZ: [0, 360] }}
        transition={{ rotateZ: { duration: 35, ease: 'linear', repeat: Infinity }, rotateX: { duration: 0.5, ease: 'easeOut' }, rotateY: { duration: 0.5, ease: 'easeOut' } }}
      >
        <div className="ball-login-glow" />
        <div className="ball-login-frame" />
        <div className="ball-login-fill">
          <img src="/cricket-ball.png" alt="" className="w-full h-full object-cover" draggable={false} />
        </div>
        <div className="ball-login-highlight" />
      </motion.div>
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-3 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)', filter: 'blur(8px)' }} />
    </div>
  );
}

/* Friendly error message mapper for Firebase auth error codes */
function getFirebaseErrorMessage(code: string | undefined, fallback: string): string {
  switch (code) {
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for localhost and try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Console. Go to Firebase → Authentication → Settings → Authorized domains and add "localhost".';
    case 'auth/invalid-api-key':
      return 'Invalid Firebase API key. Check your NEXT_PUBLIC_FIREBASE_API_KEY in .env.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Go to Firebase Console → Authentication → Sign-in method and enable Google.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection and try again.';
    case 'auth/internal-error':
      return 'Firebase internal error. Check your Firebase project configuration.';
    default:
      return fallback || 'Google sign-in failed. See the browser console for details.';
  }
}

/* Main Login Page */
export default function LoginPage() {
  const { setView } = useAppStore();
  const { signInWithGoogle, signInAsGuest } = useFirebaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');

  const handleGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setErrorCode('');
    try {
      await signInWithGoogle();
      // signInWithGoogle either succeeds (auth state listener handles the rest)
      // or throws — never silently falls back to a mock user
      setView('dashboard');
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      // User closed the popup — not an error worth showing
      if (e.code === 'auth/popup-closed-by-user') {
        setIsLoading(false);
        return;
      }
      console.error('[CricIQ] Google sign-in error:', e);
      setErrorCode(e.code || '');
      setError(getFirebaseErrorMessage(e.code, e.message || ''));
    } finally {
      setIsLoading(false);
    }
  }, [signInWithGoogle, setView]);

  const handleGuestLogin = useCallback(() => {
    signInAsGuest();
    setView('dashboard');
  }, [signInAsGuest, setView]);

  const handleBack = useCallback(() => { setView('landing'); }, [setView]);

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ background: 'oklch(0.05 0.01 265)' }}>
      <div className="absolute inset-0 floodlight-cones opacity-40" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: 'oklch(0.65 0.20 155 / 5%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'oklch(0.80 0.15 85 / 4%)' }} />

      <div className="relative z-10 min-h-screen flex flex-col">
        <motion.nav className="flex items-center justify-between px-5 md:px-10 py-4"
          initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <button className="flex items-center gap-2 group cursor-pointer" onClick={handleBack}>
            <div className="w-7 h-7 rounded-full overflow-hidden" style={{ boxShadow: '0 0 10px rgba(212,69,53,0.2)' }}>
              <img src="/cricket-ball.png" alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold tracking-tight font-display">
              <span className="gradient-text">Cric</span><span className="text-foreground">IQ</span>
            </span>
          </button>
          <button onClick={handleBack} className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5">
            <ArrowLeft size={12} /> Back to Home
          </button>
        </motion.nav>

        <div className="flex-1 flex items-center justify-center px-5">
          <motion.div className="w-full max-w-sm"
            initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <div className="glass-strong rounded-2xl p-7 md:p-9 relative overflow-hidden">
              <div className="absolute inset-0 rounded-2xl gradient-border pointer-events-none" />
              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  <LoginBallCircle />
                </div>

                <div className="text-center mb-7">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 font-display">
                    <span className="gradient-text-hero">Welcome to CricIQ</span>
                  </h1>
                  <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-xs mx-auto">
                    Sign in with Google for full access, or continue as guest to explore.
                  </p>
                </div>

                {/* Firebase not configured notice */}
                {!isFirebaseConfigured && (
                  <div className="flex items-start gap-2 mb-5 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                    <AlertCircle size={14} className="text-amber-400/80 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-amber-300/80 leading-relaxed">
                      Firebase not configured. Add your <code className="font-mono text-[10px] bg-white/5 px-1 rounded">NEXT_PUBLIC_FIREBASE_*</code> keys to <code className="font-mono text-[10px] bg-white/5 px-1 rounded">.env</code> and restart the dev server to enable Google sign-in.
                    </p>
                  </div>
                )}

                {/* Real Firebase error with error code */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-1.5 mb-5 p-3 rounded-xl bg-destructive/8 border border-destructive/15"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle size={14} className="text-destructive/70 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-destructive/80 leading-relaxed">{error}</p>
                    </div>
                    {errorCode === 'auth/unauthorized-domain' && (
                      <a
                        href="https://console.firebase.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-blue-400/70 hover:text-blue-400 transition-colors ml-5"
                      >
                        Open Firebase Console <ExternalLink size={10} />
                      </a>
                    )}
                    {errorCode && (
                      <p className="text-[10px] text-muted-foreground/40 ml-5 font-mono">{errorCode}</p>
                    )}
                  </motion.div>
                )}

                <motion.button onClick={handleGoogleSignIn} disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                  style={{ background: 'oklch(0.98 0.002 85)', color: 'oklch(0.10 0.02 50)' }}
                  whileHover={{ scale: 1.015, boxShadow: '0 0 24px oklch(0.65 0.20 155 / 12%)' }} whileTap={{ scale: 0.985 }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: 'linear-gradient(135deg, oklch(0.65 0.20 155 / 6%), oklch(0.80 0.15 85 / 6%))' }} />
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <motion.div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full"
                        animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-4 h-4 relative z-10" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="relative z-10">Continue with Google</span>
                    </>
                  )}
                </motion.button>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-border/40" />
                  <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-border/40" />
                </div>

                <motion.button onClick={handleGuestLogin}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer glass border-border/25 hover:border-[oklch(0.65_0.20_155/25%)] hover:bg-[oklch(0.65_0.20_155/4%)]"
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <User size={14} className="text-muted-foreground/60" />
                  <span className="text-muted-foreground/70">Continue as Guest</span>
                </motion.button>

                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {[{ icon: '🧠', label: 'RAG AI' }, { icon: '📊', label: 'Live Analytics' }, { icon: '🏏', label: '50+ Countries' }, { icon: '⚡', label: '12ms Response' }].map((f) => (
                    <span key={f.label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-[9px] text-muted-foreground/40">
                      <span>{f.icon}</span>{f.label}
                    </span>
                  ))}
                </div>

                <p className="text-[9px] text-muted-foreground/35 text-center mt-5 leading-relaxed">
                  By continuing, you agree to CricIQ&apos;s{' '}
                  <span className="text-muted-foreground/60 underline cursor-pointer">Terms</span>{' '}and{' '}
                  <span className="text-muted-foreground/60 underline cursor-pointer">Privacy Policy</span>.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p className="text-center py-4 text-[9px] text-muted-foreground/30 tracking-wider uppercase"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          The Future of Cricket Intelligence
        </motion.p>
      </div>
    </div>
  );
}