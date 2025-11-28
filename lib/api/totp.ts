/**
 * TOTP 관리 API
 *
 * Endpoints:
 * - POST /center-totp/setup - TOTP 설정 (QR 코드 생성)
 * - POST /center-totp/enable - TOTP 활성화
 * - POST /center-totp/disable - TOTP 비활성화
 * - GET /center-totp/status - TOTP 상태 조회
 * - POST /center-totp/verify - TOTP 검증
 */

import apiClient from './client'
import type {
  TotpSetupRequest,
  TotpSetupResponse,
  TotpEnableRequest,
  TotpDisableRequest,
  TotpStatusParams,
  TotpStatusResponse,
  TotpVerifyRequest,
  TotpVerifyResponse,
  ApiResponse,
} from './types'

export const totpApi = {
  /**
   * TOTP 설정 (QR 코드 생성)
   *
   * @param request - TOTP 설정 요청 데이터 (centerId)
   * @returns QR 코드 URL 및 비밀 키
   *
   * @example
   * ```typescript
   * const response = await totpApi.setup({ centerId: 1 })
   * console.log(response.data.qrCodeUrl) // data:image/png;base64,...
   * console.log(response.data.secretKey) // JBSWY3DPEHPK3PXP
   * ```
   */
  setup: async (request: TotpSetupRequest): Promise<ApiResponse<TotpSetupResponse>> => {
    return apiClient.post('/center-totp/setup', request)
  },

  /**
   * TOTP 활성화
   *
   * @param request - TOTP 활성화 요청 데이터 (centerId, otpCode)
   * @returns 성공 응답
   *
   * @example
   * ```typescript
   * await totpApi.enable({
   *   centerId: 1,
   *   otpCode: '123456'
   * })
   * ```
   */
  enable: async (request: TotpEnableRequest): Promise<ApiResponse<null>> => {
    return apiClient.post('/center-totp/enable', request)
  },

  /**
   * TOTP 비활성화
   *
   * @param request - TOTP 비활성화 요청 데이터 (centerId)
   * @returns 성공 응답
   *
   * @example
   * ```typescript
   * await totpApi.disable({ centerId: 1 })
   * ```
   */
  disable: async (request: TotpDisableRequest): Promise<ApiResponse<null>> => {
    return apiClient.post('/center-totp/disable', request)
  },

  /**
   * TOTP 상태 조회
   *
   * @param params - 검색 조건 (centerId)
   * @returns TOTP 활성화 여부 및 설정 날짜
   *
   * @example
   * ```typescript
   * const response = await totpApi.getStatus({ centerId: 1 })
   * console.log(response.data.isEnabled) // true
   * console.log(response.data.setupDate) // '2025-01-10T10:00:00'
   * ```
   */
  getStatus: async (params: TotpStatusParams): Promise<ApiResponse<TotpStatusResponse>> => {
    return apiClient.get('/center-totp/status', { params })
  },

  /**
   * TOTP 검증
   *
   * @param request - TOTP 검증 요청 데이터 (centerId, otpCode)
   * @returns 검증 결과
   *
   * @example
   * ```typescript
   * const response = await totpApi.verify({
   *   centerId: 1,
   *   otpCode: '123456'
   * })
   * console.log(response.data.isValid) // true
   * ```
   */
  verify: async (request: TotpVerifyRequest): Promise<ApiResponse<TotpVerifyResponse>> => {
    return apiClient.post('/center-totp/verify', request)
  },
}
