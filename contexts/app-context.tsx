"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import type { PaymentPurposeType } from "@/lib/enums"
import { PaymentPurpose } from "@/lib/enums"
import type { IUser } from "@/types"
import { authApi, tokenManager } from "@/lib/api"
import { clearAuth } from "@/lib/utils/auth"
import { FullScreenLoading } from "@/components/common/full-screen-loading"

interface GlobalLoadingState {
  isLoading: boolean
  message?: string
  subMessage?: string
}

interface AppContextType {
  centerId: number | null
  paymentPurpose: PaymentPurposeType
  user: IUser | null
  isAuthenticated: boolean
  sidebarOpen: boolean
  theme: "light" | "dark"
  isInitialized: boolean
  setCenterId: (id: number) => void
  setPaymentPurpose: (purpose: PaymentPurposeType) => void
  setUser: (user: IUser | null) => void
  logout: () => Promise<void>
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleTheme: () => void
  setTheme: (theme: "light" | "dark") => void
  showLoading: (message?: string, subMessage?: string) => void
  hideLoading: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [centerId, setCenterIdState] = useState<number | null>(null)
  const [paymentPurpose, setPaymentPurposeState] = useState<PaymentPurposeType>(PaymentPurpose.DELIVERY_CHARGE)
  const [user, setUserState] = useState<IUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sidebarOpen, setSidebarOpenState] = useState(true)
  const [theme, setThemeState] = useState<"light" | "dark">("light")
  const [isInitialized, setIsInitialized] = useState(false)
  const [globalLoading, setGlobalLoading] = useState<GlobalLoadingState>({
    isLoading: false
  })

  // localStorage에서 초기값 로드 및 토큰 유효성 확인
  // 토큰은 httpOnly 쿠키에 저장되어 있으므로 서버 API로 유효성 확인
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initializeAuth = async () => {
      const savedPurpose = localStorage.getItem('paymentPurpose')
      const savedUser = localStorage.getItem('user')
      const savedSidebar = localStorage.getItem('sidebar-storage')
      const savedTheme = localStorage.getItem('theme-storage')

      // 저장된 사용자 정보가 있으면 토큰 유효성 확인
      if (savedUser) {
        try {
          // 서버에서 토큰 유효성 확인
          const isValid = await tokenManager.verify()

          if (isValid) {
            const userData = JSON.parse(savedUser) as IUser
            setUserState(userData)
            setIsAuthenticated(true)

            // centerId 설정
            if (userData.centerId) {
              setCenterIdState(userData.centerId)
            }
          } else {
            // 토큰이 유효하지 않으면 사용자 정보 제거
            localStorage.removeItem('user')
            setUserState(null)
            setIsAuthenticated(false)
          }
        } catch (error) {
          console.error('인증 초기화 실패:', error)
          localStorage.removeItem('user')
        }
      }

      if (savedPurpose) {
        setPaymentPurposeState(savedPurpose as PaymentPurposeType)
      }
      if (savedSidebar) {
        try {
          const sidebarData = JSON.parse(savedSidebar)
          setSidebarOpenState(sidebarData.state?.isOpen ?? true)
        } catch (error) {
          console.error('사이드바 정보 파싱 실패:', error)
        }
      }
      if (savedTheme) {
        try {
          const themeData = JSON.parse(savedTheme)
          setThemeState(themeData.state?.theme ?? "light")
        } catch (error) {
          console.error('테마 정보 파싱 실패:', error)
        }
      }

      // 초기화 완료
      setIsInitialized(true)
    }

    initializeAuth()
  }, [])

  const setCenterId = (id: number) => {
    localStorage.setItem('centerId', String(id))
    setCenterIdState(id)
  }

  const setPaymentPurpose = (purpose: PaymentPurposeType) => {
    localStorage.setItem('paymentPurpose', purpose)
    setPaymentPurposeState(purpose)
  }

  const setUser = (user: IUser | null) => {
    if (user) {
      // 사용자 정보 저장
      localStorage.setItem('user', JSON.stringify(user))
      setUserState(user)
      setIsAuthenticated(true)

      // centerId 설정
      if (user.centerId) {
        setCenterIdState(user.centerId)
      }
    } else {
      localStorage.removeItem('user')
      setUserState(null)
      setIsAuthenticated(false)
    }
  }

  const logout = async () => {
    try {
      // 서버 로그아웃 API 호출하여 httpOnly 쿠키 제거
      await authApi.logout()
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error)
    }

    // localStorage 데이터 및 상태 정리
    clearAuth()

    // 상태 초기화
    setUserState(null)
    setIsAuthenticated(false)
    setCenterIdState(null)
    setPaymentPurposeState(PaymentPurpose.DELIVERY_CHARGE)
  }

  const toggleSidebar = () => {
    const newValue = !sidebarOpen
    setSidebarOpenState(newValue)
    localStorage.setItem('sidebar-storage', JSON.stringify({ state: { isOpen: newValue } }))
  }

  const setSidebarOpen = (open: boolean) => {
    setSidebarOpenState(open)
    localStorage.setItem('sidebar-storage', JSON.stringify({ state: { isOpen: open } }))
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setThemeState(newTheme)
    localStorage.setItem('theme-storage', JSON.stringify({ state: { theme: newTheme } }))
  }

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme)
    localStorage.setItem('theme-storage', JSON.stringify({ state: { theme: newTheme } }))
  }

  const showLoading = useCallback((message?: string, subMessage?: string) => {
    setGlobalLoading({ isLoading: true, message, subMessage })
  }, [])

  const hideLoading = useCallback(() => {
    setGlobalLoading({ isLoading: false })
  }, [])

  return (
    <AppContext.Provider value={{
      centerId,
      paymentPurpose,
      user,
      isAuthenticated,
      sidebarOpen,
      theme,
      isInitialized,
      setCenterId,
      setPaymentPurpose,
      setUser,
      logout,
      toggleSidebar,
      setSidebarOpen,
      toggleTheme,
      setTheme,
      showLoading,
      hideLoading
    }}>
      {children}
      {globalLoading.isLoading && (
        <FullScreenLoading
          message={globalLoading.message}
          subMessage={globalLoading.subMessage}
        />
      )}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
