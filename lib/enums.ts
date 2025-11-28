/**
 * 웹 정산 어드민 API ENUM 정의 및 헬퍼 메소드
 */

// ============================================
// 1. CompanyLevel (업체 레벨)
// ============================================

export const CompanyLevel = {
  HEADQUARTERS: 'HEADQUARTERS',
  BRANCH: 'BRANCH',
  DISTRIBUTOR: 'DISTRIBUTOR',
  AGENT: 'AGENT',
  MERCHANT: 'MERCHANT',
} as const

export type CompanyLevelType = (typeof CompanyLevel)[keyof typeof CompanyLevel]

export const CompanyLevelLabel: Record<CompanyLevelType, string> = {
  HEADQUARTERS: '본사',
  BRANCH: '지사',
  DISTRIBUTOR: '총판',
  AGENT: '대리점',
  MERCHANT: '가맹점',
}

export const CompanyLevelCode: Record<CompanyLevelType, number> = {
  HEADQUARTERS: 0,
  BRANCH: 1,
  DISTRIBUTOR: 2,
  AGENT: 3,
  MERCHANT: 4,
}

export const CompanyLevelHelper = {
  getLabel: (code: CompanyLevelType): string => CompanyLevelLabel[code] || code,
  getCode: (level: CompanyLevelType): number => CompanyLevelCode[level] ?? -1,
  getLevelByCode: (code: number): CompanyLevelType | null => {
    const entry = Object.entries(CompanyLevelCode).find(([_, value]) => value === code)
    return entry ? (entry[0] as CompanyLevelType) : null
  },
  isValid: (code: string): code is CompanyLevelType => code in CompanyLevel,
  getOptions: () =>
    Object.keys(CompanyLevel).map((key) => ({
      value: key as CompanyLevelType,
      label: CompanyLevelLabel[key as CompanyLevelType],
      code: CompanyLevelCode[key as CompanyLevelType],
    })),
}

// ============================================
// 2. BusinessType (사업자 유형)
// ============================================

export const BusinessType = {
  NON_BUSINESS: 'NON_BUSINESS',
  INDIVIDUAL: 'INDIVIDUAL',
  CORPORATE: 'CORPORATE',
  OTHER: 'OTHER',
} as const

export type BusinessTypeType = (typeof BusinessType)[keyof typeof BusinessType]

export const BusinessTypeLabel: Record<BusinessTypeType, string> = {
  NON_BUSINESS: '비사업자',
  INDIVIDUAL: '개인사업자',
  CORPORATE: '법인사업자',
  OTHER: '기타',
}

export const BusinessTypeHelper = {
  getLabel: (code: BusinessTypeType): string => BusinessTypeLabel[code] || code,
  isValid: (code: string): code is BusinessTypeType => code in BusinessType,
  getOptions: () =>
    Object.keys(BusinessType).map((key) => ({
      value: key as BusinessTypeType,
      label: BusinessTypeLabel[key as BusinessTypeType],
    })),
}

// ============================================
// 3. ContractStatus (계약 상태)
// ============================================

export const ContractStatus = {
  APPLIED: 'APPLIED',
  ACTIVE: 'ACTIVE',
  TERMINATED: 'TERMINATED',
} as const

export type ContractStatusType = (typeof ContractStatus)[keyof typeof ContractStatus]

export const ContractStatusLabel: Record<ContractStatusType, string> = {
  APPLIED: '신청',
  ACTIVE: '정상',
  TERMINATED: '해지',
}

export const ContractStatusHelper = {
  getLabel: (code: ContractStatusType): string => ContractStatusLabel[code] || code,
  isValid: (code: string): code is ContractStatusType => code in ContractStatus,
  getOptions: () =>
    Object.keys(ContractStatus).map((key) => ({
      value: key as ContractStatusType,
      label: ContractStatusLabel[key as ContractStatusType],
    })),
}

// ============================================
// 4. SettlementCycle (정산 주기)
// ============================================

export const SettlementCycle = {
  D_PLUS_0: 'D_PLUS_0',
  D_PLUS_1: 'D_PLUS_1',
} as const

export type SettlementCycleType = (typeof SettlementCycle)[keyof typeof SettlementCycle]

export const SettlementCycleLabel: Record<SettlementCycleType, string> = {
  D_PLUS_0: '10M',
  D_PLUS_1: 'D+1',
}

export const SettlementCycleHelper = {
  getLabel: (code: SettlementCycleType): string => SettlementCycleLabel[code] || code,
  isValid: (code: string): code is SettlementCycleType => code in SettlementCycle,
  getOptions: () =>
    Object.keys(SettlementCycle).map((key) => ({
      value: key as SettlementCycleType,
      label: SettlementCycleLabel[key as SettlementCycleType],
    })),
}

// ============================================
// 5. PaymentPurpose (결제 목적)
// ============================================

export const PaymentPurpose = {
  DELIVERY_CHARGE: 'DELIVERY_CHARGE',
  MONTHLY_RENT: 'MONTHLY_RENT',
} as const

export type PaymentPurposeType = (typeof PaymentPurpose)[keyof typeof PaymentPurpose]

export const PaymentPurposeLabel: Record<PaymentPurposeType, string> = {
  DELIVERY_CHARGE: '배달비',
  MONTHLY_RENT: '월세',
}

export const PaymentPurposeHelper = {
  getLabel: (code: PaymentPurposeType): string => PaymentPurposeLabel[code] || code,
  isValid: (code: string): code is PaymentPurposeType => code in PaymentPurpose,
  getOptions: () =>
    Object.keys(PaymentPurpose).map((key) => ({
      value: key as PaymentPurposeType,
      label: PaymentPurposeLabel[key as PaymentPurposeType],
    })),
}

// ============================================
// 5-1. PGCode (PG 코드)
// ============================================

export const PGCode = {
  ALL: 'ALL',
  WEROUTE: 'WEROUTE',
} as const

export type PGCodeType = (typeof PGCode)[keyof typeof PGCode]

export const PGCodeLabel: Record<PGCodeType, string> = {
  ALL: '모두',
  WEROUTE: '위루트',
}

export const PGCodeHelper = {
  getLabel: (code: PGCodeType): string => PGCodeLabel[code] || code,
  getValue: (code: PGCodeType): string | null => code === 'ALL' ? null : code,
  isValid: (code: string): code is PGCodeType => code in PGCode,
  getOptions: () =>
    Object.keys(PGCode).map((key) => ({
      value: key as PGCodeType,
      label: PGCodeLabel[key as PGCodeType],
    })),
}

// ============================================
// 6. PaymentStatus (결제 상태)
// ============================================

export const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const

export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus]

export const PaymentStatusLabel: Record<PaymentStatusType, string> = {
  PENDING: '대기',
  SUCCESS: '성공',
  FAILED: '실패',
  CANCELLED: '취소',
}

export const PaymentStatusHelper = {
  getLabel: (code: PaymentStatusType): string => PaymentStatusLabel[code] || code,
  isValid: (code: string): code is PaymentStatusType => code in PaymentStatus,
  getOptions: () =>
    Object.keys(PaymentStatus).map((key) => ({
      value: key as PaymentStatusType,
      label: PaymentStatusLabel[key as PaymentStatusType],
    })),
}

// ============================================
// 7. UserType (사용자 유형)
// ============================================

export const UserType = {
  COMPANY: 'COMPANY',
  MERCHANT: 'MERCHANT',
} as const

export type UserTypeType = (typeof UserType)[keyof typeof UserType]

export const UserTypeLabel: Record<UserTypeType, string> = {
  COMPANY: '업체',
  MERCHANT: '가맹점',
}

export const UserTypeHelper = {
  getLabel: (code: UserTypeType): string => UserTypeLabel[code] || code,
  isValid: (code: string): code is UserTypeType => code in UserType,
  getOptions: () =>
    Object.keys(UserType).map((key) => ({
      value: key as UserTypeType,
      label: UserTypeLabel[key as UserTypeType],
    })),
}

// ============================================
// 8. BankCode (은행 코드)
// ============================================

export interface Bank {
  code: string
  name: string
}

export const BANKS: Bank[] = [
  // 한국은행 및 특수은행
  { code: '001', name: '한국은행' },
  { code: '002', name: '산업은행' },
  { code: '003', name: '기업은행' },
  { code: '004', name: '국민은행' },

  // 특수은행
  { code: '007', name: '수협은행' },
  { code: '008', name: '수출입은행' },

  // 농협
  { code: '011', name: '농협은행' },
  { code: '012', name: '농협회원조합' },

  // 시중은행
  { code: '020', name: '우리은행' },
  { code: '023', name: 'SC제일은행' },
  { code: '027', name: '한국씨티은행' },

  // 지방은행
  { code: '031', name: '대구은행' },
  { code: '032', name: '부산은행' },
  { code: '034', name: '광주은행' },
  { code: '035', name: '제주은행' },
  { code: '037', name: '전북은행' },
  { code: '039', name: '경남은행' },

  // 특수은행
  { code: '045', name: '새마을금고' },
  { code: '048', name: '신협' },
  { code: '050', name: '상호저축은행' },
  { code: '052', name: '모건스탠리은행' },
  { code: '054', name: 'HSBC은행' },
  { code: '055', name: '도이치은행' },
  { code: '056', name: '에이비엔암로은행' },
  { code: '057', name: '제이피모간체이스은행' },
  { code: '058', name: '미즈호은행' },
  { code: '059', name: '미쓰비시도쿄UFJ은행' },
  { code: '060', name: 'BOA은행' },
  { code: '061', name: '비엔피파리바은행' },
  { code: '062', name: '중국공상은행' },
  { code: '063', name: '중국은행' },
  { code: '064', name: '산림조합중앙회' },
  { code: '065', name: '대화은행' },
  { code: '066', name: '교통은행' },
  { code: '067', name: '중국건설은행' },

  // 우체국
  { code: '071', name: '우체국' },

  // 시중은행
  { code: '081', name: '하나은행' },
  { code: '088', name: '신한은행' },

  // 인터넷은행
  { code: '089', name: '케이뱅크' },
  { code: '090', name: '카카오뱅크' },
  { code: '092', name: '토스뱅크' },

  // 증권사
  { code: '218', name: 'KB증권' },
  { code: '238', name: '미래에셋증권' },
  { code: '240', name: '삼성증권' },
  { code: '243', name: '한국투자증권' },
  { code: '247', name: 'NH투자증권' },
  { code: '261', name: '교보증권' },
  { code: '262', name: '하이투자증권' },
  { code: '263', name: '현대차증권' },
  { code: '264', name: '키움증권' },
  { code: '265', name: '이베스트투자증권' },
  { code: '266', name: 'SK증권' },
  { code: '267', name: '대신증권' },
  { code: '268', name: '아이엠투자증권' },
  { code: '269', name: '한화투자증권' },
  { code: '270', name: '하나증권' },
  { code: '271', name: '토스증권' },
  { code: '278', name: '신한투자증권' },
  { code: '279', name: 'DB금융투자' },
  { code: '280', name: '유진투자증권' },
  { code: '287', name: '메리츠증권' },
  { code: '288', name: '카카오페이증권' },
  { code: '290', name: '부국증권' },
  { code: '291', name: '신영증권' },
  { code: '292', name: '케이프투자증권' },
]

// 은행명 -> 은행코드 매핑
const bankNameToCodeMap = new Map<string, string>(
  BANKS.map((bank) => [bank.name, bank.code])
)

// 은행코드 -> 은행명 매핑
const bankCodeToNameMap = new Map<string, string>(
  BANKS.map((bank) => [bank.code, bank.name])
)

/**
 * 주요 은행 목록 (드롭다운용)
 */
export const MAIN_BANKS: Bank[] = [
  { code: '004', name: '국민은행' },
  { code: '088', name: '신한은행' },
  { code: '020', name: '우리은행' },
  { code: '081', name: '하나은행' },
  { code: '011', name: '농협은행' },
]

export const BankHelper = {
  getName: (code: string): string => bankCodeToNameMap.get(code) || code,
  getCode: (name: string): string | null => bankNameToCodeMap.get(name) || null,
  isValid: (code: string): boolean => bankCodeToNameMap.has(code),
  getOptions: () => BANKS,
  getMainOptions: () => MAIN_BANKS,
  search: (keyword: string) =>
    BANKS.filter(
      (bank) => bank.name.includes(keyword) || bank.code.includes(keyword)
    ),
}
