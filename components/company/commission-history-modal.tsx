"use client"

import { useEffect, useState } from "react"
import { commissionsApi } from "@/lib/api"
import type { CommissionHistory } from "@/lib/api/types"
import { Button } from "@/components/ui/button"
import { LoadingModal } from "@/components/common/loading-modal"
import { PaymentPurposeHelper } from "@/lib/enums"

interface CommissionHistoryModalProps {
  open: boolean
  onClose: () => void
  commissionId: number
  merchantName: string
}

export function CommissionHistoryModal({
  open,
  onClose,
  commissionId,
  merchantName,
}: CommissionHistoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [histories, setHistories] = useState<CommissionHistory[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  const loadHistories = async () => {
    if (!commissionId) return

    setLoading(true)
    setError("")
    try {
      const response = await commissionsApi.getHistories(commissionId, {
        page: currentPage,
        size: pageSize,
      })

      if (response.data) {
        setHistories(response.data.histories || [])
        setTotalPages(response.data.totalPages || 0)
        setTotalElements(response.data.totalElements || 0)
      }
    } catch (e: any) {
      console.error("수수료 변경 이력 조회 오류:", e)
      setError(e?.response?.data?.message || "수수료 변경 이력을 불러오지 못했습니다.")
      setHistories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && commissionId) {
      setCurrentPage(0)
      loadHistories()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, commissionId])

  useEffect(() => {
    if (open && commissionId) {
      loadHistories()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-[101] w-[900px] max-h-[90vh] rounded-lg border bg-white shadow-lg flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-[#5F7C94] text-white rounded-t-lg">
          <h2 className="text-base font-semibold">수수료 변경 이력 - {merchantName}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-xl font-bold w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        {/* 데이터 건수 */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
          <div className="text-sm text-gray-700">
            전체 <span className="font-semibold text-blue-600">{totalElements}</span>건
          </div>
        </div>

        {/* 테이블 */}
        <div className="flex-1 overflow-auto min-h-0 p-4">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-[#5F7C94] text-white sticky top-0">
              <tr>
                <th className="text-center p-2 border-r border-white w-12">NO</th>
                <th className="text-center p-2 border-r border-white w-36">변경일시</th>
                <th className="text-center p-2 border-r border-white w-24">결제목적</th>
                <th className="text-center p-2 border-r border-white">가맹점수수료</th>
                <th className="text-center p-2 border-r border-white">본사수수료</th>
                <th className="text-center p-2 border-r border-white">지사수수료</th>
                <th className="text-center p-2 border-r border-white">총판수수료</th>
                <th className="text-center p-2">대리점수수료</th>
              </tr>
            </thead>
            <tbody className="bg-[#E8EAED]">
              {histories.length === 0 ? (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={8}>
                    변경 이력이 없습니다.
                  </td>
                </tr>
              ) : (
                histories.map((history, index) => (
                  <tr key={history.id} className="border-b border-gray-300 hover:bg-[#DDE0E4]">
                    <td className="p-2 text-center text-gray-600">
                      {totalElements - (currentPage * pageSize + index)}
                    </td>
                    <td className="p-2 text-center text-gray-700">
                      {formatDateTime(history.createdDt)}
                    </td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        history.paymentPurpose === 'DELIVERY_CHARGE'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {PaymentPurposeHelper.getLabel(history.paymentPurpose)}
                      </span>
                    </td>
                    <td className="p-2 text-center text-gray-700 font-mono">
                      {history.merchantCommission}
                    </td>
                    <td className="p-2 text-center text-gray-700 font-mono">
                      {history.headquartersCommission}
                    </td>
                    <td className="p-2 text-center text-gray-700 font-mono">
                      {history.branchCommission}
                    </td>
                    <td className="p-2 text-center text-gray-700 font-mono">
                      {history.distributorCommission}
                    </td>
                    <td className="p-2 text-center text-gray-700 font-mono">
                      {history.agentCommission}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <div className="flex items-center justify-center gap-1 px-4 py-3 border-t bg-white">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
              className="h-7 px-2 text-xs"
            >
              처음
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="h-7 px-2 text-xs"
            >
              이전
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageGroup = Math.floor(currentPage / 5)
              const pageNum = pageGroup * 5 + i
              if (pageNum >= totalPages) return null
              return (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={currentPage === pageNum ? "default" : "outline"}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-7 px-3 text-xs ${
                    currentPage === pageNum
                      ? "bg-[#4A90E2] hover:bg-[#357ABD] text-white"
                      : ""
                  }`}
                >
                  {pageNum + 1}
                </Button>
              )
            })}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="h-7 px-2 text-xs"
            >
              다음
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(totalPages - 1)}
              disabled={currentPage === totalPages - 1}
              className="h-7 px-2 text-xs"
            >
              마지막
            </Button>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-center gap-2 px-4 py-3 border-t bg-white rounded-b-lg">
          <Button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 h-8 text-sm"
          >
            닫기
          </Button>
        </div>
      </div>

      {/* 로딩 모달 */}
      <LoadingModal isOpen={loading} />
    </div>
  )
}
