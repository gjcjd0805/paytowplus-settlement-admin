/**
 * API 프록시 라우터
 *
 * 클라이언트의 모든 API 요청을 백엔드 서버로 프록시합니다.
 * httpOnly 쿠키에 저장된 JWT 토큰을 Authorization 헤더로 변환하여 전달합니다.
 *
 * BFF (Backend for Frontend) 패턴:
 * - 클라이언트는 /api/* 경로로 요청
 * - 서버에서 백엔드 API로 프록시
 * - JWT 토큰은 httpOnly 쿠키로 관리 (XSS 방지)
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// 백엔드 API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:18080/webadmin/api/v1'

/**
 * 공통 프록시 로직
 */
async function proxyRequest(request: NextRequest, method: string): Promise<NextResponse> {
  try {
    // URL에서 경로 추출 (/api/xxx -> /xxx)
    const url = new URL(request.url)
    const pathSegments = url.pathname.replace(/^\/api/, '')
    const targetUrl = `${BACKEND_API_URL}${pathSegments}${url.search}`

    // 쿠키에서 토큰 추출
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    // 디버깅: 쿠키 확인
    console.log('[API Proxy] Path:', pathSegments)
    console.log('[API Proxy] Token:', token ? `있음 (${token.substring(0, 20)}...)` : '없음')
    console.log('[API Proxy] All cookies:', cookieStore.getAll().map(c => c.name))

    // 요청 헤더 구성
    const headers: HeadersInit = {}

    // Content-Type 설정 (multipart/form-data는 제외 - boundary 자동 설정)
    const contentType = request.headers.get('content-type')
    if (contentType && !contentType.includes('multipart/form-data')) {
      headers['Content-Type'] = contentType
    }

    // 쿠키를 그대로 백엔드로 전달
    if (token) {
      headers['Cookie'] = `access_token=${token}`
    }

    // 요청 본문 처리
    let body: BodyInit | null = null
    if (method !== 'GET' && method !== 'HEAD') {
      if (contentType?.includes('multipart/form-data')) {
        // multipart/form-data는 FormData로 처리
        body = await request.formData()
      } else if (contentType?.includes('application/json')) {
        // JSON은 텍스트로 처리
        body = await request.text()
      } else {
        // 기타 형식
        body = await request.blob()
      }
    }

    // 백엔드로 요청 전송
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    })

    // 응답 헤더 구성
    const responseHeaders = new Headers()

    // Content-Type 전달
    const responseContentType = response.headers.get('content-type')
    if (responseContentType) {
      responseHeaders.set('Content-Type', responseContentType)
    }

    // Set-Cookie 헤더 모두 전달 (로그인/로그아웃 시)
    // getSetCookie()는 모든 Set-Cookie 헤더를 배열로 반환
    const setCookies = response.headers.getSetCookie()
    console.log('[API Proxy] Set-Cookie from backend:', setCookies)
    if (setCookies && setCookies.length > 0) {
      setCookies.forEach(cookie => {
        responseHeaders.append('Set-Cookie', cookie)
      })
    }

    // 응답 본문
    const responseBody = await response.arrayBuffer()

    // 에러 응답 로깅
    if (!response.ok) {
      const errorText = new TextDecoder().decode(responseBody)
      console.log('[API Proxy] Error response:', response.status, errorText)
    }

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('[API Proxy Error]', error)
    return NextResponse.json(
      { message: '서버 연결에 실패했습니다.' },
      { status: 500 }
    )
  }
}

// HTTP 메서드별 핸들러
export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET')
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST')
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT')
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, 'PATCH')
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE')
}
