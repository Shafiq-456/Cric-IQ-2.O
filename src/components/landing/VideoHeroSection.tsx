'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import {
  Search, Sparkles, ArrowRight, Play, Menu, X,
  Brain, Shield, Globe, BarChart3,
} from 'lucide-react';

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Players', href: '#players-section' },
  { label: 'Matches', href: '#matches-section' },
  { label: 'Blog', href: '#blog' },
];

/* ═══ Ball in Perfect Circle Frame ═══ */
function CricketBallCircle({ size = 220 }: { size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const springCfg = { stiffness: 80, damping: 20, mass: 0.4 };
  const rotateX = useSpring(-12, springCfg);
  const rotateY = useSpring(20, springCfg);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      rotateX.set(-12 - dy * 15);
      rotateY.set(20 + dx * 15);
    };
    const onLeave = () => { rotateX.set(-12); rotateY.set(20); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseleave', onLeave); };
  }, [rotateX, rotateY]);

  return (
    <div ref={ref} className="perspective-dramatic relative" style={{ width: size, height: size }}>
      <motion.div
        className="preserve-3d relative w-full h-full"
        style={{ rotateX, rotateY }}
        animate={{ rotateZ: [0, 360] }}
        transition={{ rotateZ: { duration: 40, ease: 'linear', repeat: Infinity } }}
      >
        <div className="ball-glow-ring" />
        <div className="ball-circle-frame" />
        <div className="ball-circle-fill">
          <img src="/cricket-ball.png" alt="" className="w-full h-full object-cover" draggable={false} />
        </div>
        <div className="ball-circle-highlight" />
      </motion.div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-4 rounded-full"
        style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)', filter: 'blur(10px)' }} />
    </div>
  );
}

/* ═══ Compact Search Bar ═══ */
function AnimatedSearchBar() {
  const { setView, setSearchQuery } = useAppStore();
  const prompts = [
    'Who has the best Test average in 2026?',
    'Compare Bumrah vs Cummins in WTC',
    'India vs Australia head-to-head since 2020',
    'Best bowling figures in Champions Trophy',
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx((i) => (i + 1) % prompts.length), 3000);
    return () => clearInterval(iv);
  }, [prompts.length]);

  return (
    <div className="w-full max-w-xl">
      <div className="relative rounded-xl p-[1px] overflow-hidden"
        style={{ background: 'linear-gradient(135deg, oklch(0.65 0.20 155 / 25%), oklch(0.80 0.15 85 / 15%), oklch(0.65 0.20 155 / 8%))' }}>
        <div className="rounded-xl flex items-center gap-3 px-4 py-3"
          style={{ background: 'oklch(0.10 0.015 265 / 95%)', backdropFilter: 'blur(20px)' }}>
          <Search size={16} className="text-white/25 shrink-0" />
          <span className="text-white/25 text-sm flex-1 text-left truncate">
            <motion.span key={idx} initial={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="inline-block">
              {prompts[idx]}
            </motion.span>
          </span>
          <Button size="sm" className="bg-[oklch(0.65_0.20_155/70%)] hover:bg-[oklch(0.65_0.20_155)] text-white shrink-0 cursor-pointer text-xs"
            style={{ boxShadow: '0 0 12px oklch(0.65 0.20 155 / 10%)' }}
            onClick={() => setView('chat')}>
            <Sparkles size={12} className="mr-1" />Ask AI
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ═══ Navbar ═══ */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <motion.nav className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <div className="mx-4 sm:mx-6 mt-3 rounded-xl px-4 py-2.5 flex justify-between items-center glass-strong border border-white/[0.06]">
          <a href="#hero" className="flex items-center gap-2 select-none group">
            <div className="w-7 h-7 rounded-full shrink-0 overflow-hidden"
              style={{ boxShadow: '0 0 10px rgba(212,69,53,0.25)' }}>
              <img src="/cricket-ball.png" alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl tracking-tight font-normal text-white group-hover:text-[oklch(0.65_0.20_155)] transition-colors duration-300 font-display">
              CricIQ
            </span>
          </a>
          <div className="hidden md:flex items-center gap-5">
            {navItems.map((item) => (
              <a key={item.label} href={item.href}
                className="text-[12px] text-white/40 hover:text-white/90 transition-colors duration-200">
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <Button className="rounded-lg px-4 py-1.5 text-xs font-medium cursor-pointer bg-[oklch(0.65_0.20_155)] text-white hover:bg-[oklch(0.58_0.22_155)] transition-all duration-200"
              style={{ boxShadow: '0 0 14px oklch(0.65 0.20 155 / 12%)' }}
              onClick={() => { const s = useAppStore.getState(); if (s.isAuthenticated) { setView('dashboard'); } else { setView('login'); } }}>
              Get Started <ArrowRight size={12} className="ml-1" />
            </Button>
            <button className="md:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={18} className="text-white" /> : <Menu size={18} className="text-white" />}
            </button>
          </div>
        </div>
      </motion.nav>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-40 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setMobileOpen(false)} />
            <motion.div className="absolute right-0 top-0 bottom-0 w-64 p-5 pt-16 border-l border-white/5"
              style={{ background: 'oklch(0.07 0.015 265 / 98%)' }}
              initial={{ x: 256 }} animate={{ x: 0 }} exit={{ x: 256 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              {navItems.map((item) => (
                <a key={item.label} href={item.href}
                  className="block py-2.5 text-sm border-b border-white/5 text-white/40 hover:text-white transition-colors"
                  onClick={() => setMobileOpen(false)}>{item.label}</a>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══ Stats Row ═══ */
function StatsRow() {
  const stats = [
    { value: '2.4M+', label: 'Data Points' },
    { value: '15K+', label: 'Matches' },
    { value: '3.2K+', label: 'Players' },
    { value: '98.7%', label: 'AI Accuracy' },
    { value: '50+', label: 'Countries' },
  ];
  return (
    <div className="grid grid-cols-5 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <p className="text-lg sm:text-xl font-bold text-foreground/90 font-body-hero">{s.value}</p>
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ═══ HERO SECTION ═══ */
export default function VideoHeroSection({ onEnterApp }: { onEnterApp?: () => void }) {
  const { setView } = useAppStore();
  const handleEnter = onEnterApp || (() => setView('dashboard'));

  return (
    <section id="hero" className="relative w-full overflow-hidden bg-background">
      <div className="absolute inset-0 stadium-grid opacity-30" />
      <div className="absolute top-[-30%] right-[-15%] w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none"
        style={{ background: 'oklch(0.65 0.20 155 / 5%)' }} />
      <div className="absolute bottom-[-30%] left-[-15%] w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none"
        style={{ background: 'oklch(0.80 0.15 85 / 3%)' }} />

      <Navbar />

      <div className="relative z-10 pt-20 pb-6">
        <div className="w-full max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
              <motion.span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[oklch(0.65_0.20_155/12%)] bg-[oklch(0.65_0.20_155/4%)] text-[11px] text-[oklch(0.65_0.20_155)] mb-4"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}>
                <Sparkles size={10} className="text-[oklch(0.80_0.15_85)]" />
                Powered by RAG and Advanced AI
              </motion.span>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.1] tracking-tight font-display mb-4">
                <span className="gradient-text-hero">Beyond the pitch,</span><br />
                <span className="text-white/90">we </span>
                <em className="text-[oklch(0.65_0.20_155)]" style={{ fontStyle: 'italic' }}>decode</em>
                <span className="text-white/90"> the </span>
                <em className="text-[oklch(0.80_0.15_85)]" style={{ fontStyle: 'italic' }}>eternal.</em>
              </h1>

              <p className="text-sm sm:text-base max-w-md leading-relaxed text-white/35 mb-6">
                The definitive cricket intelligence platform for analysts, players, and fans. Millions of data points,{' '}
                <span className="text-white/55">surface clarity</span>.
              </p>

              <div className="flex items-center gap-2.5 mb-6">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button className="rounded-lg px-7 py-2.5 text-sm font-medium bg-white text-[oklch(0.08_0.015_265)] hover:bg-white/90 cursor-pointer depth-2 transition-colors"
                    onClick={handleEnter}>
                    Begin Journey <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="ghost" className="rounded-lg px-4 py-2.5 text-sm text-white/50 hover:text-white/80 hover:bg-white/5 cursor-pointer"
                    onClick={() => { const s = useAppStore.getState(); if (s.isAuthenticated) { s.setView('chat'); } else { s.setView('login'); } }}>
                    <Play size={14} className="mr-1.5" />Demo
                  </Button>
                </motion.div>
              </div>

              <AnimatedSearchBar />
            </motion.div>

            <motion.div
              className="relative flex justify-center"
              initial={{ opacity: 0, scale: 0.5, filter: 'blur(12px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <motion.div className="absolute -top-2 -right-2 lg:right-0 hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass border border-white/[0.06] text-[11px] font-medium whitespace-nowrap z-10"
                animate={{ y: [0, -6, 0] }} transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}>
                <Brain size={11} className="text-[oklch(0.65 0.20 155)]" />
                <span className="text-foreground/70">RAG-Powered AI</span>
              </motion.div>
              <motion.div className="absolute -bottom-1 -left-4 lg:-left-8 hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass border border-white/[0.06] text-[11px] font-medium whitespace-nowrap z-10"
                animate={{ y: [0, -5, 0] }} transition={{ duration: 3.5, ease: 'easeInOut', repeat: Infinity, delay: 0.5 }}>
                <Shield size={11} className="text-[oklch(0.80 0.15 85)]" />
                <span className="text-foreground/70">98.7% Accuracy</span>
              </motion.div>
              <motion.div className="absolute top-1/2 -right-6 lg:-right-12 hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass border border-white/[0.06] text-[11px] font-medium whitespace-nowrap z-10"
                animate={{ y: [0, -7, 0] }} transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity, delay: 1 }}>
                <Globe size={11} className="text-[oklch(0.55 0.16 45)]" />
                <span className="text-foreground/70">50+ Countries</span>
              </motion.div>
              <motion.div className="absolute top-1/2 -left-6 lg:-left-12 hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass border border-white/[0.06] text-[11px] font-medium whitespace-nowrap z-10"
                animate={{ y: [0, -5, 0] }} transition={{ duration: 3.8, ease: 'easeInOut', repeat: Infinity, delay: 0.8 }}>
                <BarChart3 size={11} className="text-[oklch(0.65 0.12 300)]" />
                <span className="text-foreground/70">Live Analytics</span>
              </motion.div>
              <CricketBallCircle size={240} />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 pb-10 pt-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.7 }} className="pt-6 border-t border-white/[0.06]">
          <StatsRow />
        </motion.div>
      </div>
    </section>
  );
}
