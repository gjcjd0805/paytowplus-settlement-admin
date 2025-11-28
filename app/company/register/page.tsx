"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { ICompanyFormData } from "@/types/company"
import { CompanyCodeSearchModal } from "@/components/company/company-code-search-modal"
import { companiesApi, usersApi } from "@/lib/api"
import { getCenterId } from "@/lib/utils/auth"
import { BankHelper, BANKS } from "@/lib/enums"

// 사업자구분 UI 표시용 타입
type BusinessTypeDisplay = "법인사업자" | "개인사업자" | "비사업자"

// 사업자구분 변환 헬퍼
const businessTypeToApi = (display: BusinessTypeDisplay): "NON_BUSINESS" | "INDIVIDUAL" | "CORPORATE" => {
  switch (display) {
    case "법인사업자": return "CORPORATE"
    case "개인사업자": return "INDIVIDUAL"
    case "비사업자": return "NON_BUSINESS"
  }
}

export default function CompanyRegisterPage() {
  const router = useRouter()
  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>("")
  const [selectedParentCompanyId, setSelectedParentCompanyId] = useState<number | undefined>(undefined)
  const [isIdChecked, setIsIdChecked] = useState(false)
  const [idCheckStatus, setIdCheckStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle")
  const [companyLevel, setCompanyLevel] = useState<1 | 2 | 3>(2) // 기본값: 총판

  // UI 표시용 상태 (사업자구분)
  const [businessTypeDisplay, setBusinessTypeDisplay] = useState<BusinessTypeDisplay>("법인사업자")

  const [formData, setFormData] = useState<ICompanyFormData>({
    // 상위업체 정보
    companyPath: "",
    parentCompanyCode: "",
    parentCompanyName: "",
    // 로그인 정보
    loginId: "",
    password: "",
    // 기본 정보
    name: "",
    businessType: "CORPORATE",
    representativeName: "",
    representativeAddress: "",
    // 담당자 정보
    managerName: "",
    managerContact: "",
    managerEmail: "",
    // 서비스 설정
    isLoginAllowed: true,
    contractStatus: "ACTIVE",
    // 정산계좌 정보
    bankCode: "",
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    // 사업자 정보
    companyName: "",
    companyPhoneNumber: "",
    businessRegistrationNumber: "",
    corporateRegistrationNumber: "",
    businessCategory: "",
    businessItem: "",
    businessAddress: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    let processedValue = value

    // 입력값 검증 및 처리
    switch (name) {
      case "loginId": // 아이디: 영문숫자만 2~20자
        processedValue = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)
        setIsIdChecked(false)
        setIdCheckStatus("idle")
        break
      case "managerContact": // 담당자 연락처: 숫자만 11자리까지
      case "companyPhoneNumber": // 회사 전화번호: 숫자만 11자리까지
        processedValue = value.replace(/[^0-9]/g, "").slice(0, 11)
        break
      case "businessRegistrationNumber": // 사업자번호: 숫자만 12자 이하
        processedValue = value.replace(/[^0-9]/g, "").slice(0, 12)
        break
      case "corporateRegistrationNumber": // 법인등록번호: 숫자만 13자 이하
        processedValue = value.replace(/[^0-9]/g, "").slice(0, 13)
        break
      case "accountNumber": // 계좌번호: 숫자만 30자까지
        processedValue = value.replace(/[^0-9]/g, "").slice(0, 30)
        break
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }))
  }

  const handleBusinessTypeChange = (display: BusinessTypeDisplay) => {
    setBusinessTypeDisplay(display)
    setFormData((prev) => ({ ...prev, businessType: businessTypeToApi(display) }))
  }

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bankName = e.target.value
    const bankCode = BankHelper.getCode(bankName) || ""
    setFormData((prev) => ({
      ...prev,
      bankName,
      bankCode
    }))
  }

  const handleCheckId = async () => {
    const loginId = formData.loginId.trim()

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
    } catch (error: unknown) {
      console.error("아이디 중복 체크 오류:", error)
      setIdCheckStatus("unavailable")
      setIsIdChecked(false)
      const errorMessage = error instanceof Error
        ? error.message
        : "아이디 중복 체크 중 오류가 발생했습니다."
      alert(errorMessage)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      // 필수 필드 검증
      if (!formData.name.trim()) {
        throw new Error("업체명은 필수입니다.")
      }
      if (!formData.loginId.trim()) {
        throw new Error("아이디는 필수입니다.")
      }
      if (!formData.password.trim()) {
        throw new Error("패스워드는 필수입니다.")
      }
      if (formData.password.trim().length < 4) {
        throw new Error("비밀번호는 4자 이상이어야 합니다.")
      }
      if (!isIdChecked) {
        throw new Error("아이디 중복 체크를 먼저 진행해주세요.")
      }
      // 지사(level 1)가 아닌 경우에만 상위업체 필수
      if (companyLevel !== 1 && !selectedParentCompanyId) {
        throw new Error("상위업체는 필수입니다.")
      }
      if (!formData.representativeName.trim()) {
        throw new Error("대표자명은 필수입니다.")
      }
      if (!formData.bankName.trim()) {
        throw new Error("입금은행명은 필수입니다.")
      }
      if (!formData.accountHolder.trim()) {
        throw new Error("예금주는 필수입니다.")
      }
      if (!formData.accountNumber.trim()) {
        throw new Error("계좌번호는 필수입니다.")
      }

      // 이메일 형식 검증
      if (formData.managerEmail.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.managerEmail.trim())) {
          throw new Error("담당자 이메일 형식이 올바르지 않습니다.")
        }
      }

      // API 요청 데이터 생성
      const payload = {
        centerId: getCenterId(),
        level: companyLevel,
        name: formData.name.trim(),
        loginId: formData.loginId.trim(),
        password: formData.password.trim(),
        parentCompanyId: selectedParentCompanyId,
        businessType: formData.businessType,
        representativeName: formData.representativeName.trim() || undefined,
        representativeAddress: formData.representativeAddress.trim() || undefined,
        managerName: formData.managerName.trim() || undefined,
        managerContact: formData.managerContact.trim() || undefined,
        managerEmail: formData.managerEmail.trim() || undefined,
        companyName: formData.companyName.trim() || undefined,
        companyPhoneNumber: formData.companyPhoneNumber.trim() || undefined,
        businessRegistrationNumber: formData.businessRegistrationNumber.trim() || undefined,
        corporateRegistrationNumber: formData.corporateRegistrationNumber.trim() || undefined,
        businessCategory: formData.businessCategory.trim() || undefined,
        businessItem: formData.businessItem.trim() || undefined,
        businessAddress: formData.businessAddress.trim() || undefined,
        isLoginAllowed: formData.isLoginAllowed,
        contractStatus: formData.contractStatus,
        bankCode: formData.bankCode || undefined,
        accountHolder: formData.accountHolder.trim() || undefined,
        accountNumber: formData.accountNumber.trim() || undefined,
      }

      await companiesApi.create(payload)

      alert("업체가 등록되었습니다.")
      router.push("/company/list")
    } catch (err: unknown) {
      console.error("업체 등록 실패:", err)
      const errorMessage = err instanceof Error
        ? err.message
        : "업체 등록 중 오류가 발생했습니다."
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push("/company/list")
  }

  return (
    <div className="space-y-4">
      {/* 메뉴 Path */}
      <div className="text-xl text-gray-600">
        <span>업체 관리</span>
        <span className="mx-2">{'>'}</span>
        <span className="font-semibold text-gray-800">업체 등록</span>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="rounded border border-red-200 bg-red-50 text-red-700 text-sm p-3 mb-4">
            {error}
          </div>
        )}

        {/* 2열 그리드로 변경 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 좌측 컬럼 */}
          <div className="space-y-4">
            {/* 기본정보 */}
            <div className="bg-[#f7f7f7] border border-gray-300">
              <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2.5">기본정보</div>
              <div className="p-3 space-y-2">
                {/* 업체 레벨 선택 */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="text-xs">업체 레벨 <span className="text-red-500">*</span></Label>
                    <div className="group relative">
                      <span className="text-xs text-blue-600 cursor-help">ⓘ</span>
                      <div className="invisible group-hover:visible absolute left-0 top-5 z-10 w-80 p-3 bg-gray-800 text-white text-xs rounded shadow-lg">
                        <div className="space-y-1">
                          <div><span className="font-semibold text-yellow-300">지사:</span> 본사 직속 업체 (상위업체 불필요)</div>
                          <div><span className="font-semibold text-green-300">총판:</span> 지사 하위 업체 (상위업체: 지사만 선택 가능)</div>
                          <div><span className="font-semibold text-blue-300">대리점:</span> 총판 하위 업체 (상위업체: 총판만 선택 가능)</div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-600 text-gray-300">
                          계층 구조: 본사 → 지사 → 총판 → 대리점
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center h-8">
                    {[
                      { value: 1, label: "지사" },
                      { value: 2, label: "총판" },
                      { value: 3, label: "대리점" }
                    ].map((level) => (
                      <label key={level.value} className="flex items-center gap-1 text-xs">
                        <input
                          type="radio"
                          name="companyLevel"
                          value={level.value}
                          checked={companyLevel === level.value}
                          onChange={(e) => {
                            setCompanyLevel(Number(e.target.value) as 1 | 2 | 3)
                            // 레벨 변경 시 상위업체 정보 초기화
                            setFormData((prev) => ({
                              ...prev,
                              companyPath: "",
                              parentCompanyCode: "",
                              parentCompanyName: "",
                            }))
                            setSelectedParentCompanyId(undefined)
                          }}
                          className="w-3 h-3"
                        />
                        <span>{level.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 지사가 아닌 경우에만 상위업체 필드 표시 */}
                {companyLevel !== 1 && (
                  <div className="flex gap-2">
                    <div className="flex-[2]">
                      <Label className="text-xs">상위업체 Path <span className="text-red-500">*</span></Label>
                      <Input
                        name="companyPath"
                        value={formData.companyPath}
                        readOnly
                        className="h-8 text-xs"
                        placeholder="업체검색"
                      />
                    </div>
                    <div className="flex-[1]">
                      <Label className="text-xs">상위업체코드 <span className="text-red-500">*</span></Label>
                      <Input
                        name="parentCompanyCode"
                        value={formData.parentCompanyCode}
                        readOnly
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="flex-[1.5]">
                      <Label className="text-xs">상위업체명 <span className="text-red-500">*</span></Label>
                      <div className="flex gap-1">
                        <Input
                          name="parentCompanyName"
                          value={formData.parentCompanyName}
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
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">아이디 <span className="text-red-500">*</span></Label>
                    <div className="flex gap-1">
                      <Input
                        name="loginId"
                        value={formData.loginId}
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
                    <Label className="text-xs">업체명 <span className="text-red-500">*</span></Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="업체 별칭"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">사업자구분</Label>
                    <div className="flex gap-2 items-center h-8">
                      {(["법인사업자", "개인사업자", "비사업자"] as BusinessTypeDisplay[]).map((type) => (
                        <label key={type} className="flex items-center gap-1 text-xs">
                          <input
                            type="radio"
                            name="businessTypeDisplay"
                            value={type}
                            checked={businessTypeDisplay === type}
                            onChange={() => handleBusinessTypeChange(type)}
                            className="w-3 h-3"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

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
                  <Label className="text-xs">대표지주소</Label>
                  <Input
                    name="representativeAddress"
                    value={formData.representativeAddress}
                    onChange={handleChange}
                    className="h-8 text-xs"
                    placeholder="비사업자만 해당"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">담당자</Label>
                    <Input
                      name="managerName"
                      value={formData.managerName}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="담당자명"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">담당자연락처</Label>
                    <Input
                      name="managerContact"
                      value={formData.managerContact}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="'-' 제외 숫자만 입력"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">담당자이메일</Label>
                    <Input
                      name="managerEmail"
                      type="email"
                      value={formData.managerEmail}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="email@example.com"
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
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="회사명"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">회사(사업자) 전화번호</Label>
                    <Input
                      name="companyPhoneNumber"
                      value={formData.companyPhoneNumber}
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
                      name="corporateRegistrationNumber"
                      value={formData.corporateRegistrationNumber}
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
                      name="businessCategory"
                      value={formData.businessCategory}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="업태"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">종목</Label>
                    <Input
                      name="businessItem"
                      value={formData.businessItem}
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
                      {[
                        { value: true, label: "허용" },
                        { value: false, label: "차단" }
                      ].map((opt) => (
                        <label key={opt.label} className="flex items-center gap-1 text-xs">
                          <input
                            type="radio"
                            name="isLoginAllowed"
                            checked={formData.isLoginAllowed === opt.value}
                            onChange={() => setFormData((prev) => ({ ...prev, isLoginAllowed: opt.value }))}
                            className="w-3 h-3"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">계약상태</Label>
                    <div className="flex gap-2 items-center h-8">
                      {[
                        { value: "APPLIED" as const, label: "신청" },
                        { value: "ACTIVE" as const, label: "정상" },
                        { value: "TERMINATED" as const, label: "해지" }
                      ].map((opt) => (
                        <label key={opt.label} className="flex items-center gap-1 text-xs">
                          <input
                            type="radio"
                            name="contractStatus"
                            checked={formData.contractStatus === opt.value}
                            onChange={() => setFormData((prev) => ({ ...prev, contractStatus: opt.value }))}
                            className="w-3 h-3"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">입금은행명 <span className="text-red-500">*</span></Label>
                    <Select
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleBankChange}
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
                      name="accountHolder"
                      value={formData.accountHolder}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="예금주"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">계좌번호 <span className="text-red-500">*</span></Label>
                    <Input
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="'-' 제외 숫자만 입력"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-xs">수수료율</Label>
                    <div className="flex items-center h-8 px-2 text-xs text-gray-600 bg-gray-100 border border-gray-300 rounded">
                      ※ 업체수수료율 관리 페이지에서 등록
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-center gap-2 mt-4">
          <Button type="submit" className="h-8 px-6 text-sm bg-blue-600 hover:bg-blue-700 text-white" disabled={submitting}>
            {submitting ? "저장 중..." : "등록하기"}
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
          setFormData((prev) => ({
            ...prev,
            companyPath: company.companyNamePath || "",
            parentCompanyCode: String(company.companyCode || company.id || ""),
            parentCompanyName: company.companyName || "",
          }))
          setSelectedParentCompanyId(Number(company.id))
        }}
        initialLevel={
          companyLevel === 2 ? "BRANCH" :      // 총판 선택 시 지사만 조회
          companyLevel === 3 ? "DISTRIBUTOR" : // 대리점 선택 시 총판만 조회
          "all"
        }
      />
    </div>
  )
}
