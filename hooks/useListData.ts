import { useState, useCallback } from 'react'

/** 페이지네이션 응답의 기본 구조 */
interface PaginatedResponse {
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResponseData = PaginatedResponse & Record<string, any>

interface UseListDataConfig<T, P> {
  /** API 호출 함수 */
  fetchFn: (params: P) => Promise<{ data: ApiResponseData }>
  /** 응답 데이터에서 목록을 추출하는 키 (예: 'companies', 'merchants') */
  dataKey: string
  /** 에러 발생 시 호출되는 함수 */
  onError?: (error: unknown, defaultMessage: string) => void
  /** 기본 에러 메시지 */
  defaultErrorMessage?: string
}

interface UseListDataReturn<T> {
  /** 목록 데이터 */
  data: T[]
  /** 로딩 상태 */
  isLoading: boolean
  /** 전체 페이지 수 */
  totalPages: number
  /** 전체 데이터 수 */
  totalElements: number
  /** 데이터 로드 함수 */
  loadData: <P>(params: P) => Promise<void>
  /** 데이터 초기화 */
  resetData: () => void
}

/**
 * 목록 데이터 페칭을 위한 커스텀 훅
 *
 * @example
 * ```tsx
 * const {
 *   data: companies,
 *   isLoading,
 *   totalPages,
 *   totalElements,
 *   loadData,
 * } = useListData<CompanyListItem, CompanyListParams>({
 *   fetchFn: companiesApi.findAll,
 *   dataKey: 'companies',
 *   onError: handleError,
 *   defaultErrorMessage: '업체 목록을 불러오는데 실패했습니다.',
 * })
 *
 * useEffect(() => {
 *   loadData({ centerId, page: 0, size: 15 })
 * }, [centerId])
 * ```
 */
export function useListData<T, P = Record<string, unknown>>(
  config: UseListDataConfig<T, P>
): UseListDataReturn<T> {
  const {
    fetchFn,
    dataKey,
    onError,
    defaultErrorMessage = '데이터를 불러오는데 실패했습니다.',
  } = config

  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const loadData = useCallback(async <Params>(params: Params) => {
    setIsLoading(true)
    try {
      const response = await fetchFn(params as unknown as P)

      if (response.data) {
        const responseData = response.data
        const items = responseData[dataKey] as T[] | undefined
        setData(items || [])
        setTotalPages(responseData.totalPages || 0)
        setTotalElements(responseData.totalElements || 0)
      }
    } catch (error) {
      if (onError) {
        onError(error, defaultErrorMessage)
      } else {
        console.error('List data fetch error:', error)
        alert(defaultErrorMessage)
      }
      setData([])
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn, dataKey, onError, defaultErrorMessage])

  const resetData = useCallback(() => {
    setData([])
    setTotalPages(0)
    setTotalElements(0)
  }, [])

  return {
    data,
    isLoading,
    totalPages,
    totalElements,
    loadData,
    resetData,
  }
}

export type { UseListDataConfig, UseListDataReturn, PaginatedResponse, ApiResponseData }
