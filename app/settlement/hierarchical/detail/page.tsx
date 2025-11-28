"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { settlementsApi } from "@/lib/api"
import type { SettlementAmountDetail, SettlementAmountTotalSummary } from "@/lib/api/types"
import { LoadingModal } from "@/components/common/loading-modal"
import { Pagination } from "@/components/common/pagination"
import { PaymentStatusHelper, type PaymentStatusType } from "@/lib/enums"

function SettlementAmountDetailContent() {
  const searchParams = useSearchParams()
  const [settlements, setSettlements] = useState<SettlementAmountDetail[]>([])
  const [totalSummary, setTotalSummary] = useState<SettlementAmountTotalSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // URL 파라미터에서 초기값 가져오기
  const companyId = searchParams.get("companyId")
  const companyName = searchParams.get("companyName")
  const level = searchParams.get("level")
  const centerId = searchParams.get("centerId")
  const paymentPurpose = searchParams.get("paymentPurpose")

  // 검색 조건 state
  const [currentDateType, setCurrentDateType] = useState<"settlement" | "transaction">(
    (searchParams.get("dateType") as "settlement" | "transaction") || "transaction"
  )
  const [currentStartDate, setCurrentStartDate] = useState<string>(searchParams.get("startDate") || "")
  const [currentEndDate, setCurrentEndDate] = useState<string>(searchParams.get("endDate") || "")
  const [currentPgCode, setCurrentPgCode] = useState<"all" | "WEROUTE">("all")

  // 레벨명 반환
  const getLevelName = () => {
    if (level === "1") return "지사"
    if (level === "2") return "총판"
    if (level === "3") return "대리점"
    return ""
  }

  const loadData = useCallback(async () => {
    if (!companyId || !centerId) return

    setIsLoading(true)
    try {
      const params: any = {
        centerId: Number(centerId),
        paymentPurpose,
        level: Number(level),
        companyId: Number(companyId),
        page: currentPage,
        size: pageSize,
      }

      // 날짜 조건 추가
      if (currentDateType === "settlement") {
        if (currentStartDate) params.settlementDateFrom = currentStartDate
        if (currentEndDate) params.settlementDateTo = currentEndDate
      } else {
        if (currentStartDate) params.transactionDateFrom = currentStartDate
        if (currentEndDate) params.transactionDateTo = currentEndDate
      }

      // PG 코드 추가
      if (currentPgCode !== "all") {
        params.pgCode = currentPgCode
      }

      const response = await settlementsApi.getSettlementAmounts(params)
      setSettlements(response.data?.settlements || [])
      setTotalSummary(response.data?.totalSummary || null)
      setTotalPages(response.data?.totalPages || 0)
      setTotalElements(response.data?.totalElements || 0)
    } catch (error: any) {
      console.error("정산금액 상세 조회 오류:", error)
      alert("데이터를 불러오는데 실패했습니다.")
      setSettlements([])
      setTotalSummary(null)
    } finally {
      setIsLoading(false)
    }
  }, [companyId, centerId, paymentPurpose, level, currentPage, pageSize, currentDateType, currentStartDate, currentEndDate, currentPgCode])

  // 초기 데이터 로드
  useEffect(() => {
    if (companyId && centerId) {
      loadData()
    }
  }, [companyId, centerId, currentPage, pageSize, loadData])

  const handleSearch = () => {
    setCurrentPage(0)
    loadData()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1)
  }

  return (
    <div className="min-h-screen bg-white p-4">
      {/* 헤더 */}
      <div className="bg-[#5F7C94] text-white px-4 py-3 mb-4">
        <h1 className="text-lg font-medium">{getLevelName()} 정산금액 상세 - {companyName}</h1>
      </div>

      {/* 검색 영역 */}
      <div className="bg-white border border-gray-300 w-full overflow-x-auto mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#5F7C94] text-white text-sm font-medium">
              <th className="border-r border-white px-3 py-2.5 min-w-[400px]">일자</th>
              <th className="border-r border-white px-3 py-2.5 min-w-[200px]">PG</th>
              <th className="px-3 py-2.5 min-w-[200px]">기능</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <select
                    value={currentDateType}
                    onChange={(e) => setCurrentDateType(e.target.value as "settlement" | "transaction")}
                    className="px-2 py-1 text-xs border border-gray-300 rounded bg-white h-6"
                  >
                    <option value="transaction">거래일자</option>
                    <option value="settlement">정산일자</option>
                  </select>
                  <input
                    type="date"
                    value={currentStartDate}
                    onChange={(e) => setCurrentStartDate(e.target.value)}
                    className="w-32 px-2 py-1 text-xs border border-gray-300 rounded bg-white h-6"
                  />
                  <span className="text-xs text-gray-600">~</span>
                  <input
                    type="date"
                    value={currentEndDate}
                    onChange={(e) => setCurrentEndDate(e.target.value)}
                    className="w-32 px-2 py-1 text-xs border border-gray-300 rounded bg-white h-6"
                  />
                </div>
              </td>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                    <input
                      type="radio"
                      name="pgCode"
                      value="all"
                      checked={currentPgCode === "all"}
                      onChange={(e) => setCurrentPgCode(e.target.value as "all" | "WEROUTE")}
                      className="w-3.5 h-3.5"
                    />
                    <span className="text-gray-700">모두</span>
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                    <input
                      type="radio"
                      name="pgCode"
                      value="WEROUTE"
                      checked={currentPgCode === "WEROUTE"}
                      onChange={(e) => setCurrentPgCode(e.target.value as "all" | "WEROUTE")}
                      className="w-3.5 h-3.5"
                    />
                    <span className="text-gray-700">위루트</span>
                  </label>
                </div>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-center gap-2">
                  <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-7 text-xs">
                    검색
                  </Button>
                  <Button variant="outline" onClick={() => window.close()} className="px-4 h-7 text-xs border-gray-400">
                    닫기
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 데이터 건수 및 페이지 크기 */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-600">
          총 <strong>{totalElements.toLocaleString()}</strong>건
        </span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value))
            setCurrentPage(0)
          }}
          className="px-2 py-1 text-xs border border-gray-300 rounded bg-white h-7"
        >
          <option value={10}>10건</option>
          <option value={50}>50건</option>
          <option value={100}>100건</option>
          <option value={500}>500건</option>
        </select>
      </div>

      {/* 데이터 테이블 */}
      <div className="border border-gray-300 overflow-x-auto">
        <table className="w-full border-collapse bg-white">
          <thead className="bg-[#6B7D8F] text-white text-xs font-semibold">
            <tr>
              <th className="border border-white px-2 py-2 min-w-[40px]">NO</th>
              <th className="border border-white px-2 py-2 min-w-[130px]">거래일자</th>
              <th className="border border-white px-2 py-2 min-w-[50px]">결제</th>
              <th className="border border-white px-2 py-2 min-w-[100px]">지사명</th>
              <th className="border border-white px-2 py-2 min-w-[100px]">총판명</th>
              <th className="border border-white px-2 py-2 min-w-[100px]">대리점명</th>
              <th className="border border-white px-2 py-2 min-w-[120px]">가맹점명</th>
              <th className="border border-white px-2 py-2 min-w-[90px]">터미널</th>
              <th className="border border-white px-2 py-2 min-w-[80px]">승인번호</th>
              <th className="border border-white px-2 py-2 min-w-[90px]">승인금액</th>
              <th className="border border-white px-2 py-2 min-w-[90px]">취소금액</th>
              <th className="border border-white px-2 py-2 min-w-[90px]">거래금액</th>
              <th className="border border-white px-2 py-2 min-w-[70px]">수수료</th>
              <th className="border border-white px-2 py-2 min-w-[80px]">정산금액(지)</th>
              <th className="border border-white px-2 py-2 min-w-[80px]">정산금액(총)</th>
              <th className="border border-white px-2 py-2 min-w-[80px]">정산금액(대)</th>
              <th className="border border-white px-2 py-2 min-w-[90px]">정산금액(가)</th>
              <th className="border border-white px-2 py-2 min-w-[140px]">정산일자</th>
              <th className="border border-white px-2 py-2 min-w-[140px]">취소일자(원거래일자)</th>
            </tr>
          </thead>
          <tbody className="text-xs text-gray-700">
            {settlements.length === 0 ? (
              <tr>
                <td colSpan={19} className="text-center py-10 text-gray-500">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              <>
                {settlements.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="border-r border-gray-300 px-2 py-2 text-center whitespace-nowrap">
                      {totalElements - (currentPage * pageSize + index)}
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-center whitespace-nowrap">{item.transactionDate}</td>
                    <td className="border-r border-gray-300 px-2 py-2 text-center whitespace-nowrap">
                      <span className={
                        item.paymentStatus === "SUCCESS" ? "text-green-600" :
                        item.paymentStatus === "CANCELLED" ? "text-red-600" :
                        item.paymentStatus === "FAILED" ? "text-red-600" :
                        "text-gray-600"
                      }>
                        {item.paymentStatus === "SUCCESS" ? "승인" :
                         item.paymentStatus === "CANCELLED" ? "취소" :
                         item.paymentStatus === "FAILED" ? "실패" :
                         item.paymentStatus === "PENDING" ? "대기" : item.paymentStatus}
                      </span>
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-center whitespace-nowrap">{item.branchName}</td>
                    <td className="border-r border-gray-300 px-2 py-2 text-center whitespace-nowrap">{item.distributorName}</td>
                    <td className="border-r border-gray-300 px-2 py-2 text-center whitespace-nowrap">{item.agentName ? item.agentName : ""}</td>
                    <td className="border-r border-gray-300 px-2 py-2 text-left whitespace-nowrap">{item.merchantName}</td>
                    <td className="border-r border-gray-300 px-2 py-2 text-center whitespace-nowrap">{item.terminalCode}</td>
                    <td className="border-r border-gray-300 px-2 py-2 text-center whitespace-nowrap">{item.approvalNumber}</td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right whitespace-nowrap">
                      {item.approvalAmount.toLocaleString()}
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right whitespace-nowrap text-red-600">
                      {item.cancelAmount.toLocaleString()}
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right whitespace-nowrap">
                      {item.transactionAmount.toLocaleString()}
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right ">
                      <div>{item.merchantFee.toLocaleString()}</div>
                      <span className="text-gray-500">({item.merchantCommissionRate})</span>
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right ">
                      <div>{item.branchSettlementAmount.toLocaleString()}</div> 
                      <span className="text-gray-500">({item.branchCommissionRate})</span>
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right ">
                      <div>{item.distributorSettlementAmount.toLocaleString()}</div> 
                      <span className="text-gray-500">({item.distributorCommissionRate})</span>
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right">
                      <div>{item.agentSettlementAmount.toLocaleString()}</div> 
                      <span className="text-gray-500">({item.agentCommissionRate})</span>
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right whitespace-nowrap">
                      {(item.merchantSettlementAmount || 0).toLocaleString()}
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-center">
                      <div>{item.settlementDate}</div> <span className="text-blue-600">정산완료</span>
                    </td>
                    <td className="px-2 py-2 text-center whitespace-nowrap">
                      {item.cancelDate ? (
                        <>
                          <div><span className="text-red-600">{item.cancelDate}</span></div>
                          {item.originalTransactionDate && (
                            <span className="text-gray-500"> ({item.originalTransactionDate})</span>
                          )}
                        </>
                      ) : (
                        ""
                      )}
                    </td>
                  </tr>
                ))}
                {/* 합계 행 */}
                {totalSummary && (
                  <tr className="bg-[#B8D4E8] font-semibold border-t-2 border-gray-400">
                    <td colSpan={9} className="border-r border-gray-300 px-2 py-2 text-center">
                      합계
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right">
                      {totalSummary.totalApprovalAmount.toLocaleString()}
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right text-red-600">
                      {totalSummary.totalCancelAmount.toLocaleString()}
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right">
                      {totalSummary.totalTransactionAmount.toLocaleString()}
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right">
                      {totalSummary.totalMerchantFee.toLocaleString()}
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right">
                      {totalSummary.totalBranchSettlementAmount.toLocaleString()}
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right">
                      {totalSummary.totalDistributorSettlementAmount.toLocaleString()}
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right">
                      {totalSummary.totalAgentSettlementAmount.toLocaleString()}
                    </td>
                    <td className="border-r border-gray-300 px-2 py-2 text-right">
                      {totalSummary.totalMerchantSettlementAmount.toLocaleString()}
                    </td>
                    <td colSpan={2} className="px-2 py-2 text-center">-</td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage + 1}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <LoadingModal isOpen={isLoading} />
    </div>
  )
}

export default function SettlementAmountDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <SettlementAmountDetailContent />
    </Suspense>
  )
}
