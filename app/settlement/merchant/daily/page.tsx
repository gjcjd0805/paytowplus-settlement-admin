"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/common/pagination"
import { LoadingModal } from "@/components/common/loading-modal"
import { DataCountPageSize } from "@/components/common/data-count-page-size"
import { settlementsApi } from "@/lib/api"
import { useAppContext } from "@/contexts/app-context"
import type { DailySettlementGroup, MerchantSettlementTotalSummary } from "@/lib/api/types"
import { PGCode, type PGCodeType, PGCodeHelper } from "@/lib/enums"
import { formatAmount, getDateRange, type DateTabType } from "@/lib/utils/dateUtils"

export default function MerchantSettlementDailyPage() {
  const { centerId, paymentPurpose } = useAppContext()

  // 필수 상태
  const [settlements, setSettlements] = useState<DailySettlementGroup[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0) // 0-based
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(15)
  const [totalSummary, setTotalSummary] = useState<MerchantSettlementTotalSummary | null>(null)

  // 검색 조건 상태 (초기값: 오늘 날짜)
  const { start: todayStart, end: todayEnd } = getDateRange("오늘")
  const [startDate, setStartDate] = useState<string>(todayStart)
  const [endDate, setEndDate] = useState<string>(todayEnd)
  const [pgCode, setPgCode] = useState<PGCodeType>(PGCode.ALL)
  const [searchCondition, setSearchCondition] = useState<"companyName" | "merchantName">("merchantName")
  const [searchKeyword, setSearchKeyword] = useState<string>("")
  const [selectedTab, setSelectedTab] = useState<DateTabType | null>("오늘")

  // 데이터 로드
  const loadData = async () => {
    setIsLoading(true)
    try {
      // centerId 체크
      if (!centerId) {
        setIsLoading(false)
        return
      }

      const params: any = {
        centerId: centerId,
        paymentPurpose: paymentPurpose,
        page: currentPage,
        size: pageSize,
      }

      // 검색 조건 추가
      if (startDate) params.settlementDateFrom = startDate
      if (endDate) params.settlementDateTo = endDate
      const pgCodeValue = PGCodeHelper.getValue(pgCode)
      if (pgCodeValue) params.pgCode = pgCodeValue
      if (searchKeyword) {
        params[searchCondition] = searchKeyword
      }

      const response = await settlementsApi.findMerchantsByDaily(params)

      if (response.data) {
        const data = response.data
        setSettlements(data.settlements || [])
        setTotalElements(data.totalElements || 0)
        setTotalPages(data.totalPages || 0)
        setTotalSummary(data.totalSummary || null)
      }
    } catch (error) {
      console.error("Failed to load settlements:", error)
      alert("정산 목록을 불러오는데 실패했습니다.")
      setSettlements([])
      setTotalSummary(null)
    } finally {
      setIsLoading(false)
    }
  }

  // centerId, paymentPurpose, currentPage, pageSize 변경 시 데이터 로드
  useEffect(() => {
    if (centerId) {
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


  // 테이블 렌더링
  const renderTable = () => {
    let rowNumber = currentPage * pageSize

    return (
      <table className="w-full border-collapse bg-white">
        <thead className="bg-[#6B7D8F] text-white text-xs font-semibold">
          <tr>
            <th rowSpan={2} className="border border-white px-1 py-2 min-w-[40px] w-[40px]">NO</th>
            <th rowSpan={2} className="border border-white px-2 py-2 min-w-[90px]">정산일자</th>
            <th rowSpan={2} className="border border-white px-2 py-2 min-w-[120px]">가맹점명</th>
            <th colSpan={4} className="border border-white px-1 py-1.5">정상매출</th>
            <th colSpan={5} className="border border-white px-1 py-1.5">차감매출(정산후취소)</th>
            <th rowSpan={2} className="border border-white px-1 py-2 min-w-[70px]">정산차감</th>
            <th rowSpan={2} className="border border-white px-1 py-2 min-w-[100px]">정산금액</th>
            <th rowSpan={2} className="border border-white px-1 py-2 min-w-[70px]">이체수수료</th>
            <th rowSpan={2} className="border border-white px-1 py-2 min-w-[100px]">입금금액</th>
            <th rowSpan={2} className="border border-white px-1 py-2 min-w-[90px]">은행명</th>
            <th rowSpan={2} className="border border-white px-1 py-2 min-w-[95px]">계좌번호</th>
            <th rowSpan={2} className="border border-white px-1 py-2 min-w-[100px]">예금주</th>
          </tr>
          <tr>
            <th className="border border-white px-1 py-1.5 min-w-[50px]">건수</th>
            <th className="border border-white px-1 py-1.5 min-w-[100px]">거래금액</th>
            <th className="border border-white px-1 py-1.5 min-w-[100px]">수수료</th>
            <th className="border border-white px-1 py-1.5 min-w-[100px]">정산금액</th>
            <th className="border border-white px-1 py-1.5 min-w-[50px]">건수</th>
            <th className="border border-white px-1 py-1.5 min-w-[70px]">취소금액</th>
            <th className="border border-white px-1 py-1.5 min-w-[70px]">수수료</th>
            <th className="border border-white px-1 py-1.5 min-w-[90px]">차감금액</th>
            <th className="border border-white px-1 py-1.5 min-w-[90px]">차감완료금액</th>
          </tr>
        </thead>
        <tbody className="text-xs text-gray-700">
          {settlements.length === 0 ? (
            <tr>
              <td colSpan={19} className="text-center py-10 text-gray-500">검색 결과가 없습니다.</td>
            </tr>
          ) : (
            settlements.map((dailyGroup) =>
              dailyGroup.items.map((row, itemIndex) => {
                rowNumber++
                return (
                  <tr key={`${dailyGroup.date}-${row.merchantId}-${itemIndex}`} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="border-r border-gray-300 px-1 py-2 text-center">{rowNumber}</td>
                    <td className="border-r border-gray-300 px-2 py-2 text-center">{dailyGroup.date || "-"}</td>
                    <td className="border-r border-gray-300 px-2 py-2 text-left">{row.merchantName || "-"}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-center text-blue-600 font-medium">{row.normal.count}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right">{formatAmount(row.normal.transactionAmount)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right">{formatAmount(row.normal.fee)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right">{formatAmount(row.normal.settlementAmount)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-center text-blue-600 font-medium">{row.canceled.count}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right">{formatAmount(row.canceled.cancelAmount)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right">{formatAmount(row.canceled.fee)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right">{formatAmount(row.canceled.deductedAmount)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right">{formatAmount(row.canceled.totalCanceledAmount)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right">{formatAmount(row.totalDeduct)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right text-blue-600 font-medium">{formatAmount(row.finalSettlement)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right text-red-600 font-medium">{formatAmount(row.transferFee)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-right text-green-600 font-medium">{formatAmount(row.depositAmount)}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-center">{row.bankName || "-"}</td>
                    <td className="border-r border-gray-300 px-1 py-2 text-center">{row.accountNumber || "-"}</td>
                    <td className="px-1 py-2 text-center">{row.accountHolder || "-"}</td>
                  </tr>
                )
              })
            )
          )}
        </tbody>
        {/* 합계 행 */}
        {totalSummary && settlements.length > 0 && (
          <tfoot className="bg-[#4A5568] text-white text-xs font-bold">
            <tr>
              <td colSpan={3} className="border border-white px-1 py-2 text-center">합계</td>
              <td className="border border-white px-1 py-2 text-center text-yellow-300">{totalSummary.totalNormalCount}</td>
              <td className="border border-white px-1 py-2 text-right">{formatAmount(totalSummary.totalNormalTransactionAmount)}</td>
              <td className="border border-white px-1 py-2 text-right">{formatAmount(totalSummary.totalNormalFee)}</td>
              <td className="border border-white px-1 py-2 text-right">{formatAmount(totalSummary.totalNormalSettlementAmount)}</td>
              <td className="border border-white px-1 py-2 text-center text-yellow-300">{totalSummary.totalCanceledCount}</td>
              <td className="border border-white px-1 py-2 text-right">{formatAmount(totalSummary.totalCanceledCancelAmount)}</td>
              <td className="border border-white px-1 py-2 text-right">{formatAmount(totalSummary.totalCanceledFee)}</td>
              <td className="border border-white px-1 py-2 text-right">{formatAmount(totalSummary.totalCanceledDeductedAmount)}</td>
              <td className="border border-white px-1 py-2 text-right">{formatAmount(totalSummary.totalCanceledTotalAmount)}</td>
              <td className="border border-white px-1 py-2 text-right">{formatAmount(totalSummary.totalDeduct)}</td>
              <td className="border border-white px-1 py-2 text-right text-yellow-300">{formatAmount(totalSummary.totalFinalSettlement)}</td>
              <td className="border border-white px-1 py-2 text-right text-yellow-300">{formatAmount(totalSummary.totalTransferFee)}</td>
              <td className="border border-white px-1 py-2 text-right text-yellow-300">{formatAmount(totalSummary.totalDepositAmount)}</td>
              <td colSpan={3} className="border border-white px-1 py-2 text-center"></td>
            </tr>
          </tfoot>
        )}
      </table>
    )
  }

  return (
    <div className="space-y-4">
      {/* 메뉴 Path */}
      <div className="text-xl text-gray-600">
        <span>정산 관리</span>
        <span className="mx-2">{'>'}</span>
        <span className="font-semibold text-gray-800">가맹점 정산금액 조회(일자별)</span>
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
              <th className="border-r border-white px-3 py-2.5 min-w-[120px]">PG코드</th>
              <th className="border-r border-white px-3 py-2.5 min-w-[180px]">검색조건</th>
              <th className="border-r border-white px-3 py-2.5 min-w-[180px]">검색어</th>
              <th className="px-3 py-2.5 min-w-[150px]">검색</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">정산일자</span>
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
                <div className="flex items-center gap-3">
                  {[
                    { label: "업체명", value: "companyName" },
                    { label: "가맹점명", value: "merchantName" }
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
                      setPgCode(PGCode.ALL)
                      setSearchCondition("merchantName")
                      setSearchKeyword("")
                      setSelectedTab(null)
                      setCurrentPage(0)
                      setSettlements([])
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
          pageSizeOptions={[50, 100, 200, 500]}
        />

        {/* 테이블 */}
        <div className="border border-gray-300 overflow-x-auto">
          {renderTable()}
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
