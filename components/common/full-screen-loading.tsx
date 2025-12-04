"use client"

interface FullScreenLoadingProps {
  message?: string
  subMessage?: string
}

export function FullScreenLoading({
  message = "로딩 중...",
  subMessage
}: FullScreenLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">{message}</p>
        {subMessage && (
          <p className="text-gray-500 text-sm mt-1">{subMessage}</p>
        )}
      </div>
    </div>
  )
}
