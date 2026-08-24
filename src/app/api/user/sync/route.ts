/**
 * POST /api/user/sync
 *
 * Called immediately after a successful Firebase Google sign-in.
 * Creates a User record in the database if one doesn't exist for this Firebase UID.
 * Returns the database user record (never creates demo data).
 *
 * Security: Verifies the Firebase ID token from the Authorization header.
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  // 1. Verify Firebase ID token
  const token = await verifyFirebaseToken(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Upsert the user record keyed by Firebase UID
    //    - If first sign-in: creates a new empty user
    //    - If returning user: updates name/email/photo if they changed
    const user = await db.user.upsert({
      where: { firebaseUid: token.uid },
      update: {
        email: token.email ?? undefined,
        name: token.name ?? undefined,
        photoUrl: token.picture ?? undefined,
      },
      create: {
        firebaseUid: token.uid,
        email: token.email ?? null,
        name: token.name ?? null,
        photoUrl: token.picture ?? null,
      },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        name: true,
        photoUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[/api/user/sync] Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
