"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/common/pagination"
import { LoadingModal } from "@/components/common/loading-modal"
import { CommissionHistoryModal } from "@/components/company/commission-history-modal"
import { commissionsApi } from "@/lib/api"
import type { Commission } from "@/lib/api"
import { useAppContext } from "@/contexts/app-context"

// 개별 행 컴포넌트 - 각 행이 독립적인 상태를 가짐
const CommissionRow = memo(function CommissionRow({
  commission,
  rowNumber,
  onSave,
  onHistory,
}: {
  commission: Commission
  rowNumber: number
  onSave: (commissionId: number, values: {
    merchantCommission: number
    headquartersCommission: number
    branchCommission: number
    distributorCommission: number
    agentCommission: number
  }) => Promise<void>
  onHistory: (commissionId: number, merchantName: string) => void
}) {
  // 각 행이 독립적으로 상태 관리
  const [branchCommission, setBranchCommission] = useState(String(commission.branchCommission))
  const [distributorCommission, setDistributorCommission] = useState(String(commission.distributorCommission))
  const [agentCommission, setAgentCommission] = useState(String(commission.agentCommission))
  const [isChanged, setIsChanged] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 본사 수수료 자동 계산
  const headquartersCommission =
    commission.merchantCommission -
    ((parseFloat(branchCommission) || 0) +
     (parseFloat(distributorCommission) || 0) +
     (parseFloat(agentCommission) || 0))

  const handleInputChange = (setter: (v: string) => void, value: string) => {
    // 숫자와 소수점만 허용
    if (value !== "" && !/^\d*\.?\d{0,2}$/.test(value)) {
      return
    }
    setter(value)
    setIsChanged(true)
  }

  const handleSave = async () => {
    if (headquartersCommission < 0) {
      alert(`본사 수수료가 음수가 될 수 없습니다.\n가맹점 수수료(${commission.merchantCommission}%)보다 지사+총판+대리점 수수료의 합이 작아야 합니다.`)
      return
    }

    setIsSaving(true)
    try {
      await onSave(commission.id, {
        merchantCommission: commission.merchantCommission,
        headquartersCommission: Math.round(headquartersCommission * 100) / 100,
        branchCommission: parseFloat(branchCommission) || 0,
        distributorCommission: parseFloat(distributorCommission) || 0,
        agentCommission: parseFloat(agentCommission) || 0,
      })
      setIsChanged(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <tr className="border-b border-gray-300 last:border-b-0 hover:bg-[#DDE0E4]">
      <td className="px-2 py-1.5 border-r border-gray-300 text-center text-xs text-gray-800">
        {rowNumber}
      </td>
      <td className="px-2 py-1.5 border-r border-gray-300 text-center text-xs text-gray-800">
        {commission.merchantId}
      </td>
      <td className="px-2 py-1.5 border-r border-gray-300 text-left text-xs text-gray-800">
        {commission.companyNamePath}
      </td>
      <td className="px-2 py-1.5 border-r border-gray-300 text-left text-xs text-gray-800">
        {commission.merchantName}
      </td>
      <td className="px-2 py-1.5 border-r border-gray-300 text-center text-xs text-gray-500">
        {commission.merchantCommission}%
      </td>
      <td className="px-2 py-1.5 border-r border-gray-300 text-center">
        <div className="flex items-center justify-center gap-1">
          <input
            type="text"
            value={Math.round(headquartersCommission * 100) / 100}
            readOnly
            className="w-16 px-2 py-1 text-xs border border-gray-200 rounded text-right bg-gray-100 text-gray-500 cursor-not-allowed"
          />
          <span className="text-xs text-gray-400">%</span>
        </div>
      </td>
      <td className="px-2 py-1.5 border-r border-gray-300 text-center">
        <div className="flex items-center justify-center gap-1">
          <input
            type="text"
            value={branchCommission}
            onChange={(e) => handleInputChange(setBranchCommission, e.target.value)}
            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700">%</span>
        </div>
      </td>
      <td className="px-2 py-1.5 border-r border-gray-300 text-center">
        <div className="flex items-center justify-center gap-1">
          <input
            type="text"
            value={distributorCommission}
            onChange={(e) => handleInputChange(setDistributorCommission, e.target.value)}
            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700">%</span>
        </div>
      </td>
      <td className="px-2 py-1.5 border-r border-gray-300 text-center">
        <div className="flex items-center justify-center gap-1">
          <input
            type="text"
            value={agentCommission}
            onChange={(e) => handleInputChange(setAgentCommission, e.target.value)}
            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700">%</span>
        </div>
      </td>
      <td className="px-2 py-1.5 border-r border-gray-300 text-center">
        <Button
          size="sm"
          className="h-7 px-3 text-xs"
          disabled={!isChanged || isSaving}
          onClick={handleSave}
          variant={isChanged ? "default" : "outline"}
        >
          {isSaving ? "저장중..." : "저장"}
        </Button>
      </td>
      <td className="px-2 py-1.5 text-center">
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-3 text-xs border-gray-400"
          onClick={() => onHistory(commission.id, commission.merchantName)}
        >
          이력확인
        </Button>
      </td>
    </tr>
  )
})

export default function CompanyCommissionPage() {
  const router = useRouter()
  const { centerId, paymentPurpose } = useAppContext()

  // 필수 상태
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(15)

  // 검색 조건 상태
  const [searchCondition, setSearchCondition] = useState<"merchantName" | "companyName">("companyName")
  const [searchKeyword, setSearchKeyword] = useState<string>("")

  // 이력 팝업 상태
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [selectedCommissionId, setSelectedCommissionId] = useState<number>(0)
  const [selectedMerchantName, setSelectedMerchantName] = useState<string>("")

  const loadCommissions = async () => {
    setIsLoading(true)
    try {
      if (!centerId) {
        setIsLoading(false)
        return
      }

      const params: any = {
        centerId,
        paymentPurpose,
        page: currentPage,
        size: pageSize,
      }

      if (searchKeyword) {
        params[searchCondition] = searchKeyword
      }

      const response = await commissionsApi.findAll(params)

      if (response.data) {
        const data = response.data
        setCommissions(data.commissions || [])
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      }
    } catch (error) {
      console.error("목록 조회 오류:", error)
      alert("데이터를 불러오는데 실패했습니다.")
      setCommissions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (centerId) {
      loadCommissions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId, paymentPurpose, currentPage, pageSize])

  const handleSearch = () => {
    setCurrentPage(0)
    loadCommissions()
  }

  const handleReset = () => {
    setSearchKeyword("")
    setCurrentPage(0)
    loadCommissions()
  }

  const handleSave = async (commissionId: number, values: {
    merchantCommission: number
    headquartersCommission: number
    branchCommission: number
    distributorCommission: number
    agentCommission: number
  }) => {
    await commissionsApi.update(commissionId, values)
    alert("수수료율이 저장되었습니다.")
    loadCommissions()
  }

  const handleHistory = useCallback((commissionId: number, merchantName: string) => {
    setSelectedCommissionId(commissionId)
    setSelectedMerchantName(merchantName)
    setHistoryModalOpen(true)
  }, [])

  return (
    <div className="space-y-4">
      {/* 메뉴 Path */}
      <div className="text-xl text-gray-600">
        <span>업체 관리</span>
        <span className="mx-2">{">"}</span>
        <span className="font-semibold text-gray-800">업체 수수료율 관리</span>
      </div>

      {/* 검색 영역 */}
      <div className="bg-white border border-gray-300 w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#5F7C94] text-white text-sm font-medium">
              <th className="border-r border-white px-3 py-2.5 min-w-[200px]">검색 조건</th>
              <th className="px-3 py-2.5 min-w-[400px]">검색어</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                    <input
                      type="radio"
                      name="searchCondition"
                      value="companyName"
                      checked={searchCondition === "companyName"}
                      onChange={(e) => setSearchCondition(e.target.value as "merchantName" | "companyName")}
                      className="w-3.5 h-3.5"
                    />
                    <span className="text-gray-700">업체명</span>
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                    <input
                      type="radio"
                      name="searchCondition"
                      value="merchantName"
                      checked={searchCondition === "merchantName"}
                      onChange={(e) => setSearchCondition(e.target.value as "merchantName" | "companyName")}
                      className="w-3.5 h-3.5"
                    />
                    <span className="text-gray-700">가맹점명</span>
                  </label>
                </div>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="검색어를 입력하세요"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded h-6"
                  />
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-7 text-xs" onClick={handleSearch}>
                    검색
                  </Button>
                  <Button size="sm" variant="outline" className="px-4 h-7 text-xs border-gray-400" onClick={handleReset}>
                    목록
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 데이터 건수 및 사이즈 조절 */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="text-sm text-gray-700 flex items-center gap-1">
          <span>전체</span>
          <span className="font-semibold text-blue-600">{totalElements}</span>
          <span>건</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(0)
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={15}>15건</option>
            <option value={50}>50건</option>
            <option value={100}>100건</option>
            <option value={500}>500건</option>
          </select>
        </div>
      </div>

      {/* 데이터 테이블 - 직접 렌더링 */}
      <div className="bg-white border border-gray-300 overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse w-full">
            <thead className="bg-[#5F7C94] text-white">
              <tr>
                <th className="px-2 py-3 font-medium border-r border-white text-center" style={{ width: "60px" }}>NO</th>
                <th className="px-2 py-3 font-medium border-r border-white text-center" style={{ width: "80px" }}>코드</th>
                <th className="px-2 py-3 font-medium border-r border-white text-center" style={{ width: "250px" }}>업체명</th>
                <th className="px-2 py-3 font-medium border-r border-white text-center" style={{ width: "150px" }}>가맹점명</th>
                <th className="px-2 py-3 font-medium border-r border-white text-center" style={{ width: "100px" }}>가맹점수수료</th>
                <th className="px-2 py-3 font-medium border-r border-white text-center" style={{ width: "110px" }}>본사수수료</th>
                <th className="px-2 py-3 font-medium border-r border-white text-center" style={{ width: "110px" }}>지사수수료</th>
                <th className="px-2 py-3 font-medium border-r border-white text-center" style={{ width: "110px" }}>총판수수료</th>
                <th className="px-2 py-3 font-medium border-r border-white text-center" style={{ width: "110px" }}>대리점수수료</th>
                <th className="px-2 py-3 font-medium border-r border-white text-center" style={{ width: "80px" }}>저장</th>
                <th className="px-2 py-3 font-medium text-center" style={{ width: "90px" }}>이력확인</th>
              </tr>
            </thead>
            <tbody className="bg-[#E8EAED]">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-3 py-8 text-center text-gray-500 bg-white">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                commissions.map((commission, index) => (
                  <CommissionRow
                    key={commission.id}
                    commission={commission}
                    rowNumber={totalElements - (currentPage * pageSize + index)}
                    onSave={handleSave}
                    onHistory={handleHistory}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage + 1}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page - 1)}
        />
      )}

      {/* 로딩 모달 */}
      <LoadingModal isOpen={isLoading} />

      {/* 이력 확인 팝업 */}
      <CommissionHistoryModal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        commissionId={selectedCommissionId}
        merchantName={selectedMerchantName}
      />
    </div>
  )
}
