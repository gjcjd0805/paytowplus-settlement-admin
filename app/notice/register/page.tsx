"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { noticesApi } from "@/lib/api"

export default function NoticeRegisterPage() {
  const router = useRouter()

  // ===========================
  // 상태 관리
  // ===========================
  const [formData, setFormData] = useState({
    isNotice: false,
    title: "",
    content: "",
    author: "페이플러스",
  })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // ===========================
  // 핸들러 함수
  // ===========================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isNotice: e.target.checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      // 모든 필드 trim 처리
      const trimmedData = {
        isNotice: formData.isNotice,
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: formData.author.trim(),
      }

      // 필수 필드 검증
      if (!trimmedData.title) throw new Error("제목은 필수입니다.")
      if (!trimmedData.content) throw new Error("내용은 필수입니다.")
      if (!trimmedData.author) throw new Error("작성자는 필수입니다.")

      // API 호출
      await noticesApi.create(trimmedData)
      alert("공지사항이 등록되었습니다.")
      router.push("/notice/list")
    } catch (err: any) {
      setError(err.message || "공지사항 등록 중 오류가 발생했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (confirm("작성 중인 내용이 사라집니다. 목록으로 이동하시겠습니까?")) {
      router.push("/notice/list")
    }
  }

  // ===========================
  // 렌더링
  // ===========================
  return (
    <div className="space-y-4">
      {/* 메뉴 Path */}
      <div className="text-xl text-gray-600">
        <span>게시판 관리</span>
        <span className="mx-2">{">"}</span>
        <span className="font-semibold text-gray-800">공지사항 등록</span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* 에러 메시지 */}
        {error && (
          <div className="rounded border border-red-200 bg-red-50 text-red-700 text-sm p-3 mb-4">
            {error}
          </div>
        )}

        {/* 공지사항 입력 폼 */}
        <div className="bg-[#f7f7f7] border border-gray-300">
          <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2.5">공지사항</div>
          <div className="p-3 space-y-3">
            {/* 공지여부 */}
            <div>
              <div className="flex items-center gap-2 h-8">
                <input
                  type="checkbox"
                  id="isNotice"
                  name="isNotice"
                  checked={formData.isNotice}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4"
                />
                <Label htmlFor="isNotice" className="text-xs cursor-pointer">
                  공지
                </Label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                체크하면 목록 상단에 공지로 표시됩니다.
              </p>
            </div>

            {/* 작성자 */}
            <div>
              <Label className="text-xs">
                작성자 <span className="text-red-500">*</span>
              </Label>
              <Input
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="h-8 text-xs"
                placeholder="페이플러스센터"
              />
            </div>

            {/* 제목 */}
            <div>
              <Label className="text-xs">
                제목 <span className="text-red-500">*</span>
              </Label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="h-8 text-xs"
                placeholder="제목"
              />
            </div>

            {/* 내용 */}
            <div>
              <Label className="text-xs">
                내용 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="min-h-[400px] text-xs"
                placeholder="내용"
              />
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-center gap-2 mt-4">
          <Button
            type="submit"
            className="h-8 px-6 text-sm bg-blue-600 hover:bg-blue-700 text-white"
            disabled={submitting}
          >
            {submitting ? "저장 중..." : "저장하기"}
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            className="h-8 px-4 text-sm border-gray-400 hover:bg-gray-100"
          >
            목록으로
          </Button>
        </div>
      </form>
    </div>
  )
}
