"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function PaymentDeferredPage() {
  const router = useRouter()

  return (
    <div className="space-y-4">
      {/* 메뉴 Path */}
      <div className="text-xl text-gray-600">
        <span>결제 관리</span>
        <span className="mx-2">{'>'}</span>
        <span className="font-semibold text-gray-800">보류내역 조회</span>
      </div>

      {/* 안내 메시지 */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white border border-gray-300 rounded-lg">
        <div className="text-center space-y-4">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-800">보류내역 조회</h2>
          <p className="text-gray-600">
            이 페이지는 현재 개발 중입니다.<br />
            결제 보류 내역을 조회하고 관리하는 기능이 추가될 예정입니다.
          </p>
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              onClick={() => router.push("/payment/list")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-9"
            >
              결제 목록으로
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-gray-400 px-6 h-9"
            >
              홈으로
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}