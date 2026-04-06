import { randomBytes } from 'crypto';
import { NextRequest } from 'next/server';

/**
 * In-memory session store for admin auth.
 * Tokens are random hex strings, not the raw password.
 * On serverless cold starts, sessions clear (admin re-logs in).
 */
const activeSessions = new Set<string>();

export function createSession(): string {
  const token = randomBytes(32).toString('hex');
  activeSessions.add(token);
  return token;
}

export function isValidSession(request: NextRequest): boolean {
  const token = request.cookies.get('admin_session')?.value;
  return !!token && activeSessions.has(token);
}
