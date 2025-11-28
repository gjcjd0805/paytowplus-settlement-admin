export interface ICompany {
  id: string
  registrationDate: string
  companyCode: string
  companyPath: string
  type: "지사" | "총판" | "대리점"
  level: string
  parentCompany: string
  agent: string
  managerName: string
  managerPhone: string
  commissionRate: number
  status: "정상" | "해지"
  memo: string
  // 기본정보
  companyName: string
  companyRegistrationNumber: string
  representativeName: string
  businessType: string
  businessCategory: string
  companyType: "법인사업자" | "개인사업자" | "법인사업자(간이)"
  representativeAddress: string
  companyAddress: string
  managerPosition: string
  managerEmail: string
  // 서비스 설정 및 정산계좌 정보
  useYn: "사용" | "미사용"
  agentUseYn: "사용" | "해지" | "폐지"
  settlementBank: string
  settlementAccount: string
  settlementAccountHolder: string
  accountStatus: string
  susuTongbun: string
  depositCycle: string
  // 사업자정보
  ceoName: string
  ceoRegistrationNumber: string
  businessRegistrationNumber: string
  businessAddress: string
  occupation: string
  category: string
  businessTel: string
}

export type CompanyType = "지사" | "총판" | "대리점" | "전체"

export interface ICompanyFormData {
  // 상위업체 정보 (지사 제외)
  companyPath: string                // 상위업체 Path (읽기 전용)
  parentCompanyCode: string          // 상위업체 코드 (읽기 전용)
  parentCompanyName: string          // 상위업체명 (읽기 전용)

  // 로그인 정보
  loginId: string                    // 아이디 (필수)
  password: string                   // 비밀번호 (필수)

  // 기본 정보
  name: string                       // 업체명 (필수)
  businessType: "NON_BUSINESS" | "INDIVIDUAL" | "CORPORATE"  // 사업자구분
  representativeName: string         // 대표자명 (필수)
  representativeAddress: string      // 대표지주소

  // 담당자 정보
  managerName: string                // 담당자명
  managerContact: string             // 담당자 연락처
  managerEmail: string               // 담당자 이메일

  // 서비스 설정
  isLoginAllowed: boolean            // 로그인 허용
  contractStatus: "APPLIED" | "ACTIVE" | "TERMINATED"  // 계약상태

  // 정산계좌 정보
  bankCode: string                   // 입금은행 코드
  bankName: string                   // 입금은행명 (표시용)
  accountHolder: string              // 예금주 (필수)
  accountNumber: string              // 계좌번호 (필수)

  // 사업자 정보
  companyName: string                // 회사명
  companyPhoneNumber: string         // 회사(사업자) 전화번호
  businessRegistrationNumber: string // 사업자번호
  corporateRegistrationNumber: string // 법인번호
  businessCategory: string           // 업태
  businessItem: string               // 종목
  businessAddress: string            // 사업자주소
}