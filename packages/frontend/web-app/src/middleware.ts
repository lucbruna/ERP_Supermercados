import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['pt-BR', 'en'];
const defaultLocale = 'pt-BR';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.startsWith('/setup')) {
    try {
      const baseUrl = request.nextUrl.origin;
      const res = await fetch(`${baseUrl}/api/setup`, { signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      if (!data.setupComplete) {
        return NextResponse.redirect(new URL('/setup', request.url));
      }
    } catch {
      // If setup check fails, allow request through
    }
  }

  let locale = request.cookies.get('NEXT_LOCALE')?.value;

  if (!locale || !locales.includes(locale)) {
    const acceptLanguage = request.headers.get('Accept-Language');
    if (acceptLanguage) {
      const preferred = acceptLanguage.split(',')[0]?.trim().split('-')[0];
      locale = preferred === 'en' ? 'en' : defaultLocale;
    } else {
      locale = defaultLocale;
    }
  }

  const response = NextResponse.next();
  response.cookies.set('NEXT_LOCALE', locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
