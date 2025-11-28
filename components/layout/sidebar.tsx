"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  Receipt,
  Calculator,
  CreditCard,
  Building2,
  Store,
  Monitor,
  Bell,
  X
} from "lucide-react"
import { cn } from "@/utils/cn"
import { useAppContext } from "@/contexts/app-context"
import { IMenuItem } from "@/types"
import React, { useState } from "react"

/**
 * 메뉴 권한 정책
 * - level 0: 본사 (모든 메뉴 접근 가능)
 * - level 1: 지사
 * - level 2: 총판
 * - level 3: 대리점
 */
const menuItems: IMenuItem[] = [
  {
    title: "결제 관리",
    icon: Receipt,
    levels: [0, 1, 2, 3, 4], // 대리점, 총판, 지사, 본사, 가맹점
    children: [
      { title: "결제내역 조회", href: "/payment/list", levels: [0, 1, 2, 3, 4] },
      { title: "보류내역 조회", href: "/payment/deferred", levels: [0] },
      // { title: "간편결제내역 조회", href: "/payment/simple", levels: [0] },
      { title: "단말기미등록 결제내역 처리", href: "/payment/unregistered", levels: [0] },
    ],
  },
  {
    title: "정산 관리",
    icon: Calculator,
    levels: [0, 1, 2, 3, 4], // 대리점, 총판, 지사, 본사, 가맹점
    children: [
      { title: "가맹점 정산금액 조회(기간별)", href: "/settlement/merchant/period", levels: [0, 1, 2, 3, 4] },
      { title: "가맹점 정산금액 조회(일자별)", href: "/settlement/merchant/daily", levels: [0, 1, 2, 3, 4] },
      { title: "가맹점 매출금액 조회", href: "/settlement/merchant/sales", levels: [0, 1, 2, 3, 4] },
      // 업체 정산금액 조회 - level별 분기
      { title: "업체 정산금액 조회", href: "/settlement/amount", levels: [0] }, // 본사
      { title: "지사 정산금액 조회", href: "/settlement/amount/branch", levels: [1] }, // 지사
      { title: "총판 정산금액 조회", href: "/settlement/amount/distributor", levels: [2] }, // 총판
      { title: "대리점 정산금액 조회", href: "/settlement/amount/agent", levels: [3] }, // 대리점
    ],
  },
  {
    title: "업체 관리",
    icon: Building2,
    levels: [0, 1, 2], // 지사, 총판, 본사 (대리점 제외)
    children: [
      {
        menuGroup: {
          items: [
            { title: "전체", href: "/company/list", levels: [0, 1] }, // 본사, 지사만
            { title: "지사", href: "/company/list?level=1", levels: [0] }, // 본사만
            { title: "총판", href: "/company/list?level=2", levels: [0, 1] }, // 본사, 지사
            { title: "대리점", href: "/company/list?level=3", levels: [0, 1, 2] }, // 본사, 지사, 총판
          ]
        }
      } as any,
      { title: "업체 등록", href: "/company/register", levels: [0] },
      { title: "업체 수수료율 관리", href: "/company/commission", levels: [0] }, // 본사만
    ],
  },
  {
    title: "가맹점",
    icon: Store,
    levels: [0, 1, 2, 3], // 대리점, 총판, 지사, 본사
    children: [
      {
        menuGroup: {
          items: [
            { title: "가맹점 목록", href: "/merchant/list", levels: [0, 1, 2, 3] },
            { title: "가맹점 등록", href: "/merchant/register", levels: [0, 1, 2, 3] },
          ]
        }
      } as any,
    ],
  },
  {
    title: "단말기 관리",
    icon: Monitor,
    levels: [0, 1, 2, 3], // 대리점, 총판, 지사, 본사
    children: [
      {
        menuGroup: {
          items: [
            { title: "단말기 목록", href: "/terminal/list", levels: [0, 1, 2, 3] },
            { title: "단말기 등록", href: "/terminal/register", levels: [0] },
          ]
        }
      } as any,
    ],
  },
  {
    title: "공지사항 관리",
    icon: Bell,
    levels: [0, 1, 2, 3, 4], // 대리점, 총판, 지사, 본사, 가맹점
    children: [
      {
        menuGroup: {
          items: [
            { title: "공지사항", href: "/notice/list", levels: [0, 1, 2, 3, 4] },
            { title: "공지사항등록", href: "/notice/register", levels: [0] },
          ]
        }
      } as any,
    ],
  },
]

// 한 행에 여러 메뉴를 | 로 구분하여 표시하는 컴포넌트
interface MenuGroup {
  items: IMenuItem[]
}

function MenuGroupItem({ group }: { group: MenuGroup }) {
  const pathname = usePathname()
  const { user, toggleSidebar } = useAppContext()

  // 모바일에서 메뉴 클릭 시 사이드바 닫기
  const handleMenuClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        toggleSidebar()
      }, 100)
    }
  }

  // 권한 체크 (level 기반)
  const visibleItems = group.items.filter(item =>
    user && typeof user.level === 'number' && item.levels && item.levels.includes(user.level)
  )

  if (visibleItems.length === 0) return null

  return (
    <div className="flex items-center px-3 py-1.5 text-[13px] pl-5">
      <span className="text-white/50 mr-1.5">›</span>
      {visibleItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="mx-1.5 text-white/40">|</span>}
          <Link
            href={item.href || "#"}
            onClick={handleMenuClick}
            className={cn(
              "transition-colors hover:text-white active:text-white px-1 py-1 whitespace-nowrap",
              "inline-block min-h-[24px] lg:min-h-0",
              pathname === item.href && "text-white font-medium",
              pathname !== item.href && "text-white/80"
            )}
          >
            {item.title}
          </Link>
        </React.Fragment>
      ))}
    </div>
  )
}

function MenuItem({ item, level = 0 }: { item: IMenuItem; level?: number }) {
  const pathname = usePathname()
  const { user, toggleSidebar } = useAppContext()
  const [isOpen, setIsOpen] = useState(true) // 기본적으로 열린 상태

  // 모바일에서 메뉴 클릭 시 사이드바 닫기
  const handleMenuClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        toggleSidebar()
      }, 100)
    }
  }

  // 권한 체크 (level 기반)
  if (!user || typeof user.level !== 'number' || !item.levels || !item.levels.includes(user.level)) {
    return null
  }

  const hasChildren = item.children && item.children.length > 0
  const isActive = item.href === pathname

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-1.5 text-[13px] transition-colors",
            "hover:bg-[hsl(var(--sidebar-hover))] active:bg-[hsl(var(--sidebar-hover))]",
            "min-h-[44px] lg:min-h-0",
            level === 0 && "font-medium border-b border-white/10"
          )}
        >
          {item.icon && <item.icon className="h-3.5 w-3.5" />}
          <span className="flex-1 text-left">{item.title}</span>
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
        {isOpen && item.children && (
          <div className="bg-black/10">
            {item.children.map((child, index) => {
              // menuGroup 속성이 있으면 그룹으로 처리
              if ((child as any).menuGroup) {
                return <MenuGroupItem key={index} group={(child as any).menuGroup} />
              }
              return <MenuItem key={index} item={child} level={level + 1} />
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href || "#"}
      onClick={handleMenuClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 text-[13px] transition-colors",
        "hover:bg-[hsl(var(--sidebar-hover))] active:bg-[hsl(var(--sidebar-hover))]",
        "min-h-[44px] lg:min-h-0",
        isActive && "bg-[hsl(var(--sidebar-active))] font-medium",
        level > 0 && "pl-5"
      )}
    >
      {level > 0 && <span className="text-white/50">›</span>}
      {item.icon && <item.icon className="h-3.5 w-3.5" />}
      <span>{item.title}</span>
    </Link>
  )
}

export function Sidebar() {
  const { sidebarOpen, user, toggleSidebar } = useAppContext()

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
        onClick={toggleSidebar}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-[6.5rem] sm:top-14 z-50 h-[calc(100vh-6.5rem)] sm:h-[calc(100vh-3.5rem)] w-[240px] bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-foreground))] transition-transform lg:translate-x-0 overflow-y-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* 모바일 닫기 버튼 */}
          <div className="lg:hidden flex justify-end p-2 border-b border-white/10">
            <button
              onClick={toggleSidebar}
              className="text-white/80 hover:text-white active:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 사용자 정보 */}
          {user && (
            <div className="px-3 py-4 border-b border-white/10 bg-black/20">
              <div className="bg-white/10 rounded-lg p-3">
                {/* 업체명 (크게) */}
                <div className="text-white font-bold text-base truncate mb-2">
                  {user.name || 'Unknown'}
                </div>

                {/* 레벨 & ID (작게) */}
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 bg-blue-500/80 text-white font-medium rounded">
                    {user.levelName || '사용자'}
                  </span>
                  <span className="text-white/60 truncate ml-2">
                    {user.loginId || ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 메뉴 */}
          <div className="flex-1 overflow-y-auto py-2">
            <nav className="space-y-0.5">
              {menuItems.map((item, index) => (
                <MenuItem key={index} item={item} />
              ))}
            </nav>
          </div>

          {/* Copyright */}
          <div className="px-3 py-4 border-t border-white/10 text-[10px] text-white/60">
            <div>Copyright 2025</div>
            <div className="mt-0.5">Pay++. All rights reserved.</div>
          </div>
        </div>
      </aside>
    </>
  )
}