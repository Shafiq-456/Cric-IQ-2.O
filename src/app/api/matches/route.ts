import { NextResponse } from 'next/server';
import { matches as mockMatches } from '@/data/mockData';

const CRICAPI_KEY = process.env.CRICAPI_KEY;
const BASE_URL = 'https://api.cricapi.com/v1';

export const revalidate = 60;

const COUNTRY_FLAGS: Record<string, string> = {
  india: '🇮🇳',
  australia: '🇦🇺',
  england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  pakistan: '🇵🇰',
  'new zealand': '🇳🇿',
  'south africa': '🇿🇦',
  'west indies': '🏏',
  'sri lanka': '🇱🇰',
  bangladesh: '🇧🇩',
  afghanistan: '🇦🇫',
  zimbabwe: '🇿🇼',
  ireland: '🇮🇪',
  scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  netherlands: '🇳🇱',
  'united arab emirates': '🇦🇪',
  uae: '🇦🇪',
  kenya: '🇰🇪',
  namibia: '🇳🇦',
  oman: '🇴🇲',
  'papua new guinea': '🇵🇬',
  usa: '🇺🇸',
  'united states': '🇺🇸',
  canada: '🇨🇦',
};

function getFlag(team: string): string {
  const lower = team.toLowerCase();
  for (const [key, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (lower.includes(key)) return flag;
  }
  return '🏏';
}

function fmtScore(s?: { r?: number; w?: number; o?: number }): string | undefined {
  if (!s || s.r === undefined) return undefined;
  const wickets = s.w !== undefined ? `/${s.w}` : '';
  const overs   = s.o !== undefined ? ` (${parseFloat(String(s.o)).toFixed(1)} ov)` : '';
  return `${s.r}${wickets}${overs}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalise(raw: any) {
  const teams: string[] = raw.teams ?? [];
  const teamA = teams[0] ?? 'TBD';
  const teamB = teams[1] ?? 'TBD';
  const scores: { r?: number; w?: number; o?: number }[] = raw.score ?? [];
  const scoreA = fmtScore(scores[0]);
  const scoreB = fmtScore(scores[1]);

  let status: 'live' | 'upcoming' | 'completed' = 'upcoming';
  if (raw.matchEnded) status = 'completed';
  else if (raw.matchStarted) status = 'live';

  const competition =
    raw.series ??
    (raw.name ? raw.name.replace(/^.*?,\s*/, '').trim() : 'International Cricket');

  const highlights: string[] = [];
  if (raw.matchType) highlights.push(`${String(raw.matchType).toUpperCase()} Match`);
  if (status === 'live' && raw.status && !raw.status.toLowerCase().includes('no result')) {
    highlights.push(raw.status);
  }

  return {
    id: String(raw.id),
    teamA,
    teamB,
    flagA: getFlag(teamA),
    flagB: getFlag(teamB),
    date: raw.date ?? '',
    venue: raw.venue ?? '',
    competition,
    status,
    scoreA,
    scoreB,
    result: status === 'completed' ? raw.status : undefined,
    highlights,
  };
}

export async function GET() {
  if (!CRICAPI_KEY) {
    return NextResponse.json({
      matches: mockMatches,
      source: 'mock',
      reason: 'CRICAPI_KEY not set',
      fetchedAt: new Date().toISOString(),
    });
  }

  try {
    const [liveRes, allRes] = await Promise.all([
      fetch(`${BASE_URL}/currentMatches?apikey=${CRICAPI_KEY}&offset=0`, { next: { revalidate: 60 } }),
      fetch(`${BASE_URL}/matches?apikey=${CRICAPI_KEY}&offset=0`, { next: { revalidate: 60 } }),
    ]);

    const liveJson = await liveRes.json();
    const allJson  = await allRes.json();

    if (liveJson.status !== 'success') {
      return NextResponse.json({ matches: mockMatches, source: 'mock', fetchedAt: new Date().toISOString() });
    }

    const liveMatches = (liveJson.data ?? []).map(normalise);
    const liveIds     = new Set(liveMatches.map((m: { id: string }) => m.id));

    const otherMatches = (allJson.data ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((m: any) => !liveIds.has(String(m.id)))
      .slice(0, 12)
      .map(normalise);

    const combined = [...liveMatches, ...otherMatches];

    return NextResponse.json({
      matches: combined.length > 0 ? combined : mockMatches,
      source: combined.length > 0 ? 'live' : 'mock',
      fetchedAt: new Date().toISOString(),
      hitsUsed: liveJson.info?.hitsUsed,
      hitsLimit: liveJson.info?.hitsLimit,
    });
  } catch (err) {
    console.error('[/api/matches] Fetch failed:', err);
    return NextResponse.json({ matches: mockMatches, source: 'mock', fetchedAt: new Date().toISOString() });
  }
}
