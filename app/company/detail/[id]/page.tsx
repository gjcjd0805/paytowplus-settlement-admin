"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { companiesApi } from "@/lib/api"
import { BankHelper } from "@/lib/enums"

export default function CompanyDetailPage() {
  const params = useParams()
  const companyId = params.id as string
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [registrationDate, setRegistrationDate] = useState<string>("")
  const [modificationDate, setModificationDate] = useState<string>("")
  const [memo, setMemo] = useState<string>("")

  const [formData, setFormData] = useState({
    companyPath: "",
    companyRegistrationNumber: "",
    representativeName: "",
    businessType: "",
    companyType: "법인사업자",
    representativeAddress: "",
    companyAddress: "",
    managerPosition: "",
    managerName: "",
    managerPhone: "",
    managerEmail: "",
    useYn: "허용",
    agentUseYn: "정상",
    settlementBank: "",
    settlementAccount: "",
    settlementAccountHolder: "",
    ceoName: "",
    ceoRegistrationNumber: "",
    businessRegistrationNumber: "",
    businessAddress: "",
    occupation: "",
    category: "",
    businessTel: "",
  })

  // 업체 데이터 로드
  useEffect(() => {
    const loadCompany = async () => {
      try {
        setLoading(true)
        const response = await companiesApi.findById(Number(companyId))
        const company = response.data || response

        // 등록일시, 수정일시 설정 (YYYY-MM-DD HH:mm:ss 형식)
        const formatDateTime = (dateTimeStr: string) => {
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
        setRegistrationDate(formatDateTime(company.registDt || ""))
        setModificationDate(formatDateTime(company.updateDt || ""))
        setMemo(company.memo || "")

        // 백엔드 응답 데이터를 폼 데이터로 변환
        setFormData({
          companyPath: company.companyNamePath || "",
          companyRegistrationNumber: String(company.parentCompanyId || ""),
          representativeName: company.loginId || "",
          businessType: company.name || "",
          companyType: company.businessType === "INDIVIDUAL" ? "개인사업자" :
                      company.businessType === "CORPORATE" ? "법인사업자" : "비사업자",
          representativeAddress: company.representativeName || "",
          companyAddress: company.representativeAddress || "",
          managerPosition: company.managerName || "",
          managerName: company.managerName || "",
          managerPhone: company.managerContact || "",
          managerEmail: company.managerEmail || "",
          useYn: company.isLoginAllowed ? "허용" : "차단",
          agentUseYn: company.contractStatus === "APPLIED" ? "신청" :
                     company.contractStatus === "ACTIVE" ? "정상" : "해지",
          settlementBank: BankHelper.getName(company.bankCode || ""),
          settlementAccount: company.accountHolder || "",
          settlementAccountHolder: company.accountNumber || "",
          ceoName: company.companyName || "",
          ceoRegistrationNumber: company.companyPhoneNumber || "",
          businessRegistrationNumber: company.businessRegistrationNumber || "",
          businessAddress: company.businessAddress || "",
          occupation: company.businessCategory || "",
          category: company.businessItem || "",
          businessTel: company.corporateRegistrationNumber || "",
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
        <span className="font-semibold text-gray-800">업체 상세보기</span>
      </div>

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
                  <Label className="text-xs">아이디</Label>
                  <Input
                    value={formData.representativeName}
                    readOnly
                    className="h-8 text-xs bg-gray-100"
                  />
                </div>
                <div>
                  <Label className="text-xs">비밀번호</Label>
                  <Input
                    value="********"
                    readOnly
                    className="h-8 text-xs bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">업체명</Label>
                <Input
                  value={formData.businessType}
                  readOnly
                  className="h-8 text-xs bg-gray-100"
                />
              </div>

              <div>
                <Label className="text-xs">사업자구분</Label>
                <div className="flex gap-2 items-center h-8">
                  {["비사업자", "개인사업자", "법인사업자"].map((type) => (
                    <label key={type} className="flex items-center gap-1 text-xs">
                      <input
                        type="radio"
                        name="companyType"
                        value={type}
                        checked={formData.companyType === type}
                        disabled
                        className="w-3 h-3"
                      />
                      <span className="text-gray-600">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs">대표자명</Label>
                <Input
                  value={formData.representativeAddress}
                  readOnly
                  className="h-8 text-xs bg-gray-100"
                />
              </div>

              <div>
                <Label className="text-xs">대표자주소</Label>
                <Input
                  value={formData.companyAddress}
                  readOnly
                  className="h-8 text-xs bg-gray-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">담당자명</Label>
                  <Input
                    value={formData.managerPosition}
                    readOnly
                    className="h-8 text-xs bg-gray-100"
                  />
                </div>
                <div>
                  <Label className="text-xs">담당자연락처</Label>
                  <Input
                    value={formData.managerPhone}
                    readOnly
                    className="h-8 text-xs bg-gray-100"
                  />
                </div>
                <div>
                  <Label className="text-xs">담당자이메일</Label>
                  <Input
                    value={formData.managerEmail}
                    readOnly
                    className="h-8 text-xs bg-gray-100"
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
                    value={formData.ceoName}
                    readOnly
                    className="h-8 text-xs bg-gray-100"
                  />
                </div>
                <div>
                  <Label className="text-xs">회사(사업자) 전화번호</Label>
                  <Input
                    value={formData.ceoRegistrationNumber}
                    readOnly
                    className="h-8 text-xs bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">사업자번호</Label>
                  <Input
                    value={formData.businessRegistrationNumber}
                    readOnly
                    className="h-8 text-xs bg-gray-100"
                  />
                </div>
                <div>
                  <Label className="text-xs">법인번호</Label>
                  <Input
                    value={formData.businessTel}
                    readOnly
                    className="h-8 text-xs bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">업태</Label>
                  <Input
                    value={formData.occupation}
                    readOnly
                    className="h-8 text-xs bg-gray-100"
                  />
                </div>
                <div>
                  <Label className="text-xs">종목</Label>
                  <Input
                    value={formData.category}
                    readOnly
                    className="h-8 text-xs bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">사업자주소</Label>
                <Input
                  value={formData.businessAddress}
                  readOnly
                  className="h-8 text-xs bg-gray-100"
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
                          name="useYn"
                          value={opt}
                          checked={formData.useYn === opt}
                          disabled
                          className="w-3 h-3"
                        />
                        <span className="text-gray-600">{opt}</span>
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
                          name="agentUseYn"
                          value={opt}
                          checked={formData.agentUseYn === opt}
                          disabled
                          className="w-3 h-3"
                        />
                        <span className="text-gray-600">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">입금은행명</Label>
                  <Input
                    value={formData.settlementBank}
                    readOnly
                    className="h-8 text-xs bg-gray-100"
                  />
                </div>
                <div>
                  <Label className="text-xs">예금주</Label>
                  <Input
                    value={formData.settlementAccount}
                    readOnly
                    className="h-8 text-xs bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">계좌번호</Label>
                <Input
                  value={formData.settlementAccountHolder}
                  readOnly
                  className="h-8 text-xs bg-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">등록일시</Label>
                  <Input
                    value={registrationDate}
                    readOnly
                    className="h-8 text-xs bg-gray-100"
                  />
                </div>
                <div>
                  <Label className="text-xs">수정일시</Label>
                  <Input
                    value={modificationDate}
                    readOnly
                    className="h-8 text-xs bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-center gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/company/list")}
          className="h-8 px-4 text-sm border-gray-400 hover:bg-gray-100"
        >
          목록으로
        </Button>
      </div>
    </div>
  )
}
