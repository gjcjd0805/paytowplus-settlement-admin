"use client"

import { useEffect, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common/data-table"
import { Pagination } from "@/components/common/pagination"
import { LoadingModal } from "@/components/common/loading-modal"
import { DataCountPageSize } from "@/components/common/data-count-page-size"
import { merchantsApi } from "@/lib/api"
import { getCenterId } from "@/lib/utils/auth"
import { useAppContext } from "@/contexts/app-context"
import { useSearchState, useApiError, useListData } from "@/hooks"
import { BusinessTypeHelper, ContractStatusHelper, SettlementCycleHelper } from "@/lib/enums"
import {
  DATE_TABS,
  MERCHANT_SEARCH_CONDITIONS,
  CONTRACT_STATUS_OPTIONS,
  type MerchantSearchConditionValue,
} from "@/lib/constants"
import type { MerchantListItem, MerchantListParams, ContractStatus } from "@/lib/api/types"

export default function MerchantListPage() {
  const router = useRouter()
  const { user } = useAppContext()

  // 커스텀 훅 사용
  const { handleError } = useApiError()
  const {
    state: searchState,
    setStartDate,
    setEndDate,
    handleDateTabClick,
    setSearchCondition,
    setSearchKeyword,
    setCurrentPage,
    setPageSize,
    handleSearch: triggerSearch,
    handleReset: resetSearch,
  } = useSearchState<MerchantSearchConditionValue>({
    initialSearchCondition: 'name',
    initialPageSize: 15,
  })

  const {
    data: merchants,
    isLoading,
    totalPages,
    totalElements,
    loadData,
  } = useListData<MerchantListItem, MerchantListParams>({
    fetchFn: merchantsApi.findAll,
    dataKey: 'merchants',
    onError: handleError,
    defaultErrorMessage: '가맹점 목록을 불러오는데 실패했습니다.',
  })

  // 가맹점 전용: 계약 상태 필터
  const [contractStatus, setContractStatus] = useState<"all" | ContractStatus>("all")

  // 정렬 상태
  const [sortKey, setSortKey] = useState<string>("registrationDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const centerId = getCenterId()

  const loadMerchants = useCallback(async () => {
    if (!centerId) return

    const params: MerchantListParams = {
      centerId,
      page: searchState.currentPage,
      size: searchState.pageSize,
    }

    if (searchState.startDate) params.registDateFrom = searchState.startDate
    if (searchState.endDate) params.registDateTo = searchState.endDate
    if (contractStatus !== "all") params.contractStatus = contractStatus
    if (searchState.searchKeyword) {
      if (searchState.searchCondition === 'merchantId') {
        const merchantIdNum = Number(searchState.searchKeyword)
        if (!isNaN(merchantIdNum)) params.merchantId = merchantIdNum
      } else {
        params[searchState.searchCondition] = searchState.searchKeyword
      }
    }

    await loadData(params)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId, contractStatus, searchState.currentPage, searchState.pageSize])

  useEffect(() => {
    loadMerchants()
  }, [loadMerchants])

  const handleSearch = () => {
    triggerSearch()
    loadMerchants()
  }

  const handleReset = () => {
    resetSearch()
    setContractStatus("all")
    loadMerchants()
  }

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const columns = [
    {
      key: "no",
      header: "NO",
      width: "40px",
      align: "center" as const,
      sortable: false,
      render: (_: MerchantListItem, index: number) => totalElements - (searchState.currentPage * searchState.pageSize + index)
    },
    {
      key: "registrationDate",
      header: "등록일자",
      width: "95px",
      align: "center" as const,
      sortable: true,
      render: (row: MerchantListItem) => row.registDt?.split('T')[0] || ""
    },
    {
      key: "code",
      header: "가맹점코드",
      width: "75px",
      align: "center" as const,
      render: (row: MerchantListItem) => row.id || ""
    },
    {
      key: "hierarchy",
      header: "업체경로",
      width: "225px",
      align: "left" as const,
      sortable: true,
      render: (row: MerchantListItem) => row.companyNamePath || ""
    },
    {
      key: "merchantName",
      header: "가맹점명",
      width: "133px",
      align: "left" as const,
      sortable: true,
      render: (row: MerchantListItem) => row.name || ""
    },
    {
      key: "representative",
      header: "대표자명",
      width: "76px",
      align: "center" as const,
      render: (row: MerchantListItem) => row.representativeName || ""
    },
    {
      key: "phone",
      header: "담당자연락처",
      width: "104px",
      align: "center" as const,
      render: (row: MerchantListItem) => row.managerContact || ""
    },
    {
      key: "type",
      header: "사업자구분",
      width: "28px",
      align: "center" as const,
      render: (row: MerchantListItem) => row.businessType ? BusinessTypeHelper.getLabel(row.businessType) : "기"
    },
    {
      key: "transactionLimit",
      header: "건별결제한도",
      width: "89px",
      align: "center" as const,
      render: (row: MerchantListItem) => Number(row.paymentLimitPerTransaction || 0).toLocaleString()
    },
    {
      key: "monthlyLimit",
      header: "월별결제한도",
      width: "89px",
      align: "center" as const,
      render: (row: MerchantListItem) => Number(row.paymentLimitPerMonth || 0).toLocaleString()
    },
    {
      key: "deliveryFeeCommissionRate",
      header: "배달비수수료",
      width: "75px",
      align: "center" as const,
      render: (row: MerchantListItem) => (row.deliveryFeeCommissionRate || "0") + "%"
    },
    {
      key: "monthlyRentCommissionRate",
      header: "월세수수료",
      width: "70px",
      align: "center" as const,
      render: (row: MerchantListItem) => (row.monthlyRentCommissionRate || "0") + "%"
    },
    {
      key: "settlement",
      header: "정산",
      width: "44px",
      align: "center" as const,
      render: (row: MerchantListItem) => row.settlementCycle ? SettlementCycleHelper.getLabel(row.settlementCycle) : ""
    },
    {
      key: "login",
      header: "상태",
      width: "44px",
      align: "center" as const,
      render: (row: MerchantListItem) => row.contractStatus ? ContractStatusHelper.getLabel(row.contractStatus) : ""
    },
    {
      key: "accountId",
      header: "아이디",
      width: "79px",
      align: "center" as const,
      render: (row: MerchantListItem) => row.loginId || ""
    },
    ...(user?.level === 0 ? [{
      key: "password",
      header: "비밀번호",
      width: "69px",
      align: "center" as const,
      render: (row: MerchantListItem) => row.password
    }] : []),
    ...(user?.level === 0 ? [{
      key: "edit",
      header: "수정하기",
      width: "69px",
      align: "center" as const,
      render: (row: MerchantListItem) => (
        <button
          className="text-blue-600 hover:underline text-xs"
          onClick={() => router.push(`/merchant/edit/${row.id}`)}
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
        <span>가맹점</span>
        <span className="mx-2">{'>'}</span>
        <span className="font-semibold text-gray-800">가맹점 목록 조회</span>
      </div>

      {/* 검색 영역 */}
      <div className="bg-white border border-gray-300 w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#5F7C94] text-white text-sm font-medium">
              <th className="border-r border-white px-3 py-2.5 min-w-[370px]">
                <div className="flex items-center justify-center gap-1">
                  {DATE_TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleDateTabClick(tab)}
                      className={`px-3 py-1.5 text-xs font-medium border border-gray-300 rounded ${
                        searchState.selectedTab === tab
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </th>
              <th className="border-r border-white px-3 py-2.5 min-w-[250px]">계약상태</th>
              <th className="border-r border-white px-3 py-2.5 min-w-[520px]">검색조건</th>
              <th className="border-r border-white px-3 py-2.5 min-w-[205px]">검색어</th>
              <th className="px-3 py-2.5 min-w-[240px]">검색</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">등록일자</span>
                  <input
                    type="date"
                    value={searchState.startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-32 px-2 py-1 text-xs border border-gray-300 rounded bg-white h-6"
                  />
                  <span className="text-xs text-gray-600">~</span>
                  <input
                    type="date"
                    value={searchState.endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-32 px-2 py-1 text-xs border border-gray-300 rounded bg-white h-6"
                  />
                </div>
              </td>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-3 flex-wrap">
                  {CONTRACT_STATUS_OPTIONS.map((status) => (
                    <label key={status.value} className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                      <input
                        type="radio"
                        name="contractStatus"
                        checked={contractStatus === status.value}
                        onChange={() => setContractStatus(status.value)}
                        className="w-3.5 h-3.5"
                      />
                      <span className="text-gray-700">{status.label}</span>
                    </label>
                  ))}
                </div>
              </td>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-3 flex-wrap">
                  {MERCHANT_SEARCH_CONDITIONS.map((condition) => (
                    <label key={condition.value} className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                      <input
                        type="radio"
                        name="searchCondition"
                        checked={searchState.searchCondition === condition.value}
                        onChange={() => setSearchCondition(condition.value)}
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
                  placeholder=""
                  value={searchState.searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded h-6"
                />
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-center gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-7 text-xs" onClick={handleSearch}>
                    검색
                  </Button>
                  <Button size="sm" variant="outline" className="px-4 h-7 text-xs border-gray-400" onClick={handleReset}>
                    목록
                  </Button>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white px-3 h-7 text-xs border-0">
                    Excel
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 테이블 */}
      <div>
        <DataCountPageSize
          totalElements={totalElements}
          pageSize={searchState.pageSize}
          onPageSizeChange={setPageSize}
        />

        <DataTable
          columns={columns}
          data={merchants}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          emptyMessage="검색 결과가 없습니다."
        />
      </div>

      {/* 페이징 */}
      {totalPages > 0 && (
        <Pagination
          currentPage={searchState.currentPage + 1}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page - 1)}
        />
      )}

      {/* 로딩 모달 */}
      <LoadingModal isOpen={isLoading} />
    </div>
  )
}
