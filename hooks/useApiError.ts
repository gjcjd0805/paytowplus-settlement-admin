import { useState, useCallback } from 'react'

interface ApiErrorState {
  message: string | null
  code?: string
  details?: Record<string, string>
}

interface UseApiErrorReturn {
  error: ApiErrorState | null
  setError: (error: ApiErrorState | null) => void
  clearError: () => void
  handleError: (err: unknown, defaultMessage?: string) => void
  showAlert: (message: string) => void
}

/**
 * API 에러 처리를 위한 커스텀 훅
 *
 * @example
 * ```tsx
 * const { error, handleError, clearError } = useApiError()
 *
 * const loadData = async () => {
 *   try {
 *     clearError()
 *     const response = await api.getData()
 *     // ...
 *   } catch (err) {
 *     handleError(err, '데이터를 불러오는데 실패했습니다.')
 *   }
 * }
 *
 * return (
 *   <>
 *     {error && <ErrorMessage message={error.message} />}
 *   </>
 * )
 * ```
 */
export function useApiError(): UseApiErrorReturn {
  const [error, setError] = useState<ApiErrorState | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((err: unknown, defaultMessage = '오류가 발생했습니다.') => {
    console.error('API Error:', err)

    if (err instanceof Error) {
      // Axios 에러 처리
      const axiosError = err as { response?: { data?: { message?: string; code?: string } } }
      if (axiosError.response?.data) {
        setError({
          message: axiosError.response.data.message || defaultMessage,
          code: axiosError.response.data.code,
        })
        return
      }

      // 일반 Error 객체
      setError({
        message: err.message || defaultMessage,
      })
      return
    }

    // 기타 에러
    setError({
      message: defaultMessage,
    })
  }, [])

  const showAlert = useCallback((message: string) => {
    alert(message)
  }, [])

  return {
    error,
    setError,
    clearError,
    handleError,
    showAlert,
  }
}

export type { ApiErrorState, UseApiErrorReturn }
