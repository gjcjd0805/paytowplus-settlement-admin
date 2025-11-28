/**
 * Pay++ 정산 관리자 API 클라이언트
 *
 * 이 파일은 모든 API 호출을 중앙에서 관리합니다.
 * Axios 기반으로 백엔드 서버와 직접 통신합니다.
 *
 * 사용 예시:
 * ```typescript
 * import { merchantsApi, authApi, tokenManager } from '@/lib/api'
 *
 * // 로그인
 * const response = await authApi.login({ loginId: 'admin', password: '1234' })
 * tokenManager.set(response.data.token)
 *
 * // 가맹점 목록 조회
 * const merchants = await merchantsApi.findAll({ centerId: 1 })
 *
 * // 가맹점 등록
 * await merchantsApi.create({ name: '테스트 가맹점', ... })
 * ```
 */

// ============================================
// 1. 타입 정의 Export
// ============================================
export * from './types'

// ============================================
// 2. API 클라이언트 Export (개별 사용 권장)
// ============================================
export { authApi } from './auth'
export { centersApi } from './centers'
export { usersApi } from './users'
export { companiesApi } from './companies'
export { merchantsApi } from './merchants'
export { terminalsApi } from './terminals'
export { commissionsApi } from './commissions'
export { paymentsApi } from './payments'
export { settlementsApi } from './settlements'
export { salesApi } from './sales'
export { totpApi } from './totp'
export { noticesApi } from './notices'

// ============================================
// 3. 토큰 관리자 Export
// ============================================
export { tokenManager } from './client'

// ============================================
// 4. 통합 API 객체 (선택적 사용)
// ============================================
import { authApi } from './auth'
import { centersApi } from './centers'
import { usersApi } from './users'
import { companiesApi } from './companies'
import { merchantsApi } from './merchants'
import { terminalsApi } from './terminals'
import { commissionsApi } from './commissions'
import { paymentsApi } from './payments'
import { settlementsApi } from './settlements'
import { salesApi } from './sales'
import { totpApi } from './totp'
import { noticesApi } from './notices'

/**
 * 통합 API 객체
 * 모든 API를 하나의 객체로 접근 가능
 *
 * 사용 예시:
 * ```typescript
 * import { api } from '@/lib/api'
 *
 * await api.merchants.findAll({ centerId: 1 })
 * await api.auth.login({ loginId: 'admin', password: '1234' })
 * ```
 */
export const api = {
  auth: authApi,
  centers: centersApi,
  users: usersApi,
  companies: companiesApi,
  merchants: merchantsApi,
  terminals: terminalsApi,
  commissions: commissionsApi,
  payments: paymentsApi,
  settlements: settlementsApi,
  sales: salesApi,
  totp: totpApi,
  notices: noticesApi,
}

// ============================================
// 5. Default Export (통합 API 객체)
// ============================================
export default api
