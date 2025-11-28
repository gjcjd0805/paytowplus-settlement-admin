import type { ContractStatus, CompanyLevel } from '@/lib/api/types'

// ============================================
// 날짜 탭 상수
// ============================================
export const DATE_TABS = ['오늘', '어제', '3일전', '한달전', '당월'] as const
export type DateTab = (typeof DATE_TABS)[number]

// ============================================
// 페이지 크기 옵션
// ============================================
export const PAGE_SIZE_OPTIONS = [10, 15, 30, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 15

// ============================================
// 업체 검색 조건
// ============================================
export const COMPANY_SEARCH_CONDITIONS = [
  { label: '업체코드', value: 'companyId' },
  { label: '업체명', value: 'name' },
  { label: '대표자명', value: 'representativeName' },
  { label: '전화번호', value: 'companyPhoneNumber' },
  { label: '담당자명', value: 'managerName' },
  { label: '담당자연락처', value: 'managerContact' },
  { label: '아이디', value: 'loginId' },
] as const

export type CompanySearchConditionValue = (typeof COMPANY_SEARCH_CONDITIONS)[number]['value']

// ============================================
// 가맹점 검색 조건
// ============================================
export const MERCHANT_SEARCH_CONDITIONS = [
  { label: '업체명', value: 'companyName' },
  { label: '가맹점코드', value: 'merchantId' },
  { label: '가맹점명', value: 'name' },
  { label: '대표자명', value: 'representativeName' },
  { label: '담당자연락처', value: 'managerContact' },
  { label: '아이디', value: 'loginId' },
] as const

export type MerchantSearchConditionValue = (typeof MERCHANT_SEARCH_CONDITIONS)[number]['value']

// ============================================
// 계약 상태 옵션
// ============================================
export const CONTRACT_STATUS_OPTIONS: { label: string; value: 'all' | ContractStatus }[] = [
  { label: '모두', value: 'all' },
  { label: '신청', value: 'APPLIED' },
  { label: '정상', value: 'ACTIVE' },
  { label: '해지', value: 'TERMINATED' },
]

// ============================================
// 업체 레벨 매핑
// ============================================
export const COMPANY_LEVEL_MAP: Record<string, CompanyLevel> = {
  '1': 'BRANCH',
  '2': 'DISTRIBUTOR',
  '3': 'AGENT',
}

export const COMPANY_LEVEL_LABELS: Record<string, string> = {
  '': '전체',
  '1': '지사',
  '2': '총판',
  '3': '대리점',
}

// ============================================
// 사업자 구분
// ============================================
export const BUSINESS_TYPE_OPTIONS = [
  { label: '비사업자', value: 'NON_BUSINESS' },
  { label: '개인사업자', value: 'INDIVIDUAL' },
  { label: '법인사업자', value: 'CORPORATE' },
] as const

// ============================================
// 정산 주기
// ============================================
export const SETTLEMENT_CYCLE_OPTIONS = [
  { label: 'D+0', value: 'D_PLUS_0' },
  { label: 'D+1', value: 'D_PLUS_1' },
  { label: 'D+2', value: 'D_PLUS_2' },
  { label: 'D+3', value: 'D_PLUS_3' },
  { label: 'D+7', value: 'D_PLUS_7' },
] as const

// ============================================
// 은행 코드
// ============================================
export const BANKS = [
  { code: '004', name: 'KB국민은행' },
  { code: '088', name: '신한은행' },
  { code: '020', name: '우리은행' },
  { code: '081', name: '하나은행' },
  { code: '011', name: 'NH농협은행' },
  { code: '023', name: 'SC제일은행' },
  { code: '027', name: '씨티은행' },
  { code: '039', name: '경남은행' },
  { code: '034', name: '광주은행' },
  { code: '031', name: '대구은행' },
  { code: '032', name: '부산은행' },
  { code: '037', name: '전북은행' },
  { code: '035', name: '제주은행' },
  { code: '002', name: '산업은행' },
  { code: '003', name: '기업은행' },
  { code: '007', name: '수협은행' },
  { code: '045', name: '새마을금고' },
  { code: '048', name: '신협' },
  { code: '071', name: '우체국' },
  { code: '089', name: '케이뱅크' },
  { code: '090', name: '카카오뱅크' },
  { code: '092', name: '토스뱅크' },
] as const

/**
 * 은행 코드로 은행명 조회
 */
export function getBankName(code: string): string {
  const bank = BANKS.find((b) => b.code === code)
  return bank?.name || ''
}

/**
 * 은행명으로 은행 코드 조회
 */
export function getBankCode(name: string): string {
  const bank = BANKS.find((b) => b.name === name)
  return bank?.code || ''
}

// ============================================
// 테이블 스타일 상수
// ============================================
export const TABLE_STYLES = {
  headerBg: 'bg-[#5F7C94]',
  headerText: 'text-white text-sm font-medium',
  headerBorder: 'border-r border-white',
  bodyBorder: 'border-r border-gray-300',
  rowHover: 'hover:bg-gray-50',
  sectionBg: 'bg-[#f7f7f7]',
} as const

// ============================================
// 입력 필드 스타일 상수
// ============================================
export const INPUT_STYLES = {
  base: 'h-8 text-xs',
  date: 'w-32 px-2 py-1 text-xs border border-gray-300 rounded bg-white h-6',
  search: 'w-full px-2 py-1 text-xs border border-gray-300 rounded h-6',
  radio: 'w-3.5 h-3.5',
} as const

// ============================================
// 버튼 스타일 상수
// ============================================
export const BUTTON_STYLES = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  outline: 'border-gray-400',
  small: 'px-4 h-7 text-xs',
} as const
