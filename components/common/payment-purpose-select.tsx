"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { PaymentPurpose, PaymentPurposeHelper, type PaymentPurposeType } from "@/lib/enums"

interface PaymentPurposeSelectProps {
  value?: PaymentPurposeType
  onChange?: (purpose: PaymentPurposeType) => void
  className?: string
}

export function PaymentPurposeSelect({ value, onChange, className = "" }: PaymentPurposeSelectProps) {
  const [selectedPurpose, setSelectedPurpose] = useState<PaymentPurposeType>(
    value || PaymentPurpose.DELIVERY_CHARGE
  )

  // localStorage에서 저장된 paymentPurpose 확인
  useEffect(() => {
    const storedPurpose = localStorage.getItem('paymentPurpose')
    if (storedPurpose && PaymentPurposeHelper.isValid(storedPurpose)) {
      setSelectedPurpose(storedPurpose as PaymentPurposeType)
    } else {
      // 저장된 값이 없으면 기본값(배달비) 설정
      const defaultPurpose = PaymentPurpose.DELIVERY_CHARGE
      setSelectedPurpose(defaultPurpose)
      localStorage.setItem('paymentPurpose', defaultPurpose)
      onChange?.(defaultPurpose)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // value prop이 변경되면 selectedPurpose 업데이트
  useEffect(() => {
    if (value !== undefined) {
      setSelectedPurpose(value)
    }
  }, [value])

  const handleClick = (purpose: PaymentPurposeType) => {
    setSelectedPurpose(purpose)

    // localStorage에 저장
    localStorage.setItem('paymentPurpose', purpose)

    // 콜백 호출
    onChange?.(purpose)
  }

  const options = PaymentPurposeHelper.getOptions()

  return (
    <div className={`flex bg-black/20 rounded-lg p-0.5 ${className}`}>
      {options.map((option) => {
        const isSelected = selectedPurpose === option.value
        return (
          <button
            key={option.value}
            onClick={() => handleClick(option.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              isSelected
                ? 'bg-white text-gray-800 shadow-sm text-base font-bold'
                : 'text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium'
            }`}
          >
            {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
