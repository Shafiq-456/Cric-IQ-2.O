'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { User, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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

/* Main Login Page */
export default function LoginPage() {
  const { setView } = useAppStore();
  const { signInWithGoogle, signInAsGuest } = useFirebaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMockPopup, setShowMockPopup] = useState(false);
  const [isLoadingMock, setIsLoadingMock] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    setError('');
    if (!isFirebaseConfigured) {
      setShowMockPopup(true);
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Signed In",
        description: "Logged in successfully with Google.",
      });
      setView('dashboard');
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      if (e.code !== 'auth/popup-closed-by-user') {
        setError(e.message || 'Google sign-in failed. Try guest mode.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [signInWithGoogle, setView]);

  const handleSelectMockAccount = useCallback(async () => {
    setIsLoadingMock(true);
    // Simulate real OAuth network round-trip of 1.2 seconds
    setTimeout(async () => {
      try {
        await signInWithGoogle();
        toast({
          title: "Demo Mode Enabled",
          description: "Firebase is not configured. Logged in with a mock Google profile for testing.",
        });
        setShowMockPopup(false);
        setView('dashboard');
      } catch (err) {
        setError('Google sign-in failed.');
      } finally {
        setIsLoadingMock(false);
      }
    }, 1200);
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

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 mb-5 p-3 rounded-xl bg-destructive/8 border border-destructive/15"
                  >
                    <AlertCircle size={14} className="text-destructive/70 mt-0.5 shrink-0" />
                    <p className="text-[11px] text-destructive/80 leading-relaxed">{error}</p>
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
                      <motion.div className="w-4 h-4 border-2 border-oklch(0.10 0.02 50 / 20%) border-t-oklch(0.10 0.02 50) rounded-full"
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

      {/* Mock Google Account Picker Popup */}
      <AnimatePresence>
        {showMockPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[400px] bg-[#ffffff] text-[#202124] rounded-lg shadow-2xl p-8 border border-neutral-200 relative overflow-hidden"
              style={{ fontFamily: 'Roboto, Arial, sans-serif' }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowMockPopup(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Google Branding */}
              <div className="text-center mb-6">
                <svg className="w-8 h-8 mx-auto mb-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <h2 className="text-xl font-medium tracking-tight text-[#202124]">Choose an account</h2>
                <p className="text-sm text-[#5f6368] mt-1.5">to continue to <span className="font-medium text-[#1a73e8]">CricIQ</span></p>
              </div>

              {isLoadingMock ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-8 h-8 border-2 border-neutral-300 border-t-blue-600 rounded-full animate-spin mb-4" />
                  <p className="text-xs text-[#5f6368] animate-pulse">Signing in with Google...</p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {/* Account Row */}
                  <button
                    onClick={handleSelectMockAccount}
                    className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-100 cursor-pointer text-left group"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm shadow-sm group-hover:scale-105 transition-transform">
                      S
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#3c4043] truncate">Shafiq</p>
                      <p className="text-xs text-[#5f6368] truncate">shafiq.criciq@gmail.com</p>
                    </div>
                  </button>

                  <div className="h-px bg-neutral-200 my-2" />

                  {/* Add Account Row */}
                  <button
                    onClick={handleSelectMockAccount}
                    className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer text-left"
                  >
                    <div className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1a73e8]">Use another account</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Bottom Notice */}
              <div className="text-[11px] text-[#5f6368] mt-8 leading-relaxed">
                To continue, Google will share your name, email address, language preference, and profile picture with CricIQ. Before using this app, you can review its <span className="text-[#1a73e8] hover:underline cursor-pointer">privacy policy</span> and <span className="text-[#1a73e8] hover:underline cursor-pointer">terms of service</span>.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}