'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Calendar, Zap, Trophy, Sparkles, BarChart3 } from 'lucide-react';
import { matches, type Match } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';

const statusColors: Record<string, string> = {
  live: 'oklch(0.65 0.22 240)',
  upcoming: 'oklch(0.78 0.16 85)',
  completed: 'oklch(0.65 0.015 260)',
};

const statusLabels: Record<string, string> = {
  live: '● LIVE',
  upcoming: 'UPCOMING',
  completed: 'COMPLETED',
};

export default function MatchExplorerPage() {
  const { setView, setSearchQuery } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const filtered = useMemo(() => {
    return matches.filter(m => {
      const matchSearch = m.teamA.toLowerCase().includes(search.toLowerCase()) ||
        m.teamB.toLowerCase().includes(search.toLowerCase()) ||
        m.competition.toLowerCase().includes(search.toLowerCase()) ||
        m.venue.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Match Explorer</h1>
        <p className="text-sm text-muted-foreground">Browse, search, and analyze cricket matches across competitions.</p>
      </motion.div>

      {/* Search + Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by team, competition, or venue..."
            className="pl-9 bg-muted/50 border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'live', 'upcoming', 'completed'] as const).map(s => (
            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm"
              className={statusFilter === s ? 'bg-[oklch(0.65_0.22_240)] text-white text-xs' : 'text-xs border-border/50'}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All' : statusLabels[s]}
              {s === 'live' && matches.filter(m => m.status === 'live').length > 0 && (
                <span className="ml-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Live matches banner */}
      {matches.some(m => m.status === 'live') && statusFilter !== 'completed' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="p-3 rounded-xl bg-[oklch(0.65_0.22_240/8)] border border-[oklch(0.65_0.22_240/20)] flex items-center gap-3">
            <Zap size={16} className="text-[oklch(0.65_0.22_240)] animate-pulse" />
            <span className="text-sm text-[oklch(0.65_0.22_240)] font-medium">
              {matches.filter(m => m.status === 'live').length} live match{matches.filter(m => m.status === 'live').length > 1 ? 'es' : ''} in progress
            </span>
          </div>
        </motion.div>
      )}

      {/* Match cards */}
      <div className="space-y-3">
        {filtered.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * Math.min(i, 8) }}
            whileHover={{ x: 4 }}
            onClick={() => setSelectedMatch(m)}
          >
            <Card className="glass border-border/50 hover:border-[oklch(0.65_0.22_240/30)] transition-all duration-300 cursor-pointer">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{m.competition}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]" style={{
                    borderColor: `${statusColors[m.status]}40`,
                    color: statusColors[m.status],
                  }}>
                    {statusLabels[m.status]}
                  </Badge>
                </div>

                <div className="flex items-center">
                  {/* Team A */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{m.flagA}</span>
                      <span className="font-semibold text-sm">{m.teamA}</span>
                    </div>
                    {m.scoreA && (
                      <p className="text-lg font-mono font-bold text-[oklch(0.65_0.22_240)] ml-8">{m.scoreA}</p>
                    )}
                  </div>

                  {/* Center info */}
                  <div className="px-4 md:px-8 text-center shrink-0">
                    {m.status === 'live' ? (
                      <div>
                        <p className="text-xs text-[oklch(0.65_0.22_240)] font-medium">Day 2</p>
                        <p className="text-[10px] text-muted-foreground">Session 3</p>
                      </div>
                    ) : m.status === 'completed' ? (
                      <div>
                        <p className="text-[10px] text-muted-foreground">{m.date}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-muted-foreground">{m.date}</p>
                        <p className="text-[10px] text-[oklch(0.78_0.16_85)]">vs</p>
                      </div>
                    )}
                  </div>

                  {/* Team B */}
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <span className="font-semibold text-sm">{m.teamB}</span>
                      <span className="text-xl">{m.flagB}</span>
                    </div>
                    {m.scoreB && (
                      <p className="text-lg font-mono font-bold text-[oklch(0.65_0.22_240)] mr-8">{m.scoreB}</p>
                    )}
                  </div>
                </div>

                {/* Bottom info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3 pt-3 border-t border-border/30">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {m.venue}</span>
                    <span className="flex items-center gap-1"><Calendar size={10} /> {m.date}</span>
                  </div>
                  {m.motm && (
                    <Badge variant="outline" className="text-[10px] border-[oklch(0.78_0.16_85/30)] text-[oklch(0.78_0.16_85)] self-start sm:self-auto">
                      ⭐ MOTM: {m.motm}
                    </Badge>
                  )}
                </div>

                {m.result && (
                  <p className="text-xs text-[oklch(0.78_0.16_85)] mt-2 font-medium">{m.result}</p>
                )}

                {/* Highlights tags */}
                {m.highlights && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.highlights.map(h => (
                      <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{h}</span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Match Detail Drawer */}
      <AnimatePresence>
      {selectedMatch && (
        <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedMatch(null)} />
          <motion.div
            className="relative w-full max-w-md bg-[oklch(0.16_0.018_260)] border-l border-border/50 overflow-y-auto no-scrollbar"
            initial={{ x: '100%' }} animate={{ x: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="p-6 space-y-6">
              <button className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80"
                onClick={() => setSelectedMatch(null)}
              >✕</button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-3">{selectedMatch.competition}</p>
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <span className="text-3xl block mb-2">{selectedMatch.flagA}</span>
                    <p className="font-bold">{selectedMatch.teamA}</p>
                    {selectedMatch.scoreA && <p className="text-lg font-mono text-[oklch(0.65_0.22_240)] mt-1">{selectedMatch.scoreA}</p>}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{selectedMatch.date}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{selectedMatch.venue}</p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl block mb-2">{selectedMatch.flagB}</span>
                    <p className="font-bold">{selectedMatch.teamB}</p>
                    {selectedMatch.scoreB && <p className="text-lg font-mono text-[oklch(0.65_0.22_240)] mt-1">{selectedMatch.scoreB}</p>}
                  </div>
                </div>
              </div>

              {selectedMatch.result && (
                <div className="p-4 rounded-xl bg-[oklch(0.78_0.16_85/10)] border border-[oklch(0.78_0.16_85/20)] text-center">
                  <p className="text-sm font-medium text-[oklch(0.78_0.16_85)]">{selectedMatch.result}</p>
                  {selectedMatch.motm && <p className="text-xs text-muted-foreground mt-1">Man of the Match: {selectedMatch.motm}</p>}
                </div>
              )}

              {selectedMatch.highlights && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Key Highlights</h3>
                  <div className="space-y-2">
                    {selectedMatch.highlights.map(h => (
                      <div key={h} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                        <Zap size={12} className="text-[oklch(0.78_0.16_85)]" />
                        <span className="text-sm">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button className="flex-1 bg-[oklch(0.65_0.22_240)] hover:bg-[oklch(0.58_0.24_240)] text-white" onClick={() => { setSelectedMatch(null); setView('analytics'); }}>
                  <BarChart3 size={14} className="mr-1.5" />Full Analysis
                </Button>
                <Button variant="outline" className="flex-1 border-border/50" onClick={() => { setSelectedMatch(null); setSearchQuery(`Analyze ${selectedMatch.teamA} vs ${selectedMatch.teamB} - ${selectedMatch.competition}`); setView('chat'); }}>
                  <Sparkles size={14} className="mr-1.5 text-[oklch(0.78_0.16_85)]" />Ask AI
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