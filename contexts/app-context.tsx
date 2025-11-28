"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { PaymentPurposeType } from "@/lib/enums"
import { PaymentPurpose } from "@/lib/enums"
import type { IUser } from "@/types"
import { tokenManager } from "@/lib/api"
import { decodeJwtPayload, isTokenExpired } from "@/lib/utils/jwt"

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
  logout: () => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleTheme: () => void
  setTheme: (theme: "light" | "dark") => void
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

  // localStorage에서 초기값 로드 (클라이언트에서만)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const token = tokenManager.get()
    const savedPurpose = localStorage.getItem('paymentPurpose')
    const savedUser = localStorage.getItem('user')
    const savedSidebar = localStorage.getItem('sidebar-storage')
    const savedTheme = localStorage.getItem('theme-storage')

    // 토큰이 있고 만료되지 않은 경우
    if (token && !isTokenExpired(token)) {
      // JWT payload에서 보안이 필요한 정보 추출
      const payload = decodeJwtPayload(token)

      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)

          // level, companyId, centerId는 JWT에서 추출하여 덮어씀 (보안)
          const secureUserData: IUser = {
            ...userData,
            level: payload?.level ?? userData.level,
            companyId: payload?.companyId ?? userData.companyId,
            centerId: payload?.centerId ?? userData.centerId,
          }

          setUserState(secureUserData)
          setIsAuthenticated(true)

          // centerId는 JWT에서 추출한 값 사용
          if (payload?.centerId) {
            setCenterIdState(payload.centerId)
          }
        } catch (error) {
          console.error('사용자 정보 파싱 실패:', error)
          localStorage.removeItem('user')
        }
      }
    } else if (token) {
      // 토큰이 만료된 경우 정리
      tokenManager.remove()
      localStorage.removeItem('user')
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
      // JWT에서 보안이 필요한 정보 추출
      const token = tokenManager.get()
      let secureUser = user

      if (token && !isTokenExpired(token)) {
        const payload = decodeJwtPayload(token)
        if (payload) {
          // level, companyId, centerId는 JWT에서 추출하여 덮어씀 (보안)
          secureUser = {
            ...user,
            level: payload.level ?? user.level,
            companyId: payload.companyId ?? user.companyId,
            centerId: payload.centerId ?? user.centerId,
          }

          // centerId도 함께 설정
          if (payload.centerId) {
            setCenterIdState(payload.centerId)
          }
        }
      }

      localStorage.setItem('user', JSON.stringify(secureUser))
      setUserState(secureUser)
      setIsAuthenticated(true)
    } else {
      localStorage.removeItem('user')
      setUserState(null)
      setIsAuthenticated(false)
    }
  }

  const logout = () => {
    // tokenManager를 사용하여 토큰 제거 (쿠키도 함께 제거됨)
    tokenManager.remove()

    // 나머지 localStorage 데이터 제거
    localStorage.removeItem('user')
    localStorage.removeItem('centerId')
    localStorage.removeItem('paymentPurpose')

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
      setTheme
    }}>
      {children}
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
