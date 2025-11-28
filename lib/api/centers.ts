/**
 * 센터 관리 API
 *
 * Endpoint: GET /centers
 */

import apiClient from './client'
import type {
  CenterListResponse,
  CenterDetailListResponse,
  CenterDetail,
  CenterCreateRequest,
  CenterUpdateRequest
} from './types'

export const centersApi = {
  /**
   * 센터 목록 조회
   *
   * @returns 센터 목록
   *
   * @example
   * ```typescript
   * const response = await centersApi.findAll()
   * console.log(response.data.centers)
   * ```
   */
  findAll: async () => {
    return apiClient.get<CenterListResponse>('/centers')
  },

  /**
   * 센터 상세 목록 조회 (본사용)
   * 모든 필드를 포함한 센터 목록 조회
   *
   * @returns 센터 상세 목록
   */
  findAllDetail: async () => {
    return apiClient.get<CenterDetailListResponse>('/centers/detail')
  },

  /**
   * 센터 등록
   *
   * @param data 센터 등록 요청 데이터
   * @returns 생성된 센터 정보
   */
  create: async (data: CenterCreateRequest) => {
    return apiClient.post<CenterDetail>('/centers', data)
  },

  /**
   * 센터 수정
   *
   * @param centerId 센터 ID
   * @param data 센터 수정 요청 데이터
   * @returns 수정된 센터 정보
   */
  update: async (centerId: number, data: CenterUpdateRequest) => {
    return apiClient.put<CenterDetail>(`/centers/${centerId}`, data)
  },
}
