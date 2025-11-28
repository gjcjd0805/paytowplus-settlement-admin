"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function PaymentSimplePage() {
  const router = useRouter()

  return (
    <div className="space-y-4">
      {/* 메뉴 Path */}
      <div className="text-xl text-gray-600">
        <span>결제 관리</span>
        <span className="mx-2">{'>'}</span>
        <span className="font-semibold text-gray-800">간편결제내역 조회</span>
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
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-800">간편결제내역 조회</h2>
          <p className="text-gray-600">
            이 페이지는 현재 개발 중입니다.<br />
            간편결제 거래 내역을 조회하고 관리하는 기능이 추가될 예정입니다.
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