"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { commissionsApi } from "@/lib/api"

interface ICommissionHistory {
  id: string
  headquartersCommissionRate: number
  branchCommissionRate: number
  distributorCommissionRate: number
  agencyCommissionRate: number
  createdBy: string
  createdAt: string
}

interface CommissionHistoryModalProps {
  merchantId: string
  merchantName: string
  isOpen: boolean
  onClose: () => void
}

export function CommissionHistoryModal({
  merchantId,
  merchantName,
  isOpen,
  onClose,
}: CommissionHistoryModalProps) {
  const [histories, setHistories] = useState<ICommissionHistory[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && merchantId) {
      loadHistory()
    }
  }, [isOpen, merchantId])

  const loadHistory = async () => {
    try {
      setLoading(true)
      // TODO: API 명세에 수수료율 변경 이력 조회 엔드포인트가 없음
      // commissionsApi에 getHistory 메서드 추가 필요
      // const data = await commissionsApi.getHistory(merchantId) as any
      // setHistories(data || [])
      setHistories([])
    } catch (error) {
      console.error("이력 조회 오류:", error)
      alert("이력을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-4xl max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">수수료율 변경 이력</h2>
          <p className="text-sm text-muted-foreground mt-1">
            가맹점: {merchantName}
          </p>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : histories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              변경 이력이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
                      NO
                    </th>
                    <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
                      본사
                    </th>
                    <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
                      지사
                    </th>
                    <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
                      총판
                    </th>
                    <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
                      대리점
                    </th>
                    <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
                      변경일시
                    </th>
                    <th className="px-4 py-3 text-center font-medium whitespace-nowrap">
                      변경자
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {histories.map((history, index) => (
                    <tr key={history.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-left">
                        {histories.length - index}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {Number(history.headquartersCommissionRate).toFixed(2)} %
                      </td>
                      <td className="px-4 py-3 text-center">
                        {Number(history.branchCommissionRate).toFixed(2)} %
                      </td>
                      <td className="px-4 py-3 text-center">
                        {Number(history.distributorCommissionRate).toFixed(2)} %
                      </td>
                      <td className="px-4 py-3 text-center">
                        {Number(history.agencyCommissionRate).toFixed(2)} %
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {new Date(history.createdAt).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {history.createdBy || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t flex justify-end">
          <Button onClick={onClose}>닫기</Button>
        </div>
      </div>
    </div>
  )
}
