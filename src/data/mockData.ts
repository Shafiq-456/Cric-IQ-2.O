export interface Player {
  id: string;
  name: string;
  country: string;
  flag: string;
  role: string;
  battingStyle: string;
  bowlingStyle: string;
  age: number;
  matches: number;
  runs: number;
  wickets: number;
  average: number;
  strikeRate: number;
  economy: number;
  image: string;
  form: 'excellent' | 'good' | 'average' | 'poor';
  rating: number;
  recentScores: string[];
  iccRanking: number;
}

export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  flagA: string;
  flagB: string;
  date: string;
  venue: string;
  competition: string;
  status: 'upcoming' | 'live' | 'completed';
  scoreA?: string;
  scoreB?: string;
  result?: string;
  motm?: string;
  highlights: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: { source: string; snippet: string }[];
  confidence?: number;
  timestamp: Date;
  stats?: { label: string; value: string }[];
}

export const players: Player[] = [
  {
    id: 'p1', name: 'Virat Kohli', country: 'India', flag: '🇮🇳', role: 'Batsman',
    battingStyle: 'Right-handed', bowlingStyle: 'Right-arm medium', age: 35,
    matches: 292, runs: 13906, wickets: 4, average: 58.07, strikeRate: 93.62, economy: 0,
    image: '', form: 'excellent', rating: 9.2, recentScores: ['82', '121', '45', '186', '76'], iccRanking: 4,
  },
  {
    id: 'p2', name: 'Steve Smith', country: 'Australia', flag: '🇦🇺', role: 'Batsman',
    battingStyle: 'Right-handed', bowlingStyle: 'Right-arm leg break', age: 34,
    matches: 109, runs: 9685, wickets: 1, average: 58.61, strikeRate: 53.79, economy: 0,
    image: '', form: 'good', rating: 8.8, recentScores: ['53', '89', '121', '38', '67'], iccRanking: 6,
  },
  {
    id: 'p3', name: 'Jasprit Bumrah', country: 'India', flag: '🇮🇳', role: 'Bowler',
    battingStyle: 'Right-handed', bowlingStyle: 'Right-arm fast', age: 30,
    matches: 89, runs: 156, wickets: 149, average: 25.42, strikeRate: 0, economy: 3.22,
    image: '', form: 'excellent', rating: 9.0, recentScores: ['3/28', '5/32', '2/41', '4/22', '6/19'], iccRanking: 2,
  },
  {
    id: 'p4', name: 'Kane Williamson', country: 'New Zealand', flag: '🇳🇿', role: 'Batsman',
    battingStyle: 'Right-handed', bowlingStyle: 'Right-arm off break', age: 33,
    matches: 100, runs: 8478, wickets: 6, average: 55.40, strikeRate: 53.21, economy: 0,
    image: '', form: 'good', rating: 8.6, recentScores: ['78', '45', '132', '56', '91'], iccRanking: 7,
  },
  {
    id: 'p5', name: 'Shaheen Afridi', country: 'Pakistan', flag: '🇵🇰', role: 'Bowler',
    battingStyle: 'Left-handed', bowlingStyle: 'Left-arm fast', age: 24,
    matches: 60, runs: 92, wickets: 108, average: 26.14, strikeRate: 0, economy: 3.41,
    image: '', form: 'good', rating: 8.4, recentScores: ['2/35', '4/22', '3/48', '5/18', '1/32'], iccRanking: 5,
  },
  {
    id: 'p6', name: 'Babar Azam', country: 'Pakistan', flag: '🇵🇰', role: 'Batsman',
    battingStyle: 'Right-handed', bowlingStyle: 'Right-arm off break', age: 29,
    matches: 52, runs: 3898, wickets: 0, average: 48.72, strikeRate: 88.41, economy: 0,
    image: '', form: 'average', rating: 8.2, recentScores: ['34', '67', '23', '89', '12'], iccRanking: 8,
  },
  {
    id: 'p7', name: 'Joe Root', country: 'England', flag: '🇬🇧', role: 'Batsman',
    battingStyle: 'Right-handed', bowlingStyle: 'Right-arm off break', age: 33,
    matches: 145, runs: 12502, wickets: 8, average: 51.23, strikeRate: 56.14, economy: 0,
    image: '', form: 'excellent', rating: 8.9, recentScores: ['104', '56', '89', '142', '67'], iccRanking: 3,
  },
  {
    id: 'p8', name: 'Pat Cummins', country: 'Australia', flag: '🇦🇺', role: 'Bowler',
    battingStyle: 'Right-handed', bowlingStyle: 'Right-arm fast', age: 31,
    matches: 68, runs: 890, wickets: 188, average: 22.46, strikeRate: 0, economy: 3.08,
    image: '', form: 'excellent', rating: 8.7, recentScores: ['4/31', '6/42', '3/28', '5/56', '2/18'], iccRanking: 1,
  },
  {
    id: 'p9', name: 'Rohit Sharma', country: 'India', flag: '🇮🇳', role: 'Batsman',
    battingStyle: 'Right-handed', bowlingStyle: 'Right-arm off break', age: 37,
    matches: 264, runs: 10742, wickets: 1, average: 47.28, strikeRate: 89.45, economy: 0,
    image: '', form: 'good', rating: 8.3, recentScores: ['56', '121', '34', '89', '47'], iccRanking: 9,
  },
  {
    id: 'p10', name: 'Rashid Khan', country: 'Afghanistan', flag: '🇦🇫', role: 'Bowler',
    battingStyle: 'Right-handed', bowlingStyle: 'Right-arm leg spin', age: 26,
    matches: 72, runs: 680, wickets: 132, average: 24.18, strikeRate: 0, economy: 3.68,
    image: '', form: 'excellent', rating: 8.5, recentScores: ['3/32', '5/18', '2/28', '4/41', '3/35'], iccRanking: 3,
  },
  {
    id: 'p11', name: 'Ben Stokes', country: 'England', flag: '🇬🇧', role: 'All-rounder',
    battingStyle: 'Left-handed', bowlingStyle: 'Right-arm fast-medium', age: 33,
    matches: 104, runs: 3384, wickets: 74, average: 37.11, strikeRate: 56.42, economy: 3.45,
    image: '', form: 'good', rating: 8.6, recentScores: ['67', '3/45', '89', '2/32', '112'], iccRanking: 2,
  },
  {
    id: 'p12', name: 'Ravindra Jadeja', country: 'India', flag: '🇮🇳', role: 'All-rounder',
    battingStyle: 'Left-handed', bowlingStyle: 'Left-arm orthodox', age: 35,
    matches: 197, runs: 3190, wickets: 275, average: 36.78, strikeRate: 62.34, economy: 2.42,
    image: '', form: 'good', rating: 8.4, recentScores: ['45', '3/28', '67', '5/45', '34'], iccRanking: 5,
  },
];

export const matches: Match[] = [
  {
    id: 'm1', teamA: 'India', teamB: 'Australia', flagA: '🇮🇳', flagB: '🇦🇺',
    date: '2026-07-10', venue: 'Melbourne Cricket Ground', competition: 'ICC World Test Championship Final',
    status: 'upcoming', highlights: ['World Test Championship Final', 'Day-Night Match'],
  },
  {
    id: 'm2', teamA: 'England', teamB: 'Pakistan', flagA: '🇬🇧', flagB: '🇵🇰',
    date: '2026-07-08', venue: 'Lord\'s Cricket Ground', competition: 'The Ashes',
    status: 'live', scoreA: '312/5', scoreB: '198/4',
    highlights: ['Root century (104*)', 'Shaheen bowling spell'],
  },
  {
    id: 'm3', teamA: 'India', teamB: 'South Africa', flagA: '🇮🇳', flagB: '🇿🇦',
    date: '2026-07-05', venue: 'Wankhede Stadium', competition: 'ICC Champions Trophy',
    status: 'completed', scoreA: '342/8', scoreB: '298/10',
    result: 'India won by 44 runs', motm: 'Virat Kohli',
    highlights: ['Kohli 121 (98)', 'Bumrah 5/42'],
  },
  {
    id: 'm4', teamA: 'Australia', teamB: 'New Zealand', flagA: '🇦🇺', flagB: '🇳🇿',
    date: '2026-07-03', venue: 'Sydney Cricket Ground', competition: 'Bilateral ODI Series',
    status: 'completed', scoreA: '289/7', scoreB: '267/10',
    result: 'Australia won by 22 runs', motm: 'Pat Cummins',
    highlights: ['Cummins 4/31', 'Smith 89 (102)'],
  },
  {
    id: 'm5', teamA: 'India', teamB: 'England', flagA: '🇮🇳', flagB: '🇬🇧',
    date: '2026-06-30', venue: 'Eden Gardens', competition: 'ICC Champions Trophy',
    status: 'completed', scoreA: '356/4', scoreB: '312/9',
    result: 'India won by 44 runs', motm: 'Rohit Sharma',
    highlights: ['Rohit 121 (85)', 'Stokes 67 (48)'],
  },
  {
    id: 'm6', teamA: 'Pakistan', teamB: 'Afghanistan', flagA: '🇵🇰', flagB: '🇦🇫',
    date: '2026-07-12', venue: 'Gaddafi Stadium', competition: 'Asia Cup',
    status: 'upcoming', highlights: ['Asia Cup Group Stage'],
  },
  {
    id: 'm7', teamA: 'Australia', teamB: 'India', flagA: '🇦🇺', flagB: '🇮🇳',
    date: '2026-07-15', venue: 'Adelaide Oval', competition: 'ICC World Test Championship Final',
    status: 'upcoming', highlights: ['Day 3 of WTC Final'],
  },
  {
    id: 'm8', teamA: 'New Zealand', teamB: 'England', flagA: '🇳🇿', flagB: '🇬🇧',
    date: '2026-06-28', venue: 'Basin Reserve', competition: 'Bilateral Test Series',
    status: 'completed', scoreA: '478/10', scoreB: '356/10 & 189/10',
    result: 'New Zealand won by an innings and 33 runs', motm: 'Kane Williamson',
    highlights: ['Williamson 132 (210)', 'Southee 6/78'],
  },
];

export const sampleChatMessages: ChatMessage[] = [
  {
    id: 'c1', role: 'user', content: 'Compare Virat Kohli and Steve Smith\'s Test records in the last 2 years',
    timestamp: new Date('2026-07-08T10:30:00'),
  },
  {
    id: 'c2', role: 'assistant',
    content: `Based on the retrieved match data from ICC Test records (2024–2026), here's a detailed comparison of **Virat Kohli** and **Steve Smith** in Test cricket over the past two years:

**Virat Kohli** has been in remarkable form, accumulating **2,847 runs** across **28 matches** at an average of **56.94**, with a highest score of **186**. His strike rate of **93.62** reflects an aggressive yet controlled approach, particularly dominant against pace bowling where he averages **62.18**. Notably, Kohli converted **8 fifties into centuries**, showing exceptional temperament in converting starts.

**Steve Smith**, meanwhile, scored **2,412 runs** in **26 matches** at an average of **58.61**, with a highest of **145**. Smith's strength lies in his ability to grind out runs in difficult conditions — his average in the fourth innings stands at **48.32**, among the best in the world. However, his conversion rate dipped slightly, with **6 centuries** from **14 fifties**.

**Key differential**: Kohli dominates in Asia (avg. 72.40) while Smith excels in Australia and England (avg. 64.12 combined). Both players have shown exceptional slip-catching, with Kohli taking **18 catches** and Smith **22 catches** in this period.`,
    citations: [
      { source: 'ICC Test Match Records 2024-2026', snippet: 'Kohli: 28 matches, 2847 runs, avg 56.94 | Smith: 26 matches, 2412 runs, avg 58.61' },
      { source: 'ESPNcricinfo Performance Analysis', snippet: 'Kohli conversion rate: 8/8 fifties to centuries | Smith: 6/14 fifties to centuries' },
    ],
    confidence: 94,
    timestamp: new Date('2026-07-08T10:30:05'),
    stats: [
      { label: 'Kohli Runs', value: '2,847' },
      { label: 'Kohli Average', value: '56.94' },
      { label: 'Smith Runs', value: '2,412' },
      { label: 'Smith Average', value: '58.61' },
    ],
  },
];

export const trendingPlayers = [
  { name: 'Virat Kohli', country: 'India', trend: '+12%', reason: '3 centuries in last 5 matches' },
  { name: 'Pat Cummins', country: 'Australia', trend: '+8%', reason: '18 wickets in last 3 Tests' },
  { name: 'Joe Root', country: 'England', trend: '+15%', reason: '642 runs in current series' },
  { name: 'Jasprit Bumrah', country: 'India', trend: '+10%', reason: 'Best bowling figures in WTC' },
  { name: 'Kane Williamson', country: 'New Zealand', trend: '+5%', reason: 'Double century vs England' },
];

export const recentSearches = [
  'India vs Australia WTC Final 2026',
  'Virat Kohli Test average 2024-2026',
  'Best bowling figures in ICC Champions Trophy',
  'Jasprit Bumrah yorker analysis',
  'Head-to-head: India vs England ODIs',
];

export const quickActions = [
  { label: 'Compare Players', icon: 'GitCompareArrows', color: 'text-[oklch(0.65_0.22_240)]' },
  { label: 'Match Analysis', icon: 'BarChart3', color: 'text-[oklch(0.78_0.16_85)]' },
  { label: 'Ask AI', icon: 'Sparkles', color: 'text-[oklch(0.72_0.18_170)]' },
  { label: 'Player Stats', icon: 'TrendingUp', color: 'text-[oklch(0.7_0.2_300)]' },
];

export const faqItems = [
  {
    q: 'How does CricIQ\'s AI analyze cricket data?',
    a: 'CricIQ uses a Retrieval-Augmented Generation (RAG) engine that indexes thousands of match reports, scorecards, and player statistics. When you ask a question, our system retrieves the most relevant passages and uses an AI model to generate a precise, evidence-backed answer — complete with citations and confidence scores.',
  },
  {
    q: 'What data sources does CricIQ use?',
    a: 'We aggregate data from ICC official records, ESPNcricinfo, Cricbuzz, historical scorecards, ball-by-ball commentary feeds, player biographical databases, coaching manuals, and curated cricket datasets spanning from Test cricket\'s inception to live ongoing matches.',
  },
  {
    q: 'Can I upload my own cricket data for analysis?',
    a: 'Yes. CricIQ supports uploading PDF match reports, CSV player statistics, JSON datasets, and DOCX coaching manuals. Our ingestion pipeline processes these through OCR, text extraction, semantic chunking, and embedding to make them searchable within your private knowledge base.',
  },
  {
    q: 'How accurate are the AI-generated insights?',
    a: 'Every AI answer includes a confidence indicator (0-100%) and explicit citations linking to source documents. Our hybrid retrieval system combines semantic vector search with BM25 keyword matching, then re-ranks results by relevance, recency, and source quality to maximize accuracy.',
  },
  {
    q: 'Is CricIQ suitable for professional cricket analysis?',
    a: 'Absolutely. CricIQ is designed for players, coaches, commentators, journalists, and analysts who need precise, data-driven insights. The platform supports advanced queries, multi-player comparisons, timeline analysis, and exportable reports suitable for professional use.',
  },
  {
    q: 'What makes CricIQ different from other cricket apps?',
    a: 'Unlike stat-heavy dashboards, CricIQ understands natural language — ask questions the way you\'d discuss cricket with a knowledgeable friend. Our RAG engine ensures every answer is grounded in real data, and our AI can explain complex situations, compare eras, and surface insights that would take hours of manual research.',
  },
];

export const testimonials = [
  {
    name: 'Harsha Bhogle',
    role: 'Cricket Commentator & Analyst',
    quote: 'CricIQ has transformed how I prepare for broadcasts. The AI-powered insights and player comparisons save me hours of research every week. It\'s like having a cricket encyclopedia that actually understands context.',
    avatar: 'HB',
  },
  {
    name: 'Aakash Chopra',
    role: 'Former India Cricketer & Analyst',
    quote: 'The depth of analysis CricIQ provides is remarkable. I can ask about a player\'s performance against specific bowling types in specific conditions, and get a detailed, sourced answer in seconds.',
    avatar: 'AC',
  },
  {
    name: 'Dr. S. Ramakanth',
    role: 'Head Coach, National Cricket Academy',
    quote: 'We use CricIQ\'s analytics to identify player weaknesses and track opponent patterns. The RAG system\'s ability to surface relevant historical precedents has been invaluable for our match strategy sessions.',
    avatar: 'SR',
  },
];

export const battingTimeline = [
  { year: '2018', runs: 1322, avg: 55.08, matches: 25 },
  { year: '2019', runs: 1455, avg: 60.62, matches: 26 },
  { year: '2020', runs: 892, avg: 44.60, matches: 18 },
  { year: '2021', runs: 536, avg: 28.21, matches: 15 },
  { year: '2022', runs: 795, avg: 39.75, matches: 18 },
  { year: '2023', runs: 1172, avg: 58.60, matches: 22 },
  { year: '2024', runs: 1589, avg: 68.22, matches: 24 },
  { year: '2025', runs: 1424, avg: 61.04, matches: 22 },
  { year: '2026', runs: 482, avg: 69.71, matches: 7 },
];

export const bowlingTimeline = [
  { year: '2018', wickets: 22, avg: 28.45, economy: 3.12 },
  { year: '2019', wickets: 28, avg: 24.18, economy: 3.05 },
  { year: '2020', wickets: 14, avg: 31.20, economy: 3.28 },
  { year: '2021', wickets: 18, avg: 26.90, economy: 3.15 },
  { year: '2022', wickets: 24, avg: 22.45, economy: 3.02 },
  { year: '2023', wickets: 30, avg: 21.88, economy: 2.95 },
  { year: '2024', wickets: 36, avg: 20.12, economy: 2.88 },
  { year: '2025', wickets: 32, avg: 22.35, economy: 2.92 },
  { year: '2026', wickets: 14, avg: 19.85, economy: 2.78 },
];