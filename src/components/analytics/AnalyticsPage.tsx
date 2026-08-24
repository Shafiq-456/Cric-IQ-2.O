'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, Legend,
} from 'recharts';
import { TrendingUp, Target, Zap, Award, Calendar } from 'lucide-react';
import { battingTimeline, bowlingTimeline, players } from '@/data/mockData';

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

const radarData = [
  { subject: 'Batting Avg', A: 92, B: 88 },
  { subject: 'Strike Rate', A: 78, B: 65 },
  { subject: 'Consistency', A: 85, B: 90 },
  { subject: 'Big Innings', A: 88, B: 82 },
  { subject: 'Away Perf', A: 72, B: 95 },
  { subject: '4th Innings', A: 65, B: 78 },
];

const formatComparison = [
  { metric: 'Test Average', kohli: '58.07', smith: '58.61', diff: '-0.54', better: 'smith' as const },
  { metric: 'Centuries', kohli: '50', smith: '35', diff: '+15', better: 'kohli' as const },
  { metric: 'Away Average', kohli: '47.82', smith: '60.12', diff: '-12.30', better: 'smith' as const },
  { metric: 'vs Top Teams Avg', kohli: '52.45', smith: '56.78', diff: '-4.33', better: 'smith' as const },
  { metric: '4th Innings Avg', kohli: '32.18', smith: '48.32', diff: '-16.14', better: 'smith' as const },
  { metric: 'Conversion Rate', kohli: '57%', smith: '43%', diff: '+14%', better: 'kohli' as const },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('all');

  const filteredBatting = useMemo(() => {
    if (timeRange === 'all') return battingTimeline;
    const count = timeRange === '1y' ? 2 : timeRange === '6m' ? 1 : 1;
    return battingTimeline.slice(-count);
  }, [timeRange]);

  const filteredBowling = useMemo(() => {
    if (timeRange === 'all') return bowlingTimeline;
    const count = timeRange === '1y' ? 2 : timeRange === '6m' ? 1 : 1;
    return bowlingTimeline.slice(-count);
  }, [timeRange]);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Analytics</h1>
            <p className="text-sm text-muted-foreground">Performance analysis, trends, and deep insights.</p>
          </div>
          <div className="flex items-center gap-2">
            {['all', '1y', '6m', '3m'].map((r) => (
              <Button key={r} variant={timeRange === r ? 'default' : 'ghost'} size="sm"
                className={timeRange === r ? 'bg-[oklch(0.65_0.22_240)] text-white' : 'text-xs'}
                onClick={() => setTimeRange(r)}
              >
                {r === 'all' ? 'All Time' : r === '1y' ? '1 Year' : r === '6m' ? '6 Months' : '3 Months'}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="bg-muted/50 border border-border/50">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="bowling">Bowling</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Runs', value: '13,906', change: '+1,589', trend: 'up', icon: Target },
              { label: 'Test Average', value: '58.07', change: '+8.2', trend: 'up', icon: TrendingUp },
              { label: 'Centuries', value: '50', change: '+8', trend: 'up', icon: Award },
              { label: 'Matches', value: '292', change: '24', trend: 'neutral', icon: Calendar },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="glass border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <s.icon size={16} className="text-[oklch(0.65_0.22_240)]" />
                      {s.trend === 'up' && <TrendingUp size={14} className="text-[oklch(0.72_0.18_170)]" />}
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                    {s.change && (
                      <p className="text-[10px] text-[oklch(0.72_0.18_170)] mt-0.5">{s.change} this period</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Batting timeline chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Batting Performance Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredBatting}>
                      <defs>
                        <linearGradient id="runsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.65 0.22 240)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.65 0.22 240)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.78 0.16 85)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.78 0.16 85)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'oklch(0.65 0.015 260)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'oklch(0.65 0.015 260)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="runs" stroke="oklch(0.65 0.22 240)" fill="url(#runsGrad)" strokeWidth={2} name="Runs" />
                      <Area type="monotone" dataKey="avg" stroke="oklch(0.78 0.16 85)" fill="url(#avgGrad)" strokeWidth={2} name="Average" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Matches + Strike Rate bar chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Matches Per Year</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredBatting}>
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'oklch(0.65 0.015 260)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'oklch(0.65 0.015 260)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="matches" fill="oklch(0.65 0.22 240)" radius={[6, 6, 0, 0]} name="Matches" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <span className="text-[oklch(0.65_0.22_240)]">Virat Kohli</span> vs <span className="text-[oklch(0.78_0.16_85)]">Steve Smith</span> — Radar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius={90}>
                      <PolarGrid stroke="oklch(0.95 0.01 240 / 10%)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'oklch(0.65 0.015 260)' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: 'oklch(0.65 0.015 260)' }} />
                      <Radar name="Kohli" dataKey="A" stroke="oklch(0.65 0.22 240)" fill="oklch(0.65 0.22 240)" fillOpacity={0.15} strokeWidth={2} />
                      <Radar name="Smith" dataKey="B" stroke="oklch(0.78 0.16 85)" fill="oklch(0.78 0.16 85)" fillOpacity={0.15} strokeWidth={2} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Comparison table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="glass border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Head-to-Head Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {formatComparison.map((row) => (
                    <div key={row.metric} className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
                      <span className="text-xs text-muted-foreground w-36 shrink-0">{row.metric}</span>
                      <span className={`text-sm font-mono font-medium flex-1 text-right ${
                        row.better === 'kohli' ? 'text-[oklch(0.65_0.22_240)]' : ''
                      }`}>{row.kohli}</span>
                      <div className="w-16 text-center">
                        <Badge variant="outline" className={`text-[10px] ${
                          row.better === 'kohli' ? 'border-[oklch(0.65_0.22_240/30)] text-[oklch(0.65_0.22_240)]' :
                          'border-[oklch(0.78_0.16_85/30)] text-[oklch(0.78_0.16_85)]'
                        }`}>{row.diff}</Badge>
                      </div>
                      <span className={`text-sm font-mono font-medium flex-1 ${
                        row.better === 'smith' ? 'text-[oklch(0.78_0.16_85)]' : ''
                      }`}>{row.smith}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Bowling Tab */}
        <TabsContent value="bowling" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Bowling Timeline — Jasprit Bumrah</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredBowling}>
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'oklch(0.65 0.015 260)' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'oklch(0.65 0.015 260)' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="wickets" stroke="oklch(0.65 0.22 240)" strokeWidth={2} dot={{ r: 4 }} name="Wickets" />
                      <Line type="monotone" dataKey="avg" stroke="oklch(0.78 0.16 85)" strokeWidth={2} dot={{ r: 4 }} name="Average" />
                      <Line type="monotone" dataKey="economy" stroke="oklch(0.72 0.18 170)" strokeWidth={2} dot={{ r: 4 }} name="Economy" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top bowlers */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="glass border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Top Rated Bowlers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {players.filter(p => p.role === 'Bowler' || p.role === 'All-rounder').sort((a, b) => b.rating - a.rating).slice(0, 5).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                    <span className="text-xs font-mono text-muted-foreground w-4">#{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_240/20)] to-[oklch(0.78_0.16_85/20)] flex items-center justify-center text-xs font-bold">
                      {p.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.flag} {p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.wickets} wickets · {p.economy > 0 ? `Econ ${p.economy}` : `Avg ${p.average}`}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[oklch(0.65_0.22_240)]">{p.rating}</p>
                      <p className="text-[10px] text-muted-foreground">ICC #{p.iccRanking}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}