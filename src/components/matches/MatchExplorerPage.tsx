'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search, MapPin, Calendar, Zap, Trophy, Sparkles, BarChart3,
  RefreshCw, Wifi, WifiOff,
} from 'lucide-react';
import { type Match } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';

const AUTO_REFRESH_MS = 30_000; // 30 seconds

const statusColors: Record<string, string> = {
  live:      'oklch(0.65 0.22 240)',
  upcoming:  'oklch(0.78 0.16 85)',
  completed: 'oklch(0.65 0.015 260)',
};

const statusLabels: Record<string, string> = {
  live:      '● LIVE',
  upcoming:  'UPCOMING',
  completed: 'COMPLETED',
};

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <Card className="glass border-border/50">
      <CardContent className="p-4 md:p-5 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-40 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-6 w-20 rounded bg-muted ml-8" />
          </div>
          <div className="px-8 text-center shrink-0 space-y-1">
            <div className="h-3 w-16 rounded bg-muted mx-auto" />
            <div className="h-3 w-8 rounded bg-muted mx-auto" />
          </div>
          <div className="flex-1 space-y-2 items-end flex flex-col">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-6 w-20 rounded bg-muted mr-8" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
          <div className="h-3 w-36 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function MatchExplorerPage() {
  const { setView, setSearchQuery } = useAppStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // ── Data state ──────────────────────────────────────────────────────────────
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<'live' | 'mock'>('mock');
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch matches from our secure server route ───────────────────────────────
  const fetchMatches = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res  = await fetch('/api/matches', { cache: 'no-store' });
      const json = await res.json();
      setMatches(json.matches ?? []);
      setDataSource(json.source ?? 'mock');
      setFetchedAt(new Date());
      setSecondsAgo(0);
    } catch {
      // silently keep existing data on network error
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // ── Auto-refresh every 30 s ──────────────────────────────────────────────────
  useEffect(() => {
    fetchMatches();
    intervalRef.current = setInterval(() => fetchMatches(), AUTO_REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchMatches]);

  // ── "X seconds ago" counter ──────────────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      setSecondsAgo(s => s + 1);
    }, 1000);
    return () => clearInterval(tick);
  }, [fetchedAt]);

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return matches.filter(m => {
      const matchSearch =
        m.teamA.toLowerCase().includes(search.toLowerCase()) ||
        m.teamB.toLowerCase().includes(search.toLowerCase()) ||
        m.competition.toLowerCase().includes(search.toLowerCase()) ||
        m.venue.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [matches, search, statusFilter]);

  const liveCount = matches.filter(m => m.status === 'live').length;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Match Explorer</h1>
          <p className="text-sm text-muted-foreground">Browse, search, and analyze cricket matches across competitions.</p>
        </div>

        {/* Data source badge + refresh */}
        <div className="flex items-center gap-2 shrink-0">
          {!loading && (
            <Badge variant="outline"
              className="text-[10px] gap-1"
              style={{
                borderColor: dataSource === 'live' ? 'oklch(0.65 0.22 240 / 40%)' : 'oklch(0.78 0.16 85 / 40%)',
                color:        dataSource === 'live' ? 'oklch(0.65 0.22 240)' : 'oklch(0.65 0.15 85)',
              }}
            >
              {dataSource === 'live'
                ? <><Wifi size={9} /> Live data</>
                : <><WifiOff size={9} /> Demo data</>
              }
              {fetchedAt && <span className="opacity-60">· {secondsAgo}s ago</span>}
            </Badge>
          )}
          <Button
            variant="outline" size="icon"
            className="h-7 w-7 border-border/50"
            disabled={isRefreshing || loading}
            onClick={() => fetchMatches(true)}
            title="Refresh now"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          </Button>
        </div>
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
              {s === 'live' && liveCount > 0 && (
                <span className="ml-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Live matches banner */}
      {liveCount > 0 && statusFilter !== 'completed' && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="p-3 rounded-xl bg-[oklch(0.65_0.22_240/8)] border border-[oklch(0.65_0.22_240/20)] flex items-center gap-3">
            <Zap size={16} className="text-[oklch(0.65_0.22_240)] animate-pulse" />
            <span className="text-sm text-[oklch(0.65_0.22_240)] font-medium">
              {liveCount} live match{liveCount > 1 ? 'es' : ''} in progress — scores update every 30s
            </span>
          </div>
        </motion.div>
      )}

      {/* Demo-mode notice */}
      {!loading && dataSource === 'mock' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="p-3 rounded-xl bg-[oklch(0.78_0.16_85/8)] border border-[oklch(0.78_0.16_85/20)] flex items-center gap-3">
            <WifiOff size={14} className="text-[oklch(0.78_0.16_85)] shrink-0" />
            <span className="text-xs text-[oklch(0.78_0.16_85)]">
              Showing demo data. Add your free <strong>CRICAPI_KEY</strong> in <code>.env</code> to enable live scores.
              Get one free at{' '}
              <a href="https://cricapi.com" target="_blank" rel="noopener noreferrer"
                className="underline underline-offset-2">cricapi.com</a>.
            </span>
          </div>
        </motion.div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
              <SkeletonCard />
            </motion.div>
          ))}
        </div>
      )}

      {/* Match cards */}
      {!loading && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16 text-muted-foreground text-sm"
            >
              No matches found for your search.
            </motion.div>
          ) : (
            filtered.map((m, i) => (
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
                            <p className="text-xs text-[oklch(0.65_0.22_240)] font-medium animate-pulse">LIVE</p>
                            <p className="text-[10px] text-muted-foreground">In Progress</p>
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
                    {m.highlights && m.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {m.highlights.map(h => (
                          <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{h}</span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}

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

                {selectedMatch.highlights && selectedMatch.highlights.length > 0 && (
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
                  <Button className="flex-1 bg-[oklch(0.65_0.22_240)] hover:bg-[oklch(0.58_0.24_240)] text-white"
                    onClick={() => { setSelectedMatch(null); setView('analytics'); }}
                  >
                    <BarChart3 size={14} className="mr-1.5" />Full Analysis
                  </Button>
                  <Button variant="outline" className="flex-1 border-border/50"
                    onClick={() => {
                      setSelectedMatch(null);
                      setSearchQuery(`Analyze ${selectedMatch.teamA} vs ${selectedMatch.teamB} - ${selectedMatch.competition}`);
                      setView('chat');
                    }}
                  >
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