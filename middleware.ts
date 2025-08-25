import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function unauthorized(realm = 'Admin') {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${realm}"` },
  })
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const protect = pathname.startsWith('/admin') || pathname.startsWith('/api/admin')
  if (!protect) return NextResponse.next()

  let user = process.env.ADMIN_BASIC_USER
  let pass = process.env.ADMIN_BASIC_PASS

  // If not configured, fall back to admin/admin for convenience
  if (!user || !pass) {
    user = 'admin'
    pass = 'admin'
  }

  const auth = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!auth?.startsWith('Basic ')) return unauthorized()

  try {
    const decoded = atob(auth.replace(/^Basic\s+/i, ''))
    const [u, p] = decoded.split(':')
    if (u === user && p === pass) return NextResponse.next()
    return unauthorized()
  } catch {
    return unauthorized()
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

