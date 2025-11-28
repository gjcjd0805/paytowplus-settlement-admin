"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authApi, tokenManager } from "@/lib/api"
import { useAppContext } from "@/contexts/app-context"
import { IUser } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setCenterId } = useAppContext()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // 백엔드 로그인 API 호출 (Axios 사용)
      const response = await authApi.login({
        loginId: formData.username,
        password: formData.password
      })

      // API 응답 구조: { data: { token, loginId, centerId, level, levelName } }
      const data = response.data

      if (!data || !data.token) {
        throw new Error("토큰을 받지 못했습니다.")
      }

      // 토큰 저장 (localStorage)
      tokenManager.set(data.token)

      // 사용자 정보 구성 (로그인 응답 사용)
      const user: IUser = {
        companyId: data.companyId ? Number(data.companyId) : undefined,
        loginId: data.loginId,
        level: data.level !== undefined ? Number(data.level) : undefined,
        levelName: data.levelName,
        centerId: data.centerId ? Number(data.centerId) : undefined,
        name: data.name 
      }

      // Context에 사용자 정보 저장 (localStorage 자동 저장됨)
      setUser(user)

      // centerId 별도 저장 (API 호출 시 사용)
      if (user.centerId) {
        setCenterId(user.centerId)
      }

      // 원래 가려던 페이지로 이동 또는 결제내역 페이지로
      const from = searchParams.get('from') || '/payment/list'
      router.replace(from)
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.response?.data?.message || err.message || "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* 왼쪽: 브랜딩 영역 */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#5F7C94] text-white flex-col justify-center px-12">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-4">Pay++</h1>
          <h2 className="text-2xl font-semibold mb-3">정산 관리 시스템</h2>
          <p className="text-base text-gray-200 mb-6">
            간편하고 정확한 정산 관리를 위한 통합 솔루션
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>실시간 정산 조회</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>업체/가맹점 통합 관리</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>수수료율 자동 계산</span>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽: 로그인 폼 */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* 모바일 헤더 */}
          <div className="lg:hidden text-center mb-6">
            <h1 className="text-3xl font-bold text-[#5F7C94] mb-1">Pay++</h1>
            <p className="text-sm text-gray-600">정산 관리 시스템</p>
          </div>

          {/* 로그인 카드 */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1">로그인</h2>
              <p className="text-sm text-gray-600">계정 정보를 입력해주세요</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 아이디 입력 */}
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  아이디
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="mt-1 h-10 text-sm"
                  placeholder="아이디를 입력하세요"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* 비밀번호 입력 */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  비밀번호
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 h-10 text-sm"
                  placeholder="비밀번호를 입력하세요"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-2.5">
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              {/* 로그인 버튼 */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </div>

          {/* 푸터 */}
          <p className="mt-4 text-center text-xs text-gray-500">
            © 2025 Pay++. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
