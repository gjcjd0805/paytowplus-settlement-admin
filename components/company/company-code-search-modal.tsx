"use client"

import { useEffect, useMemo, useState } from "react"
import { companiesApi } from "@/lib/api"
import type { CompanyListItem } from "@/lib/api/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getCenterId } from "@/lib/utils/auth"
import { LoadingModal } from "@/components/common/loading-modal"

export interface CompanySummary {
  id: string
  companyCode: string
  companyName: string
  companyType?: "지사" | "총판" | "대리점"
  companyNamePath?: string
  ceoName?: string
  phone?: string
  mobile?: string
  creatorName?: string      // 담당자명
  creatorUsername?: string  // 아이디
}

export function CompanyCodeSearchModal({
  open,
  onClose,
  onSelect,
  filterType,
  initialLevel,
}: {
  open: boolean
  onClose: () => void
  onSelect: (company: CompanySummary) => void
  filterType?: "지사" | "총판" | "대리점"
  initialLevel?: "all" | "BRANCH" | "DISTRIBUTOR" | "AGENT"
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [levelFilter, setLevelFilter] = useState<"all" | "BRANCH" | "DISTRIBUTOR" | "AGENT">(initialLevel || "all")
  const [searchCondition, setSearchCondition] = useState<"name" | "representativeName" | "companyPhoneNumber" | "managerName" | "managerContact" | "loginId">("name")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [items, setItems] = useState<CompanyListItem[]>([])
  const [currentPage, setCurrentPage] = useState(0) // 0-based for API
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  const loadCompanies = async () => {
    setLoading(true)
    setError("")
    try {
      const centerId = getCenterId()

      const params: any = {
        centerId,
        page: currentPage,
        size: pageSize,
      }

      // 레벨 필터 적용
      if (levelFilter !== "all") {
        params.levelCode = levelFilter
      } else if (filterType === "지사") {
        params.levelCode = "BRANCH"
      } else if (filterType === "총판") {
        params.levelCode = "DISTRIBUTOR"
      } else if (filterType === "대리점") {
        params.levelCode = "AGENT"
      }

      // 검색 조건 적용
      if (searchKeyword.trim()) {
        params[searchCondition] = searchKeyword
      }

      const response = await companiesApi.findAll(params)

      if (response.data) {
        setItems(response.data.companies || [])
        setTotalPages(response.data.totalPages || 0)
        setTotalElements(response.data.totalElements || 0)
      }
    } catch (e: any) {
      console.error("업체 목록 조회 오류:", e)
      setError(e?.message || "업체 목록을 불러오지 못했습니다.")
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  // initialLevel이 변경되면 levelFilter 업데이트
  useEffect(() => {
    if (open && initialLevel) {
      setLevelFilter(initialLevel)
    }
  }, [open, initialLevel])

  useEffect(() => {
    if (!open) return
    loadCompanies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentPage, levelFilter])

  const handleSearch = () => {
    setCurrentPage(0)
    loadCompanies()
  }

  const handleReset = () => {
    setLevelFilter("all")
    setSearchCondition("name")
    setSearchKeyword("")
    setCurrentPage(0)
    loadCompanies()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-[10000] w-[1100px] max-h-[90vh] rounded-lg border bg-white shadow-lg flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-[#5F7C94] text-white">
          <h2 className="text-base font-semibold">업체 코드검색</h2>
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
              <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2.5 flex items-center justify-center border-r border-gray-300 w-24">
                레벨
              </div>
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
              <div className="px-3 py-2.5 border-r border-gray-300 w-24">
                <select
                  value={levelFilter}
                  onChange={(e) => {
                    setLevelFilter(e.target.value as any)
                    setCurrentPage(0)
                  }}
                  disabled={!!initialLevel}
                  className={`w-full px-2 py-1 text-xs border border-gray-300 rounded h-7 ${
                    initialLevel ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                  }`}
                >
                  <option value="all">전체</option>
                  <option value="BRANCH">지사</option>
                  <option value="DISTRIBUTOR">총판</option>
                  <option value="AGENT">대리점</option>
                </select>
              </div>
              <div className="px-3 py-2.5 border-r border-gray-300 flex-[400]">
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: "업체명", value: "name" },
                    { label: "대표자명", value: "representativeName" },
                    { label: "전화번호", value: "companyPhoneNumber" },
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
                <th className="text-center p-2 border-r border-white w-32">코드</th>
                <th className="text-center p-2 border-r border-white">업체명</th>
                <th className="text-center p-2 border-r border-white w-20">레벨명</th>
                <th className="text-center p-2 border-r border-white w-28">대표자명</th>
                <th className="text-center p-2 border-r border-white w-36">전화번호</th>
                <th className="text-center p-2 border-r border-white w-28">담당자</th>
                <th className="text-center p-2 border-r border-white w-32">아이디</th>
                <th className="text-center p-2 w-20">-</th>
              </tr>
            </thead>
            <tbody className="bg-[#E8EAED]">
              {items.length === 0 ? (
                <tr>
                  <td className="p-4 text-center" colSpan={9}>결과가 없습니다.</td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const company: CompanySummary = {
                    id: String(item.id),
                    companyCode: String(item.id), // API에 companyCode 필드 확인 필요
                    companyName: item.name || "",
                    companyNamePath: item.companyNamePath || "",
                    ceoName: item.representativeName || "",
                    phone: item.managerContact || "",
                    mobile: "",
                    creatorName: item.managerName || "",
                    creatorUsername: item.loginId || "",
                  }

                  const levelMap: Record<string, string> = {
                    'HEADQUARTERS': '본사',
                    'BRANCH': '지사',
                    'DISTRIBUTOR': '총판',
                    'AGENT': '대리점'
                  }

                  return (
                    <tr key={item.id} className="border-b border-gray-300 hover:bg-[#DDE0E4]">
                      <td className="p-2 text-center text-muted-foreground">{totalElements - (currentPage * pageSize + index)}</td>
                      <td className="p-2 text-center font-mono">{company.companyCode}</td>
                      <td className="p-2">{company.companyNamePath || company.companyName}</td>
                      <td className="p-2 text-center">{levelMap[item.levelCode] || item.levelCode}</td>
                      <td className="p-2 text-center">{company.ceoName || "-"}</td>
                      <td className="p-2 text-center">{company.phone || "-"}</td>
                      <td className="p-2 text-center">{company.creatorName || "-"}</td>
                      <td className="p-2 text-center text-muted-foreground">{company.creatorUsername || "-"}</td>
                      <td className="p-2 text-center">
                        <Button
                          size="sm"
                          onClick={() => { onSelect(company); onClose(); }}
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
        <div className="flex justify-center gap-2 px-4 py-3 border-t bg-white">
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
