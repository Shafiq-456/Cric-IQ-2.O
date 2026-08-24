import os

target = "/home/z/my-project/src/components/landing/VideoHeroSection.tsx"

content = r"""'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import {
  Search, Sparkles, ArrowRight, Play, Menu, X, ChevronDown,
  Zap, Shield, Brain, Globe, BarChart3,
} from 'lucide-react';

const navItems = [
  { label: 'Home', href: '#hero' },
  { label: 'Features', href: '#features' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Players', href: '#players' },
  { label: 'Matches', href: '#matches' },
];

function StatsMarquee() {
  const stats = [
    { value: '2.4M+', label: 'Data Points' },
    { value: '15K+', label: 'Matches' },
    { value: '3.2K+', label: 'Players' },
    { value: '98.7%', label: 'AI Accuracy' },
    { value: '50+', label: 'Countries' },
    { value: '12ms', label: 'Avg Response' },
  ];
  const doubled = [...stats, ...stats];
  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] py-3.5 bg-white/[0.02]">
      <motion.div className="flex gap-14 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}>
        {doubled.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5 shrink-0">
            <span className="text-sm font-bold tracking-tight text-foreground/90 font-body-hero">{s.value}</span>
            <span className="text-[11px] text-muted-foreground/50 uppercase tracking-wider">{s.label}</span>
            <span className="text-white/10 ml-10">&#9670;</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function CricketBallOrbit({ size = 300 }: { size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const springConfig = { stiffness: 60, damping: 18, mass: 0.5 };
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);
  const dotColors = ['oklch(0.65 0.20 155 / 50%)', 'oklch(0.80 0.15 85 / 50%)', 'oklch(0.55 0.16 45 / 50%)'];
  const dotBackgrounds = ['oklch(0.65 0.20 155)', 'oklch(0.80 0.15 85)', 'oklch(0.55 0.16 45)'];

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      rotateX.set(-dy * 20);
      rotateY.set(dx * 20);
    };
    const handleLeave = () => { rotateX.set(0); rotateY.set(0); };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseleave', handleLeave);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseleave', handleLeave); };
  }, [rotateX, rotateY]);

  return (
    <div ref={ref} className="perspective-dramatic relative" style={{ width: size, height: size }}>
      <motion.div className="preserve-3d relative w-full h-full" style={{ rotateX, rotateY }}>
        <div className="absolute inset-[-15%] rounded-full border border-white/[0.04]" style={{ animation: 'orbit-spin 20s linear infinite' }} />
        <div className="absolute inset-[-8%] rounded-full border border-dashed border-white/[0.03]" style={{ animation: 'orbit-spin 15s linear infinite reverse' }} />
        {[0, 1, 2].map((i) => (
          <motion.div key={i} className="absolute w-2 h-2 rounded-full"
            style={{
              background: dotBackgrounds[i],
              boxShadow: dotColors[i],
              top: '50%', left: '50%',
            }}
            animate={{
              x: [0, Math.cos((i * 120) * Math.PI / 180) * size * 0.48, 0],
              y: [0, Math.sin((i * 120) * Math.PI / 180) * size * 0.48, 0],
            }}
            transition={{ duration: 8 + i * 2, ease: 'easeInOut', repeat: Infinity, delay: i * 0.5 }} />
        ))}
        <div className="absolute inset-[12%] rounded-full overflow-hidden"
          style={{ boxShadow: '0 0 80px rgba(212,69,53,0.15), 0 25px 60px rgba(0,0,0,0.5), inset 0 -10px 30px rgba(0,0,0,0.2)' }}>
          <img src="/cricket-ball.png" alt="" className="w-full h-full object-contain" />
        </div>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[60%] h-5 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, transparent 70%)', filter: 'blur(12px)' }} />
      </motion.div>
    </div>
  );
}

function FloatingBadge({ icon: Icon, label, x, y, delay, color }: { icon: typeof Zap; label: string; x: string; y: string; delay: number; color: string }) {
  return (
    <motion.div
      className="absolute hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/[0.06] text-xs font-medium whitespace-nowrap"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.7, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: [0, -8, 0] }}
      transition={{ opacity: { delay: 2.2 + delay, duration: 0.8 }, scale: { delay: 2.2 + delay, duration: 0.8, type: 'spring' }, filter: { delay: 2.2 + delay, duration: 0.8 }, y: { duration: 3 + delay, ease: 'easeInOut', repeat: Infinity, delay: 2.2 + delay } }}>
      <Icon size={13} style={{ color }} />
      <span className="text-foreground/80">{label}</span>
    </motion.div>
  );
}

function AnimatedSearchBar() {
  const prompts = [
    'Who has the best Test average in 2026?',
    'Compare Bumrah vs Cummins in WTC',
    'India vs Australia head-to-head since 2020',
    'Best bowling figures in Champions Trophy',
    'Explain DRS referral success rates by team',
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx((i) => (i + 1) % prompts.length), 3000);
    return () => clearInterval(iv);
  }, [prompts.length]);
  return (
    <div className="max-w-2xl w-full">
      <motion.div
        className="relative rounded-2xl p-[1px] overflow-hidden"
        style={{ background: 'linear-gradient(135deg, oklch(0.65 0.20 155 / 30%), oklch(0.80 0.15 85 / 20%), oklch(0.65 0.20 155 / 10%))' }}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}>
        <div className="rounded-2xl flex items-center gap-3 px-4 py-3.5 sm:py-4"
          style={{ background: 'oklch(0.10 0.015 265 / 90%)', backdropFilter: 'blur(24px)' }}>
          <Search size={18} className="text-white/25 shrink-0" />
          <span className="text-white/25 text-sm sm:text-base flex-1 text-left truncate font-body-hero">
            <motion.span key={idx} initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="inline-block">
              {prompts[idx]}
            </motion.span>
          </span>
          <Button size="sm" className="bg-[oklch(0.65_0.20_155/70%)] hover:bg-[oklch(0.65_0.20_155)] text-white shrink-0 font-body-hero cursor-pointer"
            style={{ boxShadow: '0 0 16px oklch(0.65 0.20 155 / 12%)' }}>
            <Sparkles size={14} className="mr-1.5" />Ask AI
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <motion.nav className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className="mx-4 sm:mx-6 mt-4 rounded-2xl px-5 py-3 flex justify-between items-center glass-strong border border-white/[0.06]">
          <a href="#hero" className="flex items-center gap-2.5 select-none group">
            <motion.div className="w-8 h-8 rounded-full shrink-0 overflow-hidden"
              style={{ boxShadow: '0 0 14px rgba(212,69,53,0.3)' }}
              whileHover={{ rotateZ: 360 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
              <img src="/cricket-ball.png" alt="" className="w-full h-full object-contain" />
            </motion.div>
            <span className="text-2xl tracking-tight font-normal text-white group-hover:text-[oklch(0.65_0.20_155)] transition-colors duration-500 font-display">
              CricIQ<sup className="text-[9px] ml-0.5 text-white/30 font-body-hero">&reg;</sup>
            </span>
          </a>
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item, i) => (
              <motion.a key={item.label} href={item.href}
                className="text-[13px] text-white/40 hover:text-white/90 transition-colors duration-300 font-body-hero"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.06, duration: 0.5 }}>{item.label}</motion.a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ delay: 0.8, duration: 0.5 }}>
              <Button className="rounded-full px-5 py-2 text-sm font-medium cursor-pointer bg-[oklch(0.65_0.20_155)] text-white hover:bg-[oklch(0.58_0.22_155)] transition-all duration-300 font-body-hero"
                style={{ boxShadow: '0 0 20px oklch(0.65 0.20 155 / 15%)' }}>
                Get Started <ArrowRight size={14} className="ml-1.5" />
              </Button>
            </motion.div>
            <button className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
            </button>
          </div>
        </div>
      </motion.nav>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-40 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div className="absolute right-0 top-0 bottom-0 w-72 p-6 pt-20 border-l border-white/5"
              style={{ background: 'oklch(0.07 0.015 265 / 98%)', backdropFilter: 'blur(32px)' }}
              initial={{ x: 288, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 288, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              {navItems.map((item, i) => (
                <motion.a key={item.label} href={item.href}
                  className="block py-3 text-base border-b border-white/5 font-body-hero text-white/40 hover:text-white transition-colors"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i }}
                  onClick={() => setMobileOpen(false)}>{item.label}</motion.a>
              ))}
              <div className="mt-6">
                <Button className="w-full rounded-full bg-[oklch(0.65_0.20_155)] text-white font-body-hero cursor-pointer">
                  Get Started <ArrowRight size={14} className="ml-1.5" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function VideoHeroSection({ onEnterApp }: { onEnterApp?: () => void }) {
  const { setView } = useAppStore();
  const handleEnter = onEnterApp || (() => setView('dashboard'));
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const ballY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section ref={containerRef} id="hero" className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0 stadium-grid opacity-50" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none"
        style={{ background: 'oklch(0.65 0.20 155 / 6%)' }} />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none"
        style={{ background: 'oklch(0.80 0.15 85 / 4%)' }} />
      <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'oklch(0.55 0.16 45 / 3%)' }} />
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none z-[1]"
          style={{
            width: 1.5 + Math.random() * 2, height: 1.5 + Math.random() * 2,
            left: (5 + Math.random() * 90) + '%', top: (5 + Math.random() * 90) + '%',
            background: i % 3 === 0 ? 'oklch(0.65 0.20 155 / 40%)' : i % 3 === 1 ? 'oklch(0.80 0.15 85 / 30%)' : 'rgba(255,255,255,0.12)',
          }}
          animate={{ y: [0, -20 - Math.random() * 30, 0], opacity: [0.1, 0.6, 0.1], scale: [1, 1.3, 1] }}
          transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 3, ease: 'easeInOut' }} />
      ))}

      <Navbar />

      <motion.div className="relative z-10 min-h-screen flex items-center" style={{ opacity: contentOpacity }}>
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-24 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div style={{ y: contentY }}>
              <motion.div className="mb-6"
                initial={{ opacity: 0, x: -30, filter: 'blur(6px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[oklch(0.65_0.20_155/15%)] bg-[oklch(0.65_0.20_155/5%)] text-xs text-[oklch(0.65_0.20_155)] font-body-hero">
                  <Sparkles size={11} className="text-[oklch(0.80_0.15_85)]" />
                  Powered by RAG & Advanced AI
                </span>
              </motion.div>
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-normal leading-[1.08] tracking-tight font-display mb-6"
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                <span className="gradient-text-hero">Beyond the pitch,</span><br />
                <span className="text-white/90">we </span>
                <em className="text-[oklch(0.65_0.20_155)]" style={{ fontStyle: 'italic' }}>decode</em>
                <span className="text-white/90"> the </span>
                <em className="text-[oklch(0.80_0.15_85)]" style={{ fontStyle: 'italic' }}>eternal.</em>
              </motion.h1>
              <motion.p className="text-base sm:text-lg max-w-xl leading-relaxed text-white/35 font-body-hero mb-8"
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                Building the definitive cricket intelligence platform for brilliant
                analysts, fearless players, and devoted fans. Through millions of data points,{' '}
                <span className="text-white/55">we surface clarity</span>.
              </motion.p>
              <motion.div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 font-body-hero mb-10"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                  <Button className="rounded-full px-10 py-5 text-base font-medium bg-white text-[oklch(0.08_0.015_265)] hover:bg-white/92 cursor-pointer depth-2 transition-colors"
                    onClick={handleEnter}>
                    Begin Journey <ArrowRight size={16} className="ml-2" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="ghost" className="rounded-full px-6 py-5 text-base text-white/50 hover:text-white/80 hover:bg-white/5 cursor-pointer font-body-hero">
                    <Play size={16} className="mr-2" />Watch Demo
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div className="max-w-2xl w-full"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}>
                <AnimatedSearchBar />
              </motion.div>
            </motion.div>

            <motion.div className="relative flex justify-center lg:justify-end"
              style={{ y: ballY }}
              initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <FloatingBadge icon={Brain} label="RAG-Powered AI" x="-5%" y="15%" delay={0} color="oklch(0.65 0.20 155)" />
              <FloatingBadge icon={Shield} label="98.7% Accuracy" x="70%" y="5%" delay={0.2} color="oklch(0.80 0.15 85)" />
              <FloatingBadge icon={Globe} label="50+ Countries" x="80%" y="70%" delay={0.4} color="oklch(0.55 0.16 45)" />
              <FloatingBadge icon={BarChart3} label="Live Analytics" x="-10%" y="75%" delay={0.3} color="oklch(0.65 0.12 300)" />
              <CricketBallOrbit size={300} />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}>
        <span className="text-[10px] text-white/20 font-body-hero tracking-[0.15em] uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <ChevronDown size={14} className="text-white/20" />
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 z-20"><StatsMarquee /></div>
      <div className="absolute bottom-[52px] left-0 right-0 h-24 z-[15] bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
"""

os.makedirs(os.path.dirname(target), exist_ok=True)
with open(target, 'w') as f:
    f.write(content)

print(f"Written {len(content)} bytes to {target}")
