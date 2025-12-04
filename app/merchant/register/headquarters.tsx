"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { IMerchantFormData } from "@/types/merchant"
import { CompanyCodeSearchModal } from "@/components/company/company-code-search-modal"
import { merchantsApi, usersApi } from "@/lib/api"
import { BANKS, BankHelper } from "@/lib/enums"

export default function MerchantRegisterHeadquarters() {
  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const [isIdChecked, setIsIdChecked] = useState(false)
  const [idCheckStatus, setIdCheckStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle")
  const router = useRouter()
  const [selectedCompanyId, setSelectedCompanyId] = useState("")
  const [formData, setFormData] = useState<IMerchantFormData>({
    companyPath: "",
    companyCode: "",
    companyName: "",
    merchantId: "",
    merchantName: "",
    companyType: "개인사업자",
    representativeName: "",
    representativeIdNumber: "",
    representativeAddress: "",
    managerName: "",
    managerPhone: "",
    managerEmail: "",
    password: "",
    businessName: "",
    businessPhone: "",
    businessRegistrationNumber: "",
    corporateNumber: "",
    businessType: "",
    businessCategory: "",
    businessAddress: "",
    loginUse: "허용",
    contractStatus: "정상",
    deliveryFeeCommissionRate: "",
    monthlyRentCommissionRate: "",
    settlementCycle: "10분",
    paymentCancelUse: true,
    settlementHoldUse: "보류체크",
    installmentHoldUse: "12개월 이상 할부 시 정산보류",
    paymentLimitPerTransaction: "3000000",
    paymentLimitPerMonth: "100000000",
    settlementBank: "",
    settlementAccountHolder: "",
    settlementAccount: "",
    autoTransfer: "해당없음",
    simplePaymentUse: "허용",
    simplePaymentPeriod: "12",
    terminalCode: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    let processedValue = value

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
      return
    }

    // 입력값 검증 및 처리
    switch (name) {
      case "merchantId": // 아이디: 영문숫자만 2~20자
        processedValue = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)
        setIsIdChecked(false)
        setIdCheckStatus("idle")
        break
      case "managerPhone": // 담당자 연락처: 숫자만 11자리까지
        processedValue = value.replace(/[^0-9]/g, "").slice(0, 11)
        break
      case "businessPhone": // 사업장 전화번호: 숫자만 11자리까지
        processedValue = value.replace(/[^0-9]/g, "").slice(0, 11)
        break
      case "representativeIdNumber": // 대표자 주민번호: 숫자만 13자
        processedValue = value.replace(/[^0-9]/g, "").slice(0, 13)
        break
      case "businessRegistrationNumber": // 사업자번호: 숫자만 12자 이하
        processedValue = value.replace(/[^0-9]/g, "").slice(0, 12)
        break
      case "corporateNumber": // 법인번호: 숫자만 13자 이하
        processedValue = value.replace(/[^0-9]/g, "").slice(0, 13)
        break
      case "settlementAccount": // 계좌번호: 숫자만 30자까지
        processedValue = value.replace(/[^0-9]/g, "").slice(0, 30)
        break
      case "paymentLimitPerTransaction": // 결제한도(건): 숫자만
      case "paymentLimitPerMonth": // 결제한도(월): 숫자만
        processedValue = value.replace(/[^0-9]/g, "")
        break
      case "deliveryFeeCommissionRate": // 배달비 수수료율: 숫자와 소수점만
      case "monthlyRentCommissionRate": // 월세 수수료율: 숫자와 소수점만
        processedValue = value.replace(/[^0-9.]/g, "")
        // 소수점이 2개 이상이면 마지막 것만 유지
        const parts = processedValue.split('.')
        if (parts.length > 2) {
          processedValue = parts[0] + '.' + parts.slice(1).join('')
        }
        break
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }))
  }

  const handleCheckId = async () => {
    const loginId = formData.merchantId.trim()

    if (!loginId) {
      alert("아이디를 입력해주세요.")
      return
    }

    if (loginId.length < 2 || loginId.length > 20) {
      alert("아이디는 2~20자 이내로 입력해주세요.")
      return
    }

    setIdCheckStatus("checking")
    try {
      const response = await usersApi.checkDuplicate(loginId)

      if (response.data.isDuplicate) {
        setIdCheckStatus("unavailable")
        setIsIdChecked(false)
        alert(response.data.message || "이미 사용 중인 아이디입니다.")
      } else {
        setIdCheckStatus("available")
        setIsIdChecked(true)
        alert(response.data.message || "사용 가능한 아이디입니다.")
      }
    } catch (error: any) {
      console.error("아이디 중복 체크 오류:", error)
      setIdCheckStatus("unavailable")
      setIsIdChecked(false)
      alert(error?.response?.data?.message || "아이디 중복 체크 중 오류가 발생했습니다.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // 모든 필드 trim 처리
      const trimmedData = {
        merchantId: formData.merchantId.trim(),
        merchantName: formData.merchantName.trim(),
        password: formData.password.trim(),
        representativeName: formData.representativeName.trim(),
        representativeIdNumber: formData.representativeIdNumber.trim(),
        representativeAddress: formData.representativeAddress.trim(),
        managerName: formData.managerName.trim(),
        managerPhone: formData.managerPhone.trim(),
        managerEmail: formData.managerEmail.trim(),
        businessName: formData.businessName.trim(),
        businessPhone: formData.businessPhone.trim(),
        businessRegistrationNumber: formData.businessRegistrationNumber.trim(),
        corporateNumber: formData.corporateNumber.trim(),
        businessType: formData.businessType.trim(),
        businessCategory: formData.businessCategory.trim(),
        businessAddress: formData.businessAddress.trim(),
        settlementBank: formData.settlementBank.trim(),
        settlementAccountHolder: formData.settlementAccountHolder.trim(),
        settlementAccount: formData.settlementAccount.trim(),
        deliveryFeeCommissionRate: formData.deliveryFeeCommissionRate.trim(),
        monthlyRentCommissionRate: formData.monthlyRentCommissionRate.trim(),
        paymentLimitPerTransaction: formData.paymentLimitPerTransaction.trim(),
        paymentLimitPerMonth: formData.paymentLimitPerMonth.trim(),
      }

      // 필수 필드 검증
      if (!selectedCompanyId) {
        throw new Error("상위업체를 선택해주세요.")
      }
      if (!trimmedData.merchantId) {
        throw new Error("아이디는 필수입니다.")
      }
      if (trimmedData.merchantId.length < 2 || trimmedData.merchantId.length > 20) {
        throw new Error("아이디는 2~20자 이내로 입력해주세요.")
      }
      if (!isIdChecked) {
        throw new Error("아이디 중복 체크를 먼저 진행해주세요.")
      }
      if (!trimmedData.password) {
        throw new Error("비밀번호는 필수입니다.")
      }
      if (trimmedData.password.length < 4) {
        throw new Error("비밀번호는 4자 이상이어야 합니다.")
      }
      if (!trimmedData.merchantName) {
        throw new Error("가맹점명은 필수입니다.")
      }

      // 대표자 정보 필수 검증
      if (!trimmedData.representativeName) {
        throw new Error("대표자명은 필수입니다.")
      }
      if (!trimmedData.representativeIdNumber) {
        throw new Error("대표자주민번호는 필수입니다.")
      }
      if (!trimmedData.representativeAddress) {
        throw new Error("대표자주소는 필수입니다.")
      }

      // 담당자 정보 필수 검증
      if (!trimmedData.managerName) {
        throw new Error("담당자는 필수입니다.")
      }
      if (!trimmedData.managerPhone) {
        throw new Error("담당자연락처는 필수입니다.")
      }
      if (!trimmedData.managerEmail) {
        throw new Error("담당자이메일은 필수입니다.")
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(trimmedData.managerEmail)) {
        throw new Error("담당자 이메일 형식이 올바르지 않습니다.")
      }

      // 정산계좌 정보 필수 검증
      if (!trimmedData.settlementAccountHolder) {
        throw new Error("예금주는 필수입니다.")
      }
      if (!trimmedData.settlementAccount) {
        throw new Error("계좌번호는 필수입니다.")
      }

      // 배달비 수수료율 필수 검증
      if (!trimmedData.deliveryFeeCommissionRate) {
        throw new Error("배달비 수수료율은 필수입니다.")
      }
      const deliveryRate = Number(trimmedData.deliveryFeeCommissionRate)
      if (isNaN(deliveryRate) || deliveryRate < 0 || deliveryRate > 100) {
        throw new Error("배달비 수수료율은 0~100 사이의 숫자여야 합니다.")
      }

      // 월세 수수료율 범위 검증 (선택)
      if (trimmedData.monthlyRentCommissionRate) {
        const rate = Number(trimmedData.monthlyRentCommissionRate)
        if (isNaN(rate) || rate < 0 || rate > 100) {
          throw new Error("월세 수수료율은 0~100 사이의 숫자여야 합니다.")
        }
      }

      // 결제한도 필수 검증
      if (!trimmedData.paymentLimitPerTransaction) {
        throw new Error("결제한도(건)는 필수입니다.")
      }
      if (!trimmedData.paymentLimitPerMonth) {
        throw new Error("결제한도(월)는 필수입니다.")
      }

      const centerId = 1

      const submitData = {
        name: trimmedData.merchantName,
        loginId: trimmedData.merchantId,
        password: trimmedData.password,
        companyId: Number(selectedCompanyId),
        centerId: centerId,
        businessType: formData.companyType === "개인사업자" ? "INDIVIDUAL" as const :
                      formData.companyType === "법인사업자" ? "CORPORATE" as const : undefined,
        representativeName: trimmedData.representativeName || undefined,
        representativeResidentNumber: trimmedData.representativeIdNumber || undefined,
        representativeAddress: trimmedData.representativeAddress || undefined,
        managerName: trimmedData.managerName || undefined,
        managerContact: trimmedData.managerPhone || undefined,
        managerEmail: trimmedData.managerEmail || undefined,
        companyName: trimmedData.businessName || undefined,
        businessPhoneNumber: trimmedData.businessPhone || undefined,
        businessRegistrationNumber: trimmedData.businessRegistrationNumber || undefined,
        corporateRegistrationNumber: trimmedData.corporateNumber || undefined,
        businessCategory: trimmedData.businessCategory || undefined,
        businessItem: trimmedData.businessType || undefined,
        businessAddress: trimmedData.businessAddress || undefined,
        isLoginAllowed: formData.loginUse === "허용",
        contractStatus: formData.contractStatus === "신청" ? "APPLIED" as const :
                       formData.contractStatus === "정상" ? "ACTIVE" as const : "TERMINATED" as const,
        settlementCycle: formData.settlementCycle === "10분" ? "D_PLUS_0" as const : "D_PLUS_1" as const,
        isSameDayCancellationAllowed: formData.paymentCancelUse,
        paymentLimitPerTransaction: trimmedData.paymentLimitPerTransaction ? Number(trimmedData.paymentLimitPerTransaction) : undefined,
        paymentLimitPerMonth: trimmedData.paymentLimitPerMonth ? Number(trimmedData.paymentLimitPerMonth) : undefined,
        bankCode: BankHelper.getCode(trimmedData.settlementBank) || undefined,
        accountHolder: trimmedData.settlementAccountHolder || undefined,
        accountNumber: trimmedData.settlementAccount || undefined,
        deliveryFeeCommissionRate: trimmedData.deliveryFeeCommissionRate ? Number(trimmedData.deliveryFeeCommissionRate) : undefined,
        monthlyRentCommissionRate: trimmedData.monthlyRentCommissionRate ? Number(trimmedData.monthlyRentCommissionRate) : undefined
      }

      // Axios를 통한 가맹점 등록 API 호출
      await merchantsApi.create(submitData)

      alert("가맹점이 성공적으로 등록되었습니다.")
      router.push("/merchant/list")
    } catch (error: any) {
      console.error("가맹점 등록 오류:", error)
      alert(error?.response?.data?.message || error?.message || "가맹점 등록 중 오류가 발생했습니다.")
    }
  }

  const handleCancel = () => {
    router.push("/merchant/list")
  }

  return (
    <div className="space-y-4">
      {/* 메뉴 Path */}
      <div className="text-xl text-gray-600">
        <span>가맹점</span>
        <span className="mx-2">{'>'}</span>
        <span className="font-semibold text-gray-800">가맹점 등록</span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 2열 그리드로 변경 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 좌측 컬럼 */}
          <div className="space-y-4">
            {/* 기본정보 */}
            <div className="bg-[#f7f7f7] border border-gray-300">
              <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2.5">기본정보</div>
              <div className="p-3 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">상위업체 Path <span className="text-red-500">*</span></Label>
                    <Input
                      name="companyPath"
                      value={formData.companyPath}
                      readOnly
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">상위업체코드 <span className="text-red-500">*</span></Label>
                    <Input
                      name="companyCode"
                      value={formData.companyCode}
                      readOnly
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">상위업체명 <span className="text-red-500">*</span></Label>
                    <div className="flex gap-1">
                      <Input
                        name="companyName"
                        value={formData.companyName}
                        readOnly
                        className="h-8 text-xs"
                      />
                      <Button
                        type="button"
                        onClick={() => setCodeModalOpen(true)}
                        className="h-8 px-2 text-xs whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        검색
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">아이디 <span className="text-red-500">*</span></Label>
                    <div className="flex gap-1">
                      <Input
                        name="merchantId"
                        value={formData.merchantId}
                        onChange={handleChange}
                        className="h-8 text-xs"
                        placeholder="2~20자 이내 영문과 숫자만 가능"
                        required
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 px-2 text-xs whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleCheckId}
                      >
                        중복체크
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">비밀번호 <span className="text-red-500">*</span></Label>
                    <Input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="비밀번호(4자 이상)"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">가맹점명 <span className="text-red-500">*</span></Label>
                    <Input
                      name="merchantName"
                      value={formData.merchantName}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="가맹점명을 입력하세요"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">사업자구분</Label>
                    <div className="flex gap-2 items-center h-8">
                      {["비사업자", "개인사업자", "법인사업자", "기타"].map((type) => (
                        <label key={type} className="flex items-center gap-1 text-xs">
                          <input
                            type="radio"
                            name="companyType"
                            value={type}
                            checked={formData.companyType === type}
                            onChange={handleChange}
                            className="w-3 h-3"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">대표자명 <span className="text-red-500">*</span></Label>
                    <Input
                      name="representativeName"
                      value={formData.representativeName}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="대표자명"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">대표자주민번호 <span className="text-red-500">*</span></Label>
                    <Input
                      name="representativeIdNumber"
                      value={formData.representativeIdNumber}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="'-' 제외 숫자만 입력"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">대표자주소 <span className="text-red-500">*</span></Label>
                  <Input
                    name="representativeAddress"
                    value={formData.representativeAddress}
                    onChange={handleChange}
                    className="h-8 text-xs"
                    placeholder="대표자주소"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">담당자 <span className="text-red-500">*</span></Label>
                    <Input
                      name="managerName"
                      value={formData.managerName}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="담당자명"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">담당자연락처 <span className="text-red-500">*</span></Label>
                    <Input
                      name="managerPhone"
                      value={formData.managerPhone}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="'-' 제외 숫자만 입력"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">담당자이메일 <span className="text-red-500">*</span></Label>
                    <Input
                      name="managerEmail"
                      type="email"
                      value={formData.managerEmail}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 사업자정보 */}
            <div className="bg-[#f7f7f7] border border-gray-300">
              <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2.5">사업자정보</div>
              <div className="p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">회사명</Label>
                    <Input
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="회사명"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">사업장전화번호</Label>
                    <Input
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="'-' 제외 숫자만 입력"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">사업자번호</Label>
                    <Input
                      name="businessRegistrationNumber"
                      value={formData.businessRegistrationNumber}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="'-' 제외 숫자만 입력"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">법인번호</Label>
                    <Input
                      name="corporateNumber"
                      value={formData.corporateNumber}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="'-' 제외 숫자만 입력"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">업태</Label>
                    <Input
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="업태"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">종목</Label>
                    <Input
                      name="businessCategory"
                      value={formData.businessCategory}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="종목"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">사업자주소</Label>
                  <Input
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    className="h-8 text-xs"
                    placeholder="사업자주소"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 우측 컬럼 */}
          <div className="space-y-4">
            {/* 서비스 설정 및 정산계좌 정보 */}
            <div className="bg-[#f7f7f7] border border-gray-300">
              <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2.5">서비스 설정 및 정산계좌 정보</div>
              <div className="p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">로그인</Label>
                    <div className="flex gap-2 items-center h-8">
                      {["허용", "차단"].map((opt) => (
                        <label key={opt} className="flex items-center gap-1 text-xs">
                          <input
                            type="radio"
                            name="loginUse"
                            value={opt}
                            checked={formData.loginUse === opt}
                            onChange={handleChange}
                            className="w-3 h-3"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">계약상태</Label>
                    <div className="flex gap-2 items-center h-8">
                      {["신청", "정상", "해지"].map((opt) => (
                        <label key={opt} className="flex items-center gap-1 text-xs">
                          <input
                            type="radio"
                            name="contractStatus"
                            value={opt}
                            checked={formData.contractStatus === opt}
                            onChange={handleChange}
                            className="w-3 h-3"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">배달비 수수료율 <span className="text-red-500">*</span></Label>
                    <Input
                      name="deliveryFeeCommissionRate"
                      type="number"
                      step="0.01"
                      value={formData.deliveryFeeCommissionRate}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="3.5"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">월세 수수료율</Label>
                    <Input
                      name="monthlyRentCommissionRate"
                      type="number"
                      step="0.01"
                      value={formData.monthlyRentCommissionRate}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="3.5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">정산주기</Label>
                    <div className="flex gap-2 items-center h-8">
                      {["10분", "D+1"].map((opt) => (
                        <label key={opt} className="flex items-center gap-1 text-xs">
                          <input
                            type="radio"
                            name="settlementCycle"
                            value={opt}
                            checked={formData.settlementCycle === opt}
                            onChange={handleChange}
                            className="w-3 h-3"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">결제한도(건) <span className="text-red-500">*</span></Label>
                    <Input
                      name="paymentLimitPerTransaction"
                      value={formData.paymentLimitPerTransaction}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="3000000"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">결제한도(월) <span className="text-red-500">*</span></Label>
                    <Input
                      name="paymentLimitPerMonth"
                      value={formData.paymentLimitPerMonth}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="100000000"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                      <Label className="text-xs">입금은행명 <span className="text-red-500">*</span></Label>
                      <Select
                        name="settlementBank"
                        value={formData.settlementBank}
                        onChange={handleChange}
                        className="h-8 text-xs"
                      >
                        <option value="">은행선택</option>
                        {BANKS.map(bank => (
                          <option key={bank.code} value={bank.name}>{bank.name}</option>
                        ))}
                      </Select>
                  </div>
                  <div>
                    <Label className="text-xs">예금주 <span className="text-red-500">*</span></Label>
                    <Input
                      name="settlementAccountHolder"
                      value={formData.settlementAccountHolder}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="예금주명"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">계좌번호 <span className="text-red-500">*</span></Label>
                  <Input
                    name="settlementAccount"
                    value={formData.settlementAccount}
                    onChange={handleChange}
                    className="h-8 text-xs"
                    placeholder="'-' 제외 숫자만 입력"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 간편결제 정보 */}
            <div className="bg-[#f7f7f7] border border-gray-300">
              <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2.5">간편결제 정보</div>
              <div className="p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">간편결제</Label>
                    <div className="flex gap-2 items-center h-8">
                      {["허용", "불가"].map((opt) => (
                        <label key={opt} className="flex items-center gap-1 text-xs">
                          <input
                            type="radio"
                            name="simplePaymentUse"
                            value={opt}
                            checked={formData.simplePaymentUse === opt}
                            onChange={handleChange}
                            className="w-3 h-3"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">간편결제할부기간</Label>
                    <Select
                      name="simplePaymentPeriod"
                      value={formData.simplePaymentPeriod}
                      onChange={handleChange}
                      className="h-8 text-xs"
                    >
                      <option value="일시불">일시불</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-600">
                    ※ 간편결제 허용 가맹점은 자동부여 (등록 후 수정페이지에서 확인 후 단말기 등록 처리를 해 주세요.)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-center gap-2 mt-4">
          <Button type="submit" className="h-8 px-6 text-sm bg-blue-600 hover:bg-blue-700 text-white">
            저장하기
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="h-8 px-4 text-sm border-gray-400 hover:bg-gray-100"
          >
            목록으로
          </Button>
        </div>
      </form>

      <CompanyCodeSearchModal
        open={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        onSelect={(company) => {
          setSelectedCompanyId(company.id)
          setFormData((prev) => ({
            ...prev,
            companyPath: company.companyNamePath || "",
            companyCode: company.companyCode || "",
            companyName: company.companyName || "",
          }))
        }}
      />
    </div>
  )
}
