"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { noticesApi, type Notice } from "@/lib/api"
import { useAppContext } from "@/contexts/app-context"

interface NoticeDetailModalProps {
  open: boolean
  onClose: () => void
  noticeId: number | null
  onUpdate?: () => void
}

export function NoticeDetailModal({ open, onClose, noticeId, onUpdate }: NoticeDetailModalProps) {
  const { user } = useAppContext()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 본사(level 0)만 수정 가능
  const isHeadquarters = user?.level === 0

  // 수정 폼 데이터
  const [formData, setFormData] = useState({
    isNotice: false,
    title: "",
    content: "",
  })

  useEffect(() => {
    if (open && noticeId) {
      loadNotice()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, noticeId])

  const loadNotice = async () => {
    if (!noticeId) return

    setIsLoading(true)
    try {
      const response = await noticesApi.findById(noticeId)
      const noticeData = response.data
      setNotice(noticeData)

      // 폼 데이터 초기화
      setFormData({
        isNotice: noticeData.isNotice,
        title: noticeData.title,
        content: noticeData.content,
      })
    } catch (error) {
      console.error("공지사항 조회 오류:", error)
      alert("공지사항을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isNotice: e.target.checked }))
  }

  const handleSubmit = async () => {
    if (!notice) return

    // 유효성 검증
    const trimmedData = {
      isNotice: formData.isNotice,
      title: formData.title.trim(),
      content: formData.content.trim(),
    }

    if (!trimmedData.title) {
      alert("제목은 필수입니다.")
      return
    }
    if (!trimmedData.content) {
      alert("내용은 필수입니다.")
      return
    }

    setSubmitting(true)
    try {
      await noticesApi.update(notice.id, trimmedData)
      alert("공지사항이 수정되었습니다.")
      onUpdate?.()
      onClose()
    } catch (error) {
      console.error("공지사항 수정 오류:", error)
      alert("공지사항 수정에 실패했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return ""
    const date = new Date(dateTimeStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const seconds = String(date.getSeconds()).padStart(2, "0")
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* 팝업 헤더 */}
        <DialogHeader className="bg-[#5F7C94] text-white px-4 py-3 -mx-6 -mt-6 mb-4">
          <DialogTitle className="text-lg font-medium">공지사항 상세</DialogTitle>
        </DialogHeader>

        {/* 팝업 내용 */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">로딩 중...</div>
          ) : notice ? (
            <div className="space-y-4">
              {/* 상단 정보 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isNotice"
                      name="isNotice"
                      checked={formData.isNotice}
                      onChange={handleCheckboxChange}
                      disabled={!isHeadquarters}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isNotice" className="text-sm cursor-pointer">
                      공지
                    </Label>
                  </div>
                  <span className="text-sm text-gray-600">작성자: {notice.author}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>조회 {notice.viewCount}</span>
                  <span>{formatDateTime(notice.registDt)}</span>
                </div>
              </div>

              {/* 제목 */}
              <div>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={!isHeadquarters}
                  className="h-10 text-base font-medium"
                  placeholder="제목을 입력하세요"
                  autoComplete="off"
                />
              </div>

              {/* 내용 */}
              <div>
                <Textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  disabled={!isHeadquarters}
                  className="min-h-[350px] text-sm"
                  placeholder="내용을 입력하세요"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">공지사항을 불러올 수 없습니다.</div>
          )}
        </div>

        {/* 팝업 하단 버튼 */}
        <DialogFooter className="mt-6">
          {isHeadquarters && (
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-4 text-xs"
              disabled={submitting}
            >
              {submitting ? "저장 중..." : "저장"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-400 h-8 px-4 text-xs"
            disabled={submitting}
          >
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
