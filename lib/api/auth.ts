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
   * @returns JWT 토큰 및 사용자 정보
   *
   * @example
   * ```typescript
   * const response = await authApi.login({
   *   loginId: 'company001',
   *   password: 'password123'
   * })
   * tokenManager.set(response.data.token)
   * ```
   */
  login: async (request: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiClient.post('/auth/login', request)
  },
}
