"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ICompanyFormData } from "@/types/company"
import { CompanyCodeSearchModal } from "@/components/company/company-code-search-modal"
import { companiesApi } from "@/lib/api"
import { getCenterId } from "@/lib/utils/auth"
import { BankHelper, BANKS } from "@/lib/enums"

// 사업자구분 UI 표시용 타입
type BusinessTypeDisplay = "법인사업자" | "개인사업자" | "비사업자"

// API 타입 → UI 표시 변환
const apiToBusinessTypeDisplay = (apiType: string): BusinessTypeDisplay => {
  switch (apiType) {
    case "CORPORATE": return "법인사업자"
    case "INDIVIDUAL": return "개인사업자"
    case "NON_BUSINESS": return "비사업자"
    default: return "법인사업자"
  }
}

// UI 표시 → API 타입 변환
const businessTypeToApi = (display: BusinessTypeDisplay): "NON_BUSINESS" | "INDIVIDUAL" | "CORPORATE" => {
  switch (display) {
    case "법인사업자": return "CORPORATE"
    case "개인사업자": return "INDIVIDUAL"
    case "비사업자": return "NON_BUSINESS"
  }
}

// 날짜 포맷팅 함수
const formatDateTime = (dateTimeStr: string): string => {
  if (!dateTimeStr) return ""
  const date = new Date(dateTimeStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export default function CompanyEditPage() {
  const params = useParams()
  const companyId = params.id as string
  const router = useRouter()

  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>("")
  const [selectedParentCompanyId, setSelectedParentCompanyId] = useState<number | undefined>(undefined)
  const [originalLoginId, setOriginalLoginId] = useState("")
  const [registrationDate, setRegistrationDate] = useState<string>("")
  const [modificationDate, setModificationDate] = useState<string>("")
  const [memo, setMemo] = useState<string>("")

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

  // 업체 데이터 로드
  useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true)
        const response = await companiesApi.findById(Number(companyId))
        const company = response.data || response

        // 상위 업체 정보 설정
        if (company.parentCompanyId) {
          setSelectedParentCompanyId(Number(company.parentCompanyId))
        }

        // 원래 로그인 아이디 저장
        const loginId = company.loginId || ""
        setOriginalLoginId(loginId)

        // 등록일시, 수정일시 설정
        setRegistrationDate(formatDateTime(company.registDt || ""))
        setModificationDate(formatDateTime(company.updateDt || ""))
        setMemo(company.memo || "")

        // 사업자구분 표시용 상태 설정
        setBusinessTypeDisplay(apiToBusinessTypeDisplay(company.businessType || ""))

        // 백엔드 응답 데이터를 폼 데이터로 변환
        setFormData({
          companyPath: company.companyNamePath || "",
          parentCompanyCode: String(company.parentCompanyId || ""),
          parentCompanyName: "", // API에서 상위업체명은 별도로 조회 필요
          loginId: loginId,
          password: "",
          name: company.name || "",
          businessType: (company.businessType as "NON_BUSINESS" | "INDIVIDUAL" | "CORPORATE") || "CORPORATE",
          representativeName: company.representativeName || "",
          representativeAddress: company.representativeAddress || "",
          managerName: company.managerName || "",
          managerContact: company.managerContact || "",
          managerEmail: company.managerEmail || "",
          isLoginAllowed: company.isLoginAllowed ?? true,
          contractStatus: (company.contractStatus as "APPLIED" | "ACTIVE" | "TERMINATED") || "ACTIVE",
          bankCode: company.bankCode || "",
          bankName: BankHelper.getName(company.bankCode || ""),
          accountHolder: company.accountHolder || "",
          accountNumber: company.accountNumber || "",
          companyName: company.companyName || "",
          companyPhoneNumber: company.companyPhoneNumber || "",
          businessRegistrationNumber: company.businessRegistrationNumber || "",
          corporateRegistrationNumber: company.corporateRegistrationNumber || "",
          businessCategory: company.businessCategory || "",
          businessItem: company.businessItem || "",
          businessAddress: company.businessAddress || "",
        })
      } catch (error) {
        console.error("업체 조회 오류:", error)
        alert("업체 정보를 불러오는데 실패했습니다.")
      } finally {
        setLoading(false)
      }
    }

    loadCompany()
  }, [companyId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    let processedValue = value

    // 입력값 검증 및 처리
    switch (name) {
      case "loginId": // 아이디: 영문숫자만 2~20자
        processedValue = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20)
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
      if (!selectedParentCompanyId) {
        throw new Error("상위업체는 필수입니다.")
      }
      if (!formData.representativeName.trim()) {
        throw new Error("대표자명은 필수입니다.")
      }
      if (!formData.companyName.trim()) {
        throw new Error("회사명은 필수입니다.")
      }

      // 담당자 정보 필수 검증
      if (!formData.managerName.trim()) {
        throw new Error("담당자는 필수입니다.")
      }
      if (!formData.managerContact.trim()) {
        throw new Error("담당자연락처는 필수입니다.")
      }
      if (!formData.managerEmail.trim()) {
        throw new Error("담당자이메일은 필수입니다.")
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.managerEmail.trim())) {
        throw new Error("담당자 이메일 형식이 올바르지 않습니다.")
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

      // 비밀번호 검증 (입력된 경우에만)
      if (formData.password.trim() && formData.password.trim().length < 4) {
        throw new Error("비밀번호는 4자 이상이어야 합니다.")
      }

      // API 요청 데이터 생성
      const payload: Record<string, unknown> = {
        centerId: getCenterId(),
        name: formData.name.trim(),
        loginId: formData.loginId.trim(),
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
        memo: memo.trim() || undefined,
      }

      // 비밀번호가 입력된 경우에만 포함
      if (formData.password.trim()) {
        payload.password = formData.password.trim()
      }

      await companiesApi.update(Number(companyId), payload)

      alert("업체가 수정되었습니다.")
      router.push("/company/list")
    } catch (err: unknown) {
      console.error("업체 수정 오류:", err)
      const errorMessage = err instanceof Error
        ? err.message
        : "업체 수정에 실패했습니다."
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 메뉴 Path */}
      <div className="text-xl text-gray-600">
        <span>업체관리</span>
        <span className="mx-2">{'>'}</span>
        <span className="font-semibold text-gray-800">업체 수정</span>
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
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">아이디 <span className="text-red-500">*</span></Label>
                    <Input
                      name="loginId"
                      value={formData.loginId}
                      className="h-8 text-xs"
                      placeholder="2~20자 이내 영문과 숫자만 가능"
                      required
                      readOnly
                    />
                  </div>
                  <div>
                    <Label className="text-xs">비밀번호</Label>
                    <Input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="변경 시에만 입력하세요"
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
                  <Label className="text-xs">대표자주소</Label>
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
                      name="managerContact"
                      value={formData.managerContact}
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
                    <Label className="text-xs">회사명 <span className="text-red-500">*</span></Label>
                    <Input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="h-8 text-xs"
                      placeholder="회사명"
                      required
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

            {/* 관리자 메모 */}
            <div className="bg-[#f7f7f7] border border-gray-300">
              <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2.5">관리자 메모</div>
              <div className="p-3">
                <Textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="min-h-[100px] text-xs"
                  placeholder="메모를 입력하세요"
                />
              </div>
            </div>

            {/* 등록일시/수정일시 */}
            <div className="bg-[#f7f7f7] border border-gray-300">
              <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2.5">등록/수정 정보</div>
              <div className="p-3 space-y-2">
                <div>
                  <Label className="text-xs">등록일시</Label>
                  <Input
                    value={registrationDate}
                    readOnly
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">수정일시</Label>
                  <Input
                    value={modificationDate}
                    readOnly
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-center gap-2 mt-4">
          <Button
            type="submit"
            disabled={submitting}
            className="h-8 px-6 text-sm bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting ? "저장 중..." : "수정하기"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/company/list")}
            className="h-8 px-4 text-sm border-gray-400 hover:bg-gray-100"
          >
            목록으로
          </Button>
        </div>
      </form>

      {/* 업체 코드 검색 모달 */}
      <CompanyCodeSearchModal
        open={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        onSelect={(company) => {
          setFormData(prev => ({
            ...prev,
            companyPath: company.companyNamePath || "",
            parentCompanyCode: String(company.companyCode || company.id || ""),
            parentCompanyName: company.companyName || "",
          }))
          setSelectedParentCompanyId(Number(company.id))
        }}
      />
    </div>
  )
}
