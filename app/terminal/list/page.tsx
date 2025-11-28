"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common/data-table"
import { Pagination } from "@/components/common/pagination"
import { LoadingModal } from "@/components/common/loading-modal"
import { DataCountPageSize } from "@/components/common/data-count-page-size"
import { terminalsApi } from "@/lib/api"
import { getCenterId } from "@/lib/utils/auth"
import { useAppContext } from "@/contexts/app-context"
import { getDateRange, type DateTabType } from "@/lib/utils/dateUtils"
import { BusinessTypeHelper, ContractStatusHelper, SettlementCycleHelper } from "@/lib/enums"

export default function TerminalListPage() {
  const router = useRouter()
  const { user } = useAppContext()

  // 필수 상태
  const [terminals, setTerminals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)  // 0-based
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(15)

  // 검색 조건 상태
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [contractStatus, setContractStatus] = useState<"모두" | "APPLIED" | "CONTRACTED" | "TERMINATED">("모두")
  const [searchCondition, setSearchCondition] = useState<"terminalCode" | "pgCode" | "companyName" | "merchantName" | "representativeName" | "managerContact">("terminalCode")
  const [searchKeyword, setSearchKeyword] = useState<string>("")
  const [selectedTab, setSelectedTab] = useState<DateTabType | null>(null)

  // 데이터 로드
  const loadData = async () => {
    setIsLoading(true)
    try {
      const centerId = getCenterId()

      const params: any = {
        centerId: centerId,
        page: currentPage,
        size: pageSize,
      }

      // 검색 조건 추가
      if (startDate) params.registDateFrom = startDate
      if (endDate) params.registDateTo = endDate
      if (contractStatus !== "모두") {
        params.contractStatus = contractStatus
      }
      if (searchKeyword) {
        params[searchCondition] = searchKeyword
      }

      const response = await terminalsApi.findAll(params)

      if (response.data) {
        const data = response.data as any
        setTerminals(data.terminals || [])
        setTotalElements(data.totalElements || 0)
        setTotalPages(data.totalPages || 0)
      }
    } catch (error) {
      console.error("Failed to load terminals:", error)
      alert("단말기 목록을 불러오는데 실패했습니다.")
      setTerminals([])
    } finally {
      setIsLoading(false)
    }
  }

  const centerId = getCenterId()

  // currentPage, pageSize, centerId 변경 시 데이터 로드
  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId, currentPage, pageSize])

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

  const handleExport = () => {
    alert("Excel 다운로드 기능은 준비중입니다.")
  }

  const handleEdit = (row: any) => {
    router.push(`/terminal/edit/${row.id}`)
  }


  const columns = [
    {
      key: "no",
      header: "NO",
      width: "40px",
      align: "center" as const,
      sortable: false,
      render: (_: any, index: number) => totalElements - (currentPage * pageSize + index)
    },
    {
      key: "registrationDate",
      header: "등록일자",
      width: "100px",
      align: "center" as const,
      render: (row: any) => row.registDt?.split('T')[0] || "-"
    },
    {
      key: "terminalCode",
      header: "터미널코드",
      width: "150px",
      align: "center" as const,
      render: (row: any) => row.terminalCode || "-"
    },
    {
      key: "companyNamePath",
      header: "업체",
      width: "220px",
      align: "left" as const,
      render: (row: any) => row.companyNamePath || "-"
    },
    {
      key: "merchantName",
      header: "가맹점명",
      width: "130px",
      align: "center" as const,
      render: (row: any) => row.merchantName || "-"
    },
    {
      key: "representativeName",
      header: "대표자명",
      width: "90px",
      align: "center" as const,
      render: (row: any) => row.representativeName || "-"
    },
    {
      key: "managerContact",
      header: "담당자연락처",
      width: "110px",
      align: "center" as const,
      render: (row: any) => row.managerContact || "-"
    },
    {
      key: "businessType",
      header: "사업자구분",
      width: "80px",
      align: "center" as const,
      render: (row: any) => row.businessType ? BusinessTypeHelper.getLabel(row.businessType) : "-"
    },
    {
      key: "settlementCycle",
      header: "정산주기",
      width: "70px",
      align: "center" as const,
      render: (row: any) => row.settlementCycle ? SettlementCycleHelper.getLabel(row.settlementCycle) : "-"
    },
    {
      key: "contractStatus",
      header: "계약상태",
      width: "80px",
      align: "center" as const,
      render: (row: any) => row.contractStatus ? ContractStatusHelper.getLabel(row.contractStatus) : "-"
    },
    // 본사만 수정하기 컬럼 표시
    ...(user?.level === 0 ? [{
      key: "edit",
      header: "수정하기",
      width: "75px",
      align: "center" as const,
      render: (row: any) => (
        <button
          onClick={() => handleEdit(row)}
          className="text-blue-600 hover:underline text-xs"
        >
          수정하기
        </button>
      )
    }] : []),
  ]

  return (
    <div className="space-y-4">
      {/* 메뉴 Path */}
      <div className="text-xl text-gray-600">
        <span>단말기</span>
        <span className="mx-2">{'>'}</span>
        <span className="font-semibold text-gray-800">단말기 목록 조회</span>
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
              <th className="border-r border-white px-3 py-2.5 min-w-[215px]">계약상태</th>
              <th className="border-r border-white px-3 py-2.5 min-w-[420px]">검색조건</th>
              <th className="border-r border-white px-3 py-2.5 min-w-[200px]">검색어</th>
              <th className="px-3 py-2.5 min-w-[165px]">검색</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">등록일자</span>
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
                    { label: "신청", value: "APPLIED" },
                    { label: "정상", value: "ACTIVE" },
                    { label: "해지", value: "TERMINATED" }
                  ].map((status) => (
                    <label key={status.value} className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                      <input
                        type="radio"
                        name="contractStatus"
                        checked={contractStatus === status.value}
                        onChange={() => setContractStatus(status.value as any)}
                        className="w-3.5 h-3.5"
                      />
                      <span className="text-gray-700">{status.label}</span>
                    </label>
                  ))}
                </div>
              </td>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-3 flex-wrap">
                  {[
                    { label: "터미널코드", value: "terminalCode" },
                    { label: "업체명", value: "companyName" },
                    { label: "가맹점명", value: "merchantName" },
                    { label: "대표자명", value: "representativeName" },
                    { label: "담당자연락처", value: "managerContact" }
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
                      setContractStatus("모두")
                      setSearchCondition("terminalCode")
                      setSearchKeyword("")
                      setSelectedTab(null)
                      setCurrentPage(0)
                      loadData()
                    }}
                    className="px-4 h-7 text-xs border-gray-400"
                  >
                    목록
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

        <DataTable
          columns={columns}
          data={terminals}
          emptyMessage="검색 결과가 없습니다."
        />
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
