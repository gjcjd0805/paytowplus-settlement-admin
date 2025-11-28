"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/contexts/app-context"
import MerchantRegisterHeadquarters from "./headquarters"
import MerchantRegisterSimple from "./simple"

export default function MerchantRegisterPage() {
  const { user } = useAppContext()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      setIsLoading(false)
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  // 본사는 전체 기능 가맹점 등록 화면
  if (user?.level === 0) {
    return <MerchantRegisterHeadquarters />
  }

  // 지사/총판/대리점은 간소화된 가맹점 등록 화면
  return <MerchantRegisterSimple />
}
