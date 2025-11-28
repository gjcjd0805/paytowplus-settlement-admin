"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { tokenManager } from "@/lib/api"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = tokenManager.get()
    if (token) {
      router.replace("/payment/list")
    } else {
      router.replace("/login")
    }
  }, [router])

  return null
}