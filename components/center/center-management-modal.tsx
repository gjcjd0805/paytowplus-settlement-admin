"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { centersApi } from "@/lib/api"
import type { CenterDetail, CenterCreateRequest, CenterUpdateRequest } from "@/lib/api/types"
import { Plus, Edit, RefreshCw } from "lucide-react"
import Image from "next/image"

interface CenterManagementModalProps {
  open: boolean
  onClose: () => void
}

type ViewMode = 'list' | 'create' | 'edit'

// PG 옵션 (추후 확장 가능)
const PG_OPTIONS = [
  { value: 'WEROUTE', label: '위루트' },
  // 추후 PG 추가 시 여기에 추가
  // { value: 'NICE', label: '나이스페이' },
  // { value: 'KCP', label: 'KCP' },
] as const

const initialFormData: CenterCreateRequest = {
  centerName: '',
  pg: 'WEROUTE',
  recurringMid: '',
  recurringPayKey: '',
  manualMid: '',
  manualPayKey: '',
  transferFee: 300,
  pgFeeRate: 0,
  centerOwnerName: '',
  centerBizNumber: '',
  centerPhone: '',
  centerAddress: '',
  pgCompanyName: '',
  pgOwnerName: '',
  pgBizNumber: '',
  pgPhone: '',
  pgAddress: '',
}

export function CenterManagementModal({ open, onClose }: CenterManagementModalProps) {
  const [centers, setCenters] = useState<CenterDetail[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedCenter, setSelectedCenter] = useState<CenterDetail | null>(null)
  const [formData, setFormData] = useState<CenterCreateRequest>(initialFormData)
  const [error, setError] = useState<string | null>(null)

  // TOTP 관련 상태
  const [totpEnabled, setTotpEnabled] = useState(false)

  useEffect(() => {
    if (open) {
      loadCenters()
      setViewMode('list')
      setSelectedCenter(null)
      setFormData(initialFormData)
      setError(null)
      setTotpEnabled(false)
    }
  }, [open])

  const loadCenters = async () => {
    setIsLoading(true)
    try {
      const response = await centersApi.findAllDetail()
      setCenters(response.data?.centers || [])
    } catch (err: any) {
      console.error("센터 목록 조회 오류:", err)
      setError(err.response?.data?.message || "센터 목록을 불러오는데 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setViewMode('create')
    setFormData(initialFormData)
    setSelectedCenter(null)
    setError(null)
    setTotpEnabled(false)
  }

  const handleEdit = (center: CenterDetail) => {
    setSelectedCenter(center)
    setTotpEnabled(center.isTotpEnabled)

    setFormData({
      centerName: center.centerName,
      pg: center.pg,
      recurringMid: center.recurringMid,
      recurringPayKey: center.recurringPayKey,
      manualMid: center.manualMid,
      manualPayKey: center.manualPayKey,
      transferFee: center.transferFee,
      pgFeeRate: center.pgFeeRate,
      werouteSamwCode: center.werouteSamwCode || '',
      werouteSamwApiKey: center.werouteSamwApiKey || '',
      werouteSamwEncKey: center.werouteSamwEncKey || '',
      werouteSamwIv: center.werouteSamwIv || '',
      werouteSamwUserName: center.werouteSamwUserName || '',
      werouteSamwUserPw: center.werouteSamwUserPw || '',
      d1RecurringMid: center.d1RecurringMid || '',
      d1RecurringPayKey: center.d1RecurringPayKey || '',
      d1ManualMid: center.d1ManualMid || '',
      d1ManualPayKey: center.d1ManualPayKey || '',
      d1PgFeeRate: center.d1PgFeeRate || 0,
      d1WerouteSamwCode: center.d1WerouteSamwCode || '',
      d1WerouteSamwApiKey: center.d1WerouteSamwApiKey || '',
      d1WerouteSamwEncKey: center.d1WerouteSamwEncKey || '',
      d1WerouteSamwIv: center.d1WerouteSamwIv || '',
      d1WerouteSamwUserName: center.d1WerouteSamwUserName || '',
      d1WerouteSamwUserPw: center.d1WerouteSamwUserPw || '',
      centerOwnerName: center.centerOwnerName,
      centerBizNumber: center.centerBizNumber,
      centerPhone: center.centerPhone,
      centerAddress: center.centerAddress,
      pgCompanyName: center.pgCompanyName,
      pgOwnerName: center.pgOwnerName,
      pgBizNumber: center.pgBizNumber,
      pgPhone: center.pgPhone,
      pgAddress: center.pgAddress,
    })
    setViewMode('edit')
    setError(null)
  }

  const handleBack = () => {
    setViewMode('list')
    setSelectedCenter(null)
    setFormData(initialFormData)
    setError(null)
    setTotpEnabled(false)
  }

  // 센터 정보 새로고침 (QR 코드 갱신용)
  const handleRefreshCenter = async () => {
    if (!selectedCenter) return
    setIsLoading(true)
    try {
      const response = await centersApi.findAllDetail()
      const updatedCenter = response.data?.centers?.find(c => c.centerId === selectedCenter.centerId)
      if (updatedCenter) {
        setSelectedCenter(updatedCenter)
      }
    } catch (err: any) {
      console.error("센터 정보 새로고침 오류:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
    }))
  }

  const handleSubmit = async () => {
    // 필수 필드 검증
    if (!formData.centerName.trim()) {
      setError('센터명은 필수입니다.')
      return
    }
    if (!formData.recurringMid.trim() || !formData.recurringPayKey.trim()) {
      setError('D+0 정기결제 MID/결제키는 필수입니다.')
      return
    }
    if (!formData.manualMid.trim() || !formData.manualPayKey.trim()) {
      setError('D+0 수기결제 MID/결제키는 필수입니다.')
      return
    }
    if (!formData.centerOwnerName.trim() || !formData.centerBizNumber.trim()) {
      setError('센터 대표자명과 사업자등록번호는 필수입니다.')
      return
    }
    if (!formData.pgCompanyName.trim() || !formData.pgOwnerName.trim()) {
      setError('PG 회사명과 대표자명은 필수입니다.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      if (viewMode === 'create') {
        await centersApi.create(formData)
        alert('센터가 등록되었습니다.')
      } else if (viewMode === 'edit' && selectedCenter) {
        const updateData: CenterUpdateRequest = {
          ...formData,
          isTotpEnabled: totpEnabled
        }
        await centersApi.update(selectedCenter.centerId, updateData)
        alert('센터가 수정되었습니다.')
      }
      await loadCenters()
      handleBack()
    } catch (err: any) {
      console.error("센터 저장 오류:", err)
      setError(err.response?.data?.message || "센터 저장에 실패했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ko-KR')
  }

  const renderList = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-600">총 {centers.length}개</span>
        <Button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs"
        >
          <Plus className="w-4 h-4 mr-1" />
          센터 등록
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-gray-500">로딩 중...</div>
      ) : centers.length === 0 ? (
        <div className="text-center py-10 text-gray-500">등록된 센터가 없습니다.</div>
      ) : (
        <div className="border border-gray-300 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#5F7C94] text-white">
              <tr>
                <th className="px-3 py-2 text-left">NO</th>
                <th className="px-3 py-2 text-left">센터명</th>
                <th className="px-3 py-2 text-left">대표자</th>
                <th className="px-3 py-2 text-left">전화번호</th>
                <th className="px-3 py-2 text-center">TOTP</th>
                <th className="px-3 py-2 text-left">등록일</th>
                <th className="px-3 py-2 text-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {centers.map((center, index) => (
                <tr key={center.centerId} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2 font-medium">{center.centerName}</td>
                  <td className="px-3 py-2">{center.centerOwnerName}</td>
                  <td className="px-3 py-2">{center.centerPhone}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs ${center.isTotpEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {center.isTotpEnabled ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-3 py-2">{formatDate(center.createdDt)}</td>
                  <td className="px-3 py-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(center)}
                      className="h-7 px-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )

  const renderForm = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 text-red-700 text-sm p-3">
          {error}
        </div>
      )}

      {/* 기본 정보 */}
      <div className="bg-[#f7f7f7] border border-gray-300 rounded">
        <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2">기본 정보</div>
        <div className="p-3 grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">센터명 <span className="text-red-500">*</span></Label>
            <Input name="centerName" value={formData.centerName} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">PG <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-4 mt-2">
              {PG_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pg"
                    value={option.value}
                    checked={formData.pg === option.value}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <span className="text-xs">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 센터 정보 */}
      <div className="bg-[#f7f7f7] border border-gray-300 rounded">
        <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2">센터 정보</div>
        <div className="p-3 grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">대표자명 <span className="text-red-500">*</span></Label>
            <Input name="centerOwnerName" value={formData.centerOwnerName} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">사업자등록번호 <span className="text-red-500">*</span></Label>
            <Input name="centerBizNumber" value={formData.centerBizNumber} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">전화번호 <span className="text-red-500">*</span></Label>
            <Input name="centerPhone" value={formData.centerPhone} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">주소 <span className="text-red-500">*</span></Label>
            <Input name="centerAddress" value={formData.centerAddress} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
        </div>
      </div>

      {/* PG 정보 */}
      <div className="bg-[#f7f7f7] border border-gray-300 rounded">
        <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2">PG 정보</div>
        <div className="p-3 grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">PG 회사명 <span className="text-red-500">*</span></Label>
            <Input name="pgCompanyName" value={formData.pgCompanyName} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">PG 대표자명 <span className="text-red-500">*</span></Label>
            <Input name="pgOwnerName" value={formData.pgOwnerName} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">PG 사업자등록번호 <span className="text-red-500">*</span></Label>
            <Input name="pgBizNumber" value={formData.pgBizNumber} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">PG 전화번호 <span className="text-red-500">*</span></Label>
            <Input name="pgPhone" value={formData.pgPhone} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div className="col-span-2">
            <Label className="text-xs">PG 주소 <span className="text-red-500">*</span></Label>
            <Input name="pgAddress" value={formData.pgAddress} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
        </div>
      </div>

      {/* D+0 결제 설정 */}
      <div className="bg-[#f7f7f7] border border-gray-300 rounded">
        <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2">D+0 결제 설정</div>
        <div className="p-3 grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">정기결제 MID <span className="text-red-500">*</span></Label>
            <Input name="recurringMid" value={formData.recurringMid} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">정기결제 결제키 <span className="text-red-500">*</span></Label>
            <Input name="recurringPayKey" value={formData.recurringPayKey} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">수기결제 MID <span className="text-red-500">*</span></Label>
            <Input name="manualMid" value={formData.manualMid} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">수기결제 결제키 <span className="text-red-500">*</span></Label>
            <Input name="manualPayKey" value={formData.manualPayKey} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">PG 수수료율 (%)</Label>
            <Input name="pgFeeRate" type="number" step="0.01" value={formData.pgFeeRate} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
        </div>
      </div>

      {/* D+0 Samw 설정 */}
      <div className="bg-[#f7f7f7] border border-gray-300 rounded">
        <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2">D+0 Samw 설정</div>
        <div className="p-3 grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Samw 코드</Label>
            <Input name="werouteSamwCode" value={formData.werouteSamwCode || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">Samw API Key</Label>
            <Input name="werouteSamwApiKey" value={formData.werouteSamwApiKey || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">Samw Enc Key</Label>
            <Input name="werouteSamwEncKey" value={formData.werouteSamwEncKey || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">Samw IV</Label>
            <Input name="werouteSamwIv" value={formData.werouteSamwIv || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">Samw 유저명</Label>
            <Input name="werouteSamwUserName" value={formData.werouteSamwUserName || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">Samw 유저 비밀번호</Label>
            <Input name="werouteSamwUserPw" type="password" value={formData.werouteSamwUserPw || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
        </div>
      </div>

      {/* D+1 결제 설정 */}
      <div className="bg-[#f7f7f7] border border-gray-300 rounded">
        <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2">D+1 결제 설정 (선택)</div>
        <div className="p-3 grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">정기결제 MID</Label>
            <Input name="d1RecurringMid" value={formData.d1RecurringMid || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">정기결제 결제키</Label>
            <Input name="d1RecurringPayKey" value={formData.d1RecurringPayKey || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">수기결제 MID</Label>
            <Input name="d1ManualMid" value={formData.d1ManualMid || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">수기결제 결제키</Label>
            <Input name="d1ManualPayKey" value={formData.d1ManualPayKey || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">PG 수수료율 (%)</Label>
            <Input name="d1PgFeeRate" type="number" step="0.01" value={formData.d1PgFeeRate || 0} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
        </div>
      </div>

      {/* D+1 Samw 설정 */}
      <div className="bg-[#f7f7f7] border border-gray-300 rounded">
        <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2">D+1 Samw 설정 (선택)</div>
        <div className="p-3 grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Samw 코드</Label>
            <Input name="d1WerouteSamwCode" value={formData.d1WerouteSamwCode || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">Samw API Key</Label>
            <Input name="d1WerouteSamwApiKey" value={formData.d1WerouteSamwApiKey || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">Samw Enc Key</Label>
            <Input name="d1WerouteSamwEncKey" value={formData.d1WerouteSamwEncKey || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">Samw IV</Label>
            <Input name="d1WerouteSamwIv" value={formData.d1WerouteSamwIv || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">Samw 유저명</Label>
            <Input name="d1WerouteSamwUserName" value={formData.d1WerouteSamwUserName || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
          <div>
            <Label className="text-xs">Samw 유저 비밀번호</Label>
            <Input name="d1WerouteSamwUserPw" type="password" value={formData.d1WerouteSamwUserPw || ''} onChange={handleChange} className="h-8 text-xs mt-1" />
          </div>
        </div>
      </div>

      {/* TOTP 설정 (수정 모드에서만) */}
      {viewMode === 'edit' && selectedCenter && (
        <div className="bg-[#f7f7f7] border border-gray-300 rounded">
          <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2">TOTP 설정</div>
          <div className="p-4 flex items-start gap-6">
            {/* QR 코드 */}
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 border border-gray-300 rounded flex items-center justify-center bg-white">
                {isLoading ? (
                  <div className="text-gray-400 text-sm">로딩...</div>
                ) : selectedCenter.totpQrCodeUrl ? (
                  <Image
                    src={selectedCenter.totpQrCodeUrl}
                    alt="TOTP QR Code"
                    width={176}
                    height={176}
                    className="w-44 h-44"
                    unoptimized
                  />
                ) : (
                  <div className="text-gray-400 text-sm">QR 코드 없음</div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshCenter}
                disabled={isLoading}
                className="mt-2 h-7 text-xs px-3"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                새로고침
              </Button>
            </div>

            {/* 설명 및 토글 */}
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">TOTP 인증</p>
                <p className="text-xs text-gray-500">
                  Google Authenticator, Microsoft Authenticator 등의 앱으로<br />
                  QR 코드를 스캔하여 2단계 인증을 설정할 수 있습니다.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={totpEnabled}
                  onCheckedChange={setTotpEnabled}
                  id="totp-toggle"
                />
                <Label htmlFor="totp-toggle" className="text-sm cursor-pointer">
                  {totpEnabled ? 'TOTP 활성화됨' : 'TOTP 비활성화됨'}
                </Label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="bg-[#5F7C94] text-white px-4 py-3 -mx-6 -mt-6 mb-4">
          <DialogTitle className="text-lg font-medium">
            {viewMode === 'list' && '센터 관리'}
            {viewMode === 'create' && '센터 등록'}
            {viewMode === 'edit' && '센터 수정'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {viewMode === 'list' ? renderList() : renderForm()}
        </div>

        <DialogFooter className="mt-4 pt-4 border-t">
          {viewMode === 'list' ? (
            <Button variant="outline" onClick={onClose} className="h-8 px-4 text-xs">
              닫기
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-4 text-xs"
                disabled={submitting}
              >
                {submitting ? '저장 중...' : '저장'}
              </Button>
              <Button variant="outline" onClick={handleBack} className="h-8 px-4 text-xs" disabled={submitting}>
                취소
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
