/**
 * 인증 API
 *
 * Endpoint: POST /auth/login
 */

import apiClient from './client'
import type { LoginRequest, LoginResponse, ApiResponse } from './types'

export const authApi = {
  /**
   * 로그인
   *
   * @param request - 로그인 요청 데이터
   * @returns 사용자 정보 (토큰은 httpOnly 쿠키로 설정됨)
   *
   * @example
   * ```typescript
   * const response = await authApi.login({
   *   loginId: 'company001',
   *   password: 'password123'
   * })
   * // 토큰은 httpOnly 쿠키로 자동 설정됨
   * ```
   */
  login: async (request: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post('/auth/login', request)
  },

  /**
   * 로그아웃
   *
   * httpOnly 쿠키를 제거합니다.
   *
   * @example
   * ```typescript
   * await authApi.logout()
   * ```
   */
  logout: async (): Promise<ApiResponse<null>> => {
    return apiClient.post('/auth/logout')
  },
}
