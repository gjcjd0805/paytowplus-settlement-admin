/**
 * @deprecated 이 파일은 더 이상 사용되지 않습니다.
 * 대신 lib/enums.ts의 BANKS와 BankHelper를 사용하세요.
 *
 * 은행 코드 상수
 * 금융결제원 표준 은행 코드 기준
 */

export interface Bank {
  code: string
  name: string
}

export const BANKS: Bank[] = [
  // 한국은행 및 특수은행
  { code: "001", name: "한국은행" },
  { code: "002", name: "산업은행" },
  { code: "003", name: "기업은행" },
  { code: "004", name: "국민은행" },

  // 특수은행
  { code: "007", name: "수협은행" },
  { code: "008", name: "수출입은행" },

  // 농협
  { code: "011", name: "농협은행" },
  { code: "012", name: "농협회원조합" },

  // 시중은행
  { code: "020", name: "우리은행" },
  { code: "023", name: "SC제일은행" },
  { code: "027", name: "한국씨티은행" },

  // 지방은행
  { code: "031", name: "대구은행" },
  { code: "032", name: "부산은행" },
  { code: "034", name: "광주은행" },
  { code: "035", name: "제주은행" },
  { code: "037", name: "전북은행" },
  { code: "039", name: "경남은행" },

  // 특수은행
  { code: "045", name: "새마을금고" },
  { code: "048", name: "신협" },
  { code: "050", name: "상호저축은행" },
  { code: "052", name: "모건스탠리은행" },
  { code: "054", name: "HSBC은행" },
  { code: "055", name: "도이치은행" },
  { code: "056", name: "에이비엔암로은행" },
  { code: "057", name: "제이피모간체이스은행" },
  { code: "058", name: "미즈호은행" },
  { code: "059", name: "미쓰비시도쿄UFJ은행" },
  { code: "060", name: "BOA은행" },
  { code: "061", name: "비엔피파리바은행" },
  { code: "062", name: "중국공상은행" },
  { code: "063", name: "중국은행" },
  { code: "064", name: "산림조합중앙회" },
  { code: "065", name: "대화은행" },
  { code: "066", name: "교통은행" },
  { code: "067", name: "중국건설은행" },

  // 우체국
  { code: "071", name: "우체국" },

  // 시중은행
  { code: "081", name: "하나은행" },
  { code: "088", name: "신한은행" },

  // 인터넷은행
  { code: "089", name: "케이뱅크" },
  { code: "090", name: "카카오뱅크" },
  { code: "092", name: "토스뱅크" },

  // 증권사
  { code: "218", name: "KB증권" },
  { code: "238", name: "미래에셋증권" },
  { code: "240", name: "삼성증권" },
  { code: "243", name: "한국투자증권" },
  { code: "247", name: "NH투자증권" },
  { code: "261", name: "교보증권" },
  { code: "262", name: "하이투자증권" },
  { code: "263", name: "현대차증권" },
  { code: "264", name: "키움증권" },
  { code: "265", name: "이베스트투자증권" },
  { code: "266", name: "SK증권" },
  { code: "267", name: "대신증권" },
  { code: "268", name: "아이엠투자증권" },
  { code: "269", name: "한화투자증권" },
  { code: "270", name: "하나증권" },
  { code: "271", name: "토스증권" },
  { code: "278", name: "신한투자증권" },
  { code: "279", name: "DB금융투자" },
  { code: "280", name: "유진투자증권" },
  { code: "287", name: "메리츠증권" },
  { code: "288", name: "카카오페이증권" },
  { code: "290", name: "부국증권" },
  { code: "291", name: "신영증권" },
  { code: "292", name: "케이프투자증권" },
]

// 은행명 -> 은행코드 매핑
const bankNameToCodeMap = new Map<string, string>(
  BANKS.map(bank => [bank.name, bank.code])
)

// 은행코드 -> 은행명 매핑
const bankCodeToNameMap = new Map<string, string>(
  BANKS.map(bank => [bank.code, bank.name])
)

/**
 * 은행명으로 은행코드를 조회합니다.
 * @param bankName 은행명
 * @returns 은행코드 (찾지 못한 경우 입력값 반환)
 */
export const getBankCode = (bankName: string): string => {
  return bankNameToCodeMap.get(bankName) || bankName
}

/**
 * 은행코드로 은행명을 조회합니다.
 * @param bankCode 은행코드
 * @returns 은행명 (찾지 못한 경우 입력값 반환)
 */
export const getBankName = (bankCode: string): string => {
  return bankCodeToNameMap.get(bankCode) || bankCode
}

/**
 * 주요 은행 목록 (드롭다운용)
 */
export const MAIN_BANKS: Bank[] = [
  { code: "004", name: "국민은행" },
  { code: "088", name: "신한은행" },
  { code: "020", name: "우리은행" },
  { code: "081", name: "하나은행" },
  { code: "011", name: "농협은행" },
]
