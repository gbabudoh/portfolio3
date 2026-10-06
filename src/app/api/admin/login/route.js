import { NextResponse } from 'next/server';
import { checkCredentials, setSessionCookie } from '@/lib/auth';

// Basic in-memory brute-force protection: 5 failed attempts per IP per 15 minutes.
// (Per-process only; use Redis or similar if running multiple instances.)
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map();

function clientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
}

function isLimited(ip) {
  const entry = attempts.get(ip);
  if (!entry || Date.now() - entry.first > WINDOW_MS) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip) {
  const entry = attempts.get(ip);
  if (!entry || Date.now() - entry.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: Date.now() });
  } else {
    entry.count += 1;
  }
}

export async function POST(request) {
  const ip = clientIp(request);
  if (isLimited(ip)) {
    return NextResponse.json(
      { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: 'Username and password are required' }, { status: 400 });
    }

    if (!checkCredentials(username, password)) {
      recordFailure(ip);
      return NextResponse.json({ success: false, message: 'Invalid username or password' }, { status: 401 });
    }

    attempts.delete(ip);
    const response = NextResponse.json({ success: true, message: 'Login successful' });
    await setSessionCookie(response, username);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    const message = error?.message?.includes('SESSION_SECRET')
      ? 'Server is missing SESSION_SECRET. Set it in the environment and restart.'
      : 'Internal server error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
