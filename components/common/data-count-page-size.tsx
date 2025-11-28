"use client"

interface DataCountPageSizeProps {
  /** 전체 데이터 수 */
  totalElements: number
  /** 현재 페이지 크기 */
  pageSize: number
  /** 페이지 크기 변경 핸들러 */
  onPageSizeChange: (size: number) => void
  /** 페이지 크기 옵션 (기본값: [10, 15, 30, 50, 100]) */
  pageSizeOptions?: number[]
  /** 추가 className */
  className?: string
}

/**
 * 데이터 건수 표시 및 페이지 크기 선택 컴포넌트
 *
 * @example
 * ```tsx
 * <DataCountPageSize
 *   totalElements={100}
 *   pageSize={15}
 *   onPageSizeChange={(size) => {
 *     setPageSize(size)
 *     setCurrentPage(0)
 *   }}
 * />
 * ```
 */
export function DataCountPageSize({
  totalElements,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 15, 30, 50, 100],
  className = ""
}: DataCountPageSizeProps) {
  return (
    <div className={`flex items-center justify-between mb-3 px-2 ${className}`}>
      <div className="text-sm text-gray-700 flex items-center gap-1">
        <span>전체</span>
        <span className="font-semibold text-blue-600">{totalElements.toLocaleString()}</span>
        <span>건</span>
      </div>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {pageSizeOptions.map((size) => (
          <option key={size} value={size}>
            {size}건
          </option>
        ))}
      </select>
    </div>
  )
}

export default DataCountPageSize
