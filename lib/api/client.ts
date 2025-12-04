/**
 * Axios 기반 API 클라이언트
 *
 * - BFF 패턴: Next.js API Route를 통해 백엔드와 통신
 * - JWT 토큰은 httpOnly 쿠키로 관리 (XSS 방지)
 * - 401 에러 시 자동 로그아웃
 * - 응답 데이터 자동 언래핑
 */
import axios from 'axios'

// API Base URL - BFF 패턴: Next.js API Route를 통해 프록시
// 클라이언트 → /api/* → Next.js API Route → 백엔드 서버
const API_BASE_URL = '/api'

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // 쿠키 전송을 위해 필수
  withCredentials: true,
})

/**
 * 토큰 관리자
 * httpOnly 쿠키 기반이므로 클라이언트에서 직접 접근 불가
 * 서버 API를 통해 토큰 유효성 확인 및 쿠키 제거
 */
export const tokenManager = {
  /**
   * 토큰 유효성 확인 (서버 API 호출)
   * httpOnly 쿠키에 저장된 토큰의 유효성을 서버에서 확인
   */
  verify: async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify', {
        credentials: 'include',
      })
      const data = await response.json()
      return data.valid === true
    } catch (error) {
      console.error('Token verify error:', error)
      return false
    }
  },

  /**
   * @deprecated httpOnly 쿠키 사용으로 더 이상 사용하지 않음
   * 레거시 코드 호환성을 위해 유지
   */
  get: () => {
    // deprecated 경고 제거 - 호출되더라도 조용히 처리
    return null
  },

  /**
   * @deprecated httpOnly 쿠키 사용으로 더 이상 사용하지 않음
   * 레거시 코드 호환성을 위해 유지
   */
  set: (_token: string) => {
    // deprecated 경고 제거 - 호출되더라도 조용히 처리
  },

  /**
   * 로그아웃 시 호출
   * 서버 API를 통해 쿠키를 제거해야 함
   */
  remove: async () => {
    try {
      // 서버 로그아웃 API 호출하여 쿠키 제거
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.error('Logout API error:', error)
    }
  },
}

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 토큰은 httpOnly 쿠키로 자동 전송됨
    // Next.js API Route에서 Authorization 헤더로 변환
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    // 백엔드가 직접 데이터를 반환하므로 response.data를 그대로 사용
    return response.data
  },
  (error) => {
    // 에러 처리
    if (error.response) {
      // 서버 응답 에러
      const status = error.response.status
      const data = error.response.data

      console.error('[API Error]', error.config?.url, 'Status:', status, 'Data:', data)

      // 401 Unauthorized - 로그인 페이지로 리다이렉트
      if (status === 401) {
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }

      // 403 Forbidden - 권한 없음
      if (status === 403) {
        console.error('권한이 없습니다.')
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함
      console.error('Network Error:', error.message)
    } else {
      // 요청 설정 중 에러
      console.error('Error:', error.message)
    }

    return Promise.reject(error)
  }
)

export { apiClient }
export default apiClient