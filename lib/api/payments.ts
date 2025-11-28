/**
 * 결제 관리 API
 *
 * Endpoints:
 * - GET /payments - 결제 목록 조회
 * - POST /payments/{paymentId}/cancel - 결제 취소
 */

import apiClient from './client'
import type {
  PaymentListParams,
  PaymentListResponse,
  UnregisteredPaymentListParams,
  UnregisteredPaymentListResponse,
  RegisterTerminalRequest,
  PaymentReceiptResponse,
  ApiResponse,
} from './types'

export const paymentsApi = {
  /**
   * 결제 목록 조회
   *
   * @param params - 검색 조건
   * @returns 결제 목록 및 페이징 정보, 전체 합계
   *
   * @example
   * ```typescript
   * const response = await paymentsApi.findAll({
   *   centerId: 1,
   *   transactionDateFrom: '2025-01-01',
   *   transactionDateTo: '2025-01-31',
   *   paymentStatus: 'SUCCESS',
   *   page: 0,
   *   size: 10
   * })
   * console.log(response.data.payments) // [...]
   * console.log(response.data.totalSummary) // { totalCount: 100, ... }
   * ```
   */
  findAll: async (params: PaymentListParams): Promise<ApiResponse<PaymentListResponse>> => {
    return apiClient.get('/payments', { params })
  },

  /**
   * 결제 취소
   *
   * @param paymentId - 결제 ID
   * @returns 성공 응답
   *
   * @example
   * ```typescript
   * await paymentsApi.cancel(1)
   * ```
   */
  cancel: async (paymentId: number): Promise<ApiResponse<null>> => {
    return apiClient.post(`/payments/${paymentId}/cancel`)
  },

  /**
   * 단말기 미등록 결제 목록 조회
   *
   * @param params - 검색 조건
   * @returns 미등록 결제 목록 및 페이징 정보
   *
   * @example
   * ```typescript
   * const response = await paymentsApi.findUnregistered({
   *   centerId: 1,
   *   paymentPurpose: 'DELIVERY_CHARGE',
   *   transactionDateFrom: '2025-01-01',
   *   transactionDateTo: '2025-01-31',
   *   page: 0,
   *   size: 10
   * })
   * console.log(response.data.payments) // [...]
   * ```
   */
  findUnregistered: async (params: UnregisteredPaymentListParams): Promise<ApiResponse<UnregisteredPaymentListResponse>> => {
    return apiClient.get('/payments/unregistered-terminals', { params })
  },

  /**
   * 결제 단말기 등록 처리
   *
   * @param paymentId - 결제 ID
   * @param data - 등록할 가맹점 정보
   * @returns 성공 응답
   *
   * @example
   * ```typescript
   * await paymentsApi.registerTerminal(1001, { merchantId: 100 })
   * ```
   */
  registerTerminal: async (paymentId: number, data: RegisterTerminalRequest): Promise<ApiResponse<any>> => {
    return apiClient.post(`/payments/${paymentId}/register-terminal`, data)
  },

  /**
   * 결제 전표 조회
   *
   * @param paymentId - 결제 ID
   * @returns 결제 전표 정보 (결제정보, 금액정보, 상점정보, 공급자정보)
   *
   * @example
   * ```typescript
   * const response = await paymentsApi.getReceipt(123)
   * console.log(response.data.paymentInfo) // { payerName: '박정순', ... }
   * console.log(response.data.amountInfo) // { supplyAmount: 181818, ... }
   * ```
   */
  getReceipt: async (paymentId: number): Promise<ApiResponse<PaymentReceiptResponse>> => {
    return apiClient.get(`/payments/${paymentId}/receipt`)
  },
}
