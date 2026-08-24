'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, BarChart3, Sparkles, GitCompareArrows, Zap,
  ArrowUpRight, Clock, Loader2,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { matches, trendingPlayers, quickActions, battingTimeline } from '@/data/mockData';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserStats {
  savedPlayersCount: number;
  aiQueriesToday: number;
  documentsAnalyzed: number;
  recentSearches: string[];
}

// ─── Animation variant ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

const quickActionIcons: Record<string, typeof TrendingUp> = {
  GitCompareArrows, BarChart3, Sparkles, TrendingUp,
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
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

// ─── Empty state for personal stats ──────────────────────────────────────────

function StatCard({
  label,
  value,
  loading,
  color,
  view,
  isPersonal,
}: {
  label: string;
  value: string | number;
  loading: boolean;
  color: string;
  view: 'matches' | 'players' | 'chat' | 'settings';
  isPersonal: boolean;
}) {
  const { setView } = useAppStore();
  return (
    <Card
      className="glass border-border/50 hover:border-[oklch(0.65_0.22_240/30)] transition-all duration-300 cursor-pointer"
      onClick={() => setView(view)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{label}</span>
          <ArrowUpRight size={14} className="text-[oklch(0.72_0.18_170)]" />
        </div>
        {loading ? (
          <div className="flex items-center gap-2 h-8">
            <Loader2 size={16} className="animate-spin text-muted-foreground/50" />
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            {isPersonal && Number(value) === 0 && (
              <p className="text-[10px] text-muted-foreground/50 mt-1">Get started →</p>
            )}
            {(!isPersonal || Number(value) > 0) && (
              <p className="text-[10px] text-[oklch(0.72_0.18_170)] mt-1">
                {isPersonal ? 'your total' : 'global'}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { setView, user, setSearchQuery } = useAppStore();
  const { getIdToken, user: authUser } = useFirebaseAuth();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch this user's personal stats from the API
  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      // Guest users have no DB records — show zeros immediately
      if (authUser?.isGuest) {
        setStats({ savedPlayersCount: 0, aiQueriesToday: 0, documentsAnalyzed: 0, recentSearches: [] });
        setStatsLoading(false);
        return;
      }

      const token = await getIdToken();
      if (!token) {
        setStatsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/user/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: UserStats = await res.json();
        if (!cancelled) setStats(data);
      } catch (err) {
        console.warn('[Dashboard] Failed to fetch user stats:', err);
        // Show zeros on error — don't show fake data
        if (!cancelled) setStats({ savedPlayersCount: 0, aiQueriesToday: 0, documentsAnalyzed: 0, recentSearches: [] });
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, [authUser, getIdToken]);

  // ── Live match count derived from global match data (this IS global data) ──
  const liveMatchCount = matches.filter(m => m.status === 'live').length;
  const upcomingMatchCount = matches.filter(m => m.status !== 'completed').length;

  // ── Query distribution from real stats (gracefully empty for new users) ───
  const hasQueries = stats && (stats.aiQueriesToday > 0 || stats.savedPlayersCount > 0);
  const pieData = hasQueries
    ? [
        { name: 'Player queries', value: Math.max(1, stats!.savedPlayersCount), color: 'oklch(0.65 0.22 240)' },
        { name: 'AI queries', value: Math.max(1, stats!.aiQueriesToday), color: 'oklch(0.78 0.16 85)' },
        { name: 'Documents', value: Math.max(1, stats!.documentsAnalyzed), color: 'oklch(0.72 0.18 170)' },
      ]
    : [
        { name: 'No queries yet', value: 1, color: 'oklch(0.3 0.01 260)' },
      ];

  // ── Recent searches: real user data, or empty for new users ──────────────
  const displayedSearches = stats?.recentSearches ?? [];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s your cricket intelligence briefing for today.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3" initial="hidden" animate="visible">
        {quickActions.map((action, i) => {
          const Icon = quickActionIcons[action.icon] || Zap;
          const targetView = {
            'Compare Players': 'compare',
            'Match Analysis': 'analytics',
            'Ask AI': 'chat',
            'Player Stats': 'players',
          }[action.label] as 'compare' | 'analytics' | 'chat' | 'players';
          return (
            <motion.div key={action.label} variants={fadeUp} custom={i}>
              <Card
                className="glass border-border/50 hover:border-[oklch(0.65_0.22_240/30)] transition-all duration-300 cursor-pointer group"
                onClick={() => setView(targetView)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon size={18} className={action.color} />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Stats row — Personal (🔒) vs Global (🌐) clearly separated */}
      <div className="space-y-2">
        {/* Section label */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.65_0.22_240)]" />
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Global</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.18_170)]" />
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Your Data</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* GLOBAL — live match count comes from global match data */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StatCard
              label="Live & Upcoming Matches"
              value={upcomingMatchCount}
              loading={false}
              color="oklch(0.65 0.22 240)"
              view="matches"
              isPersonal={false}
            />
          </motion.div>

          {/* PERSONAL — real per-user data from /api/user/stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <StatCard
              label="Players Tracked"
              value={stats?.savedPlayersCount ?? 0}
              loading={statsLoading}
              color="oklch(0.78 0.16 85)"
              view="players"
              isPersonal
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <StatCard
              label="AI Queries Today"
              value={stats?.aiQueriesToday ?? 0}
              loading={statsLoading}
              color="oklch(0.72 0.18 170)"
              view="chat"
              isPersonal
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
            <StatCard
              label="Documents Analyzed"
              value={stats?.documentsAnalyzed ?? 0}
              loading={statsLoading}
              color="oklch(0.7 0.2 300)"
              view="settings"
              isPersonal
            />
          </motion.div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance chart — GLOBAL cricket data (Virat Kohli historical) */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Performance Trend — Virat Kohli (Test)
                </CardTitle>
                <Badge variant="outline" className="text-[10px] border-border/50">2018–2026</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={battingTimeline}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.65 0.22 240)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.65 0.22 240)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'oklch(0.65 0.015 260)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'oklch(0.65 0.015 260)' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="runs" stroke="oklch(0.65 0.22 240)" fill="url(#areaGrad)" strokeWidth={2} name="Runs" />
                    <Area type="monotone" dataKey="avg" stroke="oklch(0.78 0.16 85)" fill="transparent" strokeWidth={2} name="Average" strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Query distribution — YOUR data (empty state for new users) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        >
          <Card className="glass border-border/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Your Query Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex flex-col items-center justify-center">
              {statsLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-muted-foreground/40" />
                </div>
              ) : !hasQueries ? (
                <div className="h-48 flex flex-col items-center justify-center gap-3 text-center px-4">
                  <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center">
                    <Sparkles size={22} className="text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground/60">No queries yet</p>
                    <p className="text-[11px] text-muted-foreground/40 mt-1 leading-relaxed">
                      Ask the AI a question to see your usage breakdown here.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[oklch(0.65_0.22_240)]"
                    onClick={() => setView('chat')}
                  >
                    Ask AI <ArrowUpRight size={12} className="ml-1" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 justify-center">
                    {pieData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        {d.name}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming matches — GLOBAL data */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Upcoming &amp; Live Matches</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-[oklch(0.65_0.22_240)]" onClick={() => setView('matches')}>
                  View All <ArrowUpRight size={12} className="ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {matches.filter(m => m.status !== 'completed').slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setView('matches')}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg">{m.flagA}</span>
                    <span className="text-sm font-medium truncate">{m.teamA}</span>
                  </div>
                  <div className="text-center shrink-0">
                    {m.status === 'live' ? (
                      <Badge className="bg-[oklch(0.65_0.22_240/15)] text-[oklch(0.65_0.22_240)] text-[10px]">LIVE</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">{m.date.slice(5)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="text-sm font-medium truncate">{m.teamB}</span>
                    <span className="text-lg">{m.flagB}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Trending players (global) + Recent searches (YOUR data) */}
        <div className="space-y-6">
          {/* Trending Players — GLOBAL */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <Card className="glass border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Trending Players</CardTitle>
                  <Button variant="ghost" size="sm" className="text-xs text-[oklch(0.65_0.22_240)]" onClick={() => setView('players')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {trendingPlayers.slice(0, 4).map((p, i) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => { setSearchQuery(p.name); setView('players'); }}
                  >
                    <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_240/20)] to-[oklch(0.78_0.16_85/20)] flex items-center justify-center text-xs font-bold">
                      {p.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.reason}</p>
                    </div>
                    <span className="text-xs text-[oklch(0.72_0.18_170)] font-medium">{p.trend}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Searches — YOUR data (empty state for new users) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="glass border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Your Recent Searches</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center gap-2 py-4 px-1">
                    <Loader2 size={13} className="animate-spin text-muted-foreground/40 shrink-0" />
                    <span className="text-xs text-muted-foreground/40">Loading…</span>
                  </div>
                ) : displayedSearches.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-4 text-center">
                    <Clock size={20} className="text-muted-foreground/25" />
                    <p className="text-xs text-muted-foreground/40 leading-relaxed">
                      Your search history will appear here.<br />
                      <button
                        className="text-[oklch(0.65_0.22_240)] hover:underline mt-1"
                        onClick={() => setView('chat')}
                      >
                        Ask the AI something →
                      </button>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayedSearches.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                        onClick={() => { setSearchQuery(s); setView('chat'); }}
                      >
                        <Clock size={13} className="text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate">{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}