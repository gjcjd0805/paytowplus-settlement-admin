"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/contexts/app-context"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, isInitialized } = useAppContext()

  useEffect(() => {
    if (!isInitialized) return // Context 초기화 대기

    if (isAuthenticated) {
      router.replace("/payment/list")
    } else {
      router.replace("/login")
    }
  }, [router, isAuthenticated, isInitialized])

  return null
}