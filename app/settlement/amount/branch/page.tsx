"use client"

import React, { useState, useEffect } from "react"
import { useAppContext } from "@/contexts/app-context"
import { settlementsApi } from "@/lib/api"
import type { HierarchicalStatistics } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { LoadingModal } from "@/components/common/loading-modal"
import { getDateRange, getMonthRange, type DateTabType } from "@/lib/utils/dateUtils"

export default function SettlementAmountBranchPage() {
  const { centerId, paymentPurpose, user } = useAppContext()

  // 당월 범위
  const { start: monthStart, end: monthEnd } = getMonthRange()

  // 검색 조건
  const [dateType, setDateType] = useState<"settlement" | "payment">("settlement")
  const [startDate, setStartDate] = useState<string>(monthStart)
  const [endDate, setEndDate] = useState<string>(monthEnd)
  const [selectedTab, setSelectedTab] = useState<DateTabType | null>("당월")

  // 데이터
  const [statistics, setStatistics] = useState<HierarchicalStatistics[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 전체 합계
  const [grandTotal, setGrandTotal] = useState({
    transactionCount: 0,
    approvalAmount: 0,
    cancelAmount: 0,
    transactionAmount: 0,
    agentSettlementAmount: 0,
    distributorSettlementAmount: 0,
    branchSettlementAmount: 0,
    totalSettlementAmount: 0,
  })

  // 데이터 로드
  const loadStatistics = async () => {
    if (!centerId) {
      alert("센터를 선택해주세요")
      return
    }

    // 지사 권한 체크
    if (user?.level !== 1) {
      alert("지사 권한이 필요합니다")
      return
    }

    if (!user?.companyId) {
      alert("업체 정보가 없습니다")
      return
    }

    setIsLoading(true)
    try {
      const params: any = {
        centerId,
        companyId: user.companyId,
        paymentPurpose,
      }

      // 검색 조건 추가
      if (dateType === "settlement") {
        if (startDate) params.settlementDateFrom = startDate
        if (endDate) params.settlementDateTo = endDate
      } else {
        if (startDate) params.paymentDateFrom = startDate
        if (endDate) params.paymentDateTo = endDate
      }

      const response = await settlementsApi.getHierarchicalStatistics(params)
      const data = response.data?.statistics || []
      setStatistics(data)

      // 전체 합계 계산 (최상위 레벨의 합계)
      const initialTotal = {
        transactionCount: 0,
        approvalAmount: 0,
        cancelAmount: 0,
        transactionAmount: 0,
        agentSettlementAmount: 0,
        distributorSettlementAmount: 0,
        branchSettlementAmount: 0,
        totalSettlementAmount: 0,
      }
      const total = data.reduce(
        (acc: typeof initialTotal, item: HierarchicalStatistics) => ({
          transactionCount: acc.transactionCount + (item.summary?.transactionCount || 0),
          approvalAmount: acc.approvalAmount + (item.summary?.approvalAmount || 0),
          cancelAmount: acc.cancelAmount + (item.summary?.cancelAmount || 0),
          transactionAmount: acc.transactionAmount + (item.summary?.transactionAmount || 0),
          agentSettlementAmount: acc.agentSettlementAmount + (item.summary?.agentSettlementAmount || 0),
          distributorSettlementAmount: acc.distributorSettlementAmount + (item.summary?.distributorSettlementAmount || 0),
          branchSettlementAmount: acc.branchSettlementAmount + (item.summary?.branchSettlementAmount || 0),
          totalSettlementAmount: acc.totalSettlementAmount + (item.summary?.totalSettlementAmount || 0),
        }),
        initialTotal
      )
      setGrandTotal(total)
    } catch (error: any) {
      console.error("지사 정산금액 조회 오류:", error)
      if (error.response?.status === 400) {
        alert(error.response.data?.message || "해당 요청에 대한 조회 권한이 없습니다")
      } else {
        alert("데이터를 불러오는데 실패했습니다.")
      }
      setStatistics([])
    } finally {
      setIsLoading(false)
    }
  }

  // 날짜 버튼 클릭 핸들러
  const handleDateTabClick = (tab: DateTabType) => {
    setSelectedTab(tab)
    const { start, end } = getDateRange(tab)
    setStartDate(start)
    setEndDate(end)
  }

  // 페이지 진입 시 자동 조회 + 결제목적 변경 시 재조회
  useEffect(() => {
    if (centerId && user) {
      loadStatistics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId, user, paymentPurpose])

  // 검색
  const handleSearch = () => {
    loadStatistics()
  }

  // 초기화
  const handleReset = () => {
    setStartDate(monthStart)
    setEndDate(monthEnd)
    setDateType("settlement")
    setSelectedTab("당월")
  }

  // 레벨에 따른 들여쓰기 표시
  const getLevelPrefix = (level: number, baseLevel: number) => {
    const depth = level - baseLevel
    if (depth === 0) return ""
    if (depth === 1) return "└ "
    if (depth === 2) return "　└ "
    return ""
  }

  // 레벨에 따른 이체금액 반환
  const getDepositAmount = (item: HierarchicalStatistics) => {
    if (item.level === 1) return item.summary?.branchSettlementAmount || 0
    if (item.level === 2) return item.summary?.distributorSettlementAmount || 0
    if (item.level === 3) return item.summary?.agentSettlementAmount || 0
    return 0
  }

  // 상세보기 클릭 핸들러
  const handleDetailClick = (item: HierarchicalStatistics) => {
    const params = new URLSearchParams({
      companyId: item.companyId.toString(),
      companyName: item.companyName,
      level: item.level.toString(),
      centerId: centerId!.toString(),
      paymentPurpose: paymentPurpose,
      dateType: dateType,
      startDate: startDate,
      endDate: endDate,
    })
    window.open(`/settlement/hierarchical/detail?${params.toString()}`, '_blank', 'width=1600,height=900')
  }

  // 재귀적으로 계층 구조 렌더링
  const renderHierarchy = (items: HierarchicalStatistics[], baseLevel: number = 1): JSX.Element[] => {
    const rows: JSX.Element[] = []

    items.forEach((item) => {
      const depth = item.level - baseLevel

      // 합계 행
      rows.push(
        <tr key={`summary-${item.companyId}`} className="border-b border-gray-300 bg-gray-50 font-semibold">
          <td className={`border-r border-gray-300 px-2 py-2 text-left ${depth > 0 ? `pl-${depth * 4 + 2}` : ''}`}>
            {getLevelPrefix(item.level, baseLevel)}{item.companyName}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-center"></td>
          <td className="border-r border-gray-300 px-1 py-2 text-right">
            {(item.summary?.transactionCount || 0).toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-right">
            {(item.summary?.approvalAmount || 0).toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-right text-red-600">
            {(item.summary?.cancelAmount || 0).toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-right">
            {(item.summary?.transactionAmount || 0).toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-right">
            {(item.summary?.agentSettlementAmount || 0).toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-right">
            {(item.summary?.distributorSettlementAmount || 0).toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-right">
            {(item.summary?.branchSettlementAmount || 0).toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-right">
            {(item.summary?.totalSettlementAmount || 0).toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-center">{item.bankName || ""}</td>
          <td className="border-r border-gray-300 px-1 py-2 text-center">{item.bankCode || ""}</td>
          <td className="border-r border-gray-300 px-1 py-2 text-center">{item.accountNumber || ""}</td>
          <td className="border-r border-gray-300 px-1 py-2 text-right">
            {getDepositAmount(item).toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-center">{item.accountHolder || ""}</td>
          <td className="px-1 py-2 text-center">
            {(item.summary?.transactionCount || 0) > 0 && (
              <Button
                variant="outline"
                onClick={() => handleDetailClick(item)}
                className="h-6 px-2 text-xs border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                상세보기
              </Button>
            )}
          </td>
        </tr>
      )

      // 수수료율별 행
      item.summaryArr?.forEach((summary, idx) => {
        rows.push(
          <tr key={`detail-${item.companyId}-${idx}`} className="border-b border-gray-300 hover:bg-gray-50">
            <td className="border-r border-gray-300 px-2 py-2 text-left"></td>
            <td className="border-r border-gray-300 px-1 py-2 text-center">
              {summary.merchantCommissionRate}%
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right">
              {summary.transactionCount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right">
              {summary.approvalAmount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right text-red-600">
              {summary.cancelAmount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right">
              {summary.transactionAmount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right">
              {summary.agentSettlementAmount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right">
              {summary.distributorSettlementAmount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right">
              {summary.branchSettlementAmount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right">
              {summary.totalSettlementAmount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-center"></td>
            <td className="border-r border-gray-300 px-1 py-2 text-center"></td>
            <td className="border-r border-gray-300 px-1 py-2 text-center"></td>
            <td className="border-r border-gray-300 px-1 py-2 text-right"></td>
            <td className="border-r border-gray-300 px-1 py-2 text-center"></td>
            <td className="px-1 py-2 text-center"></td>
          </tr>
        )
      })

      // 하위 조직 재귀 렌더링
      if (item.children && item.children.length > 0) {
        rows.push(...renderHierarchy(item.children, baseLevel))
      }
    })

    return rows
  }

  return (
    <div className="space-y-4">
      {/* 메뉴 Path */}
      <div className="text-sm sm:text-xl text-gray-600">
        <span>정산 관리</span>
        <span className="mx-2">{">"}</span>
        <span className="font-semibold text-gray-800">정산금액 조회</span>
      </div>

      {/* 검색 영역 */}
      <div className="bg-white border border-gray-300 w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#5F7C94] text-white text-sm font-medium">
              <th className="border-r border-white px-3 py-2.5 min-w-[370px]">
                <div className="flex items-center justify-center gap-1">
                  {["오늘", "어제", "3일전", "한달전", "당월"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleDateTabClick(tab as any)}
                      className={`px-3 py-1.5 text-xs font-medium border border-gray-300 rounded ${
                        selectedTab === tab
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </th>
              <th className="px-3 py-2.5 min-w-[150px]">검색</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <select
                    value={dateType}
                    onChange={(e) => setDateType(e.target.value as "settlement" | "payment")}
                    className="px-2 py-1 text-xs border border-gray-300 rounded bg-white h-6"
                  >
                    <option value="settlement">정산일자</option>
                    <option value="payment">결제일자</option>
                  </select>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-32 px-2 py-1 text-xs border border-gray-300 rounded bg-white h-6"
                  />
                  <span className="text-xs text-gray-600">~</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-32 px-2 py-1 text-xs border border-gray-300 rounded bg-white h-6"
                  />
                </div>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-center gap-2">
                  <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-7 text-xs">
                    검색
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="px-4 h-7 text-xs border-gray-400">
                    목록
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 데이터 테이블 */}
      <div className="border border-gray-300 overflow-x-auto">
        <table className="w-full border-collapse bg-white">
          <thead className="bg-[#6B7D8F] text-white text-xs font-semibold">
            <tr>
              <th rowSpan={2} className="border border-white px-2 py-2 min-w-[180px]">
                업체명
              </th>
              <th rowSpan={2} className="border border-white px-1 py-2 min-w-[80px]">
                가맹점<br/>수수료율
              </th>
              <th rowSpan={2} className="border border-white px-1 py-2 min-w-[70px]">
                결제건수
              </th>
              <th colSpan={3} className="border border-white px-1 py-1.5">
                구분
              </th>
              <th className="border border-white px-1 py-1.5 min-w-[90px]">
                대리점정산
              </th>
              <th className="border border-white px-1 py-1.5 min-w-[90px]">
                총판정산
              </th>
              <th className="border border-white px-1 py-1.5 min-w-[90px]">
                지사정산
              </th>
              <th rowSpan={2} className="border border-white px-1 py-2 min-w-[100px]">
                합계
              </th>
              <th colSpan={5} className="border border-white px-1 py-1.5">
                은행정보
              </th>
              <th rowSpan={2} className="border border-white px-1 py-2 min-w-[80px]">
                상세보기
              </th>
            </tr>
            <tr>
              <th className="border border-white px-1 py-1.5 min-w-[100px]">승인금액</th>
              <th className="border border-white px-1 py-1.5 min-w-[90px]">취소금액</th>
              <th className="border border-white px-1 py-1.5 min-w-[100px]">거래금액</th>
              <th className="border border-white px-1 py-1.5 min-w-[90px]">정산금액</th>
              <th className="border border-white px-1 py-1.5 min-w-[90px]">정산금액</th>
              <th className="border border-white px-1 py-1.5 min-w-[90px]">정산금액</th>
              <th className="border border-white px-1 py-1.5 min-w-[70px]">은행명</th>
              <th className="border border-white px-1 py-1.5 min-w-[50px]">코드</th>
              <th className="border border-white px-1 py-1.5 min-w-[110px]">계좌번호</th>
              <th className="border border-white px-1 py-1.5 min-w-[90px]">이체금액</th>
              <th className="border border-white px-1 py-1.5 min-w-[100px]">예금주</th>
            </tr>
          </thead>
          <tbody className="text-xs text-gray-700">
            {statistics.length === 0 ? (
              <tr>
                <td colSpan={16} className="text-center py-10 text-gray-500">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              <>
                {renderHierarchy(statistics)}

                {/* 전체 합계 행 */}
                <tr className="bg-yellow-50 font-bold border-t-2 border-gray-400">
                  <td className="border-r border-gray-300 px-2 py-2 text-center">
                    전체 합계
                  </td>
                  <td className="border-r border-gray-300 px-1 py-2 text-center"></td>
                  <td className="border-r border-gray-300 px-1 py-2 text-right">
                    {grandTotal.transactionCount.toLocaleString()}
                  </td>
                  <td className="border-r border-gray-300 px-1 py-2 text-right">
                    {grandTotal.approvalAmount.toLocaleString()}
                  </td>
                  <td className="border-r border-gray-300 px-1 py-2 text-right text-red-600">
                    {grandTotal.cancelAmount.toLocaleString()}
                  </td>
                  <td className="border-r border-gray-300 px-1 py-2 text-right">
                    {grandTotal.transactionAmount.toLocaleString()}
                  </td>
                  <td className="border-r border-gray-300 px-1 py-2 text-right">
                    {grandTotal.agentSettlementAmount.toLocaleString()}
                  </td>
                  <td className="border-r border-gray-300 px-1 py-2 text-right">
                    {grandTotal.distributorSettlementAmount.toLocaleString()}
                  </td>
                  <td className="border-r border-gray-300 px-1 py-2 text-right">
                    {grandTotal.branchSettlementAmount.toLocaleString()}
                  </td>
                  <td className="border-r border-gray-300 px-1 py-2 text-right">
                    {grandTotal.totalSettlementAmount.toLocaleString()}
                  </td>
                  <td className="border-r border-gray-300 px-1 py-2 text-center"></td>
                  <td className="border-r border-gray-300 px-1 py-2 text-center"></td>
                  <td className="border-r border-gray-300 px-1 py-2 text-center"></td>
                  <td className="border-r border-gray-300 px-1 py-2 text-right"></td>
                  <td className="border-r border-gray-300 px-1 py-2 text-center"></td>
                  <td className="px-1 py-2 text-center"></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <LoadingModal isOpen={isLoading} />
    </div>
  )
}
