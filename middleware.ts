import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Company routes - only accessible to court_owner role
  if (pathname.startsWith('/company')) {
    // Let the company layout handle the role check
    return NextResponse.next()
  }

  // Dashboard routes - accessible to customers and court_owners
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  // Auth pages
  if (pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // Root path
  if (pathname === '/') {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
