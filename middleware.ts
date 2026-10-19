import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(request: NextRequest) {
  // Skip middleware untuk static files dan API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    (request.nextUrl.pathname.startsWith('/favicon.ico') || request.nextUrl.pathname.startsWith('/app-icon.png') || request.nextUrl.pathname.startsWith('/google-icon.png'))
  ) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const adminRoutes = [
    '/admin',
    '/admin/exams',
    '/admin/questions',
    '/admin/results',
    '/admin/participants',
  ]
  const adminAuthRoutes = ['/admin/login']

  const isAuthRoute =
    pathname === '/auth/login' ||
    pathname === '/auth/register'

  const isExamRoute = pathname.startsWith('/exam')
  const isAdminAuthRoute = adminAuthRoutes.some((route) => pathname.startsWith(route))

  const isProtectedRoute = !isAuthRoute && !isAdminAuthRoute

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  // If user is not logged in and trying to access protected route
  if (!user && isProtectedRoute) {
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    if (!isExamRoute && !pathname.startsWith('/auth/callback')) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // If admin tries to access admin routes but is not admin
  if (isAdminRoute && user && !isAdminAuthRoute) {
    const { data: userData } = await (supabase as any)
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // If regular user tries to access admin routes
  if (isAdminRoute && user && !isAdminAuthRoute) {
    const { data: userData } = await (supabase as any)
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role === 'user') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // If logged-in user tries to access auth pages
  if (user && isAuthRoute) {
    const { data: userData } = await (supabase as any)
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
}