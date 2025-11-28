import { apiClient } from './client'
import type {
  MerchantSalesParams,
  MerchantSalesListResponse
} from './types'

/**
 * 매출 관리 API
 */
export const salesApi = {
  /**
   * 가맹점 매출금액 조회
   */
  findMerchants: async (params: MerchantSalesParams) => {
    return apiClient.get<MerchantSalesListResponse>('/sales/merchants', { params })
  },
}
