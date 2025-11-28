/**
 * 사용자 관리 API
 */

import { apiClient } from './client'
import type { ApiResponse } from './types'

/**
 * 아이디 중복 체크 응답
 */
export interface CheckDuplicateResponse {
  isDuplicate: boolean
  message: string
}

/**
 * 사용자 관리 API
 */
export const usersApi = {
  /**
   * 로그인 ID 중복 체크
   *
   * @param loginId 체크할 로그인 ID
   * @returns 중복 여부 및 메시지
   *
   * @example
   * ```typescript
   * const response = await usersApi.checkDuplicate('company001')
   * if (response.data.isDuplicate) {
   *   alert('이미 사용 중인 아이디입니다')
   * } else {
   *   alert('사용 가능한 아이디입니다')
   * }
   * ```
   */
  checkDuplicate: async (loginId: string): Promise<ApiResponse<CheckDuplicateResponse>> => {
    const response = await apiClient.get(`/users/check-duplicate`,
      {
        params: { loginId }
      }
    )
    // apiClient는 이미 response.data를 반환하므로 그대로 사용
    return response as any
  },
}
