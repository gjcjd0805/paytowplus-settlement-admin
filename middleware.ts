import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 인증이 필요없는 공개 경로
const publicPaths = ['/login']

// API 경로 (인증 체크 제외)
const apiPaths = ['/api']

/**
 * JWT 토큰 유효성 검사 (간단한 만료 시간 체크)
 */
function isTokenValid(token: string): boolean {
  if (!token) return false

  try {
    // JWT는 3부분으로 구성: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) return false

    // payload 디코딩
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())

    // 만료 시간 체크
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp <= now) {
        return false // 만료됨
      }
    }

    return true
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // API 경로는 미들웨어에서 체크하지 않음 (API Route에서 처리)
  if (apiPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 공개 경로는 인증 체크 제외
  if (publicPaths.some(path => pathname.startsWith(path))) {
    // 이미 로그인한 사용자가 로그인 페이지 접근 시 메인으로 리다이렉트
    const token = request.cookies.get('auth_token')?.value
    if (token && isTokenValid(token) && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // 정적 파일 및 Next.js 내부 경로 제외
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // 파일 확장자가 있는 경로
  ) {
    return NextResponse.next()
  }

  // 토큰 확인 (쿠키에서 읽기)
  const token = request.cookies.get('auth_token')?.value

  // 토큰이 없거나 유효하지 않으면 로그인 페이지로 리다이렉트
  if (!token || !isTokenValid(token)) {
    const loginUrl = new URL('/login', request.url)
    if (pathname !== '/') {
      loginUrl.searchParams.set('from', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // 토큰이 유효하면 계속 진행
  return NextResponse.next()
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
