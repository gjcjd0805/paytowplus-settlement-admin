/**
 * JWT 토큰 유효성 검사 (간단한 만료 시간 체크)
 * 실제 서명 검증은 백엔드에서 수행
 */
export function isTokenValid(token: string): boolean {
  if (!token) return false

  try {
    // JWT는 3부분으로 구성: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) return false

    // payload 디코딩
    const payload = JSON.parse(atob(parts[1]))

    // 만료 시간 체크
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000)
      return payload.exp > now
    }

    // exp가 없으면 유효한 것으로 간주 (백엔드에서 검증)
    return true
  } catch (error) {
    console.error('Token validation error:', error)
    return false
  }
}

/**
 * 토큰에서 사용자 정보 추출
 */
export function decodeToken(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    return payload
  } catch (error) {
    console.error('Token decode error:', error)
    return null
  }
}

/**
 * 쿠키에서 토큰 가져오기
 */
export function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'token') {
      return value
    }
  }
  return null
}

/**
 * 쿠키에 토큰 설정
 */
export function setTokenToCookie(token: string, maxAge: number = 60 * 60 * 24 * 7) {
  if (typeof document === 'undefined') return

  document.cookie = `token=${token}; path=/; max-age=${maxAge}`
}

/**
 * 쿠키에서 토큰 제거
 */
export function removeTokenFromCookie() {
  if (typeof document === 'undefined') return

  document.cookie = 'token=; path=/; max-age=0'
}
