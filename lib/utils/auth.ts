/**
 * localStorage에서 centerId 가져오기
 * @returns centerId (없으면 기본값 1)
 */
export function getCenterId(): number {
  if (typeof window === 'undefined') {
    return 1 // SSR 환경에서는 기본값 반환
  }

  const centerId = localStorage.getItem('centerId')
  return centerId ? Number(centerId) : 1
}

/**
 * localStorage 초기화 (로그아웃 시)
 */
export function clearAuth() {
  if (typeof window === 'undefined') return

  localStorage.removeItem('paymentPurpose')
  localStorage.removeItem('user')
  localStorage.removeItem('centerId')
}
