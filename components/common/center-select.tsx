"use client"

import { useState, useEffect } from "react"
import { centersApi, type Center, tokenManager } from "@/lib/api"

interface CenterSelectProps {
  value?: number
  onChange?: (centerId: number) => void
  className?: string
  disabled?: boolean
  userCenterId?: number
}

export function CenterSelect({ value, onChange, className = "", disabled = false, userCenterId }: CenterSelectProps) {
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCenterId, setSelectedCenterId] = useState<number | undefined>(value)

  // 센터 목록 로드
  useEffect(() => {
    const loadCenters = async () => {
      // 토큰이 없으면 API 호출하지 않음 (로그아웃 중일 수 있음)
      if (!tokenManager.get()) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await centersApi.findAll()
        const centerList = response.data?.centers || []
        setCenters(centerList)

        // disabled인 경우 (본사가 아닌 경우) userCenterId 사용
        if (disabled && userCenterId) {
          setSelectedCenterId(userCenterId)
          localStorage.setItem('centerId', String(userCenterId))
          onChange?.(userCenterId)
        } else {
          // 본사인 경우 기존 로직
          // localStorage에서 저장된 centerId 확인
          const storedCenterId = localStorage.getItem('centerId')
          if (storedCenterId) {
            const centerId = Number(storedCenterId)
            setSelectedCenterId(centerId)
          } else if (centerList.length > 0 && !value) {
            // 저장된 값이 없고 value도 없으면 첫 번째 센터 선택
            const firstCenterId = centerList[0].centerId
            setSelectedCenterId(firstCenterId)
            localStorage.setItem('centerId', String(firstCenterId))
            onChange?.(firstCenterId)
          }
        }
      } catch (error) {
        console.error('센터 목록 조회 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCenters()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, userCenterId])

  // value prop이 변경되면 selectedCenterId 업데이트
  useEffect(() => {
    if (value !== undefined) {
      setSelectedCenterId(value)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const centerId = Number(e.target.value)
    setSelectedCenterId(centerId)

    // localStorage에 저장
    localStorage.setItem('centerId', String(centerId))

    // 콜백 호출
    onChange?.(centerId)
  }

  if (loading) {
    return (
      <select className={`px-3 py-1 text-sm border border-white/20 rounded bg-white/10 text-white ${className}`} disabled>
        <option>로딩 중...</option>
      </select>
    )
  }

  if (centers.length === 0) {
    return (
      <select className={`px-3 py-1 text-sm border border-white/20 rounded bg-white/10 text-white ${className}`} disabled>
        <option>센터 없음</option>
      </select>
    )
  }

  // 본사가 아닌 경우 텍스트로만 표시
  if (disabled) {
    const currentCenter = centers.find(center => center.centerId === selectedCenterId)
    return (
      <div className={`text-base text-white font-semibold ${className}`}>
        {currentCenter?.centerName || '센터 정보 없음'}
      </div>
    )
  }

  // 본사인 경우 드롭다운 표시
  return (
    <select
      value={selectedCenterId || ''}
      onChange={handleChange}
      className={`px-2 py-1 text-sm bg-transparent text-white font-medium cursor-pointer hover:bg-white/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${className}`}
    >
      {centers.map((center) => (
        <option key={center.centerId} value={center.centerId} className="text-gray-900 bg-white">
          {center.centerName}
        </option>
      ))}
    </select>
  )
}
