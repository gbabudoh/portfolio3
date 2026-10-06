import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

// API endpoints anyone may call. Everything else under /api requires an admin session.
const PUBLIC_API = [
  { method: 'GET', pattern: /^\/api\/(projects|skills|experience|about|stats)(\/.*)?$/ },
  { method: 'POST', pattern: /^\/api\/contact$/ },
  { method: 'POST', pattern: /^\/api\/analytics\/track$/ },
  { method: 'POST', pattern: /^\/api\/admin\/(login|logout)$/ },
];

function isPublicApi(method, pathname) {
  const m = method === 'HEAD' ? 'GET' : method;
  return PUBLIC_API.some((rule) => rule.method === m && rule.pattern.test(pathname));
}

function withSecurityHeaders(response, pathname) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (pathname.startsWith('/admin')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'no-store');
  }
  return response;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const getSession = () => verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith('/api/')) {
    if (!isPublicApi(request.method, pathname) && !(await getSession())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    const session = await getSession();
    const isLogin = pathname === '/admin/login';
    if (!session && !isLogin) {
      const url = new URL('/admin/login', request.url);
      if (pathname !== '/admin') url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    if (session && isLogin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return withSecurityHeaders(NextResponse.next(), pathname);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon.png|robots.txt|sitemap.xml).*)'],
};
