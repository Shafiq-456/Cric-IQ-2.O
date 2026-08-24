'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search, Sparkles, BarChart3, GitCompareArrows, MessageSquare,
  Brain, FileText, TrendingUp, ChevronRight, ChevronDown,
  ArrowRight, Star, Bot,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { players, matches, faqItems } from '@/data/mockData';
import VideoHeroSection from '@/components/landing/VideoHeroSection';

/* ═══ Animation helpers ═══ */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

function Section({ children, className = '', id = '' }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section ref={ref} id={id} className={className}
      initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}>
      {children}
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FEATURES — 6 cards in compact grid
   ═══════════════════════════════════════════════════════════════ */
function FeatureGrid() {
  const features = [
    { icon: Brain, title: 'RAG-Powered AI', desc: 'Every answer grounded in real match data with citations and confidence scores.', color: 'oklch(0.65 0.20 155)' },
    { icon: GitCompareArrows, title: 'Player Comparison', desc: 'Multi-dimensional comparisons across formats, conditions, and eras.', color: 'oklch(0.80 0.15 85)' },
    { icon: BarChart3, title: 'Deep Analytics', desc: 'Trend analysis, predictive insights, and customizable dashboards.', color: 'oklch(0.55 0.16 45)' },
    { icon: MessageSquare, title: 'Conversational AI', desc: 'Ask naturally — like discussing cricket with an expert analyst.', color: 'oklch(0.60 0.22 25)' },
    { icon: FileText, title: 'Document Intelligence', desc: 'Upload PDFs and reports. Extract, chunk, and query instantly.', color: 'oklch(0.65 0.12 300)' },
    { icon: TrendingUp, title: 'Live Match Tracking', desc: 'Real-time AI commentary and situation analysis for every ball.', color: 'oklch(0.65 0.20 155)' },
  ];
  return (
    <Section id="features" className="py-14 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div className="text-center mb-10" variants={stagger}>
          <motion.span variants={fadeUp} custom={0} className="inline-block text-[10px] uppercase tracking-[0.2em] text-[oklch(0.80_0.15_85)] mb-2">Features</motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-3xl font-bold mb-2 font-display">
            Everything You Need. <span className="gradient-text">Nothing You Don&apos;t.</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-muted-foreground/50 text-sm max-w-md mx-auto">
            Built for analysts, coaches, and fans who demand precision.
          </motion.p>
        </motion.div>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger}>
          {features.map((f, i) => (
            <motion.div key={f.title} variants={fadeUp} custom={i}>
              <Card className="glass border-border/30 hover:border-[oklch(0.65_0.20_155/15%)] transition-all duration-300 group cursor-pointer h-full">
                <CardContent className="p-4 relative z-10">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `color-mix(in oklch, ${f.color} 12%, transparent)` }}>
                    <f.icon size={18} style={{ color: f.color }} />
                  </div>
                  <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-xs text-muted-foreground/50 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PLAYERS + BLOGS — Combined compact section
   ═══════════════════════════════════════════════════════════════ */
function PlayersAndBlogs() {
  const { setView } = useAppStore();
  const featured = players.slice(0, 4);

  const blogs = [
    { player: 'Virat Kohli', country: 'India', flag: '🇮🇳', role: 'Batsman', title: 'The Chase Master: How Kohli Redefined ODI Cricket', tag: 'Batting Legend', color: 'oklch(0.65 0.20 155)', readTime: '6 min' },
    { player: 'Jasprit Bumrah', country: 'India', flag: '🇮🇳', role: 'Bowler', title: 'The Unorthodox Genius: Bumrah\'s Revolution in Fast Bowling', tag: 'Bowling', color: 'oklch(0.55 0.16 45)', readTime: '5 min' },
    { player: 'Steve Smith', country: 'Australia', flag: '🇦🇺', role: 'Batsman', title: 'The Unconventional Architect: Smith\'s Test Mastery', tag: 'Test Great', color: 'oklch(0.80 0.15 85)', readTime: '7 min' },
    { player: 'Ben Stokes', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', role: 'All-rounder', title: 'The Miracle Worker: Stokes\' Greatest Comebacks', tag: 'Match Winner', color: 'oklch(0.60 0.22 25)', readTime: '8 min' },
  ];

  return (
    <Section className="py-14 md:py-16 border-t border-border/20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Players row */}
        <motion.div className="mb-12" variants={stagger}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <motion.span variants={fadeUp} custom={0} className="inline-block text-[10px] uppercase tracking-[0.2em] text-[oklch(0.65_0.20_155)] mb-1">Player Intelligence</motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-3xl font-bold font-display">
                Every Player. <span className="gradient-text">Every Stat.</span>
              </motion.h2>
            </div>
            <motion.div variants={fadeUp} custom={2}>
              <Button variant="outline" size="sm" className="border-border/20 hover:border-[oklch(0.65_0.20_155/25%)] text-xs" onClick={() => setView('players')}>
                All Players <ChevronRight size={12} className="ml-1" />
              </Button>
            </motion.div>
          </div>
          <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-3" variants={stagger}>
            {featured.map((p, i) => (
              <motion.div key={p.id} variants={fadeUp} custom={i}>
                <Card className="glass border-border/30 hover:border-[oklch(0.65_0.20_155/15%)] transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-3.5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[oklch(0.65_0.20_155/20%)] to-[oklch(0.80_0.15_85/20%)] flex items-center justify-center text-xs font-bold">
                        {p.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-xs truncate">{p.name}</h4>
                        <p className="text-[10px] text-muted-foreground/50">{p.flag} {p.role}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="py-1.5 rounded-md bg-muted/20">
                        <p className="text-xs font-bold text-[oklch(0.65 0.20 155)]">{p.role === 'Bowler' || p.role === 'All-rounder' ? p.wickets : (p.runs / 1000).toFixed(1) + 'k'}</p>
                        <p className="text-[9px] text-muted-foreground/40">{p.role === 'Bowler' ? 'Wkts' : 'Runs'}</p>
                      </div>
                      <div className="py-1.5 rounded-md bg-muted/20">
                        <p className="text-xs font-bold text-[oklch(0.80 0.15 85)]">{p.average}</p>
                        <p className="text-[9px] text-muted-foreground/40">Avg</p>
                      </div>
                      <div className="py-1.5 rounded-md bg-muted/20">
                        <p className="text-xs font-bold text-[oklch(0.55 0.16 45)]">#{p.iccRanking}</p>
                        <p className="text-[9px] text-muted-foreground/40">ICC</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Blog cards row */}
        <motion.div id="blog" variants={stagger}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <motion.span variants={fadeUp} custom={0} className="inline-block text-[10px] uppercase tracking-[0.2em] text-[oklch(0.80_0.15_85)] mb-1">Cricket Spotlight</motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-3xl font-bold font-display">
                Stories Behind the <span className="gradient-text">Legends</span>
              </motion.h2>
            </div>
            <motion.div variants={fadeUp} custom={2}>
              <Button variant="outline" size="sm" className="border-border/20 hover:border-[oklch(0.65_0.20_155/25%)] text-xs" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                All Articles <ChevronRight size={12} className="ml-1" />
              </Button>
            </motion.div>
          </div>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" variants={stagger}>
            {blogs.map((blog, i) => (
              <motion.div key={blog.player} variants={fadeUp} custom={i}>
                <Card className="glass border-border/30 hover:border-[oklch(0.65_0.20_155/15%)] transition-all duration-300 group cursor-pointer h-full">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium border" style={{ color: blog.color, borderColor: `${blog.color}18`, background: `${blog.color}06` }}>{blog.tag}</span>
                      <span className="text-[9px] text-muted-foreground/30">{blog.readTime}</span>
                    </div>
                    <h3 className="text-xs font-bold mb-2 group-hover:text-[oklch(0.65_0.20_155)] transition-colors duration-200 leading-snug flex-1">{blog.title}</h3>
                    <div className="flex items-center justify-between pt-3 border-t border-border/15 mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: `${blog.color}15` }}>
                          {blog.player.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold">{blog.player}</p>
                          <p className="text-[9px] text-muted-foreground/35">{blog.flag} {blog.country}</p>
                        </div>
                      </div>
                      <ChevronRight size={12} className="text-muted-foreground/25 group-hover:text-[oklch(0.65_0.20_155)] group-hover:translate-x-0.5 transition-all duration-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FAQ — Compact accordion
   ═══════════════════════════════════════════════════════════════ */
function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <Section className="py-14 md:py-16 border-t border-border/20">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div className="text-center mb-8" variants={stagger}>
          <motion.span variants={fadeUp} custom={0} className="inline-block text-[10px] uppercase tracking-[0.2em] text-[oklch(0.55_0.16_45)] mb-2">FAQ</motion.span>
          <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-3xl font-bold font-display">
            Got Questions? <span className="gradient-text">We&apos;ve Got Answers.</span>
          </motion.h2>
        </motion.div>
        <motion.div className="space-y-2" variants={stagger}>
          {faqItems.map((faq, i) => (
            <motion.div key={i} variants={fadeUp} custom={i}>
              <Card className="glass border-border/30 overflow-hidden">
                <button className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer group"
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                  <span className="text-xs font-medium pr-4 group-hover:text-[oklch(0.65_0.20_155)] transition-colors duration-200">{faq.q}</span>
                  <motion.div animate={{ rotate: openIdx === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown size={14} className="text-muted-foreground/40 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIdx === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <div className="px-3.5 pb-3.5 text-xs text-muted-foreground/50 leading-relaxed">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */
function FooterSection() {
  const { setView } = useAppStore();
  return (
    <footer className="border-t border-border/20 py-10 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.65_0.20_155/15%)] to-transparent" />
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full overflow-hidden" style={{ boxShadow: '0 0 8px rgba(212,69,53,0.2)' }}>
                <img src="/cricket-ball.png" alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-base font-bold font-display"><span className="gradient-text">Cric</span>IQ</span>
            </div>
            <p className="text-[10px] text-muted-foreground/40 leading-relaxed">The Future of Cricket Intelligence. AI-powered analysis for everyone.</p>
          </div>
          {[
            { title: 'Product', links: ['AI Chat', 'Analytics', 'Players', 'Matches', 'Compare'], views: ['chat', 'analytics', 'players', 'matches', 'compare'] as const },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold mb-2.5">{col.title}</h4>
              <ul className="space-y-1.5">
                {col.links.map((l, li) => (
                  <li key={l}><button
                    className="text-[10px] text-muted-foreground/40 hover:text-foreground/70 transition-colors duration-200 cursor-pointer"
                    onClick={() => { if ('views' in col) setView(col.views[li]); }}
                  >{l}</button></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border/20">
          <p className="text-[10px] text-muted-foreground/30">&copy; 2026 CricIQ. All rights reserved.</p>
          <Button size="sm" className="bg-[oklch(0.65_0.20_155)] hover:bg-[oklch(0.58_0.22_155)] text-white text-xs" style={{ boxShadow: '0 0 14px oklch(0.65 0.20 155 / 12%)' }} onClick={() => setView('dashboard')}>
            Get Started Free <ArrowRight size={12} className="ml-1" />
          </Button>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING
   ═══════════════════════════════════════════════════════════════ */
export default function LandingPage({ onEnterApp }: { onEnterApp?: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <VideoHeroSection onEnterApp={onEnterApp} />
      <FeatureGrid />
      <PlayersAndBlogs />
      <FAQSection />
      <FooterSection />
    </div>
  );
}
