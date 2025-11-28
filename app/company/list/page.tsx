"use client"

import { useEffect, useCallback, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common/data-table"
import { Pagination } from "@/components/common/pagination"
import { LoadingModal } from "@/components/common/loading-modal"
import { DataCountPageSize } from "@/components/common/data-count-page-size"
import { companiesApi } from "@/lib/api"
import { getCenterId } from "@/lib/utils/auth"
import { useAppContext } from "@/contexts/app-context"
import { useSearchState, useApiError, useListData } from "@/hooks"
import { CompanyLevelHelper, BusinessTypeHelper, ContractStatusHelper } from "@/lib/enums"
import {
  DATE_TABS,
  COMPANY_SEARCH_CONDITIONS,
  COMPANY_LEVEL_MAP,
  COMPANY_LEVEL_LABELS,
  type CompanySearchConditionValue,
} from "@/lib/constants"
import type { CompanyLevel, CompanyListItem, CompanyListParams } from "@/lib/api/types"

export default function CompanyListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAppContext()

  // URL 파라미터에서 level 가져오기
  const level = searchParams.get('level')
  const levelCode: CompanyLevel | undefined = level ? COMPANY_LEVEL_MAP[level] : undefined

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
  } = useSearchState<CompanySearchConditionValue>({
    initialSearchCondition: 'name',
    initialPageSize: 15,
  })

  const {
    data: companies,
    isLoading,
    totalPages,
    totalElements,
    loadData,
  } = useListData<CompanyListItem, CompanyListParams>({
    fetchFn: companiesApi.findAll,
    dataKey: 'companies',
    onError: handleError,
    defaultErrorMessage: '업체 목록을 불러오는데 실패했습니다.',
  })

  // 정렬 상태
  const [sortKey, setSortKey] = useState<string>("registrationDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const centerId = getCenterId()

  const loadCompanies = useCallback(async () => {
    if (!centerId) return

    const params: CompanyListParams = {
      centerId,
      page: searchState.currentPage,
      size: searchState.pageSize,
    }

    if (levelCode) params.levelCode = levelCode
    if (searchState.startDate) params.registDateFrom = searchState.startDate
    if (searchState.endDate) params.registDateTo = searchState.endDate
    if (searchState.searchKeyword) {
      if (searchState.searchCondition === 'companyId') {
        const companyIdNum = Number(searchState.searchKeyword)
        if (!isNaN(companyIdNum)) params.companyId = companyIdNum
      } else {
        params[searchState.searchCondition] = searchState.searchKeyword
      }
    }

    await loadData(params)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId, levelCode, searchState.currentPage, searchState.pageSize])

  useEffect(() => {
    loadCompanies()
  }, [loadCompanies, level])

  const handleSearch = () => {
    triggerSearch()
    loadCompanies()
  }

  const handleReset = () => {
    resetSearch()
    loadCompanies()
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
      render: (_: CompanyListItem, index: number) => totalElements - (searchState.currentPage * searchState.pageSize + index)
    },
    {
      key: "registrationDate",
      header: "등록일자",
      width: "90px",
      align: "center" as const,
      sortable: true,
      render: (row: CompanyListItem) => row.registDt?.split('T')[0] || ""
    },
    {
      key: "code",
      header: "업체코드",
      width: "60px",
      align: "center" as const,
      render: (row: CompanyListItem) => row.id || ""
    },
    {
      key: "hierarchy",
      header: "업체경로",
      width: "250px",
      align: "left" as const,
      sortable: true,
      render: (row: CompanyListItem) => row.companyNamePath || ""
    },
    {
      key: "companyName",
      header: "업체명",
      width: "120px",
      align: "center" as const,
      sortable: true,
      render: (row: CompanyListItem) => row.name || ""
    },
    {
      key: "level",
      header: "레벨",
      width: "60px",
      align: "center" as const,
      render: (row: CompanyListItem) => CompanyLevelHelper.getLabel(row.levelCode) || row.levelCode
    },
    {
      key: "representative",
      header: "대표자명",
      width: "80px",
      align: "center" as const,
      render: (row: CompanyListItem) => row.representativeName || ""
    },
    {
      key: "companyPhone",
      header: "전화번호",
      width: "110px",
      align: "center" as const,
      render: (row: CompanyListItem) => row.companyPhoneNumber || ""
    },
    {
      key: "type",
      header: "사업자구분",
      width: "80px",
      align: "center" as const,
      render: (row: CompanyListItem) => row.businessType ? BusinessTypeHelper.getLabel(row.businessType) : "비"
    },
    {
      key: "manager",
      header: "담당자",
      width: "80px",
      align: "center" as const,
      render: (row: CompanyListItem) => row.managerName || ""
    },
    {
      key: "managerContact",
      header: "담당자연락처",
      width: "110px",
      align: "center" as const,
      render: (row: CompanyListItem) => row.managerContact || ""
    },
    {
      key: "status",
      header: "계약상태",
      width: "70px",
      align: "center" as const,
      render: (row: CompanyListItem) => row.contractStatus ? ContractStatusHelper.getLabel(row.contractStatus) : ""
    },
    {
      key: "accountId",
      header: "아이디",
      width: "90px",
      align: "center" as const,
      render: (row: CompanyListItem) => row.loginId || ""
    },
    ...(user?.level === 0 ? [{
      key: "password",
      header: "비밀번호",
      width: "80px",
      align: "center" as const,
      render: (row: CompanyListItem) => row.password
    }] : []),
    {
      key: "edit",
      header: user?.level === 0 ? "정보수정" : "상세보기",
      width: "80px",
      align: "center" as const,
      render: (row: CompanyListItem) => (
        <button
          className="text-blue-600 hover:underline text-xs"
          onClick={() => {
            if (user?.level === 0) {
              router.push(`/company/edit/${row.id}`)
            } else {
              router.push(`/company/detail/${row.id}`)
            }
          }}
        >
          {user?.level === 0 ? "정보수정" : "상세보기"}
        </button>
      )
    },
  ]

  return (
    <div className="space-y-4">
      {/* 메뉴 Path */}
      <div className="text-sm sm:text-xl text-gray-600">
        <span>업체</span>
        <span className="mx-1 sm:mx-2">{'>'}</span>
        <span className="font-semibold text-gray-800">
          업체 목록 조회 ({COMPANY_LEVEL_LABELS[level || '']})
        </span>
      </div>

      {/* 모바일 검색 영역 */}
      <div className="lg:hidden bg-white border border-gray-300 p-3 space-y-3">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchState.searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSearch}
            >
              검색
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-gray-400"
              onClick={handleReset}
            >
              초기화
            </Button>
          </div>
        </div>
      </div>

      {/* 데스크톱 검색 영역 */}
      <div className="hidden lg:block bg-white border border-gray-300 w-full overflow-x-auto">
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
                  {COMPANY_SEARCH_CONDITIONS.map((condition) => (
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

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="min-w-[800px] sm:min-w-0">
            <DataTable
              columns={columns}
              data={companies}
              onSort={handleSort}
              sortKey={sortKey}
              sortDirection={sortDirection}
              emptyMessage="검색 결과가 없습니다."
            />
          </div>
        </div>
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
