"use client"

import { useState, useCallback } from "react"
import { DateTabType, getDateRange, formatDate } from "@/lib/utils/dateUtils"

interface UseDateTabHandlerOptions {
  /** 초기 선택 탭 */
  initialTab?: DateTabType | null
  /** 초기 날짜 설정 여부 (true면 initialTab에 맞는 날짜로 설정) */
  setInitialDates?: boolean
}

interface UseDateTabHandlerReturn {
  /** 현재 선택된 탭 */
  selectedTab: DateTabType | null
  /** 시작일 (YYYY-MM-DD) */
  startDate: string
  /** 종료일 (YYYY-MM-DD) */
  endDate: string
  /** 시작일 setter */
  setStartDate: (date: string) => void
  /** 종료일 setter */
  setEndDate: (date: string) => void
  /** 탭 클릭 핸들러 */
  handleDateTabClick: (tab: DateTabType) => void
  /** 날짜 초기화 */
  resetDates: () => void
}

/**
 * 날짜 탭 핸들러 커스텀 훅
 *
 * @example
 * ```tsx
 * const { selectedTab, startDate, endDate, handleDateTabClick, resetDates } = useDateTabHandler({
 *   initialTab: "당월",
 *   setInitialDates: true
 * })
 * ```
 */
export function useDateTabHandler(options: UseDateTabHandlerOptions = {}): UseDateTabHandlerReturn {
  const { initialTab = null, setInitialDates = false } = options

  // 초기 날짜 계산
  const getInitialDates = () => {
    if (setInitialDates && initialTab) {
      return getDateRange(initialTab)
    }
    return { start: "", end: "" }
  }

  const initialDates = getInitialDates()

  const [selectedTab, setSelectedTab] = useState<DateTabType | null>(initialTab)
  const [startDate, setStartDate] = useState<string>(initialDates.start)
  const [endDate, setEndDate] = useState<string>(initialDates.end)

  const handleDateTabClick = useCallback((tab: DateTabType) => {
    setSelectedTab(tab)
    const { start, end } = getDateRange(tab)
    setStartDate(start)
    setEndDate(end)
  }, [])

  const resetDates = useCallback(() => {
    setSelectedTab(null)
    setStartDate("")
    setEndDate("")
  }, [])

  return {
    selectedTab,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleDateTabClick,
    resetDates
  }
}

export default useDateTabHandler
