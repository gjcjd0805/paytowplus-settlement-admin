"use client"

import { useEffect } from "react"
import { useAppContext } from "@/contexts/app-context"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useAppContext()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  return <>{children}</>
}