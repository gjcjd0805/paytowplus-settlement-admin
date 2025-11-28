"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/common/pagination"
import { LoadingModal } from "@/components/common/loading-modal"
import { DataCountPageSize } from "@/components/common/data-count-page-size"
import { paymentsApi } from "@/lib/api"
import { useAppContext } from "@/contexts/app-context"
import type { Payment, PaymentTotalSummary } from "@/lib/api/types"
import { PGCode, type PGCodeType, PGCodeHelper } from "@/lib/enums"
import { formatAmount, getDateRange, type DateTabType } from "@/lib/utils/dateUtils"

export default function PaymentListPage() {
  const { centerId, paymentPurpose } = useAppContext()

  // 필수 상태
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0) // 0-based
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(15)
  const [totalSummary, setTotalSummary] = useState<PaymentTotalSummary | null>(null)

  // 검색 조건 상태 (초기값: 오늘 날짜)
  const { start: todayStart, end: todayEnd } = getDateRange("오늘")
  const [startDate, setStartDate] = useState<string>(todayStart)
  const [endDate, setEndDate] = useState<string>(todayEnd)
  const [paymentStatus, setPaymentStatus] = useState<"모두" | "SUCCESS" | "CANCELLED">("모두")
  const [pgCode, setPgCode] = useState<PGCodeType>(PGCode.ALL)
  const [searchCondition, setSearchCondition] = useState<"merchantName" | "approvalNumber" | "terminalCode">("merchantName")
  const [searchKeyword, setSearchKeyword] = useState<string>("")
  const [selectedTab, setSelectedTab] = useState<DateTabType | null>("오늘")

  // 데이터 로드
  const loadData = async () => {
    setIsLoading(true)
    try {
      // centerId 체크
      if (!centerId) {
        return
      }

      // 필수 날짜 검증
      if (!startDate || !endDate) {
        alert("거래일자를 선택해주세요.")
        return
      }

      const params: any = {
        centerId: centerId,
        paymentPurpose: paymentPurpose,
        transactionDateFrom: startDate,
        transactionDateTo: endDate,
        page: currentPage,
        size: pageSize,
      }

      // 검색 조건 추가
      if (paymentStatus !== "모두") {
        params.paymentStatus = paymentStatus
      }
      const pgCodeValue = PGCodeHelper.getValue(pgCode)
      if (pgCodeValue) params.pgCode = pgCodeValue
      if (searchKeyword) {
        params[searchCondition] = searchKeyword
      }

      const response = await paymentsApi.findAll(params)

      if (response.data) {
        const data = response.data
        setPayments(data.payments || [])
        setTotalElements(data.totalElements || 0)
        setTotalPages(data.totalPages || 0)
        setTotalSummary(data.totalSummary || null)
      }
    } catch (error) {
      console.error("Failed to load payments:", error)
      alert("결제 목록을 불러오는데 실패했습니다.")
      setPayments([])
      setTotalSummary(null)
    } finally {
      setIsLoading(false)
    }
  }

  // centerId, paymentPurpose, currentPage, pageSize 변경 시 데이터 로드
  useEffect(() => {
    if (centerId && startDate && endDate) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId, paymentPurpose, currentPage, pageSize])

  // 날짜 버튼 클릭 핸들러
  const handleDateTabClick = (tab: DateTabType) => {
    setSelectedTab(tab)
    const { start, end } = getDateRange(tab)
    setStartDate(start)
    setEndDate(end)
  }

  const handleSearch = () => {
    setCurrentPage(0)
    loadData()
  }

  // 결제 상태 포맷
  const formatPaymentStatus = (status: string) => {
    switch (status) {
      case "SUCCESS": return "승인"
      case "CANCELLED": return "취소"
      default: return status || "-"
    }
  }

  // 할부 개월 포맷
  const formatInstallment = (months: number): string => {
    if (months === 0) return "일시불"
    return `${months}개월`
  }

  return (
    <div className="space-y-4">
      {/* 메뉴 Path */}
      <div className="text-xl text-gray-600">
        <span>결제 관리</span>
        <span className="mx-2">{'>'}</span>
        <span className="font-semibold text-gray-800">결제내역 조회</span>
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
              <th className="border-r border-white px-3 py-2.5 min-w-[185px]">결제상태</th>
              <th className="border-r border-white px-3 py-2.5 min-w-[120px]">PG</th>
              <th className="border-r border-white px-3 py-2.5 min-w-[280px]">검색조건</th>
              <th className="border-r border-white px-3 py-2.5 min-w-[200px]">검색어</th>
              <th className="px-3 py-2.5 min-w-[165px]">검색</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">거래일자</span>
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
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-3 flex-wrap">
                  {[
                    { label: "모두", value: "모두" },
                    { label: "승인", value: "SUCCESS" },
                    { label: "취소", value: "CANCELLED" }
                  ].map((status) => (
                    <label key={status.value} className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                      <input
                        type="radio"
                        name="paymentStatus"
                        checked={paymentStatus === status.value}
                        onChange={() => setPaymentStatus(status.value as any)}
                        className="w-3.5 h-3.5"
                      />
                      <span className="text-gray-700">{status.label}</span>
                    </label>
                  ))}
                </div>
              </td>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  {PGCodeHelper.getOptions().map((option) => (
                    <label key={option.value} className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                      <input
                        type="radio"
                        name="pgCode"
                        checked={pgCode === option.value}
                        onChange={() => setPgCode(option.value)}
                        className="w-3.5 h-3.5"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </td>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-3 flex-wrap">
                  {[
                    { label: "가맹점명", value: "merchantName" },
                    { label: "승인번호", value: "approvalNumber" },
                    { label: "단말기코드", value: "terminalCode" }
                  ].map((condition) => (
                    <label key={condition.value} className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                      <input
                        type="radio"
                        name="searchCondition"
                        checked={searchCondition === condition.value}
                        onChange={() => setSearchCondition(condition.value as any)}
                        className="w-3.5 h-3.5"
                      />
                      <span className="text-gray-700">{condition.label}</span>
                    </label>
                  ))}
                </div>
              </td>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <input
                  type="text"
                  placeholder="검색어를 입력하세요"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded h-7"
                />
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-7 text-xs"
                  >
                    검색
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setStartDate("")
                      setEndDate("")
                      setPaymentStatus("모두")
                      setPgCode(PGCode.ALL)
                      setSearchCondition("merchantName")
                      setSearchKeyword("")
                      setSelectedTab(null)
                      setCurrentPage(0)
                      setPayments([])
                      setTotalSummary(null)
                    }}
                    className="px-4 h-7 text-xs border-gray-400"
                  >
                    초기화
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>


      {/* 테이블 */}
      <div>
        {/* 데이터 건수 및 사이즈 조절 */}
        <DataCountPageSize
          totalElements={totalElements}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setCurrentPage(0)
          }}
        />

        {/* 테이블 */}
        <div className="border border-gray-300 overflow-x-auto">
          <table className="w-full border-collapse bg-white">
            <thead className="bg-[#6B7D8F] text-white text-xs font-semibold">
              <tr>
                <th className="border border-white px-1 py-2 min-w-[40px] w-[40px]">NO</th>
                <th className="border border-white px-1 py-2 min-w-[60px]">PG</th>
                <th className="border border-white px-1 py-2 min-w-[130px]">거래일자</th>
                <th className="border border-white px-1 py-2 min-w-[60px]">결제상태</th>
                <th className="border border-white px-2 py-2 min-w-[100px]">가맹점명</th>
                <th className="border border-white px-1 py-2 min-w-[110px]">단말기코드</th>
                <th className="border border-white px-1 py-2 min-w-[70px]">매입사</th>
                <th className="border border-white px-1 py-2 min-w-[60px]">할부</th>
                <th className="border border-white px-1 py-2 min-w-[110px]">카드번호</th>
                <th className="border border-white px-1 py-2 min-w-[80px]">승인번호</th>
                <th className="border border-white px-1 py-2 min-w-[90px]">승인금액</th>
                <th className="border border-white px-1 py-2 min-w-[90px]">취소금액</th>
                <th className="border border-white px-1 py-2 min-w-[90px]">거래금액</th>
                <th className="border border-white px-1 py-2 min-w-[80px]">수수료</th>
                <th className="border border-white px-1 py-2 min-w-[90px]">정산금액</th>
                <th className="border border-white px-1 py-2 min-w-[60px]">수수료율</th>
                <th className="border border-white px-2 py-2 min-w-[100px]">Agent</th>
                <th className="border border-white px-1 py-2 min-w-[50px]">전표</th>
                <th className="border border-white px-1 py-2 min-w-[130px]">OrderId</th>
                <th className="border border-white px-1 py-2 min-w-[130px]">원거래일자</th>
              </tr>
            </thead>
            <tbody className="text-xs text-gray-700">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={20} className="text-center py-10 text-gray-500">검색 결과가 없습니다.</td>
                </tr>
              ) : (
                payments.map((row, index) => (
                  <tr key={row.id || index} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="border-r border-gray-300 px-1 py-2 text-center">{totalElements - (currentPage * pageSize + index)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-center">{PGCodeHelper.getLabel(row.pgCode) || "-"}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-center">{row.transactionDate || "-"}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-center">{formatPaymentStatus(row.paymentStatus)}</td>
                    <td className="border-r border-gray-300 px-2 py-2 text-left">{row.merchantName || "-"}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-center">{row.terminalCode || "-"}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-center">{row.acquirerName || "-"}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-center">{formatInstallment(row.installmentMonths)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-center">{row.cardNumber || "-"}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-center">{row.approvalNumber || "-"}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right">{formatAmount(row.approvalAmount)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right text-red-600">{formatAmount(row.cancelAmount)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right">{formatAmount(row.transactionAmount)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right">{formatAmount(row.fee)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right text-blue-600 font-medium">{formatAmount(row.settlementAmount)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-center">{row.feeRate}%</td>
                    <td className="border-r border-gray-300 px-2 py-2 text-left">{row.agentCompanyName || "-"}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs border-gray-400"
                        onClick={() => {
                          window.open(
                            `/payment/receipt?paymentId=${row.id}`,
                            "_blank",
                            "width=400,height=830,scrollbars=no,resizable=yes"
                          )
                        }}
                      >
                        전표
                      </Button>
                    </td>
                    <td className="border-r border-gray-300 px-1 py-2 text-center">{row.orderId || "-"}</td>
                    <td className="px-1 py-2 text-center">{row.originalTransactionDate || ""}</td>
                  </tr>
                ))
              )}
            </tbody>
            {/* 합계 행 */}
            {totalSummary && payments.length > 0 && (
              <tfoot className="bg-[#6B7D8F] text-white text-xs font-bold">
                <tr>
                  <td colSpan={10} className="border border-white px-1 py-2 text-center">합계 ({totalSummary.totalCount}건)</td>
                  <td className="border border-white px-1 py-2 text-right">{formatAmount(totalSummary.totalApprovalAmount)}</td>
                  <td className="border border-white px-1 py-2 text-right text-red-300">{formatAmount(totalSummary.totalCancelAmount)}</td>
                  <td className="border border-white px-1 py-2 text-right">{formatAmount(totalSummary.totalTransactionAmount)}</td>
                  <td className="border border-white px-1 py-2 text-right">{formatAmount(totalSummary.totalFee)}</td>
                  <td className="border border-white px-1 py-2 text-right text-yellow-300">{formatAmount(totalSummary.totalSettlementAmount)}</td>
                  <td colSpan={5} className="border border-white px-1 py-2 text-center"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* 페이징 */}
      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage + 1}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page - 1)}
        />
      )}

      {/* 로딩 모달 */}
      <LoadingModal isOpen={isLoading} />
    </div>
  )
}
