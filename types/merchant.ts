export interface IMerchant {
  id: string
  registrationDate: string
  merchantCode: string
  merchantPath: string
  merchantName: string
  representativeName: string
  businessRegistrationNumber: string
  settlementType: "신용" | "체크" | "정상" | "정상+체크"
  settlementStatus: string
  settlementAmount: number
  settlementLimit: number
  commissionRate: number
  monthlyFee: number
  status: "정상" | "해지"
  contractPeriod: number
  contractType: "사용" | "불가" | "X"
  paymentType: "정상" | "X"
  accountBalance: string
  paymentStatus: string
  paymentDetails: string
  memo: string
}

export interface IMerchantFormData {
  // 기본정보
  companyPath: string
  companyCode: string
  companyName: string
  merchantId: string
  merchantName: string
  companyType: "비사업자" | "개인사업자" | "법인사업자" | "기타"
  representativeName: string
  representativeIdNumber: string
  representativeAddress: string
  managerName: string
  managerPhone: string
  managerEmail: string
  password: string

  // 사업자정보
  businessName: string
  businessPhone: string
  businessRegistrationNumber: string
  corporateNumber: string
  businessType: string
  businessCategory: string
  businessAddress: string

  // 서비스 설정 및 정산계좌 정보
  loginUse: "허용" | "차단"
  contractStatus: "신청" | "정상" | "해지"
  deliveryFeeCommissionRate: string
  monthlyRentCommissionRate: string
  settlementCycle: "10분" | "D+1"
  paymentCancelUse: boolean
  settlementHoldUse: "해당없음" | "보류체크"
  installmentHoldUse: "해당없음" | "12개월 이상 할부 시 정산보류"
  paymentLimitPerTransaction: string
  paymentLimitPerMonth: string
  settlementBank: string
  settlementAccountHolder: string
  settlementAccount: string
  autoTransfer: "해당없음" | "정산금자동이체"

  // 간편결제 정보
  simplePaymentUse: "허용" | "불가"
  simplePaymentPeriod: string
  terminalCode: string
}