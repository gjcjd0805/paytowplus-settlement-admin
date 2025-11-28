/**
 * Axios 기반 API 클라이언트
 *
 * - 백엔드 서버와 직접 통신
 * - JWT 토큰 자동 관리
 * - 401 에러 시 자동 로그아웃
 * - 응답 데이터 자동 언래핑
 */
import axios from 'axios'

// API Base URL - 환경변수에서 가져오기
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18080/webadmin/api/v1'

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// JWT 토큰 저장소 (localStorage + 쿠키 병행)
const TOKEN_KEY = 'auth_token'

// 쿠키 설정
const setTokenCookie = (token: string) => {
  if (typeof document === 'undefined') return
  const maxAge = 30 * 24 * 60 * 60 // 30일
  document.cookie = `${TOKEN_KEY}=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
}

// 쿠키 제거
const removeTokenCookie = () => {
  if (typeof document === 'undefined') return
  document.cookie = `${TOKEN_KEY}=; Path=/; Max-Age=0`
}

export const tokenManager = {
  get: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  },
  set: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token)
      setTokenCookie(token) // 쿠키에도 저장 (미들웨어용)
    }
  },
  remove: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      removeTokenCookie() // 쿠키도 제거
    }
  },
}

// 요청 인터셉터 - JWT 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // 로그인 API는 토큰 불필요
    const isLoginRequest = config.url?.includes('/auth/login')

    if (!isLoginRequest) {
      const token = tokenManager.get()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
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

      // 401 Unauthorized - 토큰 제거 및 로그인 페이지로 리다이렉트
      if (status === 401) {
        tokenManager.remove()
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