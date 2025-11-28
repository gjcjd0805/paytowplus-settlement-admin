"use client"

import React, { useState, useEffect } from "react"
import { useAppContext } from "@/contexts/app-context"
import { settlementsApi } from "@/lib/api"
import type { HierarchicalStatistics } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { LoadingModal } from "@/components/common/loading-modal"
import { getDateRange, getMonthRange, type DateTabType } from "@/lib/utils/dateUtils"

export default function SettlementAmountAgentPage() {
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

  // 데이터 로드
  const loadStatistics = async () => {
    if (!centerId) {
      alert("센터를 선택해주세요")
      return
    }

    // 대리점 권한 체크
    if (user?.level !== 3) {
      alert("대리점 권한이 필요합니다")
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
    } catch (error: any) {
      console.error("대리점 정산금액 조회 오류:", error)
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

  // 재귀적으로 계층 구조 렌더링 (대리점 - 하위 계층 없음)
  const renderHierarchy = (items: HierarchicalStatistics[]): JSX.Element[] => {
    const rows: JSX.Element[] = []

    items.forEach((item) => {
      // 합계 행
      rows.push(
        <tr key={`summary-${item.companyId}`} className="border-b border-gray-300 bg-gray-50 font-semibold">
          <td className="border-r border-gray-300 px-2 py-2 text-left">
            {item.companyName}
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
          <td className="border-r border-gray-300 px-1 py-2 text-right text-blue-600">
            {(item.summary?.agentSettlementAmount || 0).toLocaleString()}
          </td>
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
            <td className="px-1 py-2 text-center"></td>
          </tr>
        )
      })

      // 하위 조직 재귀 렌더링 (대리점은 하위 계층 없음)
      if (item.children && item.children.length > 0) {
        rows.push(...renderHierarchy(item.children))
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
                대리점명
              </th>
              <th colSpan={5} className="border border-white px-1 py-1.5">
                구분
              </th>
              <th colSpan={2} className="border border-white px-1 py-1.5">
                정산
              </th>
            </tr>
            <tr>
              <th className="border border-white px-1 py-1.5 min-w-[80px]">가맹점 수수료율</th>
              <th className="border border-white px-1 py-1.5 min-w-[70px]">결제건수</th>
              <th className="border border-white px-1 py-1.5 min-w-[100px]">승인금액</th>
              <th className="border border-white px-1 py-1.5 min-w-[90px]">취소금액</th>
              <th className="border border-white px-1 py-1.5 min-w-[100px]">거래금액</th>
              <th className="border border-white px-1 py-1.5 min-w-[90px]">정산금액</th>
              <th className="border border-white px-1 py-1.5 min-w-[80px]">상세보기</th>
            </tr>
          </thead>
          <tbody className="text-xs text-gray-700">
            {statistics.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-500">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              renderHierarchy(statistics)
            )}
          </tbody>
        </table>
      </div>

      <LoadingModal isOpen={isLoading} />
    </div>
  )
}
