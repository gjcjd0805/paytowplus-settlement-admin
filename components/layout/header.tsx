"use client"

import { useState } from "react"
import Image from "next/image"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CenterSelect } from "@/components/common/center-select"
import { PaymentPurposeSelect } from "@/components/common/payment-purpose-select"
import { CenterManagementModal } from "@/components/center/center-management-modal"
import { useAppContext } from "@/contexts/app-context"
import type { PaymentPurposeType } from "@/lib/enums"

export function Header() {
  const { user, logout, setCenterId, setPaymentPurpose, toggleSidebar, showLoading } = useAppContext()
  const [centerModalOpen, setCenterModalOpen] = useState(false)

  const handleLogout = async () => {
    // 전역 로딩 표시
    showLoading("로그아웃 중...")

    // logout() 완료 대기 (쿠키 제거 후 리다이렉트해야 middleware에서 '/'로 보내지 않음)
    await logout()

    // 로그인 페이지로 이동
    window.location.href = "/login"
  }

  const handleCenterChange = (centerId: number) => {
    setCenterId(centerId)
  }

  const handlePaymentPurposeChange = (purpose: PaymentPurposeType) => {
    setPaymentPurpose(purpose)
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[hsl(var(--header-bg))] text-[hsl(var(--header-foreground))]">
      {/* 메인 헤더 */}
      <div className="flex h-14 items-center px-2 sm:px-4 gap-2 sm:gap-4">
        {/* 모바일 메뉴 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="lg:hidden text-white hover:bg-white/20 flex-shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* 로고 */}
        <div className="hidden lg:flex items-center flex-shrink-0">
          <Image
            src="/logo.png"
            alt="페이플러스"
            width={140}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </div>

        {/* 구분선 */}
        <div className="hidden lg:block h-6 w-px bg-white/30" />

        {/* 센터 선택 - 본사만 선택 가능 */}
        <div className={`flex items-center gap-2 flex-shrink-0 px-3 py-1.5 rounded transition-all ${
          user?.level === 0
            ? 'bg-white/10 border border-white/20 hover:bg-white/15'
            : ''
        }`}>
          <span className="text-sm">🏢</span>
          <CenterSelect
            onChange={handleCenterChange}
            disabled={user?.level !== 0}
            userCenterId={user?.centerId}
          />
        </div>

        {/* 결제 목적 선택 - 데스크톱 */}
        <div className="hidden sm:block flex-shrink-0">
          <PaymentPurposeSelect onChange={handlePaymentPurposeChange} />
        </div>

        <div className="flex-1" />

        {/* 센터 관리 - 본사만 */}
        {user?.level === 0 && (
          <button
            onClick={() => setCenterModalOpen(true)}
            className="hidden sm:flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
          >
            <span>⚙</span>
            <span>센터관리</span>
          </button>
        )}

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors"
        >
          <span>🔒</span>
          <span className="hidden sm:inline">로그아웃</span>
        </button>
      </div>

      {/* 모바일 결제목적 선택 - 2행 */}
      <div className="sm:hidden flex justify-center py-2 border-t border-white/10">
        <PaymentPurposeSelect onChange={handlePaymentPurposeChange} />
      </div>

      {/* 센터 관리 모달 */}
      <CenterManagementModal
        open={centerModalOpen}
        onClose={() => setCenterModalOpen(false)}
      />
    </header>
  )
}