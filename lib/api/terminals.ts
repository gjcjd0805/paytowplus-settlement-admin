/**
 * 가맹점 터미널 관리 API
 *
 * Endpoints:
 * - POST /merchant-terminals - 터미널 등록
 * - PUT /merchant-terminals/{terminalId} - 터미널 수정
 * - GET /merchant-terminals/{terminalId} - 터미널 조회
 * - GET /merchant-terminals - 터미널 목록 조회
 * - DELETE /merchant-terminals/{terminalId} - 터미널 삭제
 */

import apiClient from './client'
import type {
  TerminalCreateRequest,
  TerminalUpdateRequest,
  Terminal,
  TerminalListParams,
  TerminalListResponse,
  ApiResponse,
} from './types'

export const terminalsApi = {
  /**
   * 터미널 코드 중복 체크
   *
   * @param terminalCode - 체크할 터미널 코드
   * @returns 중복 여부
   *
   * @example
   * ```typescript
   * const response = await terminalsApi.checkDuplicate('APP_MERCHANT_100')
   * if (response.data.isDuplicate) {
   *   alert('이미 사용 중인 터미널 코드입니다')
   * }
   * ```
   */
  checkDuplicate: async (terminalCode: string): Promise<ApiResponse<{ isDuplicate: boolean; message: string }>> => {
    return apiClient.get('/merchant-terminals/check-duplicate', {
      params: { terminalCode }
    })
  },

  /**
   * 터미널 등록
   *
   * 앱 가맹점을 웹어드민 가맹점에 연결
   *
   * @param request - 터미널 등록 데이터
   * @returns 성공 응답
   *
   * @example
   * ```typescript
   * await terminalsApi.create({
   *   merchantId: 1,
   *   appMerchantId: 100
   * })
   * ```
   */
  create: async (request: TerminalCreateRequest): Promise<ApiResponse<null>> => {
    return apiClient.post('/merchant-terminals', request)
  },

  /**
   * 터미널 수정
   *
   * @param terminalId - 터미널 ID
   * @param request - 터미널 수정 데이터
   * @returns 성공 응답
   *
   * @example
   * ```typescript
   * await terminalsApi.update(1, {
   *   appMerchantId: 101
   * })
   * ```
   */
  update: async (terminalId: number, request: TerminalUpdateRequest): Promise<ApiResponse<null>> => {
    return apiClient.put(`/merchant-terminals/${terminalId}`, request)
  },

  /**
   * 터미널 조회
   *
   * @param terminalId - 터미널 ID
   * @returns 터미널 상세 정보
   *
   * @example
   * ```typescript
   * const response = await terminalsApi.findById(1)
   * console.log(response.data.appMerchantId) // 100
   * ```
   */
  findById: async (terminalId: number): Promise<ApiResponse<Terminal>> => {
    return apiClient.get(`/merchant-terminals/${terminalId}`)
  },

  /**
   * 터미널 목록 조회
   *
   * @param params - 검색 조건
   * @returns 터미널 목록 및 페이징 정보
   *
   * @example
   * ```typescript
   * const response = await terminalsApi.findAll({
   *   centerId: 1,
   *   merchantId: 1,
   *   page: 0,
   *   size: 10
   * })
   * console.log(response.data.terminals) // [...]
   * ```
   */
  findAll: async (params: TerminalListParams): Promise<ApiResponse<TerminalListResponse>> => {
    return apiClient.get('/merchant-terminals', { params })
  },

  /**
   * 터미널 삭제
   *
   * @param terminalId - 터미널 ID
   * @returns 성공 응답
   *
   * @example
   * ```typescript
   * await terminalsApi.delete(1)
   * ```
   */
  delete: async (terminalId: number): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/merchant-terminals/${terminalId}`)
  },
}
