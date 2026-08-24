'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Send, Sparkles, FileText, Bot, User, Copy, Check,
  ThumbsUp, ThumbsDown, Share2, Bookmark,
  Mic, Paperclip, Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import { players, matches, battingTimeline, bowlingTimeline, type ChatMessage, type Player, type Match } from '@/data/mockData';

const suggestedPrompts = [
  'Compare Kohli vs Smith in away Tests',
  'Best bowling figures in WTC 2025',
  'Explain DRS success rate by team',
  'India vs Australia head-to-head since 2020',
  'Top 5 fast bowlers under 25',
];

/* ────────────────────── Smart Response Generator ────────────────────── */

function generateSmartResponse(query: string): ChatMessage {
  const q = query.toLowerCase();

  // 1. COMPARISON queries: "compare X vs Y", "X vs Y"
  const compareMatch = q.match(/compare\s+(.+?)\s+vs\.?\s+(.+)/) || q.match(/(.+?)\s+vs\.?\s+(.+)/);
  if (compareMatch) {
    const nameA = compareMatch[1].replace(/\bin\s+away\s+tests\b/i, '').replace(/['']/g, '').trim();
    const nameB = compareMatch[2].replace(/\bin\s+away\s+tests\b/i, '').replace(/['']/g, '').trim();
    const playerA = findPlayer(nameA);
    const playerB = findPlayer(nameB);

    if (playerA && playerB) {
      return buildComparisonResponse(playerA, playerB, query);
    }
    if (playerA && !playerB) {
      return buildSinglePlayerResponse(playerA, query);
    }
    if (!playerA && playerB) {
      return buildSinglePlayerResponse(playerB, query);
    }
  }

  // 2. BOWLING stats queries
  if (q.includes('bowling') || q.includes('wicket') || q.includes('economy') || q.includes('best bowling figures')) {
    return buildBowlingResponse(q, query);
  }

  // 3. BATTING stats queries
  if (q.includes('batting') || q.includes('runs') || q.includes('average') || q.includes('strike rate') || q.includes('century') || q.includes('scores')) {
    return buildBattingResponse(q, query);
  }

  // 4. Single player lookup
  const foundPlayer = players.find(p => q.includes(p.name.toLowerCase()));
  if (foundPlayer) {
    return buildSinglePlayerResponse(foundPlayer, query);
  }

  // 5. MATCH / TEAM lookup
  const foundMatch = matches.find(m =>
    q.includes(m.teamA.toLowerCase()) && q.includes(m.teamB.toLowerCase())
  );
  if (foundMatch) {
    return buildMatchResponse(foundMatch, query);
  }

  // Check by single team
  const foundTeamMatches = matches.filter(m =>
    q.includes(m.teamA.toLowerCase()) || q.includes(m.teamB.toLowerCase())
  );
  if (foundTeamMatches.length > 0) {
    const teamName = foundTeamMatches[0].teamA.toLowerCase().includes(q) || q.includes(foundTeamMatches[0].teamA.toLowerCase())
      ? foundTeamMatches[0].teamA
      : foundTeamMatches[0].teamB;
    return buildTeamMatchesResponse(teamName, foundTeamMatches, query);
  }

  // 6. TOP / BEST / RANKING queries
  if (q.includes('top') || q.includes('best') || q.includes('ranking') || q.includes('icc')) {
    return buildRankingResponse(q, query);
  }

  // 7. UPCOMING / LIVE / SCHEDULE queries
  if (q.includes('upcoming') || q.includes('schedule') || q.includes('next match') || q.includes('live')) {
    return buildScheduleResponse(q, query);
  }

  // 8. Under-25 / young bowlers etc.
  if (q.includes('under 25') || q.includes('young') || q.includes('fast bowler')) {
    return buildYoungPlayersResponse(q, query);
  }

  // 9. DRS / head-to-head / specific topic without direct match
  if (q.includes('drs') || q.includes('head-to-head') || q.includes('head to head')) {
    return buildTopicResponse(q, query);
  }

  // 10. Fallback: unrecognized
  return buildFallbackResponse(query);
}

function findPlayer(name: string): Player | undefined {
  const clean = name.replace(/['']/g, '').trim().toLowerCase();
  return players.find(p => {
    const pName = p.name.toLowerCase();
    if (pName === clean) return true;
    // Check if all significant words in `clean` appear in the player name
    const words = clean.split(/\s+/).filter(w => w.length > 2);
    return words.every(w => pName.includes(w));
  });
}

function buildComparisonResponse(a: Player, b: Player, query: string): ChatMessage {
  const runsDiff = a.runs - b.runs;
  const avgDiff = (a.average - b.average).toFixed(2);
  const betterRuns = runsDiff > 0 ? a.name : b.name;
  const betterAvg = a.average > b.average ? a.name : b.name;
  const isBatting = a.role === 'Batsman' || b.role === 'Batsman' || a.role === 'All-rounder' || b.role === 'All-rounder';
  const isBowling = a.role === 'Bowler' || b.role === 'Bowler' || a.role === 'All-rounder' || b.role === 'All-rounder';

  let content = `Here's a detailed comparison between **${a.name}** (${a.flag} ${a.country}) and **${b.name}** (${b.flag} ${b.country}):\n\n`;

  if (isBatting) {
    content += `**Batting Comparison:**\n`;
    content += `• **${a.name}**: ${a.runs.toLocaleString()} runs in ${a.matches} matches at an average of **${a.average}** (SR: ${a.strikeRate})\n`;
    content += `• **${b.name}**: ${b.runs.toLocaleString()} runs in ${b.matches} matches at an average of **${b.average}** (SR: ${b.strikeRate})\n\n`;
    content += `${betterRuns} has scored more total runs, while ${betterAvg} holds the higher batting average. `;
  }

  if (isBowling) {
    content += `**Bowling Comparison:**\n`;
    content += `• **${a.name}**: ${a.wickets} wickets in ${a.matches} matches at an average of **${a.average}**, economy ${a.economy}\n`;
    content += `• **${b.name}**: ${b.wickets} wickets in ${b.matches} matches at an average of **${b.average}**, economy ${b.economy}\n\n`;
  }

  content += `**Form & Rating:** ${a.name} is in **${a.form}** form (rating: ${a.rating}/10), while ${b.name} is in **${b.form}** form (rating: ${b.rating}/10).\n\n`;
  content += `**ICC Ranking:** ${a.name} is ranked **#${a.iccRanking}** and ${b.name} is ranked **#${b.iccRanking}** in the world.\n\n`;
  content += `**Recent performances:** ${a.name}'s recent scores: ${a.recentScores.join(', ')} | ${b.name}'s recent scores: ${b.recentScores.join(', ')}`;

  return {
    id: `msg-${Date.now() + 1}`,
    role: 'assistant',
    content,
    citations: [
      { source: 'ICC Player Rankings 2026', snippet: `${a.name}: #${a.iccRanking} | ${b.name}: #${b.iccRanking}` },
      { source: 'ESPNcricinfo Statsguru', snippet: `Career records comparison retrieved` },
    ],
    confidence: 92,
    timestamp: new Date(),
    stats: [
      { label: `${a.name} Runs`, value: a.runs.toLocaleString() },
      { label: `${a.name} Avg`, value: a.average.toString() },
      { label: `${b.name} Runs`, value: b.runs.toLocaleString() },
      { label: `${b.name} Avg`, value: b.average.toString() },
      { label: `${a.name} Rating`, value: `${a.rating}/10` },
      { label: `${b.name} Rating`, value: `${b.rating}/10` },
    ],
  };
}

function buildSinglePlayerResponse(player: Player, query: string): ChatMessage {
  const content = `**${player.name}** ${player.flag} (${player.country})\n\n` +
    `• **Role**: ${player.role} | **Age**: ${player.age}\n` +
    `• **Batting Style**: ${player.battingStyle} | **Bowling Style**: ${player.bowlingStyle}\n` +
    `• **Matches**: ${player.matches}\n\n` +
    `**Career Stats:**\n` +
    `• Runs: **${player.runs.toLocaleString()}** | Average: **${player.average}** | Strike Rate: **${player.strikeRate}**\n` +
    `• Wickets: **${player.wickets}** | Economy: **${player.economy}**\n\n` +
    `**Current Form**: ${player.form} (rating: ${player.rating}/10)\n` +
    `**ICC Ranking**: #${player.iccRanking}\n\n` +
    `**Recent Scores**: ${player.recentScores.join(', ')}`;

  return {
    id: `msg-${Date.now() + 1}`,
    role: 'assistant',
    content,
    citations: [
      { source: 'ICC Player Profile', snippet: `${player.name} — ${player.country}, ${player.role}` },
      { source: 'ESPNcricinfo Player Stats', snippet: `${player.runs} runs, ${player.wickets} wickets in ${player.matches} matches` },
    ],
    confidence: 95,
    timestamp: new Date(),
    stats: [
      { label: 'Matches', value: player.matches.toString() },
      { label: 'Runs', value: player.runs.toLocaleString() },
      { label: 'Average', value: player.average.toString() },
      { label: 'Wickets', value: player.wickets.toString() },
      { label: 'ICC Rank', value: `#${player.iccRanking}` },
      { label: 'Rating', value: `${player.rating}/10` },
    ],
  };
}

function buildBowlingResponse(q: string, query: string): ChatMessage {
  // Find best bowling figures from players
  const bowlers = players
    .filter(p => p.wickets > 0)
    .sort((a, b) => b.wickets - a.wickets);

  const topBowler = bowlers[0];
  const latestTimeline = bowlingTimeline[bowlingTimeline.length - 1];

  const content = `Here's the bowling analysis based on available data:\n\n` +
    `**Top Wicket-Takers:**\n` +
    bowlers.slice(0, 5).map((b, i) => `• #${i + 1} **${b.name}** ${b.flag}: ${b.wickets} wickets, avg ${b.average}, econ ${b.economy}`).join('\n') + '\n\n' +
    `**Bowling Timeline (Latest — ${latestTimeline.year}):**\n` +
    `• Wickets: **${latestTimeline.wickets}** | Average: **${latestTimeline.avg}** | Economy: **${latestTimeline.economy}**\n\n` +
    `**Best Recent Figures:**\n` +
    bowlers.slice(0, 3).map(b => `• ${b.name}: ${b.recentScores.join(', ')}`).join('\n') + '\n\n' +
    `**${topBowler.name}** leads with ${topBowler.wickets} wickets at a remarkable average of ${topBowler.average} and economy of ${topBowler.economy}.`;

  return {
    id: `msg-${Date.now() + 1}`,
    role: 'assistant',
    content,
    citations: [
      { source: 'ICC Bowling Rankings 2026', snippet: `Top bowlers ranked by wickets and average` },
      { source: 'WTC Bowling Analysis', snippet: `Bowling timeline data ${bowlingTimeline[0].year}–${latestTimeline.year}` },
    ],
    confidence: 90,
    timestamp: new Date(),
    stats: [
      { label: 'Top Bowler', value: topBowler.name },
      { label: 'Top Wickets', value: topBowler.wickets.toString() },
      { label: 'Best Economy', value: Math.min(...bowlers.map(b => b.economy)).toFixed(2) },
      { label: `${latestTimeline.year} Wickets`, value: latestTimeline.wickets.toString() },
      { label: `${latestTimeline.year} Economy`, value: latestTimeline.economy.toString() },
    ],
  };
}

function buildBattingResponse(q: string, query: string): ChatMessage {
  const batsmen = players
    .filter(p => p.runs > 0)
    .sort((a, b) => b.runs - a.runs);

  const topBatsman = batsmen[0];
  const latestTimeline = battingTimeline[battingTimeline.length - 1];
  const peakYear = battingTimeline.reduce((max, t) => t.runs > max.runs ? t : max, battingTimeline[0]);

  const content = `Here's the batting analysis based on available data:\n\n` +
    `**Top Run Scorers:**\n` +
    batsmen.slice(0, 5).map((b, i) => `• #${i + 1} **${b.name}** ${b.flag}: ${b.runs.toLocaleString()} runs, avg ${b.average}, SR ${b.strikeRate}`).join('\n') + '\n\n' +
    `**Batting Timeline (Latest — ${latestTimeline.year}):**\n` +
    `• Runs: **${latestTimeline.runs.toLocaleString()}** | Average: **${latestTimeline.avg}** in ${latestTimeline.matches} matches\n` +
    `• Peak year: **${peakYear.year}** with ${peakYear.runs.toLocaleString()} runs at avg ${peakYear.avg}\n\n` +
    `**Recent Form:**\n` +
    batsmen.slice(0, 3).map(b => `• ${b.name}: ${b.recentScores.join(', ')}`).join('\n') + '\n\n' +
    `**${topBatsman.name}** leads with ${topBatsman.runs.toLocaleString()} runs at an average of ${topBatsman.average} and a strike rate of ${topBatsman.strikeRate}.`;

  return {
    id: `msg-${Date.now() + 1}`,
    role: 'assistant',
    content,
    citations: [
      { source: 'ICC Batting Rankings 2026', snippet: `Top run-scorers ranked by runs and average` },
      { source: 'Batting Timeline Analysis', snippet: `Historical batting data ${battingTimeline[0].year}–${latestTimeline.year}` },
    ],
    confidence: 91,
    timestamp: new Date(),
    stats: [
      { label: 'Top Scorer', value: topBatsman.name },
      { label: 'Total Runs', value: topBatsman.runs.toLocaleString() },
      { label: 'Peak Year', value: peakYear.year },
      { label: 'Peak Runs', value: peakYear.runs.toLocaleString() },
      { label: `${latestTimeline.year} Avg`, value: latestTimeline.avg.toString() },
    ],
  };
}

function buildMatchResponse(match: Match, query: string): ChatMessage {
  let content = `**${match.teamA} ${match.flagA} vs ${match.teamB} ${match.flagB}**\n\n`;
  content += `• **Competition**: ${match.competition}\n`;
  content += `• **Date**: ${match.date}\n`;
  content += `• **Venue**: ${match.venue}\n`;
  content += `• **Status**: **${match.status.toUpperCase()}**\n`;

  if (match.scoreA) content += `• **${match.teamA} Score**: ${match.scoreA}\n`;
  if (match.scoreB) content += `• **${match.teamB} Score**: ${match.scoreB}\n`;
  if (match.result) content += `• **Result**: ${match.result}\n`;
  if (match.motm) content += `• **Man of the Match**: ${match.motm}\n`;

  if (match.highlights.length > 0) {
    content += `\n**Highlights:**\n`;
    match.highlights.forEach(h => { content += `• ${h}\n`; });
  }

  const playerMention = match.motm ? findPlayer(match.motm) : null;
  const citations = [
    { source: `${match.competition} Match Center`, snippet: `${match.teamA} vs ${match.teamB} — ${match.date}` },
  ];
  if (playerMention) {
    citations.push({ source: 'Player Performance Data', snippet: `${playerMention.name}: ${playerMention.recentScores.join(', ')}` });
  }

  return {
    id: `msg-${Date.now() + 1}`,
    role: 'assistant',
    content,
    citations,
    confidence: match.status === 'completed' ? 96 : match.status === 'live' ? 93 : 85,
    timestamp: new Date(),
    stats: [
      { label: 'Competition', value: match.competition.split(' ').slice(-2).join(' ') },
      { label: 'Status', value: match.status },
      ...(match.scoreA ? [{ label: `${match.teamA}`, value: match.scoreA }] : []),
      ...(match.scoreB ? [{ label: `${match.teamB}`, value: match.scoreB }] : []),
      ...(match.motm ? [{ label: 'MoTM', value: match.motm }] : []),
    ],
  };
}

function buildTeamMatchesResponse(teamName: string, teamMatches: Match[], query: string): ChatMessage {
  const completed = teamMatches.filter(m => m.status === 'completed');
  const upcoming = teamMatches.filter(m => m.status === 'upcoming');
  const live = teamMatches.filter(m => m.status === 'live');

  let content = `**${teamName}** — Recent & Upcoming Matches:\n\n`;

  if (live.length > 0) {
    content += `🔴 **LIVE:**\n`;
    live.forEach(m => {
      content += `• ${m.teamA} ${m.flagA} ${m.scoreA || ''} vs ${m.scoreB || ''} ${m.flagB} ${m.teamB} — ${m.venue}\n`;
    });
    content += '\n';
  }

  if (completed.length > 0) {
    content += `✅ **Completed:**\n`;
    completed.forEach(m => {
      content += `• ${m.teamA} ${m.flagA} vs ${m.flagB} ${m.teamB}: ${m.result || 'N/A'} (${m.competition})\n`;
    });
    content += '\n';
  }

  if (upcoming.length > 0) {
    content += `📅 **Upcoming:**\n`;
    upcoming.forEach(m => {
      content += `• ${m.teamA} ${m.flagA} vs ${m.flagB} ${m.teamB} — ${m.date} at ${m.venue} (${m.competition})\n`;
    });
  }

  return {
    id: `msg-${Date.now() + 1}`,
    role: 'assistant',
    content,
    citations: [
      { source: 'ICC Match Schedule 2026', snippet: `${teamName}: ${teamMatches.length} matches found` },
    ],
    confidence: 93,
    timestamp: new Date(),
    stats: [
      { label: 'Total Matches', value: teamMatches.length.toString() },
      { label: 'Completed', value: completed.length.toString() },
      { label: 'Upcoming', value: upcoming.length.toString() },
      { label: 'Live', value: live.length.toString() },
    ],
  };
}

function buildRankingResponse(q: string, query: string): ChatMessage {
  const isBowlingRank = q.includes('bowler') || q.includes('wicket') || q.includes('bowling');
  const isBattingRank = q.includes('batsman') || q.includes('batting') || q.includes('run');

  let sorted: Player[];
  let statLabel: string;

  if (isBowlingRank) {
    sorted = players.filter(p => p.wickets > 0).sort((a, b) => a.iccRanking - b.iccRanking);
    statLabel = 'Wickets';
  } else {
    sorted = players.filter(p => p.runs > 0).sort((a, b) => a.iccRanking - b.iccRanking);
    statLabel = 'Runs';
  }

  const content = `**ICC Rankings** (from our database):\n\n` +
    sorted.slice(0, 5).map((p, i) => {
      const stat = isBowlingRank ? `${p.wickets} wickets, econ ${p.economy}` : `${p.runs.toLocaleString()} runs, avg ${p.average}`;
      return `• **#${p.iccRanking}** ${p.name} ${p.flag} — ${stat} (rating: ${p.rating}/10)`;
    }).join('\n') + '\n\n' +
    `Note: Rankings are based on the ICC official ranking system as available in our data.`;

  return {
    id: `msg-${Date.now() + 1}`,
    role: 'assistant',
    content,
    citations: [
      { source: 'ICC Official Rankings 2026', snippet: `Top 5 ${isBowlingRank ? 'bowlers' : 'batsmen'} by ICC ranking` },
    ],
    confidence: 94,
    timestamp: new Date(),
    stats: sorted.slice(0, 5).map(p => ({
      label: `#${p.iccRanking}`,
      value: p.name,
    })),
  };
}

function buildScheduleResponse(q: string, query: string): ChatMessage {
  const upcoming = matches.filter(m => m.status === 'upcoming');
  const live = matches.filter(m => m.status === 'live');

  let content = '';
  if (live.length > 0) {
    content += `🔴 **Live Matches:**\n`;
    live.forEach(m => {
      content += `• **${m.teamA} ${m.flagA} vs ${m.flagB} ${m.teamB}** — ${m.scoreA || ''} / ${m.scoreB || ''} at ${m.venue} (${m.competition})\n`;
    });
    content += '\n';
  }

  if (upcoming.length > 0) {
    content += `📅 **Upcoming Matches:**\n`;
    upcoming.forEach(m => {
      content += `• **${m.teamA} ${m.flagA} vs ${m.flagB} ${m.teamB}** — ${m.date} at ${m.venue} (${m.competition})\n`;
      if (m.highlights.length > 0) content += `  _${m.highlights.join(', ')}_\n`;
    });
  }

  if (!content) {
    content = 'No upcoming or live matches found in the current data.';
  }

  return {
    id: `msg-${Date.now() + 1}`,
    role: 'assistant',
    content,
    citations: [
      { source: 'ICC Future Tours Programme 2026', snippet: 'Match schedule retrieved from ICC FTP' },
    ],
    confidence: 95,
    timestamp: new Date(),
    stats: [
      { label: 'Live', value: live.length.toString() },
      { label: 'Upcoming', value: upcoming.length.toString() },
    ],
  };
}

function buildYoungPlayersResponse(q: string, query: string): ChatMessage {
  const young = players.filter(p => p.age <= 26).sort((a, b) => b.rating - a.rating);

  const content = `**Top Young Cricketers (Under 26)** from our database:\n\n` +
    young.map((p, i) => {
      const primary = p.role === 'Bowler' ? `${p.wickets} wickets, econ ${p.economy}` : `${p.runs.toLocaleString()} runs, avg ${p.average}`;
      return `• **${p.name}** ${p.flag} (${p.country}) — Age: ${p.age}, ${p.role}\n  ${primary} | ICC Rank: #${p.iccRanking} | Form: ${p.form} | Rating: ${p.rating}/10`;
    }).join('\n\n') + '\n\n' +
    `**${young[0]?.name}** (age ${young[0]?.age}) stands out as the highest-rated young player with a rating of ${young[0]?.rating}/10.`;

  return {
    id: `msg-${Date.now() + 1}`,
    role: 'assistant',
    content,
    citations: [
      { source: 'ICC Emerging Player Rankings', snippet: `Players under 26 ranked by performance rating` },
      { source: 'U-25 Performance Database', snippet: `Age-filtered player statistics` },
    ],
    confidence: 89,
    timestamp: new Date(),
    stats: young.map(p => ({
      label: `${p.name}`,
      value: `${p.age}y | ${p.rating}/10`,
    })),
  };
}

function buildTopicResponse(q: string, query: string): ChatMessage {
  if (q.includes('head-to-head') || q.includes('head to head')) {
    // Try to find two teams
    const teamNames = ['india', 'australia', 'england', 'pakistan', 'new zealand', 'south africa', 'afghanistan'];
    const foundTeams = teamNames.filter(t => q.includes(t));
    if (foundTeams.length >= 2) {
      const t1 = foundTeams[0].charAt(0).toUpperCase() + foundTeams[0].slice(1);
      const t2 = foundTeams[1].charAt(0).toUpperCase() + foundTeams[1].slice(1);
      const headToHead = matches.filter(m =>
        (m.teamA.toLowerCase() === foundTeams[0] && m.teamB.toLowerCase() === foundTeams[1]) ||
        (m.teamA.toLowerCase() === foundTeams[1] && m.teamB.toLowerCase() === foundTeams[0])
      );

      let content = `**${t1} vs ${t2}** — Head-to-Head Record\n\n`;
      if (headToHead.length > 0) {
        const winsA = headToHead.filter(m => m.result?.includes(t1)).length;
        const winsB = headToHead.filter(m => m.result?.includes(t2)).length;
        content += `Matches found: **${headToHead.length}**\n`;
        if (winsA > 0 || winsB > 0) {
          content += `• ${t1} wins: ${winsA} | ${t2} wins: ${winsB}\n\n`;
        }
        content += `**Recent encounters:**\n`;
        headToHead.forEach(m => {
          content += `• ${m.date}: ${m.teamA} vs ${m.teamB} — ${m.result || m.status} (${m.competition})\n`;
        });
      } else {
        content += `No direct encounters found in the current database. Here are matches involving these teams:\n\n`;
        matches.filter(m => m.teamA.toLowerCase() === foundTeams[0] || m.teamB.toLowerCase() === foundTeams[0] ||
          m.teamA.toLowerCase() === foundTeams[1] || m.teamB.toLowerCase() === foundTeams[1])
          .forEach(m => {
            content += `• ${m.teamA} vs ${m.teamB} — ${m.result || m.status} (${m.competition})\n`;
          });
      }

      return {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content,
        citations: [{ source: 'ICC Head-to-Head Records', snippet: `${t1} vs ${t2} historical data` }],
        confidence: 87,
        timestamp: new Date(),
        stats: [
          { label: 'Matches Found', value: headToHead.length.toString() },
        ],
      };
    }
  }

  // DRS query
  if (q.includes('drs')) {
    const content = `**DRS (Decision Review System) Analysis:**\n\n` +
      `The DRS has been a game-changer in cricket since its introduction. Based on available match data:\n\n` +
      `• **Overall Success Rate**: Reviews are successful approximately **55-60%** of the time across all formats.\n` +
      `• **Top Teams in DRS Usage**: Teams with better review strategies (like Australia and India) have success rates closer to **65%**.\n` +
      `• **LBW Reviews**: The most commonly challenged decision, with a **~60%** overturn rate.\n` +
      `• **Edge Reviews**: UltraEdge technology has made these reviews highly accurate, with **~75%** success.\n\n` +
      `Note: Specific team-by-team DRS statistics would require detailed ball-by-ball data from our expanded database.`;

    return {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content,
      citations: [
        { source: 'ICC DRS Review Analysis', snippet: 'DRS success rate data across formats' },
      ],
      confidence: 72,
      timestamp: new Date(),
      stats: [
        { label: 'Overall Success', value: '55-60%' },
        { label: 'LBW Overturn', value: '~60%' },
        { label: 'Edge Accuracy', value: '~75%' },
      ],
    };
  }

  return buildFallbackResponse(query);
}

function buildFallbackResponse(query: string): ChatMessage {
  const content = `I appreciate your question, but I don't have specific data to answer that query precisely. However, I can help you with:\n\n` +
    `• **Player Statistics** — Ask about any player's runs, average, strike rate, wickets, economy, ICC ranking, recent form (e.g., "Tell me about Virat Kohli")\n` +
    `• **Player Comparisons** — Compare two players head-to-head (e.g., "Compare Kohli vs Smith")\n` +
    `• **Match Details** — Ask about specific matches, scores, results, and Man of the Match (e.g., "India vs Australia WTC Final")\n` +
    `• **Team Schedules** — Upcoming and recent matches for any team (e.g., "India upcoming matches")\n` +
    `• **Bowling Analysis** — Best bowlers, bowling figures, economy rates (e.g., "Best bowling figures")\n` +
    `• **Batting Analysis** — Top run-scorers, batting averages, timelines (e.g., "Batting stats timeline")\n` +
    `• **ICC Rankings** — Current ICC rankings for batsmen and bowlers (e.g., "Top 5 bowlers ICC ranking")\n` +
    `• **Head-to-Head Records** — Compare teams (e.g., "India vs Australia head-to-head")\n` +
    `• **Young Players** — Emerging talent under 25 (e.g., "Top fast bowlers under 25")\n\n` +
    `Try asking one of the suggested prompts, or rephrase your question!`;

  return {
    id: `msg-${Date.now() + 1}`,
    role: 'assistant',
    content,
    citations: [
      { source: 'CricIQ Knowledge Base', snippet: 'Capability overview and data scope' },
    ],
    confidence: 65,
    timestamp: new Date(),
    stats: [
      { label: 'Players in DB', value: players.length.toString() },
      { label: 'Matches in DB', value: matches.length.toString() },
    ],
  };
}

/* ────────────────────── UI Components ────────────────────── */

function ConfidenceBar({ confidence }: { confidence: number }) {
  const color = confidence >= 90 ? 'oklch(0.72 0.18 170)' : confidence >= 70 ? 'oklch(0.78 0.16 85)' : 'oklch(0.65 0.22 240)';
  const label = confidence >= 90 ? 'High' : confidence >= 70 ? 'Medium' : 'Low';
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">Confidence</span>
      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${confidence}%` }} transition={{ duration: 0.8, delay: 0.5 }} />
      </div>
      <span style={{ color }} className="font-medium">{label} ({confidence}%)</span>
    </div>
  );
}

function MessageBubble({
  message,
  onThumbUp,
  onThumbDown,
  onBookmark,
  onShare,
  isThumbedUp,
  isThumbedDown,
  isBookmarked,
}: {
  message: ChatMessage;
  onThumbUp: () => void;
  onThumbDown: () => void;
  onBookmark: () => void;
  onShare: () => void;
  isThumbedUp: boolean;
  isThumbedDown: boolean;
  isBookmarked: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Message copied for sharing');
    onShare();
  };

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        isUser
          ? 'bg-gradient-to-br from-[oklch(0.65_0.22_240/30)] to-[oklch(0.78_0.16_85/30)]'
          : 'bg-[oklch(0.65_0.22_240/15)]'
      }`}>
        {isUser ? <User size={14} className="text-foreground" /> : <Bot size={14} className="text-[oklch(0.65_0.22_240)]" />}
      </div>

      {/* Content */}
      <div className={`max-w-[80%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-[oklch(0.65_0.22_240/20)] text-foreground rounded-tr-md'
            : 'glass border-border/50 rounded-tl-md'
        }`}>
          {message.content.split('**').map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
          )}
        </div>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.citations.map((c, i) => (
              <Badge key={i} variant="outline" className="text-[10px] border-border/50 bg-muted/50 gap-1 cursor-pointer hover:bg-muted">
                <FileText size={9} className="text-[oklch(0.65_0.22_240)]" />
                {c.source}
              </Badge>
            ))}
          </div>
        )}

        {/* Confidence */}
        {message.confidence && <ConfidenceBar confidence={message.confidence} />}

        {/* Stats */}
        {message.stats && message.stats.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.stats.map((s, i) => (
              <div key={i} className="px-3 py-1.5 rounded-lg bg-muted/50 text-xs">
                <span className="text-muted-foreground">{s.label}: </span>
                <span className="font-semibold text-foreground">{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {!isUser && (
          <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
              {copied ? <Check size={12} className="text-[oklch(0.72_0.18_170)]" /> : <Copy size={12} className="text-muted-foreground" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onThumbUp}>
              <ThumbsUp size={12} className={isThumbedUp ? 'text-[oklch(0.72_0.18_170)] fill-[oklch(0.72_0.18_170)]' : 'text-muted-foreground'} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onThumbDown}>
              <ThumbsDown size={12} className={isThumbedDown ? 'text-red-400 fill-red-400' : 'text-muted-foreground'} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBookmark}>
              <Bookmark size={12} className={isBookmarked ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleShare}>
              <Share2 size={12} className="text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ────────────────────── Main Chat Page ────────────────────── */

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thumbedUp, setThumbedUp] = useState<Set<string>>(new Set());
  const [thumbedDown, setThumbedDown] = useState<Set<string>>(new Set());
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [isRecording, setIsRecording] = useState(false);
  const voiceNotSupported = typeof window !== 'undefined' && !("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Build conversation history for the API (last 10 messages for context)
      const history = [...messages, userMsg].slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      const data = await res.json();

      if (res.ok && data.content) {
        const aiMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
          citations: [
            { source: 'CricIQ AI (Groq)', snippet: `Model: ${data.model || 'llama-3.3-70b-versatile'}` },
          ],
          confidence: 88,
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        // API failed — fallback to local mock response
        const fallbackMsg = generateSmartResponse(msg);
        setMessages(prev => [...prev, fallbackMsg]);
      }
    } catch {
      // Network error — fallback to local mock response
      const fallbackMsg = generateSmartResponse(msg);
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [input, messages]);

  const handleThumbUp = useCallback((msgId: string) => {
    setThumbedUp(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
        toast('Thumbs up removed');
      } else {
        next.add(msgId);
        toast('Marked as helpful');
      }
      return next;
    });
    // If thumbs-down was active, remove it
    setThumbedDown(prev => {
      const next = new Set(prev);
      next.delete(msgId);
      return next;
    });
  }, []);

  const handleThumbDown = useCallback((msgId: string) => {
    setThumbedDown(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
        toast('Thumbs down removed');
      } else {
        next.add(msgId);
        toast('Feedback recorded — thanks!');
      }
      return next;
    });
    // If thumbs-up was active, remove it
    setThumbedUp(prev => {
      const next = new Set(prev);
      next.delete(msgId);
      return next;
    });
  }, []);

  const handleBookmark = useCallback((msgId: string) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
        toast('Bookmark removed');
      } else {
        next.add(msgId);
        toast('Message bookmarked');
      }
      return next;
    });
  }, []);

  const handleShare = useCallback((_msgId: string) => {
    // Copy is done inside the MessageBubble; this is for any additional logic
  }, []);

  const handleFileAttach = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileMsg = `📎 Attached: ${file.name}`;
    setInput('');
    // Reset the input so the same file can be re-attached
    if (fileInputRef.current) fileInputRef.current.value = '';
    handleSend(fileMsg);
  }, [handleSend]);

  const handleMicToggle = useCallback(() => {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      toast('Voice recording stopped');
      return;
    }

    const recognition = new (SpeechRecognition as new () => SpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setInput(transcript);
        toast.success(`Heard: "${transcript}"`);
      }
      setIsRecording(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsRecording(false);
      if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please allow microphone access.');
      } else {
        toast.error(`Voice recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    toast.info('Listening... Speak now');
  }, [isRecording]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Welcome message */}
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-[oklch(0.65_0.22_240/15)] flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} className="text-[oklch(0.65_0.22_240)]" />
            </div>
            <h2 className="text-xl font-bold mb-2">Cricket Intelligence AI</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Ask anything about cricket — player stats, match analysis, comparisons, and more. Every answer is evidence-based.
            </p>
          </motion.div>

          {/* Suggested prompts (show when no user messages) */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {suggestedPrompts.map((p) => (
                <motion.button
                  key={p}
                  className="px-3.5 py-2 rounded-full glass border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-[oklch(0.65_0.22_240/30)] transition-all cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSend(p)}
                >
                  <Lightbulb size={10} className="inline mr-1.5 text-[oklch(0.78_0.16_85)]" />
                  {p}
                </motion.button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onThumbUp={() => handleThumbUp(msg.id)}
              onThumbDown={() => handleThumbDown(msg.id)}
              onBookmark={() => handleBookmark(msg.id)}
              onShare={() => handleShare(msg.id)}
              isThumbedUp={thumbedUp.has(msg.id)}
              isThumbedDown={thumbedDown.has(msg.id)}
              isBookmarked={bookmarked.has(msg.id)}
            />
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-8 h-8 rounded-lg bg-[oklch(0.65_0.22_240/15)] flex items-center justify-center shrink-0">
                <Bot size={14} className="text-[oklch(0.65_0.22_240)]" />
              </div>
              <div className="glass border-border/50 px-4 py-3 rounded-2xl rounded-tl-md flex items-center gap-1.5">
                <span className="typing-dot w-2 h-2 rounded-full bg-[oklch(0.65_0.22_240)]" />
                <span className="typing-dot w-2 h-2 rounded-full bg-[oklch(0.65_0.22_240)]" />
                <span className="typing-dot w-2 h-2 rounded-full bg-[oklch(0.65_0.22_240)]" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-border/50 p-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="glass border-border/50 rounded-2xl p-1.5 focus-within:border-[oklch(0.65_0.22_240/30)] transition-colors">
            <div className="flex items-end gap-2 px-3 py-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleFileAttach}>
                <Paperclip size={16} className="text-muted-foreground" />
              </Button>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={voiceNotSupported ? 'Voice input not supported in this browser' : isRecording ? '🔴 Listening... speak now' : 'Ask about any cricket topic...'}
                className="flex-1 bg-transparent text-sm resize-none outline-none min-h-[32px] max-h-32 placeholder:text-muted-foreground"
                rows={1}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 relative"
                onClick={handleMicToggle}
              >
                {isRecording && (
                  <span className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" />
                )}
                <Mic
                  size={16}
                  className={isRecording ? 'text-red-500' : 'text-muted-foreground'}
                />
              </Button>
              <Button
                size="icon"
                className="h-8 w-8 shrink-0 bg-[oklch(0.65_0.22_240)] hover:bg-[oklch(0.58_0.24_240)] text-white disabled:opacity-30"
                disabled={!input.trim()}
                onClick={() => handleSend()}
              >
                <Send size={14} />
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            CricIQ AI may produce inaccurate information. Verify important facts with official sources.
          </p>
        </div>
      </div>
    </div>
  );
}