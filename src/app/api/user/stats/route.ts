/**
 * GET /api/user/stats
 *
 * Returns this user's personal dashboard statistics:
 *   - savedPlayersCount  — number of players explicitly bookmarked
 *   - aiQueriesToday     — AI queries made by this user today
 *   - documentsAnalyzed  — total documents uploaded/analyzed by this user
 *   - recentSearches     — last 5 search queries by this user
 *
 * A brand-new user will receive zeros and an empty array — no demo data is injected.
 *
 * Security: Verifies the Firebase ID token from the Authorization header.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';

export async function GET(request: NextRequest) {
  // 1. Verify Firebase ID token
  const token = await verifyFirebaseToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Find user record by Firebase UID
    const user = await db.user.findUnique({
      where: { firebaseUid: token.uid },
      select: { id: true },
    });

    // If user doesn't exist in DB yet (sync hasn't completed), return zeros
    if (!user) {
      return NextResponse.json({
        savedPlayersCount: 0,
        aiQueriesToday: 0,
        documentsAnalyzed: 0,
        recentSearches: [],
      });
    }

    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

    // 3. Run all queries in parallel for performance
    const [savedPlayersCount, todayActivity, totalDocs, recentSearches] =
      await Promise.all([
        // Count of bookmarked players
        db.savedPlayer.count({
          where: { userId: user.id },
        }),

        // Today's AI query count
        db.userActivity.findUnique({
          where: { userId_date: { userId: user.id, date: today } },
          select: { aiQueriesCount: true },
        }),

        // Total documents ever analyzed
        db.userActivity.aggregate({
          where: { userId: user.id },
          _sum: { documentsCount: true },
        }),

        // Last 5 searches
        db.recentSearch.findMany({
          where: { userId: user.id },
          orderBy: { searchedAt: 'desc' },
          take: 5,
          select: { query: true, searchedAt: true },
        }),
      ]);

    return NextResponse.json({
      savedPlayersCount,
      aiQueriesToday: todayActivity?.aiQueriesCount ?? 0,
      documentsAnalyzed: totalDocs._sum.documentsCount ?? 0,
      recentSearches: recentSearches.map((s) => s.query),
    });
  } catch (error) {
    console.error('[/api/user/stats] Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
