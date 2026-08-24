'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  type: 'dot' | 'trail';
  trail?: { x: number; y: number; alpha: number }[];
}

/* Cricket-themed color palette for particles */
const COLORS = {
  pitch: 'rgba(46, 160, 100, 0.5)',
  leather: 'rgba(200, 70, 50, 0.45)',
  gold: 'rgba(210, 175, 55, 0.35)',
  seam: 'rgba(255, 255, 255, 0.3)',
  pitchBright: 'rgba(60, 200, 120, 0.6)',
};

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<'particles' | 'logo' | 'ball' | 'tagline' | 'zoom' | 'done'>('particles');
  const [showSkip, setShowSkip] = useState(false);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    /* ── Cricket-themed particles ── */
    const particles: Particle[] = [];
    const colorKeys = Object.keys(COLORS) as (keyof typeof COLORS)[];

    // Regular ambient particles
    for (let i = 0; i < 60; i++) {
      const colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.15,
        color: COLORS[colorKey],
        type: 'dot',
      });
    }

    // Cricket ball trajectory particles — arc paths
    for (let i = 0; i < 5; i++) {
      const colorKey = Math.random() > 0.5 ? 'leather' : 'pitchBright';
      const startX = Math.random() * canvas.width;
      const startY = canvas.height * (0.3 + Math.random() * 0.4);
      particles.push({
        x: startX,
        y: startY,
        vx: (Math.random() - 0.3) * 1.5,
        vy: -1.5 - Math.random() * 1,
        size: 2.5 + Math.random() * 1.5,
        opacity: 0.6,
        color: COLORS[colorKey],
        type: 'trail',
        trail: [],
      });
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Stadium night atmosphere
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.6
      );
      grad.addColorStop(0, 'rgba(15, 25, 55, 0.2)');
      grad.addColorStop(0.4, 'rgba(10, 15, 35, 0.5)');
      grad.addColorStop(1, 'rgba(5, 8, 20, 0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle floodlight cones
      const beamGrad1 = ctx.createLinearGradient(canvas.width * 0.15, 0, canvas.width * 0.35, canvas.height * 0.8);
      beamGrad1.addColorStop(0, 'rgba(210, 175, 55, 0.04)');
      beamGrad1.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad1;
      ctx.fillRect(0, 0, canvas.width * 0.5, canvas.height);

      const beamGrad2 = ctx.createLinearGradient(canvas.width * 0.85, 0, canvas.width * 0.65, canvas.height * 0.8);
      beamGrad2.addColorStop(0, 'rgba(210, 175, 55, 0.03)');
      beamGrad2.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad2;
      ctx.fillRect(canvas.width * 0.5, 0, canvas.width * 0.5, canvas.height);

      const fadeIn = Math.min(frame / 80, 1);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Trail particles leave a trail
        if (p.type === 'trail') {
          if (p.trail) {
            p.trail.push({ x: p.x, y: p.y, alpha: 0.4 });
            if (p.trail.length > 20) p.trail.shift();
            // Draw trail
            for (let t = 0; t < p.trail.length; t++) {
              const tp = p.trail[t];
              tp.alpha *= 0.92;
              ctx.beginPath();
              ctx.arc(tp.x, tp.y, p.size * 0.4 * (t / p.trail.length), 0, Math.PI * 2);
              ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${tp.alpha * fadeIn})`);
              ctx.fill();
            }
          }
          // Add slight gravity for trajectory arc
          p.vy += 0.01;
        }

        // Wrap around
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) {
          p.y = canvas.height + 20;
          p.vy = -1.5 - Math.random() * 1;
          p.trail = [];
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${p.opacity * fadeIn})`);
        ctx.fill();

        // Glow for larger particles
        if (p.size > 2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          const glowColor = p.color.replace(/[\d.]+\)$/, `${p.opacity * fadeIn * 0.15})`);
          ctx.fillStyle = glowColor;
          ctx.fill();
        }
      });

      // Connect nearby particles with cricket-themed lines
      ctx.globalAlpha = 0.06 * fadeIn;
      ctx.strokeStyle = 'rgba(46, 160, 100, 0.4)';
      ctx.lineWidth = 0.4;
      for (let i = 0; i < Math.min(particles.length, 40); i++) {
        for (let j = i + 1; j < Math.min(particles.length, 40); j++) {
          if (particles[i].type !== 'dot' || particles[j].type !== 'dot') continue;
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.globalAlpha = 0.04 * (1 - dist / 120) * fadeIn;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      frame++;
      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Phase timeline
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('logo'), 1500);
    const t2 = setTimeout(() => setPhase('ball'), 3000);
    const t3 = setTimeout(() => setPhase('tagline'), 4500);
    const t4 = setTimeout(() => setPhase('zoom'), 5500);
    const t5 = setTimeout(() => setPhase('done'), 6200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, []);

  useEffect(() => {
    if (phase === 'done') {
      const t = setTimeout(onComplete, 300);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  const skip = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    onComplete();
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: 'oklch(0.05 0.01 265)' }}
      exit={{ opacity: 0, scale: 1.15, filter: 'blur(20px)' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Ambient cricket-themed lights */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: 'oklch(0.65 0.20 155 / 6%)' }}
        />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-[100px]"
          style={{ background: 'oklch(0.80 0.15 85 / 5%)' }}
        />
        <div className="absolute top-1/2 right-1/3 w-56 h-56 rounded-full blur-[80px]"
          style={{ background: 'oklch(0.55 0.16 45 / 4%)' }}
        />
      </div>

      {/* Logo + Ball */}
      <AnimatePresence>
        {phase !== 'particles' && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(25px)' }}
            transition={{ duration: phase === 'zoom' ? 0.5 : 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* 3D Cricket Ball */}
            <motion.div
              className="relative mb-8 perspective-dramatic"
              initial={{ scale: 0, rotateZ: -200, rotateX: 30 }}
              animate={phase === 'ball' || phase === 'tagline' || phase === 'zoom'
                ? { scale: 1, rotateZ: 360, rotateX: 0 }
                : { scale: 0, rotateZ: -200, rotateX: 30 }}
              transition={{ type: 'spring', stiffness: 80, damping: 12, delay: 0.1 }}
            >
              <motion.div
                className="w-24 h-24 md:w-32 md:h-32 rounded-full preserve-3d overflow-hidden"
                style={{
                  boxShadow: '0 0 50px rgba(212,69,53,0.25), 0 0 100px rgba(212,69,53,0.08), 0 20px 60px rgba(0,0,0,0.4)',
                }}
                animate={
                  phase === 'tagline' || phase === 'zoom'
                    ? { rotateY: [0, 360] }
                    : {}
                }
                transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
              >
                <img src="/cricket-ball.png" alt="" className="w-full h-full object-cover" />
              </motion.div>
              {/* Shadow */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-3 rounded-full"
                style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)', filter: 'blur(4px)' }}
              />
            </motion.div>

            {/* Logo text */}
            <motion.div
              initial={{ opacity: 0, y: 30, filter: 'blur(12px)', translateZ: -30, rotateX: 10 }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', translateZ: 0, rotateX: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="perspective-dramatic"
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight font-display">
                <span className="gradient-text">Cric</span>
                <span className="text-foreground">IQ</span>
              </h1>
            </motion.div>

            {/* Tagline */}
            <AnimatePresence>
              {(phase === 'tagline' || phase === 'zoom') && (
                <motion.p
                  className="mt-4 text-lg md:text-xl text-muted-foreground/60 tracking-wide font-body-hero"
                  initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  The Future of Cricket Intelligence
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip button */}
      <AnimatePresence>
        {showSkip && phase !== 'done' && (
          <motion.button
            className="absolute bottom-8 right-8 px-5 py-2.5 text-sm text-muted-foreground/60 hover:text-foreground glass rounded-full cursor-pointer border border-border/20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={skip}
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px oklch(0.65 0.20 155 / 15%)' }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            Skip
          </motion.button>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] rounded-r-full"
        style={{
          background: 'linear-gradient(90deg, oklch(0.65 0.20 155), oklch(0.80 0.15 85))',
          boxShadow: '0 0 10px oklch(0.65 0.20 155 / 30%)',
        }}
        initial={{ width: '0%' }}
        animate={{ width: phase === 'done' ? '100%' : phase === 'zoom' ? '90%' : phase === 'tagline' ? '70%' : phase === 'ball' ? '45%' : phase === 'logo' ? '25%' : '10%' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  );
}