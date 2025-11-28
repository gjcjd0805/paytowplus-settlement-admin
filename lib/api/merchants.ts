/**
 * 가맹점 관리 API
 *
 * Endpoints:
 * - POST /merchants - 가맹점 등록
 * - PUT /merchants/{merchantId} - 가맹점 수정
 * - GET /merchants/{merchantId} - 가맹점 조회
 * - GET /merchants - 가맹점 목록 조회
 * - DELETE /merchants/{merchantId} - 가맹점 삭제
 */

import apiClient from './client'
import type {
  MerchantCreateRequest,
  MerchantUpdateRequest,
  Merchant,
  MerchantListParams,
  MerchantListResponse,
  MerchantCreateResponse,
  ApiResponse,
} from './types'

export const merchantsApi = {
  /**
   * 가맹점 등록
   *
   * @param request - 가맹점 등록 데이터
   * @returns 생성된 가맹점 ID
   *
   * @example
   * ```typescript
   * const response = await merchantsApi.create({
   *   name: '강남점',
   *   loginId: 'merchant001',
   *   password: 'password123',
   *   companyId: 10,
   *   centerId: 1,
   *   contractStatus: 'CONTRACTED'
   * })
   * console.log(response.data.merchantId) // 1
   * ```
   */
  create: async (request: MerchantCreateRequest): Promise<ApiResponse<MerchantCreateResponse>> => {
    return apiClient.post('/merchants', request)
  },

  /**
   * 가맹점 수정
   *
   * @param merchantId - 가맹점 ID
   * @param request - 가맹점 수정 데이터
   * @returns 성공 응답
   *
   * @example
   * ```typescript
   * await merchantsApi.update(1, {
   *   name: '강남점 변경',
   *   managerName: '박매니저'
   * })
   * ```
   */
  update: async (merchantId: number, request: MerchantUpdateRequest): Promise<ApiResponse<null>> => {
    return apiClient.put(`/merchants/${merchantId}`, request)
  },

  /**
   * 가맹점 조회
   *
   * @param merchantId - 가맹점 ID
   * @returns 가맹점 상세 정보
   *
   * @example
   * ```typescript
   * const response = await merchantsApi.findById(1)
   * console.log(response.data.name) // '강남점'
   * console.log(response.data.companyNamePath) // '서울지사'
   * ```
   */
  findById: async (merchantId: number): Promise<ApiResponse<Merchant>> => {
    return apiClient.get(`/merchants/${merchantId}`)
  },

  /**
   * 가맹점 목록 조회
   *
   * 로그인한 사용자의 업체 하위 가맹점만 조회됨
   *
   * @param params - 검색 조건
   * @returns 가맹점 목록 및 페이징 정보
   *
   * @example
   * ```typescript
   * const response = await merchantsApi.findAll({
   *   centerId: 1,
   *   name: '강남',
   *   page: 0,
   *   size: 10
   * })
   * console.log(response.data.totalElements) // 100
   * console.log(response.data.merchants) // [...]
   * ```
   */
  findAll: async (params: MerchantListParams): Promise<ApiResponse<MerchantListResponse>> => {
    return apiClient.get('/merchants', { params })
  },

  /**
   * 가맹점 삭제
   *
   * @param merchantId - 가맹점 ID
   * @returns 성공 응답
   *
   * @example
   * ```typescript
   * await merchantsApi.delete(1)
   * ```
   */
  delete: async (merchantId: number): Promise<ApiResponse<null>> => {
    return apiClient.delete(`/merchants/${merchantId}`)
  },
}
