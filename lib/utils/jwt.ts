/**
 * JWT 토큰 Payload 디코딩 유틸리티
 *
 * 주의: 이 함수는 토큰의 payload를 디코딩만 할 뿐, 서명 검증은 하지 않습니다.
 * 서명 검증은 반드시 서버에서 수행해야 합니다.
 */

export interface JwtPayload {
  sub?: string | number  // subject (userId)
  userId?: number
  username?: string
  loginId?: string
  name?: string
  level?: number
  levelName?: string
  levelCode?: string
  companyId?: number
  centerId?: number
  userType?: string
  exp?: number  // 만료 시간
  iat?: number  // 발급 시간
  [key: string]: any
}

/**
 * JWT 토큰의 payload 부분을 디코딩합니다.
 * @param token JWT 토큰 문자열
 * @returns 디코딩된 payload 객체 또는 null
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    if (!token) return null

    const parts = token.split('.')
    if (parts.length !== 3) return null

    const base64Payload = parts[1]
    // Base64URL을 Base64로 변환
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/')
    // 패딩 추가
    const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)

    const payload = atob(padded)
    return JSON.parse(payload)
  } catch (error) {
    console.error('JWT 디코딩 실패:', error)
    return null
  }
}

/**
 * JWT 토큰이 만료되었는지 확인합니다.
 * @param token JWT 토큰 문자열
 * @returns 만료 여부 (만료됨: true, 유효함: false)
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token)
  if (!payload || !payload.exp) return true

  // exp는 초 단위, Date.now()는 밀리초 단위
  return payload.exp * 1000 < Date.now()
}

/**
 * JWT 토큰에서 보안이 필요한 사용자 정보를 추출합니다.
 * level, companyId, centerId는 토큰에서만 추출합니다.
 * @param token JWT 토큰 문자열
 * @returns 사용자 정보 객체
 */
export function getSecureUserInfo(token: string): {
  level: number | undefined
  companyId: number | undefined
  centerId: number | undefined
} | null {
  const payload = decodeJwtPayload(token)
  if (!payload) return null

  return {
    level: payload.level,
    companyId: payload.companyId,
    centerId: payload.centerId,
  }
}
