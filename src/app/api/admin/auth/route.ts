import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/admin/session';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const token = createSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/admin',
  });

  return response;
}
