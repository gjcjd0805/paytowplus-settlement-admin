/**
 * 웹 정산 어드민 API 타입 정의
 */

import { PGCodeType } from "../enums"

// ============================================
// Enum 타입
// ============================================

/** 업체 레벨 */
export type CompanyLevel = 'HEADQUARTERS' | 'BRANCH' | 'DISTRIBUTOR' | 'AGENT'

/** 계약 상태 */
export type ContractStatus = 'APPLIED' | 'ACTIVE' | 'TERMINATED'

/** 사업자 구분 */
export type BusinessType = 'INDIVIDUAL' | 'CORPORATE' | 'NON_BUSINESS' | 'OTHER'

/** 정산 주기 */
export type SettlementCycle = 'D_PLUS_0' | 'D_PLUS_1'

/** 결제 목적 */
export type PaymentPurpose = 'DELIVERY_CHARGE' | 'MONTHLY_RENT'

/** 결제 상태 */
export type PaymentStatus = 'SUCCESS' | 'CANCELLED'

/** 사용자 유형 */
export type UserType = 'COMPANY' | 'MERCHANT'

// ============================================
// 인증 API 타입
// ============================================

export interface LoginRequest {
  loginId: string
  password: string
}

export interface LoginResponse {
  token: string
  // userId: number
  companyId?: number
  // userType: UserType
  loginId: string
  centerId?: number
  level?: number
  levelName?: string
  name: string
}

// ============================================
// 센터 관리 API 타입
// ============================================

export interface Center {
  centerId: number
  centerName: string
  pg?: string
  isTotpEnabled?: boolean
  createdDt?: string
}

export interface CenterDetail {
  centerId: number
  centerName: string
  pg: string
  recurringMid: string
  recurringPayKey: string
  manualMid: string
  manualPayKey: string
  transferFee: number
  pgFeeRate: number
  werouteSamwCode?: string
  werouteSamwApiKey?: string
  werouteSamwEncKey?: string
  werouteSamwIv?: string
  werouteSamwUserName?: string
  werouteSamwUserPw?: string
  d1RecurringMid?: string
  d1RecurringPayKey?: string
  d1ManualMid?: string
  d1ManualPayKey?: string
  d1PgFeeRate?: number
  d1WerouteSamwCode?: string
  d1WerouteSamwApiKey?: string
  d1WerouteSamwEncKey?: string
  d1WerouteSamwIv?: string
  d1WerouteSamwUserName?: string
  d1WerouteSamwUserPw?: string
  isTotpEnabled: boolean
  totpQrCodeUrl?: string | null
  centerOwnerName: string
  centerBizNumber: string
  centerPhone: string
  centerAddress: string
  pgCompanyName: string
  pgOwnerName: string
  pgBizNumber: string
  pgPhone: string
  pgAddress: string
  createdDt: string
  modifiedDt: string
}

export interface CenterListResponse {
  centers: Center[]
}

export interface CenterDetailListResponse {
  centers: CenterDetail[]
}

export interface CenterCreateRequest {
  centerName: string
  pg: string
  recurringMid: string
  recurringPayKey: string
  manualMid: string
  manualPayKey: string
  transferFee?: number
  pgFeeRate?: number
  werouteSamwCode?: string
  werouteSamwApiKey?: string
  werouteSamwEncKey?: string
  werouteSamwIv?: string
  werouteSamwUserName?: string
  werouteSamwUserPw?: string
  d1RecurringMid?: string
  d1RecurringPayKey?: string
  d1ManualMid?: string
  d1ManualPayKey?: string
  d1PgFeeRate?: number
  d1WerouteSamwCode?: string
  d1WerouteSamwApiKey?: string
  d1WerouteSamwEncKey?: string
  d1WerouteSamwIv?: string
  d1WerouteSamwUserName?: string
  d1WerouteSamwUserPw?: string
  centerOwnerName: string
  centerBizNumber: string
  centerPhone: string
  centerAddress: string
  pgCompanyName: string
  pgOwnerName: string
  pgBizNumber: string
  pgPhone: string
  pgAddress: string
}

export interface CenterUpdateRequest {
  centerName?: string
  pg?: string
  recurringMid?: string
  recurringPayKey?: string
  manualMid?: string
  manualPayKey?: string
  transferFee?: number
  pgFeeRate?: number
  werouteSamwCode?: string
  werouteSamwApiKey?: string
  werouteSamwEncKey?: string
  werouteSamwIv?: string
  werouteSamwUserName?: string
  werouteSamwUserPw?: string
  d1RecurringMid?: string
  d1RecurringPayKey?: string
  d1ManualMid?: string
  d1ManualPayKey?: string
  d1PgFeeRate?: number
  d1WerouteSamwCode?: string
  d1WerouteSamwApiKey?: string
  d1WerouteSamwEncKey?: string
  d1WerouteSamwIv?: string
  d1WerouteSamwUserName?: string
  d1WerouteSamwUserPw?: string
  isTotpEnabled?: boolean
  centerOwnerName?: string
  centerBizNumber?: string
  centerPhone?: string
  centerAddress?: string
  pgCompanyName?: string
  pgOwnerName?: string
  pgBizNumber?: string
  pgPhone?: string
  pgAddress?: string
}

// ============================================
// 업체 관리 API 타입
// ============================================

export interface CompanyCreateRequest {
  centerId: number
  name: string
  loginId: string
  password: string
  parentCompanyId?: number | null
  businessType?: BusinessType
  representativeName?: string
  representativeAddress?: string
  managerName?: string
  managerContact?: string
  managerEmail?: string
  companyName?: string
  companyPhoneNumber?: string
  businessRegistrationNumber?: string
  corporateRegistrationNumber?: string
  businessCategory?: string
  businessItem?: string
  businessAddress?: string
  isLoginAllowed?: boolean
  contractStatus: ContractStatus
  bankCode?: string
  accountHolder?: string
  accountNumber?: string
}

export interface CompanyUpdateRequest {
  name?: string
  parentCompanyId?: number | null
  businessType?: BusinessType
  representativeName?: string
  representativeAddress?: string
  managerName?: string
  managerContact?: string
  managerEmail?: string
  companyName?: string
  companyPhoneNumber?: string
  businessRegistrationNumber?: string
  corporateRegistrationNumber?: string
  businessCategory?: string
  businessItem?: string
  businessAddress?: string
  isLoginAllowed?: boolean
  contractStatus?: ContractStatus
  bankCode?: string
  accountHolder?: string
  accountNumber?: string
  memo?: string
}

export interface Company {
  id: number
  centerId: number
  name: string
  parentCompanyId?: number | null
  companyCodePath: string
  companyNamePath: string
  levelCode: CompanyLevel
  level: number
  businessType?: BusinessType
  representativeName?: string
  representativeAddress?: string
  managerName?: string
  managerContact?: string
  managerEmail?: string
  companyName?: string
  companyPhoneNumber?: string
  businessRegistrationNumber?: string
  corporateRegistrationNumber?: string
  businessCategory?: string
  businessItem?: string
  businessAddress?: string
  isLoginAllowed: boolean
  contractStatus: ContractStatus
  bankCode?: string
  accountHolder?: string
  accountNumber?: string
  loginId: string
  password: string
  registDt: string
  updateDt: string
  memo?: string
}

export interface CompanyListItem {
  no: number
  id: number
  name: string
  companyNamePath: string
  levelCode: CompanyLevel
  level: number
  representativeName?: string
  companyPhoneNumber?: string
  managerName?: string
  managerContact?: string
  loginId: string
  password?: string
  businessType?: BusinessType
  contractStatus: ContractStatus
  registDt: string
}

export interface CompanyListParams {
  centerId: number
  companyId?: number
  name?: string
  representativeName?: string
  companyPhoneNumber?: string
  managerName?: string
  managerContact?: string
  loginId?: string
  levelCode?: CompanyLevel
  businessType?: BusinessType
  contractStatus?: ContractStatus
  registDateFrom?: string // yyyy-MM-dd
  registDateTo?: string // yyyy-MM-dd
  page?: number
  size?: number
}

export interface CompanyListResponse {
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  companies: CompanyListItem[]
}

// ============================================
// 가맹점 관리 API 타입
// ============================================

export interface MerchantCreateRequest {
  name: string
  loginId: string
  password: string
  companyId: number
  centerId: number
  businessType?: BusinessType
  representativeName?: string
  representativeResidentNumber?: string
  representativeAddress?: string
  managerName?: string
  managerContact?: string
  managerEmail?: string
  companyName?: string
  businessPhoneNumber?: string
  businessRegistrationNumber?: string
  corporateRegistrationNumber?: string
  businessCategory?: string
  businessItem?: string
  businessAddress?: string
  isLoginAllowed?: boolean
  contractStatus: ContractStatus
  settlementCycle?: SettlementCycle
  isSameDayCancellationAllowed?: boolean
  paymentLimitPerTransaction?: number
  paymentLimitPerMonth?: number
  bankCode?: string
  accountHolder?: string
  accountNumber?: string
  deliveryFeeCommissionRate?: number
  monthlyRentCommissionRate?: number
}

export interface MerchantUpdateRequest {
  name?: string
  companyId?: number
  businessType?: BusinessType
  representativeName?: string
  representativeResidentNumber?: string
  representativeAddress?: string
  managerName?: string
  managerContact?: string
  managerEmail?: string
  companyName?: string
  businessPhoneNumber?: string
  businessRegistrationNumber?: string
  corporateRegistrationNumber?: string
  businessCategory?: string
  businessItem?: string
  businessAddress?: string
  isLoginAllowed?: boolean
  contractStatus?: ContractStatus
  settlementCycle?: SettlementCycle
  isSameDayCancellationAllowed?: boolean
  paymentLimitPerTransaction?: number
  paymentLimitPerMonth?: number
  bankCode?: string
  accountHolder?: string
  accountNumber?: string
  deliveryFeeCommissionRate?: number
  monthlyRentCommissionRate?: number
}

export interface Merchant {
  id: number
  name: string
  loginId: string
  centerId: number
  companyId: number
  companyNamePath: string
  businessType: BusinessType
  representativeName?: string
  representativeResidentNumber?: string
  representativeAddress?: string
  managerName?: string
  managerContact?: string
  managerEmail?: string
  companyName: string
  businessPhoneNumber?: string
  businessRegistrationNumber?: string
  corporateRegistrationNumber?: string
  businessCategory?: string
  businessItem?: string
  businessAddress?: string
  isLoginAllowed: boolean
  contractStatus: ContractStatus
  settlementCycle: SettlementCycle
  isSameDayCancellationAllowed: boolean
  paymentLimitPerTransaction?: number
  paymentLimitPerMonth?: number
  bankCode: string
  accountHolder: string
  accountNumber: string
  deliveryFeeCommissionRate?: number
  monthlyRentCommissionRate?: number
  memo?: string
  registDt: string
  updateDt: string
}

export interface MerchantListItem {
  no: number
  id: number
  name: string
  companyNamePath: string
  loginId: string
  password: string
  representativeName?: string
  businessPhoneNumber?: string
  managerName?: string
  managerContact?: string
  businessType?: BusinessType
  contractStatus: ContractStatus
  settlementCycle?: SettlementCycle
  paymentLimitPerTransaction?: number
  paymentLimitPerMonth?: number
  deliveryFeeCommissionRate?: number
  monthlyRentCommissionRate?: number
  registDt: string
}

export interface MerchantListParams {
  centerId: number
  merchantId?: number
  name?: string
  loginId?: string
  companyName?: string
  representativeName?: string
  managerContact?: string
  businessType?: BusinessType
  contractStatus?: ContractStatus
  registDateFrom?: string // yyyy-MM-dd
  registDateTo?: string // yyyy-MM-dd
  page?: number
  size?: number
}

export interface MerchantListResponse {
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  merchants: MerchantListItem[]
}

export interface MerchantCreateResponse {
  merchantId: number
}

// ============================================
// 터미널 관리 API 타입
// ============================================

export interface TerminalCreateRequest {
  merchantId: number
  terminalCode: string
}

export interface TerminalUpdateRequest {
  terminalCode: string
  memo?: string
}

export interface Terminal {
  id: number
  merchantId: number
  merchantName: string
  terminalCode: string
  memo?: string
  registDt: string
  updateDt: string
}

export interface TerminalListParams {
  centerId: number
  merchantId?: number
  page?: number
  size?: number
}

export interface TerminalListResponse {
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  terminals: Terminal[]
}

// ============================================
// 수수료 관리 API 타입
// ============================================

export interface CommissionUpdateRequest {
  merchantCommission: number
  headquartersCommission: number
  branchCommission: number
  distributorCommission: number
  agentCommission: number
}

export interface Commission {
  id: number
  merchantId: number
  companyNamePath: string
  merchantName: string
  paymentPurpose: PaymentPurpose
  merchantCommission: number
  headquartersCommission: number
  branchCommission: number
  distributorCommission: number
  agentCommission: number
}

export interface CommissionListParams {
  centerId: number
  paymentPurpose: PaymentPurpose
  merchantId?: number
  companyName?: string
  merchantName?: string
  page?: number
  size?: number
}

export interface CommissionListResponse {
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  commissions: Commission[]
}

export interface CommissionHistory {
  id: number
  commissionId: number
  merchantId: number
  merchantName: string
  paymentPurpose: PaymentPurpose
  merchantCommission: string
  headquartersCommission: string
  branchCommission: string
  distributorCommission: string
  agentCommission: string
  createdDt: string
  createdBy: number
}

export interface CommissionHistoryListParams {
  commissionId: number
  page?: number
  size?: number
}

export interface CommissionHistoryListResponse {
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  histories: CommissionHistory[]
}

// ============================================
// 결제 관리 API 타입
// ============================================

export interface Payment {
  id: number
  transactionDate: string
  paymentStatus: PaymentStatus
  merchantName: string
  terminalCode: string
  acquirerName: string
  installmentMonths: number
  cardNumber: string
  approvalNumber: string
  approvalAmount: number
  cancelAmount: number
  transactionAmount: number
  fee: number
  settlementAmount: number
  feeRate: number
  agentCompanyName: string
  originalTransactionDate: string | null
  pgCode: PGCodeType
  orderId: string
}

export interface PaymentListParams {
  centerId: number
  transactionDateFrom: string // yyyy-MM-dd
  transactionDateTo: string // yyyy-MM-dd
  paymentStatus?: PaymentStatus
  pgCode?: string
  merchantName?: string
  approvalNumber?: string
  terminalCode?: string
  page?: number
  size?: number
}

export interface PaymentTotalSummary {
  totalCount: number
  totalApprovalAmount: number
  totalCancelAmount: number
  totalTransactionAmount: number
  totalFee: number
  totalSettlementAmount: number
}

// 단말기 미등록 결제
export interface UnregisteredPayment {
  id: number
  approvalDate: string
  paymentStatus: PaymentStatus
  terminalCode: string | null
  approvalNumber: string | null
  approvalAmount: number
  cancelAmount: number
  transactionAmount: number
  cancelApprovalDate: string | null
}

export interface UnregisteredPaymentListParams {
  centerId: number
  paymentPurpose: PaymentPurpose
  transactionDateFrom?: string
  transactionDateTo?: string
  page?: number
  size?: number
  sort?: string
}

export interface UnregisteredPaymentListResponse {
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  payments: UnregisteredPayment[]
}

export interface RegisterTerminalRequest {
  merchantId: number
}

export interface PaymentListResponse {
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  payments: Payment[]
  totalSummary: PaymentTotalSummary
}

// ============================================
// 정산 관리 API 타입
// ============================================

export interface NormalSettlement {
  count: number
  transactionAmount: number
  fee: number
  settlementAmount: number
}

export interface CanceledSettlement {
  count: number
  cancelAmount: number
  fee: number
  deductedAmount: number
  totalCanceledAmount: number
}

export interface MerchantSettlement {
  merchantId: number
  merchantName: string
  bankName: string
  bankCode: string
  accountNumber: string
  accountHolder: string
  normal: NormalSettlement
  canceled: CanceledSettlement
  totalDeduct: number
  finalSettlement: number
  totalFee: number
  transferFee: number
  depositAmount: number
}

export interface MerchantSettlementParams {
  centerId: number
  paymentPurpose: PaymentPurpose
  pgCode?: string
  settlementDateFrom?: string // yyyy-MM-dd
  settlementDateTo?: string // yyyy-MM-dd
  companyName?: string
  merchantName?: string
  page?: number
  size?: number
}

export interface MerchantSettlementTotalSummary {
  totalNormalCount: number
  totalNormalTransactionAmount: number
  totalNormalFee: number
  totalNormalSettlementAmount: number
  totalCanceledCount: number
  totalCanceledCancelAmount: number
  totalCanceledFee: number
  totalCanceledDeductedAmount: number
  totalCanceledTotalAmount: number
  totalDeduct: number
  totalFinalSettlement: number
  totalFee: number
  totalTransferFee: number
  totalDepositAmount: number
}

export interface MerchantSettlementListResponse {
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  settlements: MerchantSettlement[]
  totalSummary: MerchantSettlementTotalSummary
}

// 일자별 정산 데이터 (날짜별 그룹화)
export interface DailySettlementGroup {
  date: string
  items: MerchantSettlement[]
}

export interface MerchantSettlementDailyListResponse {
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  settlements: DailySettlementGroup[]
  totalSummary: MerchantSettlementTotalSummary
}

// ============================================
// 매출 관리 API 타입
// ============================================

export interface MerchantSales {
  merchantId: number
  merchantName: string
  count: number
  approvalAmount: number
  cancelAmount: number
  transactionAmount: number
  fee: number
  settlementAmount: number
  companyNamePath: string
}

export interface MerchantSalesParams {
  centerId: number
  paymentPurpose: PaymentPurpose
  settlementDateFrom?: string // yyyy-MM-dd
  settlementDateTo?: string // yyyy-MM-dd
  paymentDateFrom?: string // yyyy-MM-dd
  paymentDateTo?: string // yyyy-MM-dd
  pgCode?: string
  companyName?: string
  merchantName?: string
  page?: number
  size?: number
}

export interface MerchantSalesTotalSummary {
  totalCount: number
  totalApprovalAmount: number
  totalCancelAmount: number
  totalTransactionAmount: number
  totalFee: number
  totalSettlementAmount: number
}

export interface MerchantSalesListResponse {
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  sales: MerchantSales[]
  totalSummary: MerchantSalesTotalSummary
}

// ============================================
// TOTP 관리 API 타입
// ============================================

export interface TotpSetupRequest {
  centerId: number
}

export interface TotpSetupResponse {
  qrCodeUrl: string
  secretKey: string
}

export interface TotpEnableRequest {
  centerId: number
  otpCode: string
}

export interface TotpDisableRequest {
  centerId: number
}

export interface TotpStatusParams {
  centerId: number
}

export interface TotpStatusResponse {
  isEnabled: boolean
  setupDate?: string
}

export interface TotpVerifyRequest {
  centerId: number
  otpCode: string
}

export interface TotpVerifyResponse {
  isValid: boolean
}

// ============================================
// 공지사항 관리 API 타입
// ============================================

export interface Notice {
  id: number
  isNotice: boolean
  title: string
  content: string
  author: string
  viewCount: number
  registDt: string
  updateDt: string
}

export interface NoticeListParams {
  title?: string
  content?: string
  isNotice?: boolean
  registDateFrom?: string
  registDateTo?: string
  page?: number
  size?: number
  sort?: string
}

export interface NoticeListResponse  {
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  notices: Notice[]
}

export interface NoticeCreateRequest {
  isNotice: boolean
  title: string
  content: string
  author: string
}

export interface NoticeUpdateRequest {
  isNotice?: boolean
  title?: string
  content?: string
  author?: string
}

// ============================================
// 정산 통계 API 타입
// ============================================

// 지사별 수수료 통계 조회 요청 파라미터
export interface BranchCommissionStatisticsParams {
  centerId: number
  paymentPurpose: string
  settlementDateFrom?: string
  settlementDateTo?: string
  paymentDateFrom?: string
  paymentDateTo?: string
}

// 수수료율별 집계
export interface CommissionRateSummary {
  merchantCommissionRate: number
  transactionCount: number
  approvalAmount: number
  cancelAmount: number
  transactionAmount: number
}

// 지사별 통계 항목
export interface BranchStatistics {
  companyId: number
  name: string
  totalTransactionCount: number
  totalApprovalAmount: number
  totalCancelAmount: number
  totalTransactionAmount: number
  summaryArr: CommissionRateSummary[]
}

// 지사별 수수료 통계 조회 응답
export interface BranchCommissionStatisticsResponse {
  statistics: BranchStatistics[]
}

// 계층형 정산 통계 조회 요청 파라미터
export interface HierarchicalSettlementStatisticsParams {
  centerId: number
  companyId: number
  paymentPurpose: string
  settlementDateFrom?: string
  settlementDateTo?: string
  paymentDateFrom?: string
  paymentDateTo?: string
}

// 계층형 정산 통계 합계
export interface HierarchicalSummary {
  merchantCommissionRate: number | null
  transactionCount: number
  approvalAmount: number
  cancelAmount: number
  transactionAmount: number
  agentSettlementAmount: number
  distributorSettlementAmount: number
  branchSettlementAmount: number
  totalSettlementAmount: number
}

// 계층형 정산 통계 수수료율별 집계
export interface HierarchicalCommissionRateSummary {
  merchantCommissionRate: number
  transactionCount: number
  approvalAmount: number
  cancelAmount: number
  transactionAmount: number
  agentSettlementAmount: number
  distributorSettlementAmount: number
  branchSettlementAmount: number
  totalSettlementAmount: number
}

// 계층형 정산 통계 항목 (재귀 구조)
export interface HierarchicalStatistics {
  companyId: number
  companyName: string
  level: number
  bankName: string | null
  bankCode: string | null
  accountNumber: string | null
  accountHolder: string | null
  parentCompanyId: number | null
  summary: HierarchicalSummary
  summaryArr: HierarchicalCommissionRateSummary[]
  children: HierarchicalStatistics[]
}

// 계층형 정산 통계 조회 응답
export interface HierarchicalSettlementStatisticsResponse {
  statistics: HierarchicalStatistics[]
}

// ============================================
// 정산금액 상세 조회 API 타입
// ============================================

// 정산금액 상세 조회 파라미터
export interface SettlementAmountParams {
  centerId: number
  paymentPurpose: string
  level: number // 1: 지사, 2: 총판, 3: 대리점
  companyId: number
  settlementDateFrom?: string
  settlementDateTo?: string
  transactionDateFrom?: string
  transactionDateTo?: string
  pgCode?: string
  page?: number
  size?: number
}

// 정산금액 상세 항목
export interface SettlementAmountDetail {
  id: number
  transactionDate: string
  paymentStatus: string
  branchName: string
  distributorName: string
  agentName: string
  merchantName: string
  terminalCode: string
  approvalNumber: string
  approvalAmount: number
  cancelAmount: number
  transactionAmount: number
  merchantFee: number
  merchantCommissionRate: string
  branchSettlementAmount: number
  branchCommissionRate: string
  distributorSettlementAmount: number
  distributorCommissionRate: string
  agentSettlementAmount: number
  agentCommissionRate: string
  merchantSettlementAmount: number
  settlementDate: string
  settlementStatus: string
  cancelDate: string | null
  originalTransactionDate: string | null
}

// 정산금액 전체 합계
export interface SettlementAmountTotalSummary {
  totalCount: number
  totalApprovalAmount: number
  totalCancelAmount: number
  totalTransactionAmount: number
  totalMerchantFee: number
  totalBranchSettlementAmount: number
  totalDistributorSettlementAmount: number
  totalAgentSettlementAmount: number
  totalMerchantSettlementAmount: number
}

// 정산금액 상세 조회 응답
export interface SettlementAmountListResponse {
  settlements: SettlementAmountDetail[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
  totalSummary: SettlementAmountTotalSummary
}

// ============================================
// 결제 전표 API 타입
// ============================================

// 결제 전표 - 결제정보
export interface PaymentReceiptPaymentInfo {
  payerName: string
  productName: string
  cardNumber: string
  cardType: string
  installmentMonths: string
  approvalNumber: string
  approvalDate: string
  cancelDate?: string
}

// 결제 전표 - 결제금액정보
export interface PaymentReceiptAmountInfo {
  supplyAmount: number
  taxAmount: number
  totalAmount: number
}

// 결제 전표 - 상점정보 (센터)
export interface PaymentReceiptStoreInfo {
  storeName: string
  ownerName: string
  bizNumber: string
  phone: string
  address: string
  url?: string
}

// 결제 전표 - 공급자정보 (PG)
export interface PaymentReceiptSupplierInfo {
  companyName: string
  ownerName: string
  bizNumber: string
  phone: string
  address: string
}

// 결제 전표 조회 응답
export interface PaymentReceiptResponse {
  paymentInfo: PaymentReceiptPaymentInfo
  amountInfo: PaymentReceiptAmountInfo
  storeInfo: PaymentReceiptStoreInfo
  supplierInfo: PaymentReceiptSupplierInfo
}

// ============================================
// 공통 응답 타입
// ============================================

export interface ApiResponse<T = any> {
  data: T
}

export interface ApiErrorResponse {
  message: string
  status: number
  errorCode: string
  timeStamp: string
}

export interface PaginationParams {
  page?: number
  size?: number
}
