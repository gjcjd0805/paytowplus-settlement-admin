import { useState, useCallback } from 'react'
import { getDateRange, type DateTabType } from '@/lib/utils/dateUtils'

interface SearchStateConfig<T extends string> {
  /** 초기 검색 조건 */
  initialSearchCondition: T
  /** 초기 페이지 크기 */
  initialPageSize?: number
  /** 초기 날짜를 당월로 설정할지 여부 */
  initializeWithCurrentMonth?: boolean
}

interface SearchState<T extends string> {
  startDate: string
  endDate: string
  selectedTab: DateTabType | null
  searchCondition: T
  searchKeyword: string
  currentPage: number
  pageSize: number
}

interface UseSearchStateReturn<T extends string> {
  /** 검색 상태 */
  state: SearchState<T>
  /** 시작 날짜 변경 */
  setStartDate: (date: string) => void
  /** 종료 날짜 변경 */
  setEndDate: (date: string) => void
  /** 날짜 탭 클릭 핸들러 */
  handleDateTabClick: (tab: DateTabType) => void
  /** 검색 조건 변경 */
  setSearchCondition: (condition: T) => void
  /** 검색어 변경 */
  setSearchKeyword: (keyword: string) => void
  /** 현재 페이지 변경 */
  setCurrentPage: (page: number) => void
  /** 페이지 크기 변경 */
  setPageSize: (size: number) => void
  /** 검색 실행 (페이지를 0으로 리셋) */
  handleSearch: () => void
  /** 검색 조건 초기화 */
  handleReset: () => void
  /** 전체 상태 초기화 */
  resetAll: () => void
}

/**
 * 목록 페이지의 검색 조건 상태를 관리하는 커스텀 훅
 *
 * @example
 * ```tsx
 * type SearchConditionType = 'name' | 'loginId' | 'companyName'
 *
 * const {
 *   state,
 *   setStartDate,
 *   setEndDate,
 *   handleDateTabClick,
 *   setSearchCondition,
 *   setSearchKeyword,
 *   setCurrentPage,
 *   setPageSize,
 *   handleSearch,
 *   handleReset,
 * } = useSearchState<SearchConditionType>({
 *   initialSearchCondition: 'name',
 *   initialPageSize: 15,
 *   initializeWithCurrentMonth: true,
 * })
 * ```
 */
export function useSearchState<T extends string>(
  config: SearchStateConfig<T>
): UseSearchStateReturn<T> {
  const {
    initialSearchCondition,
    initialPageSize = 15,
    initializeWithCurrentMonth = false,
  } = config

  // 초기 날짜 설정
  const getInitialDates = () => {
    if (initializeWithCurrentMonth) {
      const { start, end } = getDateRange('당월')
      return { startDate: start, endDate: end, selectedTab: '당월' as DateTabType }
    }
    return { startDate: '', endDate: '', selectedTab: null }
  }

  const initialDates = getInitialDates()

  const [startDate, setStartDate] = useState(initialDates.startDate)
  const [endDate, setEndDate] = useState(initialDates.endDate)
  const [selectedTab, setSelectedTab] = useState<DateTabType | null>(initialDates.selectedTab)
  const [searchCondition, setSearchCondition] = useState<T>(initialSearchCondition)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // 날짜 탭 클릭 핸들러
  const handleDateTabClick = useCallback((tab: DateTabType) => {
    setSelectedTab(tab)
    const { start, end } = getDateRange(tab)
    setStartDate(start)
    setEndDate(end)
  }, [])

  // 검색 실행
  const handleSearch = useCallback(() => {
    setCurrentPage(0)
  }, [])

  // 검색 조건 초기화
  const handleReset = useCallback(() => {
    if (initializeWithCurrentMonth) {
      const { start, end } = getDateRange('당월')
      setStartDate(start)
      setEndDate(end)
      setSelectedTab('당월')
    } else {
      setStartDate('')
      setEndDate('')
      setSelectedTab(null)
    }
    setSearchKeyword('')
    setCurrentPage(0)
  }, [initializeWithCurrentMonth])

  // 전체 상태 초기화
  const resetAll = useCallback(() => {
    handleReset()
    setSearchCondition(initialSearchCondition)
    setPageSize(initialPageSize)
  }, [handleReset, initialSearchCondition, initialPageSize])

  // 페이지 크기 변경 시 페이지를 0으로 리셋
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(0)
  }, [])

  return {
    state: {
      startDate,
      endDate,
      selectedTab,
      searchCondition,
      searchKeyword,
      currentPage,
      pageSize,
    },
    setStartDate,
    setEndDate,
    handleDateTabClick,
    setSearchCondition,
    setSearchKeyword,
    setCurrentPage,
    setPageSize: handlePageSizeChange,
    handleSearch,
    handleReset,
    resetAll,
  }
}

export type { SearchStateConfig, SearchState, UseSearchStateReturn }
