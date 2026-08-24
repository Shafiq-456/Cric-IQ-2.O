'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ArrowUpDown, Star } from 'lucide-react';
import { players, type Player } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';

const formColors: Record<string, string> = {
  excellent: 'oklch(0.72 0.18 170)',
  good: 'oklch(0.65 0.22 240)',
  average: 'oklch(0.78 0.16 85)',
  poor: 'oklch(0.65 0.22 25)',
};

const roles = ['All', 'Batsman', 'Bowler', 'All-rounder'];
const countries = ['All', ...Array.from(new Set(players.map(p => p.country)))];

export default function PlayerExplorerPage() {
  const { setView } = useAppStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'runs' | 'wickets' | 'average'>('rating');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const filtered = useMemo(() => {
    let result = players.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.country.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'All' || p.role === roleFilter;
      const matchCountry = countryFilter === 'All' || p.country === countryFilter;
      return matchSearch && matchRole && matchCountry;
    });
    result.sort((a, b) => {
      if (sortBy === 'runs') return b.runs - a.runs;
      if (sortBy === 'wickets') return b.wickets - a.wickets;
      if (sortBy === 'average') return b.average - a.average;
      return b.rating - a.rating;
    });
    return result;
  }, [search, roleFilter, countryFilter, sortBy]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Player Explorer</h1>
        <p className="text-sm text-muted-foreground">Explore comprehensive player profiles with detailed statistics.</p>
      </motion.div>

      {/* Search + Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search players by name or country..."
            className="pl-9 bg-muted/50 border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {roles.map(r => (
            <Button key={r} variant={roleFilter === r ? 'default' : 'outline'} size="sm"
              className={roleFilter === r ? 'bg-[oklch(0.65_0.22_240)] text-white text-xs' : 'text-xs border-border/50'}
              onClick={() => setRoleFilter(r)}
            >{r}</Button>
          ))}
        </div>
      </motion.div>

      {/* Country filter + Sort */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="flex gap-2 flex-wrap">
          {countries.slice(0, 7).map(c => (
            <button key={c} className={`text-xs px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              countryFilter === c ? 'bg-[oklch(0.65_0.22_240/15)] text-[oklch(0.65_0.22_240)]' : 'text-muted-foreground hover:text-foreground bg-muted/50'
            }`} onClick={() => setCountryFilter(c)}>{c === 'All' ? '🌍 All' : c}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowUpDown size={12} />
          <span>Sort:</span>
          {(['rating', 'runs', 'wickets', 'average'] as const).map(s => (
            <button key={s} className={`capitalize px-2 py-0.5 rounded transition-colors cursor-pointer ${
              sortBy === s ? 'text-[oklch(0.65_0.22_240)]' : 'hover:text-foreground'
            }`} onClick={() => setSortBy(s)}>{s}</button>
          ))}
        </div>
      </motion.div>

      {/* Results count */}
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="text-xs text-muted-foreground"
      >
        Showing {filtered.length} of {players.length} players
      </motion.p>

      {/* Player Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * Math.min(i, 12) }}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedPlayer(p)}
          >
            <Card className="glass border-border/50 hover:border-[oklch(0.65_0.22_240/30)] transition-all duration-300 cursor-pointer h-full">
              <CardContent className="p-5">
                {/* Top row: avatar, name, form */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[oklch(0.65_0.22_240/30)] to-[oklch(0.78_0.16_85/30)] flex items-center justify-center text-sm font-bold shrink-0">
                    {p.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.flag} {p.country}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] border-border/50">{p.role}</Badge>
                      <span className="text-[10px] font-medium" style={{ color: formColors[p.form] }}>
                        {p.form}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-0.5">
                      <Star size={12} className="text-[oklch(0.78_0.16_85)]" />
                      <span className="text-sm font-bold">{p.rating}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">ICC #{p.iccRanking}</p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {p.role !== 'Bowler' ? (
                    <>
                      <div className="py-2 rounded-lg bg-muted/50 text-center">
                        <p className="text-sm font-bold text-[oklch(0.65_0.22_240)]">{p.runs.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">Runs</p>
                      </div>
                      <div className="py-2 rounded-lg bg-muted/50 text-center">
                        <p className="text-sm font-bold text-[oklch(0.78_0.16_85)]">{p.average}</p>
                        <p className="text-[10px] text-muted-foreground">Average</p>
                      </div>
                      <div className="py-2 rounded-lg bg-muted/50 text-center">
                        <p className="text-sm font-bold text-[oklch(0.72_0.18_170)]">{p.strikeRate > 0 ? p.strikeRate : p.wickets}</p>
                        <p className="text-[10px] text-muted-foreground">{p.strikeRate > 0 ? 'SR' : 'Wickets'}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="py-2 rounded-lg bg-muted/50 text-center">
                        <p className="text-sm font-bold text-[oklch(0.65_0.22_240)]">{p.wickets}</p>
                        <p className="text-[10px] text-muted-foreground">Wickets</p>
                      </div>
                      <div className="py-2 rounded-lg bg-muted/50 text-center">
                        <p className="text-sm font-bold text-[oklch(0.78_0.16_85)]">{p.economy}</p>
                        <p className="text-[10px] text-muted-foreground">Economy</p>
                      </div>
                      <div className="py-2 rounded-lg bg-muted/50 text-center">
                        <p className="text-sm font-bold text-[oklch(0.72_0.18_170)]">{p.average}</p>
                        <p className="text-[10px] text-muted-foreground">Avg</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Recent form mini chart */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground mr-1">Recent:</span>
                  {p.recentScores.map((s, si) => {
                    const isHigh = parseInt(s) >= 50;
                    return (
                      <div key={si} className="flex-1 h-6 rounded bg-muted/50 flex items-center justify-center">
                        <span className={`text-[9px] font-mono ${isHigh ? 'text-[oklch(0.72_0.18_170)]' : 'text-muted-foreground'}`}>
                          {s}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Player Detail Drawer */}
      <AnimatePresence>
      {selectedPlayer && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPlayer(null)} />
          <motion.div
            className="relative w-full max-w-md bg-[oklch(0.16_0.018_260)] border-l border-border/50 overflow-y-auto no-scrollbar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="p-6 space-y-6">
              {/* Close button */}
              <button className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80"
                onClick={() => setSelectedPlayer(null)}
              >✕</button>

              {/* Player header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[oklch(0.65_0.22_240/30)] to-[oklch(0.78_0.16_85/30)] flex items-center justify-center text-xl font-bold">
                  {selectedPlayer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedPlayer.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedPlayer.flag} {selectedPlayer.country}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{selectedPlayer.role}</Badge>
                    <span className="text-xs" style={{ color: formColors[selectedPlayer.form] }}>{selectedPlayer.form} form</span>
                  </div>
                </div>
              </div>

              {/* Detailed stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Matches', value: selectedPlayer.matches },
                  { label: 'ICC Ranking', value: `#${selectedPlayer.iccRanking}` },
                  { label: 'Rating', value: selectedPlayer.rating },
                  { label: 'Age', value: selectedPlayer.age },
                  { label: 'Batting', value: selectedPlayer.battingStyle },
                  { label: 'Bowling', value: selectedPlayer.bowlingStyle },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-xl bg-muted/50">
                    <p className="text-[10px] text-muted-foreground mb-1">{s.label}</p>
                    <p className="text-sm font-semibold">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Key stats */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Key Statistics</h3>
                <div className="space-y-2">
                  {selectedPlayer.role !== 'Bowler' ? [
                    { l: 'Total Runs', v: selectedPlayer.runs.toLocaleString(), c: 'oklch(0.65 0.22 240)' },
                    { l: 'Batting Average', v: selectedPlayer.average, c: 'oklch(0.78 0.16 85)' },
                    { l: 'Strike Rate', v: selectedPlayer.strikeRate, c: 'oklch(0.72 0.18 170)' },
                    { l: 'Wickets', v: selectedPlayer.wickets, c: 'oklch(0.7 0.2 300)' },
                  ] : [
                    { l: 'Total Wickets', v: selectedPlayer.wickets, c: 'oklch(0.65 0.22 240)' },
                    { l: 'Bowling Average', v: selectedPlayer.average, c: 'oklch(0.78 0.16 85)' },
                    { l: 'Economy', v: selectedPlayer.economy, c: 'oklch(0.72 0.18 170)' },
                    { l: 'Runs Scored', v: selectedPlayer.runs, c: 'oklch(0.7 0.2 300)' },
                  ].map((s) => (
                    <div key={s.l} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <span className="text-sm text-muted-foreground">{s.l}</span>
                      <span className="text-lg font-bold" style={{ color: s.c }}>{s.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button className="flex-1 bg-[oklch(0.65_0.22_240)] hover:bg-[oklch(0.58_0.24_240)] text-white" onClick={() => { setSelectedPlayer(null); setView('compare'); }}>
                  <Star size={14} className="mr-2" /> Compare
                </Button>
                <Button variant="outline" className="flex-1 border-border/50" onClick={() => { setSelectedPlayer(null); setView('analytics'); }}>
                  <BarChart3 size={14} className="mr-2" /> Analytics
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

function BarChart3(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 24, ...rest } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}