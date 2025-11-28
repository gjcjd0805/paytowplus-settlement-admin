"use client"

import { ReactNode } from "react"

interface SearchSectionProps {
  title: string
  breadcrumb?: string
  children: ReactNode
}

export function SearchSection({ title, breadcrumb, children }: SearchSectionProps) {
  return (
    <div className="space-y-2">
      {/* 페이지 제목 및 브레드크럼 */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">{title}</span>
        {breadcrumb && <span className="text-gray-400">{breadcrumb}</span>}
      </div>

      {/* 검색 영역 */}
      <div className="bg-white border border-gray-300 rounded">
        {children}
      </div>
    </div>
  )
}

interface TabBarProps {
  children: ReactNode
}

export function TabBar({ children }: TabBarProps) {
  return (
    <div className="flex gap-1 bg-[hsl(var(--tab-bg))] p-1 border-b border-gray-300">
      {children}
    </div>
  )
}

interface TabButtonProps {
  active?: boolean
  onClick?: () => void
  children: ReactNode
}

export function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
        active
          ? "bg-white text-gray-900 shadow-sm"
          : "bg-transparent text-gray-700 hover:bg-white/50"
      }`}
    >
      {children}
    </button>
  )
}

interface SearchFormProps {
  children: ReactNode
}

export function SearchForm({ children }: SearchFormProps) {
  return (
    <div className="p-3 space-y-2">
      {children}
    </div>
  )
}

interface FormRowProps {
  label: string
  children: ReactNode
  required?: boolean
}

export function FormRow({ label, children, required }: FormRowProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700 w-24 flex-shrink-0">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex-1 flex items-center gap-2">
        {children}
      </div>
    </div>
  )
}
