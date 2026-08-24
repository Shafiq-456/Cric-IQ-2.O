'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ArrowLeftRight } from 'lucide-react';
import { players } from '@/data/mockData';

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

function generateRadarData(p1: typeof players[0], p2: typeof players[0]) {
  const normalize = (val: number, max: number) => Math.min(Math.round((val / max) * 100), 100);
  const isBowler1 = p1.role === 'Bowler';
  const isBowler2 = p2.role === 'Bowler';

  if (isBowler1 && isBowler2) {
    return [
      { subject: 'Wickets', A: normalize(p1.wickets, 200), B: normalize(p2.wickets, 200) },
      { subject: 'Average', A: normalize(40 - p1.average, 40), B: normalize(40 - p2.average, 40) },
      { subject: 'Economy', A: normalize(5 - p1.economy, 5), B: normalize(5 - p2.economy, 5) },
      { subject: 'Rating', A: normalize(p1.rating, 10), B: normalize(p2.rating, 10) },
      { subject: 'ICC Rank', A: normalize(20 - p1.iccRanking, 20), B: normalize(20 - p2.iccRanking, 20) },
      { subject: 'Matches', A: normalize(p1.matches, 120), B: normalize(p2.matches, 120) },
    ];
  }

  return [
    { subject: 'Runs', A: normalize(p1.runs, 15000), B: normalize(p2.runs, 15000) },
    { subject: 'Average', A: normalize(p1.average, 70), B: normalize(p2.average, 70) },
    { subject: 'Strike Rate', A: normalize(p1.strikeRate, 100), B: normalize(p2.strikeRate, 100) },
    { subject: 'Rating', A: normalize(p1.rating, 10), B: normalize(p2.rating, 10) },
    { subject: 'ICC Rank', A: normalize(20 - p1.iccRanking, 20), B: normalize(20 - p2.iccRanking, 20) },
    { subject: 'Matches', A: normalize(p1.matches, 300), B: normalize(p2.matches, 300) },
  ];
}

function generateBarData(p1: typeof players[0], p2: typeof players[0]) {
  const k1 = p1.name.split(' ').pop() || p1.name;
  const k2 = p2.name.split(' ').pop() || p2.name;
  return [
    { metric: 'Matches', [k1]: p1.matches, [k2]: p2.matches },
    { metric: 'Rating', [k1]: p1.rating, [k2]: p2.rating },
  ];
}

export default function ComparePage() {
  const [p1Idx, setP1Idx] = useState(0);
  const [p2Idx, setP2Idx] = useState(1);
  const p1 = players[p1Idx];
  const p2 = players[p2Idx];
  const radarData = generateRadarData(p1, p2);
  const barData = generateBarData(p1, p2);

  const swap = () => { setP1Idx(p2Idx); setP2Idx(p1Idx); };

  const headToHead = [
    { metric: 'Career Runs', v1: p1.runs.toLocaleString(), v2: p2.runs.toLocaleString(), better: p1.runs > p2.runs ? 1 : 2 },
    { metric: 'Average', v1: p1.average.toString(), v2: p2.average.toString(), better: p1.average > p2.average ? 1 : 2 },
    { metric: 'Rating', v1: p1.rating.toString(), v2: p2.rating.toString(), better: p1.rating > p2.rating ? 1 : 2 },
    { metric: 'ICC Ranking', v1: `#${p1.iccRanking}`, v2: `#${p2.iccRanking}`, better: p1.iccRanking < p2.iccRanking ? 1 : 2 },
    { metric: 'Matches', v1: p1.matches.toString(), v2: p2.matches.toString(), better: p1.matches > p2.matches ? 1 : 2 },
    { metric: 'Wickets', v1: p1.wickets.toString(), v2: p2.wickets.toString(), better: p1.wickets > p2.wickets ? 1 : 2 },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Player Comparison</h1>
        <p className="text-sm text-muted-foreground">Side-by-side multi-dimensional player analysis.</p>
      </motion.div>

      {/* Player selectors */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex items-center gap-4"
      >
        <div className="flex-1">
          <select
            className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[oklch(0.65_0.22_240/50)] cursor-pointer"
            value={p1Idx}
            onChange={(e) => {
              const idx = Number(e.target.value);
              if (idx !== p2Idx) setP1Idx(idx);
            }}
          >
            {players.map((p, i) => (
              <option key={p.id} value={i} disabled={i === p2Idx}>{p.flag} {p.name} — {p.role}{i === p2Idx ? ' (selected)' : ''}</option>
            ))}
          </select>
        </div>
        <Button variant="outline" size="icon" className="shrink-0 border-border/50" onClick={swap}>
          <ArrowLeftRight size={16} className="text-muted-foreground" />
        </Button>
        <div className="flex-1">
          <select
            className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[oklch(0.65_0.22_240/50)] cursor-pointer"
            value={p2Idx}
            onChange={(e) => {
              const idx = Number(e.target.value);
              if (idx !== p1Idx) setP2Idx(idx);
            }}
          >
            {players.map((p, i) => (
              <option key={p.id} value={i} disabled={i === p1Idx}>{p.flag} {p.name} — {p.role}{i === p1Idx ? ' (selected)' : ''}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Player cards row */}
      <div className="grid grid-cols-2 gap-4">
        {[p1, p2].map((p, idx) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + idx * 0.05 }}>
            <Card className="glass border-border/50">
              <CardContent className="p-5 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[oklch(0.65_0.22_240/30)] to-[oklch(0.78_0.16_85/30)] flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {p.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{p.flag} {p.country} · {p.role}</p>
                <div className="flex justify-center gap-4 mt-4">
                  <div>
                    <p className="text-lg font-bold text-[oklch(0.65_0.22_240)]">{p.role === 'Bowler' ? p.wickets : p.runs.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{p.role === 'Bowler' ? 'Wickets' : 'Runs'}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[oklch(0.78_0.16_85)]">{p.average}</p>
                    <p className="text-[10px] text-muted-foreground">Average</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[oklch(0.72_0.18_170)]">#{p.iccRanking}</p>
                    <p className="text-[10px] text-muted-foreground">ICC Rank</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Radar Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Multi-Dimensional Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius={100}>
                  <PolarGrid stroke="oklch(0.95 0.01 240 / 10%)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'oklch(0.65 0.015 260)' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: 'oklch(0.65 0.015 260)' }} />
                  <Radar name={p1.name} dataKey="A" stroke="oklch(0.65 0.22 240)" fill="oklch(0.65 0.22 240)" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name={p2.name} dataKey="B" stroke="oklch(0.78 0.16 85)" fill="oklch(0.78 0.16 85)" fillOpacity={0.15} strokeWidth={2} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Head to Head table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="glass border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Head-to-Head Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {headToHead.map((row) => (
                <div key={row.metric} className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
                  <span className={`text-sm font-mono font-medium flex-1 text-right transition-colors ${
                    row.better === 1 ? 'text-[oklch(0.65_0.22_240)]' : 'text-foreground/70'
                  }`}>{row.v1}</span>
                  <div className="w-28 text-center shrink-0">
                    <span className="text-xs text-muted-foreground">{row.metric}</span>
                  </div>
                  <span className={`text-sm font-mono font-medium flex-1 transition-colors ${
                    row.better === 2 ? 'text-[oklch(0.78_0.16_85)]' : 'text-foreground/70'
                  }`}>{row.v2}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bar comparison */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Visual Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'oklch(0.65 0.015 260)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'oklch(0.65 0.015 260)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey={p1.name.split(' ').pop() || p1.name} fill="oklch(0.65 0.22 240)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey={p2.name.split(' ').pop() || p2.name} fill="oklch(0.78 0.16 85)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}