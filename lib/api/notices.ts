/**
 * 공지사항 관리 API
 */

import { apiClient } from "./client"
import type {
  ApiResponse,
  Notice,
  NoticeListParams,
  NoticeListResponse,
  NoticeCreateRequest,
  NoticeUpdateRequest,
} from "./types"

// ===========================
// 공지사항 API 함수
// ===========================

/**
 * 공지사항 목록 조회
 */
export const findAll = async (params: NoticeListParams): Promise<ApiResponse<NoticeListResponse>> => {
  return apiClient.get("/settlement-notices", { params })
}

/**
 * 공지사항 단건 조회
 */
export const findById = async (noticeId: number): Promise<ApiResponse<Notice>> => {
  return apiClient.get(`/settlement-notices/${noticeId}`)
}

/**
 * 공지사항 등록
 */
export const create = async (data: NoticeCreateRequest): Promise<ApiResponse<Notice>> => {
  return apiClient.post("/settlement-notices", data)
}

/**
 * 공지사항 수정
 */
export const update = async (noticeId: number, data: NoticeUpdateRequest): Promise<ApiResponse<Notice>> => {
  return apiClient.put(`/settlement-notices/${noticeId}`, data)
}

/**
 * 공지사항 삭제
 */
export const remove = async (noticeId: number): Promise<ApiResponse<null>> => {
  return apiClient.delete(`/settlement-notices/${noticeId}`)
}

/**
 * 공지사항 API 객체
 */
export const noticesApi = {
  findAll,
  findById,
  create,
  update,
  remove,
}
