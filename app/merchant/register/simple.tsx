"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { merchantsApi, usersApi, companiesApi } from "@/lib/api"
import { BANKS, BankHelper } from "@/lib/enums"
import { getCenterId } from "@/lib/utils/auth"

interface ISimpleMerchantFormData {
  companyCode: string
  companyName: string
  merchantId: string
  merchantName: string
  companyType: string
  representativeName: string
  representativeIdNumber: string
  representativeAddress: string
  managerName: string
  managerPhone: string
  managerEmail: string
  businessName: string
  businessPhone: string
  businessRegistrationNumber: string
  corporateNumber: string
  businessType: string
  businessCategory: string
  businessAddress: string
  deliveryFeeCommissionRate: string
  monthlyRentCommissionRate: string
  paymentCancelUse: boolean
  settlementHoldUse: string
  installmentHoldUse: string
  settlementBank: string
  settlementAccountHolder: string
  settlementAccount: string
  autoTransfer: string
}

export default function MerchantRegisterSimple() {
  const router = useRouter()
  const { user } = useAppContext()
  const [isIdChecked, setIsIdChecked] = useState(false)
  const [idCheckStatus, setIdCheckStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle")
  const [formData, setFormData] = useState<ISimpleMerchantFormData>({
    companyCode: user?.companyId ? String(user.companyId) : "",
    companyName: user?.name || "",
    merchantId: "",
    merchantName: "",
    companyType: "개인사업자",
    representativeName: "",
    representativeIdNumber: "",
    representativeAddress: "",
    managerName: "",
    managerPhone: "",
    managerEmail: "",
    businessName: "",
    businessPhone: "",
    businessRegistrationNumber: "",
    corporateNumber: "",
    businessType: "",
    businessCategory: "",
    businessAddress: "",
    deliveryFeeCommissionRate: "",
    monthlyRentCommissionRate: "",
    paymentCancelUse: true,
    settlementHoldUse: "보류체크",
    installmentHoldUse: "12개월 이상 할부 시 정산보류",
    settlementBank: "",
    settlementAccountHolder: "",
    settlementAccount: "",
    autoTransfer: "해당없음",
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
      case "merchantId":
        processedValue = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)
        setIsIdChecked(false)
        setIdCheckStatus("idle")
        break
      case "managerPhone":
      case "businessPhone":
        processedValue = value.replace(/[^0-9]/g, "").slice(0, 11)
        break
      case "representativeIdNumber":
        processedValue = value.replace(/[^0-9]/g, "").slice(0, 13)
        break
      case "businessRegistrationNumber":
        processedValue = value.replace(/[^0-9]/g, "").slice(0, 12)
        break
      case "corporateNumber":
        processedValue = value.replace(/[^0-9]/g, "").slice(0, 13)
        break
      case "settlementAccount":
        processedValue = value.replace(/[^0-9]/g, "").slice(0, 30)
        break
      case "deliveryFeeCommissionRate":
      case "monthlyRentCommissionRate":
        processedValue = value.replace(/[^0-9.]/g, "")
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
      const trimmedData = {
        merchantId: formData.merchantId.trim(),
        merchantName: formData.merchantName.trim(),
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
      }

      // 필수 필드 검증
      if (!user?.companyId) {
        throw new Error("업체 정보를 확인할 수 없습니다.")
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

      const centerId = getCenterId()

      const submitData = {
        name: trimmedData.merchantName,
        loginId: trimmedData.merchantId,
        password: "1234", // 자동으로 1234 설정
        companyId: user.companyId,
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
        isLoginAllowed: true, // 자동으로 허용
        contractStatus: "APPLIED" as const, // 자동으로 신청 상태
        settlementCycle: "D_PLUS_0" as const, // 기본값
        isSameDayCancellationAllowed: formData.paymentCancelUse,
        paymentLimitPerTransaction: undefined, // 제거
        paymentLimitPerMonth: undefined, // 제거
        bankCode: BankHelper.getCode(trimmedData.settlementBank) || undefined,
        accountHolder: trimmedData.settlementAccountHolder || undefined,
        accountNumber: trimmedData.settlementAccount || undefined,
        deliveryFeeCommissionRate: trimmedData.deliveryFeeCommissionRate ? Number(trimmedData.deliveryFeeCommissionRate) : undefined,
        monthlyRentCommissionRate: trimmedData.monthlyRentCommissionRate ? Number(trimmedData.monthlyRentCommissionRate) : undefined
      }

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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">상위업체코드 <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.companyCode}
                      readOnly
                      className="h-8 text-xs bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">상위업체명 <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.companyName}
                      readOnly
                      className="h-8 text-xs bg-gray-100"
                    />
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
                    <Label className="text-xs">비밀번호</Label>
                    <div className="space-y-1">
                      <Input
                        value="****"
                        readOnly
                        className="h-8 text-xs bg-gray-100"
                      />
                      <p className="text-xs text-red-500">※ 자동으로 1234 설정됩니다</p>
                    </div>
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
    </div>
  )
}
