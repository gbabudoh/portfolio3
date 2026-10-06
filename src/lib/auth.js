import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, SESSION_TTL_SECONDS, safeEqual, signSession, verifySession } from '@/lib/session';

const DEFAULT_PASSWORD = 'portfolio2024!';

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD,
    usingDefaultPassword: !process.env.ADMIN_PASSWORD,
  };
}

export function checkCredentials(username, password) {
  const expected = getAdminCredentials();
  // Production must never accept the built-in default password.
  if (expected.usingDefaultPassword && process.env.NODE_ENV === 'production') return false;
  const userOk = safeEqual(username, expected.username);
  const passOk = safeEqual(password, expected.password);
  return userOk && passOk;
}

export async function getSession() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return session;
}

// Cookie helpers operate on the route's NextResponse so every Set-Cookie header
// (new session + legacy cleanup) is guaranteed to reach the browser.
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  // Root path so the cookie also reaches /api/* routes guarded by middleware.
  path: '/',
};

// Older builds scoped an unsigned cookie with the same name to /admin. Browsers send the
// more specific path first, which would shadow the new cookie, so expire it explicitly.
const LEGACY_COOKIE_CLEAR = `${SESSION_COOKIE}=; Path=/admin; Max-Age=0; HttpOnly; SameSite=Strict`;

export async function setSessionCookie(response, username) {
  response.cookies.set(SESSION_COOKIE, await signSession(username), { ...cookieOptions, maxAge: SESSION_TTL_SECONDS });
  response.headers.append('Set-Cookie', LEGACY_COOKIE_CLEAR);
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  response.headers.append('Set-Cookie', LEGACY_COOKIE_CLEAR);
}
