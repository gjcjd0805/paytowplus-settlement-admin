/**
 * 가맹점 업체별 수수료 관리 API
 *
 * Endpoints:
 * - PUT /merchant-commissions/{commissionId} - 수수료 설정 수정
 * - GET /merchant-commissions - 수수료 설정 목록 조회
 * - GET /merchant-commission-histories/{historyId} - 수수료 변경 이력 단건 조회
 * - GET /merchant-commissions/{commissionId}/histories - 수수료 설정별 이력 목록 조회
 */

import apiClient from './client'
import type {
  CommissionUpdateRequest,
  CommissionListParams,
  CommissionListResponse,
  CommissionHistory,
  CommissionHistoryListResponse,
  ApiResponse,
} from './types'

export const commissionsApi = {
  /**
   * 수수료 설정 수정
   *
   * 가맹점의 결제 목적별 수수료를 4단계 업체별로 설정
   *
   * @param commissionId - 수수료 설정 ID
   * @param request - 수수료 수정 데이터
   * @returns 성공 응답
   *
   * @example
   * ```typescript
   * await commissionsApi.update(1, {
   *   headquartersCommission: 0.5,
   *   branchCommission: 1.0,
   *   distributorCommission: 1.5,
   *   agentCommission: 0.5
   * })
   * ```
   */
  update: async (commissionId: number, request: CommissionUpdateRequest): Promise<ApiResponse<null>> => {
    return apiClient.put(`/merchant-commissions/${commissionId}`, request)
  },

  /**
   * 수수료 설정 목록 조회
   *
   * @param params - 검색 조건 (centerId, paymentPurpose 필수)
   * @returns 수수료 설정 목록
   *
   * @example
   * ```typescript
   * const response = await commissionsApi.findAll({
   *   centerId: 1,
   *   paymentPurpose: 'DELIVERY_CHARGE',
   *   page: 0,
   *   size: 10
   * })
   * console.log(response.data.commissions) // [...]
   * ```
   */
  findAll: async (params: CommissionListParams): Promise<ApiResponse<CommissionListResponse>> => {
    return apiClient.get('/merchant-commissions', { params })
  },

  /**
   * 수수료 변경 이력 단건 조회
   *
   * @param historyId - 이력 ID
   * @returns 수수료 변경 이력
   *
   * @example
   * ```typescript
   * const response = await commissionsApi.getHistory(1)
   * console.log(response.data) // { id: 1, merchantName: '강남점', ... }
   * ```
   */
  getHistory: async (historyId: number): Promise<ApiResponse<CommissionHistory>> => {
    return apiClient.get(`/merchant-commission-histories/${historyId}`)
  },

  /**
   * 수수료 설정별 변경 이력 목록 조회
   *
   * @param commissionId - 수수료 설정 ID
   * @param params - 페이지네이션 파라미터
   * @returns 수수료 변경 이력 목록
   *
   * @example
   * ```typescript
   * const response = await commissionsApi.getHistories(1, { page: 0, size: 10 })
   * console.log(response.data.histories) // [...]
   * ```
   */
  getHistories: async (commissionId: number, params?: { page?: number; size?: number }): Promise<ApiResponse<CommissionHistoryListResponse>> => {
    return apiClient.get(`/merchant-commissions/${commissionId}/histories`, { params })
  },
}
