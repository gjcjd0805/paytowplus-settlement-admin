/**
 * 업체 관리 API
 *
 * Endpoints:
 * - POST /companies - 업체 등록
 * - PUT /companies/{companyId} - 업체 수정
 * - GET /companies/{companyId} - 업체 조회
 * - GET /companies - 업체 목록 조회
 */

import apiClient from './client'
import type {
  CompanyCreateRequest,
  CompanyUpdateRequest,
  Company,
  CompanyListParams,
  CompanyListResponse,
  ApiResponse,
} from './types'

export const companiesApi = {
  /**
   * 업체 등록
   *
   * @param request - 업체 등록 데이터
   * @returns 성공 응답
   *
   * @example
   * ```typescript
   * await companiesApi.create({
   *   centerId: 1,
   *   name: '서울지사',
   *   loginId: 'company001',
   *   password: 'password123',
   *   contractStatus: 'CONTRACTED'
   * })
   * ```
   */
  create: async (request: CompanyCreateRequest): Promise<ApiResponse<null>> => {
    return apiClient.post('/companies', request)
  },

  /**
   * 업체 수정
   *
   * @param companyId - 업체 ID
   * @param request - 업체 수정 데이터
   * @returns 성공 응답
   *
   * @example
   * ```typescript
   * await companiesApi.update(10, {
   *   name: '서울지사 변경',
   *   managerName: '김담당'
   * })
   * ```
   */
  update: async (companyId: number, request: CompanyUpdateRequest): Promise<ApiResponse<null>> => {
    return apiClient.put(`/companies/${companyId}`, request)
  },

  /**
   * 업체 조회
   *
   * @param companyId - 업체 ID
   * @returns 업체 상세 정보
   *
   * @example
   * ```typescript
   * const response = await companiesApi.findById(10)
   * console.log(response.data.name) // '서울지사'
   * ```
   */
  findById: async (companyId: number): Promise<ApiResponse<Company>> => {
    return apiClient.get(`/companies/${companyId}`)
  },

  /**
   * 업체 목록 조회
   *
   * 로그인한 사용자의 업체 및 하위 업체만 조회됨
   *
   * @param params - 검색 조건
   * @returns 업체 목록 및 페이징 정보
   *
   * @example
   * ```typescript
   * const response = await companiesApi.findAll({
   *   centerId: 1,
   *   name: '서울',
   *   page: 0,
   *   size: 10
   * })
   * console.log(response.data.totalElements) // 50
   * console.log(response.data.companies) // [...]
   * ```
   */
  findAll: async (params: CompanyListParams): Promise<ApiResponse<CompanyListResponse>> => {
    return apiClient.get('/companies', { params })
  },
}
