"use client"

import { useEffect, useState } from "react"
import { merchantsApi } from "@/lib/api"
import type { MerchantListItem } from "@/lib/api/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getCenterId } from "@/lib/utils/auth"
import { LoadingModal } from "@/components/common/loading-modal"

export interface MerchantSummary {
  id: string
  merchantCode: string
  merchantName: string
  companyNamePath?: string
  representativeName?: string
  businessPhoneNumber?: string
  managerName?: string
  managerContact?: string
  loginId?: string
}

export function MerchantCodeSearchModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (merchant: MerchantSummary) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [searchCondition, setSearchCondition] = useState<"name" | "representativeName" | "businessPhoneNumber" | "managerName" | "managerContact" | "loginId">("name")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [items, setItems] = useState<MerchantListItem[]>([])
  const [currentPage, setCurrentPage] = useState(0) // 0-based for API
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  const loadMerchants = async () => {
    setLoading(true)
    setError("")
    try {
      const centerId = getCenterId()

      const params: any = {
        centerId,
        page: currentPage,
        size: pageSize,
      }

      // 검색 조건 적용
      if (searchKeyword.trim()) {
        params[searchCondition] = searchKeyword
      }

      const response = await merchantsApi.findAll(params)

      if (response.data) {
        setItems(response.data.merchants || [])
        setTotalPages(response.data.totalPages || 0)
        setTotalElements(response.data.totalElements || 0)
      }
    } catch (e: any) {
      console.error("가맹점 목록 조회 오류:", e)
      setError(e?.message || "가맹점 목록을 불러오지 못했습니다.")
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return
    loadMerchants()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentPage])

  const handleSearch = () => {
    setCurrentPage(0)
    loadMerchants()
  }

  const handleReset = () => {
    setSearchCondition("name")
    setSearchKeyword("")
    setCurrentPage(0)
    loadMerchants()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-[101] w-[1200px] max-h-[90vh] rounded-lg border bg-white shadow-lg flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-[#5F7C94] text-white rounded-t-lg">
          <h2 className="text-base font-semibold">가맹점 코드검색</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-xl font-bold w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* 검색 영역 */}
        <div className="p-4 border-b bg-white">
          <div className="bg-white border border-gray-300 w-full">
            {/* 검색 조건 헤더 */}
            <div className="flex items-stretch border-b border-gray-300">
              <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2.5 flex items-center justify-center border-r border-gray-300 flex-[400]">
                검색조건
              </div>
              <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2.5 flex items-center justify-center border-r border-gray-300 flex-[450]">
                검색어
              </div>
              <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2.5 flex items-center justify-center w-32">
                검색
              </div>
            </div>

            {/* 검색 폼 */}
            <div className="flex items-center border-b border-gray-300">
              <div className="px-3 py-2.5 border-r border-gray-300 flex-[400]">
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: "가맹점명", value: "name" },
                    { label: "대표자명", value: "representativeName" },
                    { label: "전화번호", value: "businessPhoneNumber" },
                    { label: "담당자명", value: "managerName" },
                    { label: "담당자연락처", value: "managerContact" },
                    { label: "아이디", value: "loginId" }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                      <input
                        type="radio"
                        name="searchCondition"
                        value={option.value}
                        checked={searchCondition === option.value}
                        onChange={(e) => setSearchCondition(e.target.value as any)}
                        className="w-3.5 h-3.5"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="px-3 py-2.5 border-r border-gray-300 flex-[450]">
                <Input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded h-7"
                  placeholder="검색어를 입력하세요"
                />
              </div>
              <div className="px-3 py-2.5 flex items-center justify-center gap-2 w-32">
                <Button
                  size="sm"
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 h-7 text-xs"
                >
                  검색
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReset}
                  className="px-3 h-7 text-xs border-gray-400"
                >
                  목록
                </Button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-2 text-sm text-red-600">{error}</div>
        )}

        {/* 테이블 */}
        <div className="flex-1 overflow-auto min-h-0 p-4">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-[#5F7C94] text-white sticky top-0">
              <tr>
                <th className="text-center p-2 border-r border-white w-16">NO</th>
                <th className="text-center p-2 border-r border-white w-24">가맹점코드</th>
                <th className="text-center p-2 border-r border-white">가맹점명</th>
                <th className="text-center p-2 border-r border-white w-28">대표자명</th>
                <th className="text-center p-2 border-r border-white w-32">전화번호</th>
                <th className="text-center p-2 border-r border-white w-28">담당자</th>
                <th className="text-center p-2 border-r border-white w-32">담당자연락처</th>
                <th className="text-center p-2 border-r border-white w-28">아이디</th>
                <th className="text-center p-2 w-20">선택</th>
              </tr>
            </thead>
            <tbody className="bg-[#E8EAED]">
              {items.length === 0 ? (
                <tr>
                  <td className="p-4 text-center" colSpan={9}>결과가 없습니다.</td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const merchant: MerchantSummary = {
                    id: String(item.id),
                    merchantCode: String(item.id),
                    merchantName: item.name || "",
                    companyNamePath: item.companyNamePath || "",
                    representativeName: item.representativeName || "",
                    businessPhoneNumber: item.businessPhoneNumber || "",
                    managerName: item.managerName || "",
                    managerContact: item.managerContact || "",
                    loginId: item.loginId || "",
                  }

                  return (
                    <tr key={item.id} className="border-b border-gray-300 hover:bg-[#DDE0E4]">
                      <td className="p-2 text-center text-muted-foreground">{totalElements - (currentPage * pageSize + index)}</td>
                      <td className="p-2 text-center font-mono">{merchant.merchantCode}</td>
                      <td className="p-2">{merchant.merchantName}</td>
                      <td className="p-2 text-center">{merchant.representativeName || "-"}</td>
                      <td className="p-2 text-center">{merchant.businessPhoneNumber || "-"}</td>
                      <td className="p-2 text-center">{merchant.managerName || "-"}</td>
                      <td className="p-2 text-center">{merchant.managerContact || "-"}</td>
                      <td className="p-2 text-center text-muted-foreground">{merchant.loginId || "-"}</td>
                      <td className="p-2 text-center">
                        <Button
                          size="sm"
                          onClick={() => { onSelect(merchant); onClose(); }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 h-6 text-xs"
                        >
                          선택
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <div className="flex items-center justify-center gap-1 px-4 py-3 border-t bg-white">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
              className="h-7 px-2 text-xs"
            >
              처
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="h-7 px-2 text-xs"
            >
              이전
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageGroup = Math.floor(currentPage / 5)
              const pageNum = pageGroup * 5 + i
              if (pageNum >= totalPages) return null
              return (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={currentPage === pageNum ? "default" : "outline"}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-7 px-3 text-xs ${
                    currentPage === pageNum
                      ? "bg-[#4A90E2] hover:bg-[#357ABD] text-white"
                      : ""
                  }`}
                >
                  {pageNum + 1}
                </Button>
              )
            })}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="h-7 px-2 text-xs"
            >
              다음
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
              className="h-7 px-2 text-xs"
            >
              마
            </Button>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-center gap-2 px-4 py-3 border-t bg-white rounded-b-lg">
          <Button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700 text-white px-6 h-8 text-sm"
          >
            창닫기
          </Button>
        </div>
      </div>

      {/* 로딩 모달 */}
      <LoadingModal isOpen={loading} />
    </div>
  )
}
