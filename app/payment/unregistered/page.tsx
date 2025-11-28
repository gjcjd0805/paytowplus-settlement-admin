"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common/data-table"
import { Pagination } from "@/components/common/pagination"
import { LoadingModal } from "@/components/common/loading-modal"
import { DataCountPageSize } from "@/components/common/data-count-page-size"
import { MerchantCodeSearchModal } from "@/components/merchant/merchant-code-search-modal"
import { paymentsApi, type UnregisteredPayment } from "@/lib/api"
import { useAppContext } from "@/contexts/app-context"
import { getDateRange, getMonthRange, type DateTabType } from "@/lib/utils/dateUtils"

export default function UnregisteredPaymentListPage() {
  const { centerId: contextCenterId, paymentPurpose } = useAppContext()

  const getCenterId = () => {
    if (contextCenterId) return contextCenterId
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("centerId")
      return stored ? Number(stored) : 1
    }
    return 1
  }

  // 초기 당월 날짜
  const { start: monthStart, end: monthEnd } = getMonthRange()

  // 필수 상태
  const [payments, setPayments] = useState<UnregisteredPayment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // 검색 조건 (초기값: 당월)
  const [startDate, setStartDate] = useState<string>(monthStart)
  const [endDate, setEndDate] = useState<string>(monthEnd)
  const [selectedTab, setSelectedTab] = useState<DateTabType | null>("당월")

  // 가맹점 검색
  const [merchantSearchModalOpen, setMerchantSearchModalOpen] = useState(false)
  const [selectedMerchantCode, setSelectedMerchantCode] = useState<string>("")
  const [selectedMerchantName, setSelectedMerchantName] = useState<string>("")

  // 가맹점 코드 입력 상태 (테이블 행별)
  const [merchantCodes, setMerchantCodes] = useState<{ [key: number]: string }>({})
  const [merchantNames, setMerchantNames] = useState<{ [key: number]: string }>({})

  // ===========================
  // 데이터 로드
  // ===========================
  const loadPayments = async () => {
    setIsLoading(true)
    try {
      const centerId = getCenterId()

      const params: any = {
        centerId,
        paymentPurpose: paymentPurpose || "DELIVERY_CHARGE",
        page: currentPage,
        size: pageSize,
        sort: "approvalDate,desc",
      }

      // 검색 조건 추가
      if (startDate) params.transactionDateFrom = startDate
      if (endDate) params.transactionDateTo = endDate

      const response = await paymentsApi.findUnregistered(params)

      if (response.data) {
        setPayments(response.data.payments || [])
        setTotalPages(response.data.totalPages || 0)
        setTotalElements(response.data.totalElements || 0)
      }
    } catch (error) {
      console.error("단말기 미등록 결제 목록 조회 오류:", error)
      alert("데이터를 불러오는데 실패했습니다.")
      setPayments([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // 초기 날짜 설정 후 로드
    if (startDate && endDate) {
      loadPayments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextCenterId, paymentPurpose, currentPage, pageSize, startDate, endDate])

  // ===========================
  // 날짜 탭 클릭 핸들러
  // ===========================
  const handleDateTabClick = (tab: DateTabType) => {
    setSelectedTab(tab)
    const { start, end } = getDateRange(tab)
    setStartDate(start)
    setEndDate(end)
  }

  // ===========================
  // 검색 핸들러
  // ===========================
  const handleSearch = () => {
    setCurrentPage(0)
    loadPayments()
  }

  const handleReset = () => {
    setStartDate("")
    setEndDate("")
    setSelectedTab(null)
    setSelectedMerchantCode("")
    setSelectedMerchantName("")
    setCurrentPage(0)
    loadPayments()
  }

  // ===========================
  // 가맹점 등록 핸들러
  // ===========================
  // 코드입력: 검색 영역에서 선택한 가맹점 정보를 해당 행의 input에 세팅
  const handleCodeInput = (paymentId: number) => {
    // 검색 영역에서 선택한 가맹점 정보 확인
    if (!selectedMerchantCode || !selectedMerchantName) {
      alert("가맹점코드검색 버튼을 클릭하여 가맹점을 먼저 선택하세요.")
      return
    }

    // 해당 행의 input에 값 세팅
    setMerchantCodes((prev) => ({ ...prev, [paymentId]: selectedMerchantCode }))
    setMerchantNames((prev) => ({ ...prev, [paymentId]: selectedMerchantName }))
  }

  // 수정하기: 해당 행의 input에 입력된 가맹점 정보로 단말기 등록
  const handleUpdateMerchant = async (paymentId: number) => {
    const merchantCode = merchantCodes[paymentId]
    const merchantName = merchantNames[paymentId]

    if (!merchantCode || !merchantName) {
      alert("가맹점명과 가맹점코드를 입력하세요.")
      return
    }

    // merchantCode를 merchantId(숫자)로 변환
    const merchantId = Number(merchantCode)
    if (isNaN(merchantId)) {
      alert("올바른 가맹점 코드를 입력하세요.")
      return
    }

    if (!confirm(`[${merchantName}] 가맹점을 등록하시겠습니까?`)) return

    try {
      await paymentsApi.registerTerminal(paymentId, { merchantId })
      alert("가맹점이 등록되었습니다.")
      loadPayments()
    } catch (error) {
      console.error("가맹점 등록 오류:", error)
      alert("가맹점 등록에 실패했습니다.")
    }
  }

  // ===========================
  // 날짜 포맷 함수
  // ===========================
  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return ""
    return dateTimeStr.replace("T", " ").substring(0, 19)
  }

  // ===========================
  // 상태 표시 함수
  // ===========================
  const renderPaymentStatus = (status: string) => {
    if (status === "SUCCESS") {
      return <span className="text-blue-600 font-semibold">승인</span>
    } else if (status === "CANCELLED") {
      return <span className="text-red-600 font-semibold">취소</span>
    }
    return status
  }

  // ===========================
  // 테이블 컬럼 정의
  // ===========================
  const columns = [
    {
      key: "no",
      header: "NO",
      width: "60",
      align: "center" as const,
      render: (row: UnregisteredPayment, index: number) => totalElements - (currentPage * pageSize + index),
    },
    {
      key: "approvalDate",
      header: "거래일자",
      width: "150",
      align: "center" as const,
      render: (row: UnregisteredPayment) => formatDateTime(row.approvalDate),
    },
    {
      key: "paymentStatus",
      header: "결제",
      width: "80",
      align: "center" as const,
      render: (row: UnregisteredPayment) => renderPaymentStatus(row.paymentStatus),
    },
    {
      key: "terminalCode",
      header: "터미널",
      width: "120",
      align: "center" as const,
      render: (row: UnregisteredPayment) => row.terminalCode || "-",
    },
    {
      key: "approvalNumber",
      header: "승인번호",
      width: "100",
      align: "center" as const,
      render: (row: UnregisteredPayment) => row.approvalNumber || "-",
    },
    {
      key: "approvalAmount",
      header: "승인금액",
      width: "100",
      align: "right" as const,
      render: (row: UnregisteredPayment) => row.approvalAmount.toLocaleString(),
    },
    {
      key: "cancelAmount",
      header: "취소금액",
      width: "100",
      align: "right" as const,
      render: (row: UnregisteredPayment) => (
        <span className={row.paymentStatus === "CANCELLED" ? "text-red-600 font-semibold" : ""}>
          {row.cancelAmount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "transactionAmount",
      header: "거래금액",
      width: "100",
      align: "right" as const,
      render: (row: UnregisteredPayment) => row.transactionAmount.toLocaleString(),
    },
    {
      key: "cancelApprovalDate",
      header: "취소일자",
      width: "150",
      align: "center" as const,
      render: (row: UnregisteredPayment) => (
        <span className={row.paymentStatus === "CANCELLED" ? "text-red-600 font-semibold" : ""}>
          {row.cancelApprovalDate ? formatDateTime(row.cancelApprovalDate) : "-"}
        </span>
      ),
    },
    {
      key: "merchantName",
      header: "가맹점명",
      width: "150",
      align: "center" as const,
      render: (row: UnregisteredPayment) => (
        <input
          type="text"
          value={merchantNames[row.id] || ""}
          onChange={(e) => setMerchantNames((prev) => ({ ...prev, [row.id]: e.target.value }))}
          placeholder="단말기미등록"
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded h-7 text-left"
        />
      ),
    },
    {
      key: "merchantCode",
      header: "가맹점코드",
      width: "120",
      align: "center" as const,
      render: (row: UnregisteredPayment) => (
        <input
          type="text"
          value={merchantCodes[row.id] || ""}
          onChange={(e) => setMerchantCodes((prev) => ({ ...prev, [row.id]: e.target.value }))}
          placeholder="-"
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded h-7 text-center"
        />
      ),
    },
    {
      key: "register",
      header: "코드입력",
      width: "80",
      align: "center" as const,
      render: (row: UnregisteredPayment) => (
        <Button
          onClick={() => handleCodeInput(row.id)}
          className="h-7 px-3 text-xs bg-gray-600 hover:bg-gray-700 text-white"
        >
          코드입력
        </Button>
      ),
    },
    {
      key: "merchantSearch",
      header: "수정하기",
      width: "80",
      align: "center" as const,
      render: (row: UnregisteredPayment) => (
        <Button
          onClick={() => handleUpdateMerchant(row.id)}
          className="h-7 px-3 text-xs bg-gray-600 hover:bg-gray-700 text-white"
        >
          수정하기
        </Button>
      ),
    },
  ]

  // ===========================
  // 렌더링
  // ===========================
  return (
    <div className="space-y-4">
      {/* 메뉴 Path */}
      <div className="text-xl text-gray-600">
        <span>결제 관리</span>
        <span className="mx-2">{">"}</span>
        <span className="font-semibold text-gray-800">단말기미등록 결제내역 처리</span>
      </div>

      {/* 검색 영역 */}
      <div className="bg-white border border-gray-300 w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {/* 1행 헤더 */}
            <tr className="bg-[#5F7C94] text-white text-sm font-medium">
              <th className="border-r border-white px-3 py-2.5 min-w-[360px]">
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
              <th className="border-r border-white px-3 py-2.5 min-w-[120px]">검색</th>
              <th className="border-r border-white px-3 py-2.5 min-w-[200px]">가맹점명</th>
              <th className="border-r border-white px-3 py-2.5 min-w-[150px]">가맹점코드</th>
              <th className="px-3 py-2.5 min-w-[150px]">가맹점코드 검색</th>
            </tr>
          </thead>
          <tbody>
            {/* 2행 입력 필드 */}
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
                <div className="flex items-center justify-center gap-2">
                  <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-7 text-xs">
                    검색
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="px-4 h-7 text-xs border-gray-400">
                    초기화
                  </Button>
                </div>
              </td>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <input
                  type="text"
                  value={selectedMerchantName}
                  readOnly
                  placeholder="[가맹점코드검색] 버튼을 클릭하세요"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-gray-50 h-7 text-left"
                />
              </td>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <input
                  type="text"
                  value={selectedMerchantCode}
                  readOnly
                  placeholder="가맹점코드"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-gray-50 h-7 text-left"
                />
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-center">
                  <Button
                    onClick={() => setMerchantSearchModalOpen(true)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 h-7 text-xs"
                  >
                    가맹점코드검색
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 데이터 건수 및 페이지 크기 */}
      <DataCountPageSize
        totalElements={totalElements}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setCurrentPage(0)
        }}
      />

      {/* 데이터 테이블 */}
      <DataTable columns={columns} data={payments} emptyMessage="검색 결과가 없습니다." />

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

      {/* 가맹점 코드 검색 모달 */}
      <MerchantCodeSearchModal
        open={merchantSearchModalOpen}
        onClose={() => setMerchantSearchModalOpen(false)}
        onSelect={(merchant) => {
          setSelectedMerchantCode(merchant.merchantCode)
          setSelectedMerchantName(merchant.merchantName)
          setMerchantSearchModalOpen(false)
        }}
      />
    </div>
  )
}
