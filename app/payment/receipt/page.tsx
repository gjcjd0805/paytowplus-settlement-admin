"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { paymentsApi } from "@/lib/api"
import type { PaymentReceiptResponse } from "@/lib/api/types"
import { LoadingModal } from "@/components/common/loading-modal"

function PaymentReceiptContent() {
  const searchParams = useSearchParams()
  const [receipt, setReceipt] = useState<PaymentReceiptResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const paymentId = searchParams.get("paymentId")

  useEffect(() => {
    if (paymentId) {
      loadReceipt()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId])

  const loadReceipt = async () => {
    if (!paymentId) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await paymentsApi.getReceipt(Number(paymentId))
      setReceipt(response.data)
    } catch (err: any) {
      console.error("결제 전표 조회 오류:", err)
      setError("결제 전표를 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center text-red-600 text-xs">{error}</div>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <LoadingModal isOpen={isLoading} />
      </div>
    )
  }

  const { paymentInfo, amountInfo, storeInfo, supplierInfo } = receipt

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[360px] mx-auto p-4">
        {/* 로고 영역 */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-6 h-6 bg-[#4A9FD9] rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-lg font-semibold text-[#333]">Payplus</span>
        </div>

        {/* 신용카드 매출전표 헤더 */}
        <div className="bg-[#4A9FD9] text-white text-center py-1 rounded-t-md">
          <span className="text-[12px] font-medium">신용카드 매출전표</span>
        </div>

        {/* 결제정보 섹션 */}
        <div className="border border-[#e0e0e0] border-t-0">
          <div className="bg-[#f8f8f8] px-3 py-1 border-b border-[#e0e0e0]">
            <span className="text-[11px] font-medium text-[#555]">결제정보</span>
          </div>
          <div className="bg-white">
            <div className="flex px-3 py-1">
              <span className="w-16 text-[11px] text-[#888]">구매자</span>
              <span className="flex-1 text-[11px] text-[#333] text-right">{paymentInfo.payerName}</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-16 text-[11px] text-[#888]">상품명</span>
              <span className="flex-1 text-[11px] text-[#333] text-right">{paymentInfo.productName}</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-16 text-[11px] text-[#888]">카드번호</span>
              <span className="flex-1 text-[11px] text-[#333] text-right">{paymentInfo.cardNumber}</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-16 text-[11px] text-[#888]">카드종류</span>
              <span className="flex-1 text-[11px] text-[#333] text-right">{paymentInfo.cardType}</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-16 text-[11px] text-[#888]">할부개월</span>
              <span className="flex-1 text-[11px] text-[#333] text-right">{paymentInfo.installmentMonths}</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-16 text-[11px] text-[#888]">승인번호</span>
              <span className="flex-1 text-[11px] text-[#333] text-right">{paymentInfo.approvalNumber}</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-16 text-[11px] text-[#888]">승인일시</span>
              <span className="flex-1 text-[11px] text-[#333] text-right">{paymentInfo.approvalDate}</span>
            </div>

            {paymentInfo.cancelDate &&
              <div className="flex px-3 py-1">
                <span className="w-16 text-[11px] text-[#888]">취소일시</span>
                <span className="flex-1 text-[11px] text-[#333] text-right">{paymentInfo.cancelDate}</span>
              </div>
            }

          </div>
        </div>

        {/* 결제금액정보 섹션 */}
        <div className="border border-[#e0e0e0] border-t-0">
          <div className="bg-[#f8f8f8] px-3 py-1 border-b border-[#e0e0e0]">
            <span className="text-[11px] font-medium text-[#555]">결제금액정보</span>
          </div>
          <div className="bg-white">
            <div className="flex px-3 py-1">
              <span className="w-16 text-[11px] text-[#888]">공급가액</span>
              <span className={`flex-1 text-[11px] ${paymentInfo.cancelDate ? 'line-through' : ''} text-right`}>{amountInfo.supplyAmount.toLocaleString()} 원</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-16 text-[11px] text-[#888]">세액</span>
              <span className={`flex-1 text-[11px] ${paymentInfo.cancelDate ? 'line-through' : ''} text-right`}>{amountInfo.taxAmount.toLocaleString()} 원</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-16 text-[11px] text-[#888]">합계</span>
              <span className={`flex-1 text-[14px] ${paymentInfo.cancelDate ? 'line-through' : ''} font-bold text-[#ef4452] text-right`}>{amountInfo.totalAmount.toLocaleString()} 원</span>
            </div>
          </div>
        </div>

        {/* 상점정보 섹션 */}
        <div className="border border-[#e0e0e0] border-t-0">
          <div className="bg-[#f8f8f8] px-3 py-1 border-b border-[#e0e0e0]">
            <span className="text-[11px] font-medium text-[#555]">상점정보</span>
          </div>
          <div className="bg-white">
            <div className="flex px-3 py-1">
              <span className="w-20 text-[11px] text-[#888]">상호</span>
              <span className="flex-1 text-[11px] text-[#333] text-right">{storeInfo.storeName}</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-20 text-[11px] text-[#888]">대표자</span>
              <span className="flex-1 text-[11px] text-[#333] text-right">{storeInfo.ownerName}</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-20 text-[11px] text-[#888]">사업자등록번호</span>
              <span className="flex-1 text-[11px] text-[#333] text-right">{storeInfo.bizNumber}</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-20 text-[11px] text-[#888]">전화번호</span>
              <span className="flex-1 text-[11px] text-[#333] text-right">{storeInfo.phone}</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-20 text-[11px] text-[#888]">주소</span>
              <span className="flex-1 text-[11px] text-[#333] text-right leading-4">{storeInfo.address}</span>
            </div>
          </div>
        </div>

        {/* 공급자정보 섹션 */}
        <div className="border border-[#e0e0e0] border-t-0">
          <div className="bg-[#f8f8f8] px-3 py-1 border-b border-[#e0e0e0]">
            <span className="text-[11px] font-medium text-[#555]">공급자정보</span>
          </div>
          <div className="bg-white">
            <div className="flex px-3 py-1">
              <span className="w-20 text-[11px] text-[#888]">상호</span>
              <span className="flex-1 text-[11px] text-[#333] text-right">{supplierInfo.companyName}</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-20 text-[11px] text-[#888]">대표자</span>
              <span className="flex-1 text-[11px] text-[#333] text-right">{supplierInfo.ownerName}</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-20 text-[11px] text-[#888]">사업자등록번호</span>
              <span className="flex-1 text-[11px] text-[#333] text-right">{supplierInfo.bizNumber}</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-20 text-[11px] text-[#888]">전화번호</span>
              <span className="flex-1 text-[11px] text-[#333] text-right">{supplierInfo.phone}</span>
            </div>
            <div className="flex px-3 py-1">
              <span className="w-20 text-[11px] text-[#888]">주소</span>
              <span className="flex-1 text-[11px] text-[#333] text-right leading-4">{supplierInfo.address}</span>
            </div>
          </div>
        </div>

        {/* 하단 안내 문구 */}
        <div className="mt-2 text-[9px] text-[#888] leading-relaxed">
          <p>* 부가가치세법 제 46조 3항에 따라 신용카드 매출전표도 매입계산서로 사용할 수 있으며 부가가치세법 제 33조 2항에 따라 별도의 세금계산서를 교부하지 않습니다.</p>
        </div>
      </div>

      <LoadingModal isOpen={isLoading} />
    </div>
  )
}

export default function PaymentReceiptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-xs">로딩 중...</p>
        </div>
      </div>
    }>
      <PaymentReceiptContent />
    </Suspense>
  )
}
