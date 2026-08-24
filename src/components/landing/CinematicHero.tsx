'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Menu, X } from 'lucide-react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4';

const navLinks = [
  { label: 'Home', active: true },
  { label: 'AI Chat', active: false },
  { label: 'Analytics', active: false },
  { label: 'Players', active: false },
  { label: 'Matches', active: false },
  { label: 'Compare', active: false },
  { label: 'About', active: false },
  { label: 'Journal', active: false },
  { label: 'Reach Us', active: false },
];

export default function CinematicHero() {
  const { setView } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number>(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Seamless fade-in/fade-out video loop ──
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const FADE_MS = 500; // 0.5s fade duration

    const tick = () => {
      const { currentTime, duration } = video;
      if (duration > 0) {
        if (currentTime < FADE_MS / 1000) {
          // Fade in from 0 → 1 over first 0.5s
          video.style.opacity = String(currentTime / (FADE_MS / 1000));
        } else if (currentTime > duration - FADE_MS / 1000) {
          // Fade out from 1 → 0 over last 0.5s
          video.style.opacity = String((duration - currentTime) / (FADE_MS / 1000));
        } else {
          video.style.opacity = '1';
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // On ended: snap opacity to 0, tiny pause, reset and replay
    const handleEnded = () => {
      video.style.opacity = '0';
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => { /* autoplay may be blocked */ });
      }, 100);
    };

    video.addEventListener('ended', handleEnded);
    video.play().catch(() => { /* user interaction required first */ });

    return () => {
      cancelAnimationFrame(rafRef.current);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* ── Video Background Layer ── */}
      <video
        ref={videoRef}
        className="absolute z-0 object-cover pointer-events-none select-none"
        style={{
          top: '300px',
          inset: 'auto 0 0 0',
          width: '100%',
          height: 'calc(100% + 300px)',
          opacity: 0,
        }}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
      />

      {/* ── Gradient Overlays on Video ── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, #FFFFFF 0%, transparent 30%, transparent 55%, #FFFFFF 100%)',
        }}
      />

      {/* ── Navigation Bar (z-10) ── */}
      <nav className="relative z-10 w-full" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        <div
          className="flex items-center justify-between px-8 py-6"
          style={{ maxWidth: '80rem', margin: '0 auto' }}
        >
          {/* Logo */}
          <span
            className="text-3xl tracking-tight cursor-pointer"
            style={{
              fontFamily: 'var(--font-instrument-serif), Georgia, serif',
              color: '#000000',
            }}
          >
            CricIQ
            <sup style={{ fontSize: '0.55em', marginLeft: '1px' }}>®</sup>
          </span>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                className="text-sm transition-colors cursor-pointer"
                style={{
                  color: link.active ? '#000000' : '#6F6F6F',
                  fontWeight: link.active ? 500 : 400,
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = '#000000';
                }}
                onMouseLeave={(e) => {
                  if (!link.active) (e.target as HTMLElement).style.color = '#6F6F6F';
                }}
                onClick={() => {
                  // Navigate to the relevant app view for interactive links
                  const viewMap: Record<string, string> = {
                    'AI Chat': 'chat',
                    Analytics: 'analytics',
                    Players: 'players',
                    Matches: 'matches',
                    Compare: 'compare',
                  };
                  if (viewMap[link.label]) {
                    setView(viewMap[link.label] as 'chat' | 'analytics' | 'players' | 'matches' | 'compare');
                  }
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <button
              className="hidden sm:inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm text-white transition-transform hover:scale-[1.03] cursor-pointer"
              style={{ backgroundColor: '#000000' }}
              onClick={() => setView('dashboard')}
            >
              Begin Journey
            </button>

            <button
              className="lg:hidden p-1 cursor-pointer"
              style={{ color: '#000000' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="lg:hidden px-8 pb-6 space-y-1"
            style={{
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
            }}
          >
            {navLinks.map((link) => (
              <button
                key={link.label}
                className="block w-full text-left px-4 py-3 text-sm rounded-lg transition-colors cursor-pointer"
                style={{ color: link.active ? '#000000' : '#6F6F6F' }}
                onClick={() => {
                  const viewMap: Record<string, string> = {
                    'AI Chat': 'chat',
                    Analytics: 'analytics',
                    Players: 'players',
                    Matches: 'matches',
                    Compare: 'compare',
                  };
                  if (viewMap[link.label]) {
                    setView(viewMap[link.label] as 'chat' | 'analytics' | 'players' | 'matches' | 'compare');
                  }
                  setMobileOpen(false);
                }}
              >
                {link.label}
              </button>
            ))}
            <button
              className="block w-full text-center rounded-full px-6 py-2.5 text-sm text-white mt-3 cursor-pointer"
              style={{ backgroundColor: '#000000' }}
              onClick={() => {
                setView('dashboard');
                setMobileOpen(false);
              }}
            >
              Begin Journey
            </button>
          </div>
        )}
      </nav>

      {/* ── Hero Content (z-10) ── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center px-6"
        style={{
          paddingTop: 'calc(8rem - 75px)',
          paddingBottom: '10rem',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
        }}
      >
        {/* Headline */}
        <h1
          className="animate-fade-rise font-normal max-w-7xl"
          style={{
            fontFamily: 'var(--font-instrument-serif), Georgia, serif',
            fontSize: 'clamp(3rem, 8vw, 8rem)',
            lineHeight: 0.95,
            letterSpacing: '-2.46px',
            color: '#000000',
          }}
        >
          <span>Beyond boundaries,</span>{' '}
          <em style={{ color: '#6F6F6F', fontStyle: 'italic' }}>we decode</em>
          <br />
          <em style={{ color: '#6F6F6F', fontStyle: 'italic' }}>the eternal.</em>
        </h1>

        {/* Description */}
        <p
          className="animate-fade-rise-delay max-w-2xl mt-8 leading-relaxed"
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#6F6F6F',
          }}
        >
          Building the definitive cricket intelligence platform for brilliant minds,
          fearless analysts, and devoted fans. Through the noise of data, we craft
          AI-powered havens for deep insight and pure understanding.
        </p>

        {/* Hero CTA */}
        <button
          className="animate-fade-rise-delay-2 inline-flex items-center justify-center rounded-full px-14 py-5 text-base text-white mt-12 transition-transform hover:scale-[1.03] cursor-pointer"
          style={{ backgroundColor: '#000000' }}
          onClick={() => setView('dashboard')}
        >
          Begin Journey
        </button>
      </div>
    </div>
  );
}