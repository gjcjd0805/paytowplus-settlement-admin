/**
 * 토큰 유효성 확인 API
 *
 * httpOnly 쿠키에 저장된 JWT 토큰의 유효성을 확인합니다.
 * 클라이언트에서 인증 상태를 확인할 때 사용합니다.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * JWT 토큰 유효성 검사 (만료 시간 체크)
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

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value

    if (!token) {
      return NextResponse.json({ valid: false, reason: 'no_token' })
    }

    if (!isTokenValid(token)) {
      return NextResponse.json({ valid: false, reason: 'expired' })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Token verify error:', error)
    return NextResponse.json({ valid: false, reason: 'error' })
  }
}
