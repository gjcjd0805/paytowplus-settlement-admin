"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { settlementsApi } from "@/lib/api"
import type { HierarchicalStatistics } from "@/lib/api/types"
import { LoadingModal } from "@/components/common/loading-modal"

interface HierarchicalStatisticsModalProps {
  open: boolean
  onClose: () => void
  companyId: number
  companyName: string
  centerId: number
  paymentPurpose: string
  dateType: "settlement" | "payment"
  startDate: string
  endDate: string
}

export function HierarchicalStatisticsModal({
  open,
  onClose,
  companyId,
  companyName,
  centerId,
  paymentPurpose,
  dateType,
  startDate,
  endDate,
}: HierarchicalStatisticsModalProps) {
  const [statistics, setStatistics] = useState<HierarchicalStatistics[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 데이터 로드
  useEffect(() => {
    if (open && companyId) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, companyId, centerId, paymentPurpose, dateType, startDate, endDate])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const params: any = {
        centerId,
        companyId,
        paymentPurpose,
      }

      // 날짜 조건 추가
      if (dateType === "settlement") {
        if (startDate) params.settlementDateFrom = startDate
        if (endDate) params.settlementDateTo = endDate
      } else {
        if (startDate) params.paymentDateFrom = startDate
        if (endDate) params.paymentDateTo = endDate
      }

      const response = await settlementsApi.getHierarchicalStatistics(params)
      setStatistics(response.data?.statistics || [])
    } catch (error: any) {
      console.error("계층형 정산 통계 조회 오류:", error)
      alert("데이터를 불러오는데 실패했습니다.")
      setStatistics([])
    } finally {
      setIsLoading(false)
    }
  }

  // 레벨에 따른 들여쓰기 표시
  const getLevelPrefix = (level: number) => {
    if (level === 1) return ""
    if (level === 2) return "　ㄴ "
    if (level === 3) return "　　ㄴ "
    return ""
  }

  // 레벨명 반환
  const getLevelName = (level: number) => {
    if (level === 1) return "(지사)"
    if (level === 2) return "(총판)"
    if (level === 3) return "(대리점)"
    return ""
  }

  const getDopositAmount = (item: HierarchicalStatistics) => {
    if(item.level === 1) return item.summary.branchSettlementAmount
    if(item.level === 2) return item.summary.distributorSettlementAmount
    if(item.level === 3) return item.summary.agentSettlementAmount
    return ""
  }


  // 재귀적으로 렌더링
  const renderHierarchy = (items: HierarchicalStatistics[]) => {
    const rows: JSX.Element[] = []

    items.forEach((item) => {
      // 합계 행
      rows.push(
        <tr key={`summary-${item.companyId}`} className="border-b border-gray-300 bg-gray-50">
          <td className="border-r border-gray-300 px-2 py-2 text-left font-semibold text-xs">
            {getLevelPrefix(item.level)}
            {item.companyName}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-center text-xs"></td>
          <td className="border-r border-gray-300 px-1 py-2 text-right text-xs font-semibold">
            {item.summary.transactionCount.toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-right text-xs font-semibold">
            {item.summary.approvalAmount.toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-right text-xs font-semibold text-red-600">
            {item.summary.cancelAmount.toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-right text-xs font-semibold">
            {item.summary.transactionAmount.toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-right text-xs font-semibold">
            {item.summary.agentSettlementAmount.toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-right text-xs font-semibold">
            {item.summary.distributorSettlementAmount.toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-right text-xs font-semibold">
            {item.summary.branchSettlementAmount.toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-right text-xs font-semibold">
            {item.summary.totalSettlementAmount.toLocaleString()}
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-center text-xs">{item.bankName || ""}</td>
          <td className="border-r border-gray-300 px-1 py-2 text-center text-xs">{item.bankCode || ""}</td>
          <td className="border-r border-gray-300 px-1 py-2 text-center text-xs">{item.accountNumber || ""}</td>
          <td className="border-r border-gray-300 px-1 py-2 text-right text-xs font-semibold">
            
            {/* {item.summary.branchSettlementAmount.toLocaleString()} */}
            {getDopositAmount(item).toLocaleString()}
            
          </td>
          <td className="border-r border-gray-300 px-1 py-2 text-center text-xs">{item.accountHolder || ""}</td>
          <td className="px-1 py-2 text-center text-xs">
            <Button variant="outline" className="h-6 px-2 text-xs border-gray-400">
              상세보기
            </Button>
          </td>
        </tr>
      )

      // 수수료율별 행
      item.summaryArr.forEach((summary, idx) => {
        rows.push(
          <tr key={`detail-${item.companyId}-${idx}`} className="border-b border-gray-300 hover:bg-gray-50">
            <td className="border-r border-gray-300 px-2 py-2 text-left text-xs"/>
            <td className="border-r border-gray-300 px-1 py-2 text-right text-xs">
              {summary.merchantCommissionRate}%
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right text-xs">
              {summary.transactionCount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right text-xs">
              {summary.approvalAmount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right text-xs text-red-600">
              {summary.cancelAmount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right text-xs">
              {summary.transactionAmount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right text-xs">
              {summary.agentSettlementAmount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right text-xs">
              {summary.distributorSettlementAmount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right text-xs">
              {summary.branchSettlementAmount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-right text-xs">
              {summary.totalSettlementAmount.toLocaleString()}
            </td>
            <td className="border-r border-gray-300 px-1 py-2 text-center text-xs"></td>
            <td className="border-r border-gray-300 px-1 py-2 text-center text-xs"></td>
            <td className="border-r border-gray-300 px-1 py-2 text-center text-xs"></td>
            <td className="border-r border-gray-300 px-1 py-2 text-right text-xs"/>
            <td className="border-r border-gray-300 px-1 py-2 text-center text-xs"></td>
            <td className="px-1 py-2 text-center text-xs"></td>
          </tr>
        )
      })

      // 하위 조직 재귀 렌더링
      if (item.children && item.children.length > 0) {
        rows.push(...renderHierarchy(item.children))
      }
    })

    return rows
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[98vw] max-h-[95vh] overflow-y-auto">
          {/* 팝업 헤더 */}
          <DialogHeader className="bg-[#5F7C94] text-white px-4 py-3 -mx-6 -mt-6 mb-4">
            <DialogTitle className="text-lg font-medium">
              {companyName}_총판_대리점 정산금액 조회
            </DialogTitle>
          </DialogHeader>

          {/* 검색 영역 */}
          <div className="bg-white border border-gray-300 w-full overflow-x-auto mb-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#5F7C94] text-white text-sm font-medium">
                  <th className="border-r border-white px-3 py-2.5 min-w-[400px]">일자</th>
                  <th className="border-r border-white px-3 py-2.5 min-w-[400px]">PG</th>
                  <th className="px-3 py-2.5 min-w-[200px]">기능</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-r border-gray-300 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <select className="px-2 py-1 text-xs border border-gray-300 rounded bg-white h-6">
                        <option value="settlement">정산일자</option>
                        <option value="payment">결제일자</option>
                      </select>
                      <input
                        type="date"
                        value={startDate}
                        readOnly
                        className="w-32 px-2 py-1 text-xs border border-gray-300 rounded bg-gray-100 h-6"
                      />
                      <span className="text-xs text-gray-600">~</span>
                      <input
                        type="date"
                        value={endDate}
                        readOnly
                        className="w-32 px-2 py-1 text-xs border border-gray-300 rounded bg-gray-100 h-6"
                      />
                    </div>
                  </td>
                  <td className="border-r border-gray-300 px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                        <input type="radio" name="pgType" defaultChecked className="w-3.5 h-3.5" />
                        <span className="text-gray-700">모두</span>
                      </label>
                      <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                        <input type="radio" name="pgType" className="w-3.5 h-3.5" />
                        <span className="text-gray-700">위루트</span>
                      </label>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-center gap-2">
                      <Button onClick={loadData} className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-7 text-xs">
                        검색
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
                  <th rowSpan={2} className="border border-white px-2 py-2 min-w-[200px]">
                    업체명
                  </th>
                  <th colSpan={5} className="border border-white px-1 py-1.5">
                    구분
                  </th>
                  <th rowSpan={2} className="border border-white px-1 py-2 min-w-[100px]">
                    대리점정산
                  </th>
                  <th rowSpan={2} className="border border-white px-1 py-2 min-w-[100px]">
                    총판정산
                  </th>
                  <th rowSpan={2} className="border border-white px-1 py-2 min-w-[100px]">
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
                  <th className="border border-white px-1 py-1.5 min-w-[60px]">수수료율</th>
                  <th className="border border-white px-1 py-1.5 min-w-[60px]">결제건수</th>
                  <th className="border border-white px-1 py-1.5 min-w-[100px]">승인금액</th>
                  <th className="border border-white px-1 py-1.5 min-w-[100px]">취소금액</th>
                  <th className="border border-white px-1 py-1.5 min-w-[100px]">거래금액</th>
                  <th className="border border-white px-1 py-1.5 min-w-[80px]">은행명</th>
                  <th className="border border-white px-1 py-1.5 min-w-[40px]">코드</th>
                  <th className="border border-white px-1 py-1.5 min-w-[120px]">계좌번호</th>
                  <th className="border border-white px-1 py-1.5 min-w-[100px]">이체금액</th>
                  <th className="border border-white px-1 py-1.5 min-w-[120px]">예금주</th>
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
                  renderHierarchy(statistics)
                )}
              </tbody>
            </table>
          </div>

          {/* 팝업 하단 버튼 */}
          <DialogFooter className="mt-6">
            {/* <Button variant="outline" onClick={onClose} className="border-gray-400">
              닫기
            </Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LoadingModal isOpen={isLoading} />
    </>
  )
}
