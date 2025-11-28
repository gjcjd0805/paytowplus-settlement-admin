/**
 * 날짜 관련 유틸리티 함수 모음
 */

export type DateTabType = "오늘" | "어제" | "3일전" | "한달전" | "당월"

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 날짜시간 문자열을 YYYY-MM-DD HH:mm:ss 형식으로 포맷
 */
export const formatDateTime = (dateTimeStr: string | null | undefined): string => {
  if (!dateTimeStr) return ""
  const date = new Date(dateTimeStr)
  if (isNaN(date.getTime())) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 날짜시간 문자열을 YYYY-MM-DD 형식으로 포맷 (날짜만)
 */
export const formatDateOnly = (dateTimeStr: string | null | undefined): string => {
  if (!dateTimeStr) return ""
  return dateTimeStr.split('T')[0] || ""
}

/**
 * 금액을 천단위 콤마로 포맷
 */
export const formatAmount = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "0"
  return amount.toLocaleString('ko-KR')
}

/**
 * 날짜 탭에 따른 시작일과 종료일 계산
 */
export const getDateRange = (tab: DateTabType): { start: string; end: string } => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  switch (tab) {
    case "오늘":
      const todayStr = formatDate(today)
      return { start: todayStr, end: todayStr }

    case "어제":
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = formatDate(yesterday)
      return { start: yesterdayStr, end: yesterdayStr }

    case "3일전":
      const threeDaysAgo = new Date(today)
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      return { start: formatDate(threeDaysAgo), end: formatDate(today) }

    case "한달전":
      const oneMonthAgo = new Date(today)
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      return { start: formatDate(oneMonthAgo), end: formatDate(today) }

    case "당월":
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      return { start: formatDate(firstDay), end: formatDate(lastDay) }

    default:
      return { start: "", end: "" }
  }
}

/**
 * 월의 시작일과 종료일 계산
 */
export const getMonthRange = (date: Date = new Date()): { start: string; end: string } => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  return { start: formatDate(firstDay), end: formatDate(lastDay) }
}
