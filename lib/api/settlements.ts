/**
 * 정산 관리 API
 *
 * Endpoints:
 * - GET /settlements/merchants/period - 가맹점 정산금액 조회 (기간별)
 * - GET /settlements/merchants/daily - 가맹점 정산금액 조회 (일자별)
 * - GET /settlements/statistics/branch-commission - 지사별 수수료 통계 조회 (본사용)
 */

import apiClient from './client'
import type {
  MerchantSettlementParams,
  MerchantSettlementListResponse,
  MerchantSettlementDailyListResponse,
  BranchCommissionStatisticsParams,
  BranchCommissionStatisticsResponse,
  SettlementAmountParams,
  SettlementAmountListResponse,
  ApiResponse,
} from './types'

export const settlementsApi = {
  /**
   * 가맹점 정산금액 조회 (기간별)
   *
   * @param params - 검색 조건 (centerId, paymentPurpose 필수)
   * @returns 가맹점 정산금액 목록 및 페이징 정보, 전체 합계
   *
   * @example
   * ```typescript
   * const response = await settlementsApi.findMerchantsByPeriod({
   *   centerId: 1,
   *   paymentPurpose: 'DELIVERY_CHARGE',
   *   settlementDateFrom: '2025-01-01',
   *   settlementDateTo: '2025-01-31',
   *   page: 0,
   *   size: 200
   * })
   * console.log(response.data.settlements) // [...]
   * console.log(response.data.totalSummary) // { totalNormalCount: 500, ... }
   * ```
   */
  findMerchantsByPeriod: async (params: MerchantSettlementParams): Promise<ApiResponse<MerchantSettlementListResponse>> => {
    return apiClient.get('/settlements/merchants/period', { params })
  },

  /**
   * 가맹점 정산금액 조회 (일자별)
   *
   * @param params - 검색 조건 (centerId, paymentPurpose 필수)
   * @returns 일자별 정산금액 목록 및 페이징 정보, 전체 합계
   *
   * @example
   * ```typescript
   * const response = await settlementsApi.findMerchantsByDaily({
   *   centerId: 1,
   *   paymentPurpose: 'DELIVERY_CHARGE',
   *   settlementDateFrom: '2025-01-01',
   *   settlementDateTo: '2025-01-31',
   *   page: 0,
   *   size: 200
   * })
   * console.log(response.data.settlements) // [{ date: '2025-01-20', items: [...] }]
   * console.log(response.data.totalSummary) // { totalNormalCount: 500, ... }
   * ```
   */
  findMerchantsByDaily: async (params: MerchantSettlementParams): Promise<ApiResponse<MerchantSettlementDailyListResponse>> => {
    return apiClient.get('/settlements/merchants/daily', { params })
  },

  /**
   * 지사별 수수료 통계 조회 (본사 전용)
   *
   * @param params - 검색 조건 (centerId, paymentPurpose 필수)
   * @returns 지사별 수수료 통계 목록
   *
   * @example
   * ```typescript
   * const response = await settlementsApi.getBranchCommissionStatistics({
   *   centerId: 1,
   *   paymentPurpose: 'DELIVERY_CHARGE',
   *   settlementDateFrom: '2025-01-01',
   *   settlementDateTo: '2025-01-31'
   * })
   * console.log(response.data.statistics) // [{ companyId: 2, name: '서울지사', ... }]
   * ```
   */
  getBranchCommissionStatistics: async (params: BranchCommissionStatisticsParams): Promise<ApiResponse<BranchCommissionStatisticsResponse>> => {
    return apiClient.get('/settlements/statistics/branch-commission', { params })
  },

  /**
   * 계층형 정산 통계 조회
   *
   * @param params - 검색 조건 (centerId, companyId, paymentPurpose 필수)
   * @returns 계층형 정산 통계 (재귀 구조)
   *
   * @example
   * ```typescript
   * const response = await settlementsApi.getHierarchicalStatistics({
   *   centerId: 1,
   *   companyId: 2,
   *   paymentPurpose: 'DELIVERY_CHARGE',
   *   settlementDateFrom: '2025-01-01',
   *   settlementDateTo: '2025-01-31'
   * })
   * console.log(response.data.statistics) // [{ companyId: 2, companyName: '서울지사', children: [...] }]
   * ```
   */
  getHierarchicalStatistics: async (params: any): Promise<ApiResponse<any>> => {
    return apiClient.get('/settlements/statistics', { params })
  },

  /**
   * 정산금액 상세 목록 조회
   *
   * @param params - 검색 조건 (centerId, paymentPurpose, level, companyId 필수)
   * @returns 정산금액 상세 목록, 페이징 정보, 전체 합계
   *
   * @example
   * ```typescript
   * const response = await settlementsApi.getSettlementAmounts({
   *   centerId: 1,
   *   paymentPurpose: 'DELIVERY_CHARGE',
   *   level: 1,
   *   companyId: 10,
   *   transactionDateFrom: '2025-11-01',
   *   transactionDateTo: '2025-11-30',
   *   page: 0,
   *   size: 20
   * })
   * console.log(response.data.settlements) // [{ id: 1234, ... }]
   * console.log(response.data.totalSummary) // { totalCount: 150, ... }
   * ```
   */
  getSettlementAmounts: async (params: SettlementAmountParams): Promise<ApiResponse<SettlementAmountListResponse>> => {
    return apiClient.get('/settlements/amounts', { params })
  },
}
