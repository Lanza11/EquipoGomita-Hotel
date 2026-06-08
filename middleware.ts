import { NextRequest, NextResponse } from 'next/server';

const protectedPrefixes = ['/dashboard', '/users', '/maestros', '/transacciones'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiresAuth = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!requiresAuth) {
    return NextResponse.next();
  }

  const session = request.cookies.get('hotel_session');

  if (!session?.value) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/users/:path*', '/maestros/:path*', '/transacciones/:path*'],
};
