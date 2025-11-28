export interface ITerminal {
  id: string
  registrationDate: string
  terminalId: string
  terminalPassword: string
  pg: string
  merchantName: string
  merchantPath: string
  companyName: string
  representativeName: string
  businessRegistrationNumber: string
  status: "정상" | "해지"
  paymentType: string
  paymentDetails: string
  memo: string
}

export interface ITerminalFormData {
  merchantCode: string
  merchantName: string
  terminalId: string
  terminalPassword: string
  merchantPhone: string
  merchantAddress: string
  contractType: "단말기" | "수기"
  pg: "아몰루" | "롤럿" | "바움핀엑스"
}