"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { useAppContext } from "@/contexts/app-context"
import { tokenManager } from "@/lib/api"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, setUser, user, isInitialized } = useAppContext()
  const [isLoading, setIsLoading] = useState(true)

  const onLogin = pathname === "/login"
  const isPopupPage = pathname === "/settlement/hierarchical" ||
                      pathname === "/settlement/hierarchical/detail" ||
                      pathname === "/payment/receipt"

  // 간단한 퍼블릭 경로 화이트리스트 (필요시 확장)
  const isPublic = useMemo(() => onLogin || pathname?.startsWith("/api"), [onLogin, pathname])

  // 페이지 로드 시 인증 확인 (Context 초기화 대기)
  useEffect(() => {
    if (!isInitialized) return // Context가 localStorage를 로드할 때까지 대기

    const initAuth = async () => {
      const token = tokenManager.get()

      // 토큰은 있는데 사용자 정보가 없으면 토큰 제거
      if (token && !user) {
        tokenManager.remove()
        if (!isPublic) {
          router.replace("/login")
        }
      } else if (!token && user) {
        // 사용자 정보는 있는데 토큰이 없으면 사용자 정보 제거
        setUser(null)
        if (!isPublic) {
          router.replace("/login")
        }
      }

      setIsLoading(false)
    }

    initAuth()
  }, [isInitialized, user, isPublic, router, setUser])

  useEffect(() => {
    if (!isLoading && !isPublic && !isAuthenticated && !tokenManager.get()) {
      router.replace("/login")
    }
  }, [isAuthenticated, isPublic, router, isLoading])

  if (onLogin) {
    return <main className="min-h-screen p-6">{children}</main>
  }

  // 팝업 페이지는 헤더/사이드바 없이 표시
  if (isPopupPage) {
    return <main className="min-h-screen">{children}</main>
  }

  // 초기 인증 로딩 중
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-[240px] p-2 sm:p-4 bg-[#f5f5f5] min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-4.75rem)] overflow-x-auto">{children}</main>
      </div>
    </div>
  )
}
