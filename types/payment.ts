// 결제내역 타입
export interface IPayment {
  id: string
  paymentDate: string
  approvalNumber: string
  cardNumber: string
  merchantName: string
  terminalId: string
  amount: number
  fee: number
  settlementAmount: number
  status: "정상" | "취소" | "보류"
  paymentType: "신용" | "체크"
  installment: number
}

// 정산 타입
export interface ISettlement {
  id: string
  settlementDate: string
  merchantName: string
  merchantCode: string
  salesAmount: number
  feeAmount: number
  settlementAmount: number
  paymentCount: number
  cancelCount: number
  status: "완료" | "대기" | "처리중"
}

// 이체 타입
export interface ITransfer {
  id: string
  transferDate: string
  merchantName: string
  bankName: string
  accountNumber: string
  accountHolder: string
  amount: number
  status: "완료" | "대기" | "실패"
  memo: string
}