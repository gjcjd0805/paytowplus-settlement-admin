"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MerchantCodeSearchModal, MerchantSummary } from "@/components/merchant/merchant-code-search-modal"
import { terminalsApi } from "@/lib/api"

interface TerminalFormData {
  merchantId: string
  merchantCode: string
  merchantName: string
  terminalCode: string
  memo: string
}

export default function TerminalRegisterPage() {
  const router = useRouter()
  const [showMerchantModal, setShowMerchantModal] = useState(false)
  const [terminalIdChecked, setTerminalIdChecked] = useState(false)
  const [terminalIdAvailable, setTerminalIdAvailable] = useState(false)
  const [checkingTerminalId, setCheckingTerminalId] = useState(false)

  const [formData, setFormData] = useState<TerminalFormData>({
    merchantId: "",
    merchantCode: "",
    merchantName: "",
    terminalCode: "",
    memo: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let processedValue = value

    // 입력값 검증 및 처리
    switch (name) {
      case "terminalCode": // 터미널 코드: 영문숫자와 언더스코어만 허용
        processedValue = value.replace(/[^a-zA-Z0-9_]/g, "")
        setTerminalIdChecked(false)
        setTerminalIdAvailable(false)
        break
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }))
  }

  const handleMerchantSelect = (merchant: MerchantSummary) => {
    setFormData((prev) => ({
      ...prev,
      merchantId: merchant.id,
      merchantCode: merchant.merchantCode,
      merchantName: merchant.merchantName,
    }))
    setShowMerchantModal(false)
  }

  const handleCheckTerminalId = async () => {
    const code = formData.terminalCode.trim()

    if (!code) {
      alert("터미널 코드를 입력하세요.")
      return
    }

    if (code.length < 3) {
      alert("터미널 코드는 3자 이상이어야 합니다.")
      return
    }

    setCheckingTerminalId(true)
    try {
      const response = await terminalsApi.checkDuplicate(code)

      if (response.data.isDuplicate) {
        setTerminalIdChecked(true)
        setTerminalIdAvailable(false)
        alert(response.data.message || "이미 사용 중인 터미널 코드입니다.")
      } else {
        setTerminalIdChecked(true)
        setTerminalIdAvailable(true)
        alert(response.data.message || "사용 가능한 터미널 코드입니다.")
      }
    } catch (error: any) {
      console.error("터미널 코드 중복 체크 오류:", error)
      setTerminalIdChecked(false)
      setTerminalIdAvailable(false)
      alert(error?.response?.data?.message || "중복 체크에 실패했습니다.")
    } finally {
      setCheckingTerminalId(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // 모든 필드 trim 처리
      const trimmedData = {
        merchantId: formData.merchantId.trim(),
        terminalCode: formData.terminalCode.trim(),
        memo: formData.memo.trim(),
      }

      // 필수 필드 검증
      if (!trimmedData.merchantId) {
        throw new Error("가맹점을 선택해주세요.")
      }
      if (!trimmedData.terminalCode) {
        throw new Error("터미널 코드를 입력해주세요.")
      }
      if (trimmedData.terminalCode.length < 3) {
        throw new Error("터미널 코드는 3자 이상이어야 합니다.")
      }
      if (!terminalIdChecked || !terminalIdAvailable) {
        throw new Error("터미널 코드 중복 체크를 완료해주세요.")
      }

      await terminalsApi.create({
        merchantId: Number(trimmedData.merchantId),
        terminalCode: trimmedData.terminalCode,
      })

      alert("터미널이 등록되었습니다.")
      router.push("/terminal/list")
    } catch (error: any) {
      console.error("터미널 등록 오류:", error)
      alert(error?.response?.data?.message || error?.message || "터미널 등록에 실패했습니다.")
    }
  }

  const handleCancel = () => {
    router.push("/terminal/list")
  }

  return (
    <>
      <div className="space-y-4">
        {/* 메뉴 Path */}
        <div className="text-xl text-gray-600">
          <span>단말기</span>
          <span className="mx-2">{'>'}</span>
          <span className="font-semibold text-gray-800">단말기 등록</span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 2열 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 좌측 컬럼 */}
            <div className="space-y-4">
              {/* 기본 정보 */}
              <div className="bg-[#f7f7f7] border border-gray-300">
                <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2.5">기본 정보</div>
                <div className="p-3 space-y-2">
                  {/* 가맹점 정보 */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">가맹점코드 <span className="text-red-500">*</span></Label>
                      <Input
                        name="merchantCode"
                        value={formData.merchantCode}
                        readOnly
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">가맹점명 <span className="text-red-500">*</span></Label>
                      <div className="flex gap-1">
                        <Input
                          name="merchantName"
                          value={formData.merchantName}
                          placeholder="가맹점 검색"
                          readOnly
                          className="h-8 text-xs"
                        />
                        <Button
                          type="button"
                          onClick={() => setShowMerchantModal(true)}
                          className="h-8 px-2 text-xs whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          검색
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 터미널 코드 */}
                  <div>
                    <Label className="text-xs">터미널 코드 <span className="text-red-500">*</span></Label>
                    <div className="flex gap-1">
                      <Input
                        name="terminalCode"
                        value={formData.terminalCode}
                        onChange={handleChange}
                        placeholder="APP_MERCHANT_100 형식"
                        className={`h-8 text-xs ${terminalIdChecked ? (terminalIdAvailable ? "border-green-500" : "border-red-500") : ""}`}
                      />
                      <Button
                        type="button"
                        onClick={handleCheckTerminalId}
                        disabled={checkingTerminalId}
                        className="h-8 px-2 text-xs whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        중복체크
                      </Button>
                    </div>
                    {terminalIdChecked && (
                      <p className={`text-xs mt-0.5 ${terminalIdAvailable ? "text-green-600" : "text-red-600"}`}>
                        {terminalIdAvailable ? "✓ 사용 가능" : "✗ 사용 중"}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      ※ 앱 가맹점 연동 코드 (예: APP_MERCHANT_100)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측 컬럼 */}
            <div className="space-y-4">
              {/* 메모 */}
              <div className="bg-[#f7f7f7] border border-gray-300">
                <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2.5">메모</div>
                <div className="p-3 space-y-2">
                  <div>
                    <Label className="text-xs">메모</Label>
                    <textarea
                      name="memo"
                      value={formData.memo}
                      onChange={handleChange}
                      placeholder="메모 입력"
                      rows={5}
                      className="flex w-full rounded-md border border-black bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="h-8 px-6 text-sm bg-blue-600 hover:bg-blue-700 text-white"
            >
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

      {/* 가맹점 코드 검색 팝업 */}
      <MerchantCodeSearchModal
        open={showMerchantModal}
        onClose={() => setShowMerchantModal(false)}
        onSelect={handleMerchantSelect}
      />
    </>
  )
}
