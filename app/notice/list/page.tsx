"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/common/data-table"
import { Pagination } from "@/components/common/pagination"
import { LoadingModal } from "@/components/common/loading-modal"
import { NoticeDetailModal } from "@/components/notice/notice-detail-modal"
import { noticesApi, type Notice } from "@/lib/api"
import { useAppContext } from "@/contexts/app-context"

export default function NoticeListPage() {
  const router = useRouter()
  const { user } = useAppContext()

  // 본사(level 0)만 삭제 가능
  const isHeadquarters = user?.level === 0

  // ===========================
  // 상태 관리
  // ===========================
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(15)

  // 검색 조건
  const [searchType, setSearchType] = useState<"title" | "content">("title")
  const [searchKeyword, setSearchKeyword] = useState("")

  // 모달 상태
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null)

  // ===========================
  // 데이터 로드
  // ===========================
  const loadNotices = async () => {
    setIsLoading(true)
    try {
      const params: any = {
        page: currentPage,
        size: pageSize,
        sort: "id,desc",
      }

      // 검색 조건 추가
      if (searchKeyword) {
        // searchType에 따라 title 또는 content 파라미터 전달
        params[searchType] = searchKeyword
      }

      const response = await noticesApi.findAll(params)

      if (response.data) {
        setNotices(response.data.notices || [])
        setTotalPages(response.data.totalPages || 0)
        setTotalElements(response.data.totalElements || 0)
      }
    } catch (error) {
      console.error("공지사항 목록 조회 오류:", error)
      alert("데이터를 불러오는데 실패했습니다.")
      setNotices([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadNotices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize])

  // ===========================
  // 검색 핸들러
  // ===========================
  const handleSearch = () => {
    setCurrentPage(0)
    loadNotices()
  }

  const handleReset = () => {
    setSearchType("title")
    setSearchKeyword("")
    setCurrentPage(0)
    loadNotices()
  }

  // ===========================
  // 테이블 컬럼 정의
  // ===========================
  const columns = useMemo(() => {
    const baseColumns: any[] = [
      {
        key: "id",
        header: "NO",
        width: "60",
        align: "center" as const,
        render: (row: Notice, index: number) => totalElements - (currentPage * pageSize + index),
      },
      {
        key: "title",
        header: "제목",
        width: "400",
        align: "left" as const,
        render: (row: Notice) => (
          <div
            className="cursor-pointer hover:underline text-blue-600"
            onClick={() => handleViewNotice(row.id)}
          >
            {row.isNotice ? <strong>[공지] {row.title}</strong> : row.title}
          </div>
        ),
      },
      {
        key: "author",
        header: "작성자",
        width: "120",
        align: "center" as const,
        render: (row: Notice) => row.author,
      },
      {
        key: "registDt",
        header: "작성일시",
        width: "150",
        align: "center" as const,
        render: (row: Notice) => formatDateTime(row.registDt),
      },
      {
        key: "viewCount",
        header: "조회수",
        width: "80",
        align: "center" as const,
        render: (row: Notice) => row.viewCount,
      },
    ]

    // 본사(level 0)만 삭제 컬럼 추가
    if (isHeadquarters) {
      baseColumns.push({
        key: "actions",
        header: "삭제",
        width: "80",
        align: "center" as const,
        render: (row: Notice) => (
          <Button
            onClick={() => handleDeleteNotice(row.id)}
            className="h-7 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
          >
            삭제
          </Button>
        ),
      })
    }

    return baseColumns
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalElements, currentPage, pageSize, isHeadquarters])

  // ===========================
  // 날짜 포맷 함수
  // ===========================
  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return ""
    const date = new Date(dateTimeStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // ===========================
  // 핸들러 함수
  // ===========================
  const handleViewNotice = (noticeId: number) => {
    setSelectedNoticeId(noticeId)
    setDetailModalOpen(true)
  }

  const handleDeleteNotice = async (noticeId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return

    try {
      await noticesApi.remove(noticeId)
      alert("공지사항이 삭제되었습니다.")
      loadNotices()
    } catch (error) {
      console.error("공지사항 삭제 오류:", error)
      alert("공지사항 삭제에 실패했습니다.")
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
        <span className="font-semibold text-gray-800">공지사항</span>
      </div>

      {/* 검색 영역 */}
      <div className="bg-white border border-gray-300 w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#5F7C94] text-white text-sm font-medium">
              <th className="border-r border-white px-3 py-2.5 min-w-[200px]">검색조건</th>
              <th className="border-r border-white px-3 py-2.5 min-w-[400px]">검색어</th>
              <th className="px-3 py-2.5 min-w-[200px]">검색</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                    <input
                      type="radio"
                      name="searchType"
                      value="title"
                      checked={searchType === "title"}
                      onChange={(e) => setSearchType(e.target.value as "title" | "content")}
                      className="w-3.5 h-3.5"
                    />
                    <span className="text-gray-700">제목</span>
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer whitespace-nowrap">
                    <input
                      type="radio"
                      name="searchType"
                      value="content"
                      checked={searchType === "content"}
                      onChange={(e) => setSearchType(e.target.value as "title" | "content")}
                      className="w-3.5 h-3.5"
                    />
                    <span className="text-gray-700">내용</span>
                  </label>
                </div>
              </td>
              <td className="border-r border-gray-300 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="검색어 입력"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded h-7"
                  />
                </div>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-7 text-xs"
                  >
                    검색
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="px-4 h-7 text-xs border-gray-400"
                  >
                    초기화
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 데이터 건수 및 등록 버튼 */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="text-sm text-gray-700 flex items-center gap-1">
          <span>전체</span>
          <span className="font-semibold text-blue-600">{totalElements}</span>
          <span>건</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setCurrentPage(0)
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded bg-white"
          >
            <option value={10}>10건</option>
            <option value={15}>15건</option>
            <option value={30}>30건</option>
            <option value={50}>50건</option>
            <option value={100}>100건</option>
          </select>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <DataTable columns={columns} data={notices} emptyMessage="검색 결과가 없습니다." />

      {/* 페이지네이션 */}
      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage + 1}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page - 1)}
        />
      )}

      {/* 로딩 모달 */}
      <LoadingModal isOpen={isLoading} />

      {/* 상세보기 모달 */}
      <NoticeDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedNoticeId(null)
        }}
        noticeId={selectedNoticeId}
        onUpdate={() => {
          loadNotices()
        }}
      />
    </div>
  )
}
