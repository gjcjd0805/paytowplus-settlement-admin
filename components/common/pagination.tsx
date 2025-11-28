"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5
}: PaginationProps) {
  // 모바일에서는 페이지 번호를 적게 보여줌
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const effectiveMaxVisiblePages = isMobile ? 3 : maxVisiblePages
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const halfVisible = Math.floor(effectiveMaxVisiblePages / 2)

    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, currentPage + halfVisible)

    // 시작 페이지가 1이 아니면 조정
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages, effectiveMaxVisiblePages)
    }

    // 끝 페이지가 totalPages가 아니면 조정
    if (currentPage + halfVisible >= totalPages) {
      startPage = Math.max(1, totalPages - effectiveMaxVisiblePages + 1)
    }

    // 첫 페이지 추가
    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) {
        pages.push("...")
      }
    }

    // 페이지 번호 추가
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // 마지막 페이지 추가
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...")
      }
      pages.push(totalPages)
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      {/* 처음으로 */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-2 sm:px-3 py-1.5 sm:py-1.5 text-xs sm:text-xs min-h-[32px] sm:min-h-0 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        title="처음"
      >
        처
      </button>

      {/* 이전 */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-2 sm:px-3 py-1.5 sm:py-1.5 text-xs sm:text-xs min-h-[32px] sm:min-h-0 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        title="이전"
      >
        이전
      </button>

      {/* 페이지 번호 */}
      {pages.map((page, index) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${index}`} className="px-2 py-1 text-xs text-gray-400">
              ...
            </span>
          )
        }

        const pageNum = page as number
        const isActive = pageNum === currentPage

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`min-w-[28px] sm:min-w-[28px] px-2 sm:px-2.5 py-1.5 sm:py-1.5 text-xs sm:text-xs min-h-[32px] sm:min-h-0 border rounded ${
              isActive
                ? "bg-[#4A90E2] text-white border-[#4A90E2] font-medium"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {pageNum}
          </button>
        )
      })}

      {/* 다음 */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-2 sm:px-3 py-1.5 sm:py-1.5 text-xs sm:text-xs min-h-[32px] sm:min-h-0 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        title="다음"
      >
        다음
      </button>

      {/* 마지막으로 */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-2 sm:px-3 py-1.5 sm:py-1.5 text-xs sm:text-xs min-h-[32px] sm:min-h-0 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        title="마지막"
      >
        마
      </button>
    </div>
  )
}
