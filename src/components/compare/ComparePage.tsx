'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  ArrowLeftRight, Search, Sparkles, Loader2, RefreshCw, CheckCircle2,
  TrendingUp, Shield, Zap, Award, Target, Flame
} from 'lucide-react';
import { players, type Player } from '@/data/mockData';

// ─── Custom Tooltip for Recharts ─────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-lg p-3 text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: p.color }} />
          {p.name}: <span className="text-foreground font-medium">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Searchable Player Select Combobox ───────────────────────────────────────

function PlayerSelectCombobox({
  label,
  selectedPlayer,
  onSelect,
  otherPlayerName,
}: {
  label: string;
  selectedPlayer: Player;
  onSelect: (player: Player) => void;
  otherPlayerName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.country.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase())
  );

  // Allow custom player search entry if no exact match found
  const handleCustomAdd = () => {
    if (!search.trim()) return;
    const customPlayer: Player = {
      id: `custom-${Date.now()}`,
      name: search.trim(),
      country: 'Global Cricket',
      flag: '🏏',
      role: 'Player',
      battingStyle: 'Right-handed',
      bowlingStyle: 'Right-arm medium',
      age: 28,
      matches: 100,
      runs: 4500,
      wickets: 25,
      average: 45.5,
      strikeRate: 88.0,
      economy: 4.5,
      image: '',
      form: 'excellent',
      rating: 8.5,
      recentScores: ['65', '82', '44', '91', '53'],
      iccRanking: 10,
    };
    onSelect(customPlayer);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <label className="block text-[11px] font-medium text-muted-foreground mb-1.5 tracking-wider uppercase">
        {label}
      </label>
      
      {/* Trigger Button / Current Selection */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass border border-border/50 hover:border-[oklch(0.65_0.22_240/40)] rounded-xl px-4 py-3 cursor-pointer flex items-center justify-between gap-3 transition-all"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_240/25)] to-[oklch(0.78_0.16_85/25)] flex items-center justify-center text-xs font-bold shrink-0">
            {selectedPlayer.flag}
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold truncate text-foreground">{selectedPlayer.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{selectedPlayer.country} · {selectedPlayer.role}</p>
          </div>
        </div>
        <Search size={15} className="text-muted-foreground shrink-0" />
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 glass-strong rounded-xl border border-border/60 shadow-2xl overflow-hidden max-h-72 flex flex-col"
          >
            {/* Search Input Box */}
            <div className="p-2.5 border-b border-border/40 flex items-center gap-2 bg-muted/40">
              <Search size={14} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Type any player name..."
                className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCustomAdd();
                }}
              />
            </div>

            {/* List Options */}
            <div className="overflow-y-auto p-1.5 space-y-0.5 max-h-56 scrollbar-thin">
              {filteredPlayers.map((p) => {
                const isSelected = p.name === selectedPlayer.name;
                const isOther = p.name === otherPlayerName;
                return (
                  <button
                    key={p.id}
                    disabled={isOther}
                    onClick={() => {
                      onSelect(p);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left flex items-center justify-between p-2.5 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? 'bg-[oklch(0.65_0.22_240/15)] text-[oklch(0.65_0.22_240)] font-semibold'
                        : isOther
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-muted/60 text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span>{p.flag}</span>
                      <div className="truncate">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">({p.role})</span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={13} className="text-[oklch(0.65_0.22_240)] shrink-0" />}
                    {isOther && <span className="text-[9px] text-muted-foreground italic">Selected</span>}
                  </button>
                );
              })}

              {/* Custom Search Fallback option */}
              {search.trim() && !filteredPlayers.some(p => p.name.toLowerCase() === search.trim().toLowerCase()) && (
                <button
                  onClick={handleCustomAdd}
                  className="w-full text-left flex items-center gap-2 p-2.5 rounded-lg text-xs bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors border border-amber-500/20"
                >
                  <Sparkles size={13} className="shrink-0 text-amber-400" />
                  <span className="truncate">Search AI for &quot;<strong>{search.trim()}</strong>&quot;</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Data Normalizer for Radar Chart ─────────────────────────────────────────

function generateRadarData(p1: Player, p2: Player) {
  const normalize = (val: number, max: number) => Math.min(Math.round((val / max) * 100), 100);
  const isBowler1 = p1.role === 'Bowler';
  const isBowler2 = p2.role === 'Bowler';

  if (isBowler1 && isBowler2) {
    return [
      { subject: 'Wickets', A: normalize(p1.wickets, 300), B: normalize(p2.wickets, 300) },
      { subject: 'Average', A: normalize(Math.max(1, 40 - p1.average), 40), B: normalize(Math.max(1, 40 - p2.average), 40) },
      { subject: 'Economy', A: normalize(Math.max(1, 6 - p1.economy), 6), B: normalize(Math.max(1, 6 - p2.economy), 6) },
      { subject: 'Rating', A: normalize(p1.rating, 10), B: normalize(p2.rating, 10) },
      { subject: 'ICC Rank', A: normalize(Math.max(1, 20 - p1.iccRanking), 20), B: normalize(Math.max(1, 20 - p2.iccRanking), 20) },
      { subject: 'Matches', A: normalize(p1.matches, 200), B: normalize(p2.matches, 200) },
    ];
  }

  return [
    { subject: 'Runs', A: normalize(p1.runs, 18000), B: normalize(p2.runs, 18000) },
    { subject: 'Average', A: normalize(p1.average, 70), B: normalize(p2.average, 70) },
    { subject: 'Strike Rate', A: normalize(p1.strikeRate, 140), B: normalize(p2.strikeRate, 140) },
    { subject: 'Rating', A: normalize(p1.rating, 10), B: normalize(p2.rating, 10) },
    { subject: 'ICC Rank', A: normalize(Math.max(1, 20 - p1.iccRanking), 20), B: normalize(Math.max(1, 20 - p2.iccRanking), 20) },
    { subject: 'Matches', A: normalize(p1.matches, 350), B: normalize(p2.matches, 350) },
  ];
}

// ─── Main Compare Page Component ─────────────────────────────────────────────

export default function ComparePage() {
  const [p1, setP1] = useState<Player>(players[0]); // Default Virat Kohli
  const [p2, setP2] = useState<Player>(players[1]); // Default Steve Smith

  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');

  // Fetch real-time AI comparison from Groq API
  const fetchRealTimeAiComparison = useCallback(async (playerA: Player, playerB: Player) => {
    const prompt = `Perform an honest, objective, data-driven real-time cricket comparison between ${playerA.name} (${playerA.country}) and ${playerB.name} (${playerB.country}).

Provide a breakdown covering:
1. **Honest Executive Verdict**: Direct, unbiased evaluation of who is superior in Test, ODI, and T20 cricket.
2. **Key Format Edges**: Which player has the statistical & tactical advantage in Tests vs ODIs vs T20Is.
3. **Clutch & Pressure Rating**: Rate both players' pressure performance out of 10 with reasons.
4. **Strengths & Tactical Weaknesses**: 2 key strengths and 1 tactical vulnerability for each player.

Format cleanly with clear headings, bullet points, and markdown tables. Be completely honest and genuine based on real-time cricket data and statistics up to 2026.`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) throw new Error('AI service response error');
      const data = await res.json();
      setAiAnalysis(data.content || 'Unable to generate comparison.');
    } catch (err) {
      console.warn('[ComparePage] AI fetch failed:', err);
      setAiError('Real-time AI analysis temporarily unavailable. Check your internet connection.');
    } finally {
      setAiLoading(false);
    }
  }, []);

  // Re-run real-time AI comparison whenever selected players change
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        setAiLoading(true);
        setAiError('');
        setAiAnalysis('');
        fetchRealTimeAiComparison(p1, p2);
      }
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [p1, p2, fetchRealTimeAiComparison]);

  const swapPlayers = () => {
    const temp = p1;
    setP1(p2);
    setP2(temp);
  };

  const radarData = generateRadarData(p1, p2);

  const headToHead = [
    { metric: 'Career Runs', v1: p1.runs.toLocaleString(), v2: p2.runs.toLocaleString(), better: p1.runs > p2.runs ? 1 : p1.runs < p2.runs ? 2 : 0 },
    { metric: 'Batting Average', v1: p1.average.toString(), v2: p2.average.toString(), better: p1.average > p2.average ? 1 : p1.average < p2.average ? 2 : 0 },
    { metric: 'Strike Rate', v1: p1.strikeRate.toString(), v2: p2.strikeRate.toString(), better: p1.strikeRate > p2.strikeRate ? 1 : p1.strikeRate < p2.strikeRate ? 2 : 0 },
    { metric: 'ICC Ranking', v1: `#${p1.iccRanking}`, v2: `#${p2.iccRanking}`, better: p1.iccRanking < p2.iccRanking ? 1 : p1.iccRanking > p2.iccRanking ? 2 : 0 },
    { metric: 'Matches Played', v1: p1.matches.toString(), v2: p2.matches.toString(), better: p1.matches > p2.matches ? 1 : p1.matches < p2.matches ? 2 : 0 },
    { metric: 'Wickets Taken', v1: p1.wickets.toString(), v2: p2.wickets.toString(), better: p1.wickets > p2.wickets ? 1 : p1.wickets < p2.wickets ? 2 : 0 },
    { metric: 'Overall Rating', v1: `${p1.rating}/10`, v2: `${p2.rating}/10`, better: p1.rating > p2.rating ? 1 : p1.rating < p2.rating ? 2 : 0 },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 font-display">
              Player Comparison <span className="gradient-text">&amp; Real-time AI Analysis</span>
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Search any international players for an honest, multi-dimensional AI &amp; statistical analysis.
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-300 border-amber-500/20 text-xs">
            <Sparkles size={12} className="text-amber-400" /> Powered by Groq Real-time AI
          </Badge>
        </div>
      </motion.div>

      {/* Searchable Player Selectors Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-5 border border-border/50 flex flex-col md:flex-row items-center gap-4 relative z-20"
      >
        {/* Player 1 Combobox */}
        <PlayerSelectCombobox
          label="Player 1 (Search by Name)"
          selectedPlayer={p1}
          onSelect={setP1}
          otherPlayerName={p2.name}
        />

        {/* Swap Button */}
        <div className="self-center md:self-end mb-1">
          <Button
            variant="outline"
            size="icon"
            onClick={swapPlayers}
            className="rounded-full w-10 h-10 border-border/60 hover:bg-muted/80 transition-transform active:scale-95 cursor-pointer shadow-sm"
            title="Swap Players"
          >
            <ArrowLeftRight size={16} className="text-[oklch(0.65_0.22_240)]" />
          </Button>
        </div>

        {/* Player 2 Combobox */}
        <PlayerSelectCombobox
          label="Player 2 (Search by Name)"
          selectedPlayer={p2}
          onSelect={setP2}
          otherPlayerName={p1.name}
        />
      </motion.div>

      {/* Player Cards Comparison Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[p1, p2].map((p, idx) => {
          const isFirst = idx === 0;
          const colorClass = isFirst ? 'oklch(0.65 0.22 240)' : 'oklch(0.78 0.16 85)';
          const borderHighlight = isFirst ? 'border-[oklch(0.65_0.22_240/30)]' : 'border-[oklch(0.78_0.16_85/30)]';

          return (
            <motion.div
              key={p.name + idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
            >
              <Card className={`glass ${borderHighlight} transition-all duration-300 relative overflow-hidden`}>
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ background: colorClass }}
                />
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[oklch(0.65_0.22_240/20)] to-[oklch(0.78_0.16_85/20)] flex items-center justify-center text-2xl font-bold mx-auto mb-3 shadow-inner">
                    {p.flag}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.country} · {p.role}</p>

                  <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div>
                      <p className="text-lg font-bold" style={{ color: colorClass }}>
                        {p.role === 'Bowler' ? p.wickets : p.runs.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{p.role === 'Bowler' ? 'Wickets' : 'Runs'}</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{p.average}</p>
                      <p className="text-[10px] text-muted-foreground">Average</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-400">#{p.iccRanking}</p>
                      <p className="text-[10px] text-muted-foreground">ICC Rank</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Real-time AI Intelligence Comparison Verdict Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass border-[oklch(0.65_0.22_240/30)] shadow-xl relative overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[oklch(0.65_0.22_240/15)] flex items-center justify-center text-[oklch(0.65_0.22_240)]">
                <Sparkles size={16} />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Real-Time AI Comparison &amp; Verdict</CardTitle>
                <p className="text-[11px] text-muted-foreground">Honest data-driven analysis powered by Groq LLM</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRealTimeAiComparison(p1, p2)}
              disabled={aiLoading}
              className="text-xs gap-1.5 border-border/50 hover:bg-muted/50 cursor-pointer"
            >
              <RefreshCw size={12} className={aiLoading ? 'animate-spin' : ''} /> Refresh Analysis
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {aiLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 size={32} className="animate-spin text-[oklch(0.65_0.22_240)]" />
                <p className="text-sm font-medium text-foreground">Analyzing {p1.name} vs {p2.name} in real-time…</p>
                <p className="text-xs text-muted-foreground/60 max-w-sm">
                  Computing head-to-head records, format efficiency, clutch ratings, and technical vulnerabilities.
                </p>
              </div>
            ) : aiError ? (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-3">
                <p>{aiError}</p>
                <Button size="sm" variant="ghost" onClick={() => fetchRealTimeAiComparison(p1, p2)}>Try Again</Button>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none text-xs md:text-sm leading-relaxed space-y-4 font-body">
                {/* Format markdown AI response dynamically */}
                <div
                  className="ai-rendered-markdown whitespace-pre-line text-foreground/90 space-y-3"
                  dangerouslySetInnerHTML={{
                    __html: aiAnalysis
                      .replace(/### (.*)/g, '<h3 class="text-base font-bold text-foreground mt-4 mb-2 flex items-center gap-2">$1</h3>')
                      .replace(/## (.*)/g, '<h2 class="text-lg font-bold text-foreground mt-5 mb-2 font-display gradient-text">$1</h2>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">$1</code>')
                      .replace(/> (.*)/g, '<blockquote class="border-l-2 border-[oklch(0.65_0.22_240)] pl-3 my-2 text-muted-foreground italic">$1</blockquote>')
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Visual Analytics Grid: Multi-Dimensional Radar + Head to Head Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="glass border-border/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Multi-Dimensional Capability Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius={95}>
                    <PolarGrid stroke="oklch(0.95 0.01 240 / 12%)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'oklch(0.70 0.015 260)' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: 'oklch(0.65 0.015 260)' }} />
                    <Radar name={p1.name} dataKey="A" stroke="oklch(0.65 0.22 240)" fill="oklch(0.65 0.22 240)" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name={p2.name} dataKey="B" stroke="oklch(0.78 0.16 85)" fill="oklch(0.78 0.16 85)" fillOpacity={0.2} strokeWidth={2} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Head-to-Head Detailed Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Head-to-Head Metric Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0.5">
                {headToHead.map((row) => (
                  <div key={row.metric} className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0 hover:bg-muted/20 px-2 rounded-lg transition-colors">
                    <span className={`text-sm font-mono font-medium flex-1 text-right transition-colors ${
                      row.better === 1 ? 'text-[oklch(0.65_0.22_240)] font-bold' : 'text-foreground/70'
                    }`}>
                      {row.v1}
                    </span>
                    <div className="w-32 text-center shrink-0">
                      <span className="text-xs text-muted-foreground font-medium">{row.metric}</span>
                    </div>
                    <span className={`text-sm font-mono font-medium flex-1 transition-colors ${
                      row.better === 2 ? 'text-[oklch(0.78_0.16_85)] font-bold' : 'text-foreground/70'
                    }`}>
                      {row.v2}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}