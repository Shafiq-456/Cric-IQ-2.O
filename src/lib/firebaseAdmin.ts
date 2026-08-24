/**
 * Lightweight Firebase ID Token verifier for Next.js API routes.
 *
 * Verifies Firebase ID tokens by calling the Firebase token-info endpoint.
 * This avoids the heavyweight firebase-admin SDK and works in the Node.js runtime.
 *
 * Usage:
 *   const uid = await verifyFirebaseToken(request);
 *   if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 */

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export interface VerifiedToken {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

/**
 * Extracts and verifies the Bearer token from an incoming Next.js Request.
 * Returns the decoded token payload on success, or null on failure.
 */
export async function verifyFirebaseToken(
  request: Request
): Promise<VerifiedToken | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const idToken = authHeader.slice(7);
    if (!idToken) return null;

    if (!FIREBASE_PROJECT_ID) {
      console.error('[firebaseAdmin] NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set');
      return null;
    }

    // Verify the token using Google's token-info endpoint
    const verifyUrl = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`;
    const res = await fetch(verifyUrl, { cache: 'no-store' });

    if (!res.ok) return null;

    const payload = await res.json();

    // Validate audience (aud) matches our Firebase project
    // Firebase ID tokens have aud = project ID
    if (payload.aud !== FIREBASE_PROJECT_ID) {
      console.warn('[firebaseAdmin] Token audience mismatch', payload.aud, '!==', FIREBASE_PROJECT_ID);
      return null;
    }

    // Validate token is not expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    // sub = the Firebase UID
    if (!payload.sub) return null;

    return {
      uid: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (err) {
    console.error('[firebaseAdmin] Token verification error:', err);
    return null;
  }
}
