# 다배달 정산 관리자 개발 가이드

이 문서는 다배달 정산 관리자 프로젝트의 개발 규칙 및 가이드라인을 제공합니다.

## 프로젝트 정보

- **프로젝트명**: 다배달 정산 관리자 시스템
- **기술 스택**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **기본 포트**: 3100
- **마지막 업데이트**: 2025-12-05

## 목차

1. [프로젝트 구조](#프로젝트-구조)
2. [커스텀 훅](#커스텀-훅)
3. [API 사용 규칙](#api-사용-규칙)
4. [상수 및 Enum 관리](#상수-및-enum-관리)
5. [화면 구현 규칙](#화면-구현-규칙)
6. [공통 컴포넌트](#공통-컴포넌트)
7. [상태 관리](#상태-관리)
8. [코딩 컨벤션](#코딩-컨벤션)

---

# 프로젝트 구조

## 디렉토리 구조

```
dabaedal-settlement_admin/
├── app/                          # Next.js App Router 페이지
│   ├── api/                      # BFF API Routes (백엔드 프록시)
│   │   ├── auth/                 # 인증 API
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── verify/route.ts
│   │   └── [...path]/route.ts    # 동적 프록시
│   ├── company/                  # 업체 관리
│   │   ├── list/page.tsx
│   │   ├── register/page.tsx
│   │   ├── edit/[id]/page.tsx
│   │   ├── detail/[id]/page.tsx
│   │   └── commission/page.tsx
│   ├── merchant/                 # 가맹점 관리
│   │   ├── list/page.tsx
│   │   ├── register/page.tsx
│   │   └── edit/[id]/page.tsx
│   ├── terminal/                 # 터미널 관리
│   │   ├── list/page.tsx
│   │   ├── register/page.tsx
│   │   └── edit/[id]/page.tsx
│   ├── payment/                  # 결제 관리
│   │   ├── list/page.tsx
│   │   ├── simple/page.tsx
│   │   ├── deferred/page.tsx
│   │   ├── unregistered/page.tsx
│   │   └── receipt/page.tsx
│   ├── settlement/               # 정산 관리
│   │   ├── amount/page.tsx
│   │   ├── amount/branch/page.tsx
│   │   ├── amount/distributor/page.tsx
│   │   ├── amount/agent/page.tsx
│   │   ├── hierarchical/page.tsx
│   │   ├── hierarchical/detail/page.tsx
│   │   └── merchant/
│   │       ├── daily/page.tsx
│   │       ├── period/page.tsx
│   │       └── sales/page.tsx
│   ├── notice/                   # 공지사항 관리
│   │   ├── list/page.tsx
│   │   └── register/page.tsx
│   └── login/page.tsx
├── components/
│   ├── common/                   # 공통 컴포넌트
│   │   ├── data-table.tsx
│   │   ├── pagination.tsx
│   │   ├── loading-modal.tsx
│   │   ├── full-screen-loading.tsx  # 전체 화면 로딩 (페이지 전환용)
│   │   ├── data-count-page-size.tsx
│   │   ├── search-section.tsx
│   │   ├── center-select.tsx
│   │   ├── payment-purpose-select.tsx
│   │   └── index.ts
│   ├── layout/                   # 레이아웃 컴포넌트
│   │   ├── app-shell.tsx
│   │   ├── header.tsx
│   │   └── sidebar.tsx
│   ├── ui/                       # shadcn/ui 컴포넌트
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── dialog.tsx
│   │   └── switch.tsx
│   ├── center/                   # 센터 관련 컴포넌트
│   │   └── center-management-modal.tsx
│   ├── company/                  # 업체 관련 컴포넌트
│   │   ├── company-code-search-modal.tsx
│   │   └── commission-history-modal.tsx
│   ├── merchant/                 # 가맹점 관련 컴포넌트
│   │   └── merchant-code-search-modal.tsx
│   ├── commission/               # 수수료 관련 컴포넌트
│   │   └── commission-history-modal.tsx
│   ├── notice/                   # 공지사항 관련 컴포넌트
│   │   └── notice-detail-modal.tsx
│   ├── settlement/               # 정산 관련 컴포넌트
│   │   └── hierarchical-statistics-modal.tsx
│   └── providers/                # Provider 컴포넌트
│       └── theme-provider.tsx
├── hooks/                        # 커스텀 훅
│   ├── index.ts
│   ├── useApiError.ts
│   ├── useSearchState.ts
│   ├── useListData.ts
│   └── useDateTabHandler.ts
├── lib/
│   ├── api/                      # API 클라이언트
│   │   ├── client.ts
│   │   ├── types.ts
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── centers.ts
│   │   ├── users.ts
│   │   ├── companies.ts
│   │   ├── merchants.ts
│   │   ├── terminals.ts
│   │   ├── commissions.ts
│   │   ├── payments.ts
│   │   ├── settlements.ts
│   │   ├── sales.ts
│   │   ├── notices.ts
│   │   └── totp.ts
│   ├── constants.ts              # 상수 정의
│   ├── constants/                # 상수 모듈
│   │   └── banks.ts
│   ├── enums.ts                  # Enum 및 Helper
│   ├── utils.ts                  # 유틸리티 함수
│   └── utils/
│       ├── auth.ts
│       ├── dateUtils.ts
│       └── jwt.ts
├── types/                        # 타입 정의
│   ├── index.ts
│   ├── company.ts
│   ├── merchant.ts
│   ├── terminal.ts
│   ├── payment.ts
│   └── notice.ts
└── contexts/                     # React Context
    └── app-context.tsx
```

## 구현된 화면 목록

### 업체 관리 (company)
- `/company/list` - 업체 목록 조회
- `/company/register` - 업체 등록
- `/company/edit/[id]` - 업체 수정
- `/company/detail/[id]` - 업체 상세 (비관리자용)
- `/company/commission` - 업체 수수료율 관리

### 가맹점 관리 (merchant)
- `/merchant/list` - 가맹점 목록 조회
- `/merchant/register` - 가맹점 등록
- `/merchant/edit/[id]` - 가맹점 수정

### 터미널 관리 (terminal)
- `/terminal/list` - 터미널 목록 조회
- `/terminal/register` - 터미널 등록
- `/terminal/edit/[id]` - 터미널 수정

### 결제 관리 (payment)
- `/payment/list` - 결제 목록 조회
- `/payment/simple` - 간편결제 목록
- `/payment/deferred` - 후불결제 목록
- `/payment/unregistered` - 단말기미등록 결제내역 처리
- `/payment/receipt` - 결제 전표 조회

### 정산 관리 (settlement)
- `/settlement/amount` - 업체 정산금액 조회 (지사별 통계)
- `/settlement/amount/branch` - 지사별 정산금액 상세
- `/settlement/amount/distributor` - 총판별 정산금액 상세
- `/settlement/amount/agent` - 대리점별 정산금액 상세
- `/settlement/hierarchical` - 계층별 정산 조회
- `/settlement/hierarchical/detail` - 계층별 정산 상세
- `/settlement/merchant/daily` - 가맹점별 일정산
- `/settlement/merchant/period` - 가맹점별 기간정산
- `/settlement/merchant/sales` - 가맹점별 거래내역조회

### 게시판 관리 (notice)
- `/notice/list` - 공지사항 목록
- `/notice/register` - 공지사항 등록

---

# 커스텀 훅

## 훅 사용 원칙

목록 페이지에서는 반드시 커스텀 훅을 사용하여 코드 중복을 방지합니다.

```typescript
import { useSearchState, useApiError, useListData } from "@/hooks"
```

## useSearchState

검색 상태를 관리하는 훅입니다.

```typescript
import { useSearchState } from "@/hooks"
import type { CompanySearchConditionValue } from "@/lib/constants"

const {
  state: searchState,      // 검색 상태 객체
  setStartDate,            // 시작일 설정
  setEndDate,              // 종료일 설정
  handleDateTabClick,      // 날짜 탭 클릭 핸들러
  setSearchCondition,      // 검색 조건 설정
  setSearchKeyword,        // 검색어 설정
  setCurrentPage,          // 현재 페이지 설정
  setPageSize,             // 페이지 크기 설정
  handleSearch,            // 검색 실행 (페이지 0으로 리셋)
  handleReset,             // 검색 조건 초기화
} = useSearchState<CompanySearchConditionValue>({
  initialSearchCondition: 'name',
  initialPageSize: 15,
  initializeWithCurrentMonth: false, // 당월 초기화 여부
})

// 검색 상태 객체 구조
interface SearchState<T> {
  startDate: string
  endDate: string
  selectedTab: DateTabType | null
  searchCondition: T
  searchKeyword: string
  currentPage: number
  pageSize: number
}
```

## useListData

목록 데이터 페칭을 위한 훅입니다.

```typescript
import { useListData } from "@/hooks"
import type { CompanyListItem, CompanyListParams } from "@/lib/api/types"

const {
  data: companies,      // 목록 데이터
  isLoading,            // 로딩 상태
  totalPages,           // 전체 페이지 수
  totalElements,        // 전체 데이터 수
  loadData,             // 데이터 로드 함수
  resetData,            // 데이터 초기화
} = useListData<CompanyListItem, CompanyListParams>({
  fetchFn: companiesApi.findAll,
  dataKey: 'companies',  // API 응답에서 데이터 배열 키
  onError: handleError,
  defaultErrorMessage: '업체 목록을 불러오는데 실패했습니다.',
})
```

## useApiError

API 에러 처리를 위한 훅입니다.

```typescript
import { useApiError } from "@/hooks"

const { error, setError, clearError, handleError, showAlert } = useApiError()

// API 호출 시 에러 처리
try {
  await someApi.call()
} catch (err) {
  handleError(err, '데이터를 불러오는데 실패했습니다.')
}
```

## 목록 페이지 구현 패턴 (권장)

```typescript
"use client"

import { useEffect, useCallback, useState } from "react"
import { companiesApi } from "@/lib/api"
import { useSearchState, useApiError, useListData } from "@/hooks"
import { DATE_TABS, COMPANY_SEARCH_CONDITIONS, type CompanySearchConditionValue } from "@/lib/constants"
import type { CompanyListItem, CompanyListParams } from "@/lib/api/types"

export default function CompanyListPage() {
  // 커스텀 훅 사용
  const { handleError } = useApiError()

  const {
    state: searchState,
    setStartDate,
    setEndDate,
    handleDateTabClick,
    setSearchCondition,
    setSearchKeyword,
    setCurrentPage,
    setPageSize,
    handleSearch: triggerSearch,
    handleReset: resetSearch,
  } = useSearchState<CompanySearchConditionValue>({
    initialSearchCondition: 'name',
    initialPageSize: 15,
  })

  const {
    data: companies,
    isLoading,
    totalPages,
    totalElements,
    loadData,
  } = useListData<CompanyListItem, CompanyListParams>({
    fetchFn: companiesApi.findAll,
    dataKey: 'companies',
    onError: handleError,
    defaultErrorMessage: '업체 목록을 불러오는데 실패했습니다.',
  })

  const centerId = getCenterId()

  // ⚠️ 중요: useCallback 의존성 배열 규칙
  // - searchState 전체 객체 대신 개별 속성만 포함
  // - 검색 조건(startDate, endDate, searchKeyword)은 의존성에서 제외
  // - 페이지/사이즈 변경 시에만 자동 호출되도록 설정
  const loadCompanies = useCallback(async () => {
    if (!centerId) return

    const params: CompanyListParams = {
      centerId,
      page: searchState.currentPage,
      size: searchState.pageSize,
    }

    // 검색 조건 추가 (의존성 배열에는 포함하지 않음)
    if (searchState.startDate) params.registDateFrom = searchState.startDate
    if (searchState.endDate) params.registDateTo = searchState.endDate
    if (searchState.searchKeyword) {
      params[searchState.searchCondition] = searchState.searchKeyword
    }

    await loadData(params)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId, searchState.currentPage, searchState.pageSize])

  useEffect(() => {
    loadCompanies()
  }, [loadCompanies])

  const handleSearch = () => {
    triggerSearch()
    loadCompanies()
  }

  const handleReset = () => {
    resetSearch()
    loadCompanies()
  }

  // ... 컬럼 정의 및 렌더링
}
```

---

# API 사용 규칙

## API 클라이언트 구조

```
lib/api/
├── client.ts          # Axios 인스턴스 및 토큰 관리
├── types.ts           # 모든 타입 정의
├── auth.ts            # 인증 API
├── users.ts           # 사용자 관리 API
├── companies.ts       # 업체 API
├── merchants.ts       # 가맹점 API
├── terminals.ts       # 터미널 API
├── commissions.ts     # 수수료 API
├── payments.ts        # 결제 API
├── settlements.ts     # 정산 API
├── sales.ts           # 매출 API
├── notices.ts         # 공지사항 API
├── centers.ts         # 센터 API
├── totp.ts            # TOTP API
└── index.ts           # 통합 export
```

## API 사용 방법

```typescript
// 개별 import (권장)
import { companiesApi, merchantsApi, authApi, tokenManager } from '@/lib/api'

// 통합 객체 사용
import { api } from '@/lib/api'
await api.companies.findAll({ centerId: 1 })
```

## BFF 패턴 (Backend For Frontend)

클라이언트는 Next.js API Route(`/api/*`)를 통해 백엔드와 통신합니다.

```
클라이언트 → /api/* → Next.js API Route → 백엔드 서버
```

- JWT 토큰은 **httpOnly 쿠키**로 관리 (XSS 방지)
- 클라이언트에서 토큰에 직접 접근 불가
- API Route에서 쿠키를 읽어 백엔드로 전달

## 토큰 관리

```typescript
import { tokenManager } from '@/lib/api'

// 토큰 유효성 확인 (서버 API 호출)
const isValid = await tokenManager.verify()

// ⚠️ 아래 메서드는 deprecated (httpOnly 쿠키 사용으로 더 이상 사용하지 않음)
tokenManager.get()     // deprecated - 항상 null 반환
tokenManager.set()     // deprecated - 아무 동작 없음
tokenManager.remove()  // deprecated - authApi.logout() 사용
```

---

# 상수 및 Enum 관리

## lib/constants.ts

UI에서 사용하는 상수를 정의합니다.

```typescript
import { DATE_TABS, COMPANY_SEARCH_CONDITIONS, CONTRACT_STATUS_OPTIONS } from '@/lib/constants'

// 날짜 탭
export const DATE_TABS = ['오늘', '어제', '3일전', '한달전', '당월'] as const

// 검색 조건
export const COMPANY_SEARCH_CONDITIONS = [
  { label: '업체코드', value: 'companyId' },
  { label: '업체명', value: 'name' },
  // ...
] as const

// 타입 추출
export type CompanySearchConditionValue = (typeof COMPANY_SEARCH_CONDITIONS)[number]['value']

// 스타일 상수
export const TABLE_STYLES = {
  headerBg: 'bg-[#5F7C94]',
  headerText: 'text-white text-sm font-medium',
  // ...
} as const
```

## lib/enums.ts

Enum과 Helper 메서드를 정의합니다.

```typescript
import {
  CompanyLevelHelper,
  BusinessTypeHelper,
  ContractStatusHelper,
  SettlementCycleHelper,
  PaymentPurposeHelper,
  PaymentStatusHelper,
  UserTypeHelper,
  PGCodeHelper,
  BankHelper,
} from '@/lib/enums'
```

### 정의된 Enum 목록

| Enum | 설명 | 값 |
|------|------|------|
| `CompanyLevel` | 업체 레벨 | HEADQUARTERS, BRANCH, DISTRIBUTOR, AGENT, MERCHANT |
| `BusinessType` | 사업자 유형 | NON_BUSINESS, INDIVIDUAL, CORPORATE, OTHER |
| `ContractStatus` | 계약 상태 | APPLIED, ACTIVE, TERMINATED |
| `SettlementCycle` | 정산 주기 | D_PLUS_0 (10M), D_PLUS_1 |
| `PaymentPurpose` | 결제 목적 | DELIVERY_CHARGE, MONTHLY_RENT |
| `PaymentStatus` | 결제 상태 | PENDING, SUCCESS, FAILED, CANCELLED |
| `UserType` | 사용자 유형 | COMPANY, MERCHANT |
| `PGCode` | PG 코드 | ALL, WEROUTE |

### Helper 메서드 패턴

```typescript
// Enum 정의 패턴
export const CompanyLevel = {
  HEADQUARTERS: 'HEADQUARTERS',
  BRANCH: 'BRANCH',
  DISTRIBUTOR: 'DISTRIBUTOR',
  AGENT: 'AGENT',
  MERCHANT: 'MERCHANT',
} as const

export type CompanyLevelType = (typeof CompanyLevel)[keyof typeof CompanyLevel]

export const CompanyLevelLabel: Record<CompanyLevelType, string> = {
  HEADQUARTERS: '본사',
  BRANCH: '지사',
  DISTRIBUTOR: '총판',
  AGENT: '대리점',
  MERCHANT: '가맹점',
}

export const CompanyLevelCode: Record<CompanyLevelType, number> = {
  HEADQUARTERS: 0,
  BRANCH: 1,
  DISTRIBUTOR: 2,
  AGENT: 3,
  MERCHANT: 4,
}

// Helper 메서드
export const CompanyLevelHelper = {
  getLabel: (code: CompanyLevelType): string => CompanyLevelLabel[code] || code,
  getCode: (level: CompanyLevelType): number => CompanyLevelCode[level] ?? -1,
  getLevelByCode: (code: number): CompanyLevelType | null => { ... },
  isValid: (code: string): code is CompanyLevelType => code in CompanyLevel,
  getOptions: () => Object.keys(CompanyLevel).map((key) => ({
    value: key as CompanyLevelType,
    label: CompanyLevelLabel[key as CompanyLevelType],
    code: CompanyLevelCode[key as CompanyLevelType],
  })),
}
```

### 은행 코드 Helper

```typescript
import { BankHelper, BANKS, MAIN_BANKS } from '@/lib/enums'

// 은행 코드로 은행명 조회
BankHelper.getName('004')  // '국민은행'

// 은행명으로 은행 코드 조회
BankHelper.getCode('국민은행')  // '004'

// 유효성 검사
BankHelper.isValid('004')  // true

// 검색
BankHelper.search('국민')  // [{ code: '004', name: '국민은행' }]

// 전체 은행 목록
BankHelper.getOptions()  // BANKS 배열 반환

// 주요 은행 목록 (드롭다운용)
BankHelper.getMainOptions()  // MAIN_BANKS 배열 반환
```

---

# 화면 구현 규칙

## 1. 목록 조회 화면

### 레이아웃 구조

```tsx
<div className="space-y-4">
  {/* 메뉴 Path */}
  <div className="text-sm sm:text-xl text-gray-600">
    <span>업체</span>
    <span className="mx-1 sm:mx-2">{'>'}</span>
    <span className="font-semibold text-gray-800">업체 목록 조회</span>
  </div>

  {/* 모바일 검색 영역 */}
  <div className="lg:hidden bg-white border border-gray-300 p-3">
    {/* 간소화된 검색 UI */}
  </div>

  {/* 데스크톱 검색 영역 */}
  <div className="hidden lg:block bg-white border border-gray-300 w-full overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-[#5F7C94] text-white text-sm font-medium">
          {/* 헤더 */}
        </tr>
      </thead>
      <tbody>
        <tr>
          {/* 검색 입력 필드 */}
        </tr>
      </tbody>
    </table>
  </div>

  {/* 데이터 건수 및 페이지 크기 */}
  <DataCountPageSize
    totalElements={totalElements}
    pageSize={searchState.pageSize}
    onPageSizeChange={setPageSize}
  />

  {/* 데이터 테이블 */}
  <DataTable
    columns={columns}
    data={companies}
    onSort={handleSort}
    sortKey={sortKey}
    sortDirection={sortDirection}
    emptyMessage="검색 결과가 없습니다."
  />

  {/* 페이지네이션 */}
  {totalPages > 0 && (
    <Pagination
      currentPage={searchState.currentPage + 1}
      totalPages={totalPages}
      onPageChange={(page) => setCurrentPage(page - 1)}
    />
  )}

  {/* 로딩 모달 */}
  <LoadingModal isOpen={isLoading} />
</div>
```

### 컬럼 정의

```typescript
const columns = [
  {
    key: "no",
    header: "NO",
    width: "40px",
    align: "center" as const,
    sortable: false,
    render: (_: CompanyListItem, index: number) =>
      searchState.currentPage * searchState.pageSize + index + 1
  },
  {
    key: "name",
    header: "업체명",
    width: "120px",
    align: "left" as const,
    sortable: true,
    render: (row: CompanyListItem) => row.name || ""
  },
  // 조건부 컬럼
  ...(user?.level === 0 ? [{
    key: "password",
    header: "비밀번호",
    width: "80px",
    align: "center" as const,
    render: () => "●●●●●●"  // 마스킹 처리
  }] : []),
]
```

## 2. 등록/수정 화면

### 레이아웃 구조 (2열 그리드)

```tsx
<div className="space-y-4">
  {/* 메뉴 Path */}

  <form onSubmit={handleSubmit}>
    {/* 에러 메시지 */}
    {error && (
      <div className="rounded border border-red-200 bg-red-50 text-red-700 text-sm p-3 mb-4">
        {error}
      </div>
    )}

    {/* 2열 그리드 */}
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-4">
        {/* 섹션들 */}
      </div>
      <div className="space-y-4">
        {/* 섹션들 */}
      </div>
    </div>

    {/* 버튼 영역 */}
    <div className="flex justify-center gap-2 mt-4">
      <Button type="submit" disabled={submitting}>
        {submitting ? "저장 중..." : "등록하기"}
      </Button>
      <Button type="button" variant="outline" onClick={handleCancel}>
        목록으로
      </Button>
    </div>
  </form>
</div>
```

### 섹션 구조

```tsx
<div className="bg-[#f7f7f7] border border-gray-300">
  <div className="bg-[#5F7C94] text-white text-sm font-medium px-3 py-2.5">
    기본정보
  </div>
  <div className="p-3 space-y-2">
    {/* 필드들 */}
  </div>
</div>
```

## 3. 팝업(모달) 화면

```tsx
<Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
    <DialogHeader className="bg-[#5F7C94] text-white px-4 py-3 -mx-6 -mt-6 mb-4">
      <DialogTitle className="text-lg font-medium">팝업 제목</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      {/* 팝업 내용 */}
    </div>

    <DialogFooter className="mt-6">
      <Button variant="outline" onClick={onClose}>닫기</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## 4. React.Fragment key 규칙

목록에서 여러 행을 렌더링할 때 Fragment에 key를 부여합니다.

```tsx
// ❌ 잘못된 예
{items.map((item) => (
  <>
    <tr key={item.id}>...</tr>
    {item.children.map(...)}
  </>
))}

// ✅ 올바른 예
{items.map((item) => (
  <React.Fragment key={item.id}>
    <tr>...</tr>
    {item.children.map(...)}
  </React.Fragment>
))}
```

---

# 공통 컴포넌트

## DataTable

TanStack Table 기반 데이터 테이블 컴포넌트

```typescript
interface Column<T> {
  key: string
  header: string | ReactNode
  width?: string
  align?: "left" | "center" | "right"
  sortable?: boolean
  render?: (row: T, index: number) => ReactNode
}

<DataTable
  columns={columns}
  data={data}
  onSort={handleSort}
  sortKey={sortKey}
  sortDirection={sortDirection}
  emptyMessage="검색 결과가 없습니다."
/>
```

## Pagination

```typescript
<Pagination
  currentPage={currentPage + 1}  // 1-based로 전달
  totalPages={totalPages}
  onPageChange={(page) => setCurrentPage(page - 1)}  // 0-based로 변환
/>
```

## LoadingModal

```typescript
<LoadingModal isOpen={isLoading} />
```

**규칙**: 모든 목록 페이지에서 LoadingModal 사용 (DataTable의 loading 속성 사용 X)

## FullScreenLoading

페이지 전환 시 전체 화면 로딩을 표시합니다. AppContext의 `showLoading`/`hideLoading`을 통해 제어합니다.

```typescript
import { useAppContext } from "@/contexts/app-context"

const { showLoading, hideLoading } = useAppContext()

// 로딩 표시
showLoading("로그인 성공!", "페이지를 이동하고 있습니다...")

// 로딩 숨김 (페이지 전환 시 자동으로 호출됨)
hideLoading()
```

**특징**:
- 전역 상태로 관리되어 어디서든 호출 가능
- 페이지 전환(pathname 변경) 시 자동으로 로딩 해제
- 로그인/로그아웃 시 매끄러운 화면 전환 제공

## DataCountPageSize

```typescript
<DataCountPageSize
  totalElements={totalElements}
  pageSize={pageSize}
  onPageSizeChange={setPageSize}
/>
```

## SearchSection

검색 영역을 구성하는 컴포넌트들입니다.

```typescript
import { SearchSection, TabBar, TabButton, SearchForm, FormRow } from "@/components/common"

// 검색 섹션 전체 래퍼
<SearchSection>
  <TabBar>
    {DATE_TABS.map((tab) => (
      <TabButton
        key={tab}
        active={selectedTab === tab}
        onClick={() => handleDateTabClick(tab)}
      >
        {tab}
      </TabButton>
    ))}
  </TabBar>
  <SearchForm>
    <FormRow label="등록일">
      <input type="date" ... />
    </FormRow>
    <FormRow label="검색조건">
      <select ... />
      <input ... />
    </FormRow>
  </SearchForm>
</SearchSection>
```

## CenterSelect / PaymentPurposeSelect

헤더에서 센터 및 결제 목적을 선택하는 컴포넌트입니다.

```typescript
import { CenterSelect } from "@/components/common/center-select"
import { PaymentPurposeSelect } from "@/components/common/payment-purpose-select"

// 센터 선택 (본사 전용)
<CenterSelect />

// 결제 목적 선택 (배달비/월세)
<PaymentPurposeSelect />
```

---

# 상태 관리

## AppContext

```typescript
import { useAppContext } from "@/contexts/app-context"

const {
  // 센터 관리
  centerId, setCenterId,

  // 결제 목적
  paymentPurpose, setPaymentPurpose,

  // 사용자 인증
  user, setUser,
  isAuthenticated, logout,

  // 사이드바
  sidebarOpen, toggleSidebar, setSidebarOpen,

  // 테마
  theme, toggleTheme, setTheme,

  // 초기화 상태
  isInitialized,

  // 전역 로딩 (페이지 전환용)
  showLoading, hideLoading
} = useAppContext()
```

### 사용자 정보 (IUser)

```typescript
interface IUser {
  companyId?: number
  loginId?: string      // 로그인 ID
  name?: string         // 업체명 또는 가맹점명
  level?: number        // 레벨 (0: 본사, 1: 지사, 2: 총판, 3: 대리점)
  levelName?: string    // 레벨명 (본사, 지사, 총판, 대리점)
  centerId?: number     // 센터 ID
}
```

### 인증 방식 (httpOnly 쿠키)

- JWT 토큰은 **httpOnly 쿠키**에 저장 (XSS 공격 방지)
- 클라이언트에서 토큰에 직접 접근 불가
- 토큰 유효성은 서버 API(`/api/auth/verify`)로 확인
- 토큰 만료 시 자동으로 로그아웃 처리
- middleware에서 쿠키 기반 인증 체크

### 인증 흐름

```
1. 로그인 → 서버에서 httpOnly 쿠키로 토큰 설정
2. 앱 초기화 → tokenManager.verify()로 토큰 유효성 확인
3. API 호출 → 쿠키가 자동으로 전송됨
4. 로그아웃 → authApi.logout()으로 쿠키 제거
```

## localStorage 키
- `user`: 사용자 정보 (JSON) - UI 표시용
- `centerId`: 선택된 센터 ID
- `paymentPurpose`: 선택된 결제 목적 (DELIVERY_CHARGE | MONTHLY_RENT)
- `sidebar-storage`: 사이드바 상태 (JSON)
- `theme-storage`: 테마 설정 (JSON)

> ⚠️ `token`은 더 이상 localStorage에 저장하지 않음 (httpOnly 쿠키 사용)

---

# 코딩 컨벤션

## 파일/컴포넌트 네이밍

- **파일명**: kebab-case (`data-table.tsx`)
- **컴포넌트명**: PascalCase (`DataTable`)
- **함수명**: camelCase (`handleSubmit`)
- **상수명**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **타입명**: PascalCase (`CompanyListItem`)

## Import 순서

```typescript
// 1. React/Next.js
import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

// 2. 외부 라이브러리
import { Button } from "@/components/ui/button"

// 3. 내부 컴포넌트
import { DataTable } from "@/components/common/data-table"

// 4. 커스텀 훅
import { useSearchState, useApiError, useListData } from "@/hooks"

// 5. API
import { companiesApi } from "@/lib/api"

// 6. 상수/Enum
import { DATE_TABS, COMPANY_SEARCH_CONDITIONS } from "@/lib/constants"
import { CompanyLevelHelper } from "@/lib/enums"

// 7. 타입
import type { CompanyListItem, CompanyListParams } from "@/lib/api/types"
```

## TypeScript 규칙

- `strict: true` 유지
- `any` 최소화, 불가피한 경우 `unknown` + 타입 가드
- API 응답 타입은 `lib/api/types.ts`에 정의

## React 규칙

- 클라이언트 컴포넌트: `"use client"` 명시
- 함수형 컴포넌트 사용
- useCallback 의존성 배열 주의 (무한루프 방지)

## 스타일 상수

```typescript
// 색상
const COLORS = {
  headerBg: '#5F7C94',      // 청회색 (헤더)
  sectionBg: '#f7f7f7',     // 밝은 회색 (섹션)
  primary: 'blue-600',      // 주요 버튼
  success: 'green-600',     // Excel 버튼
}

// 공통 클래스
const STYLES = {
  input: 'h-8 text-xs',
  label: 'text-xs',
  button: 'h-7 text-xs px-4',
}
```

## 개발 환경

```bash
# 설치
npm install

# 개발 서버 (포트 3100)
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm run start
```

## 환경 변수

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:18080/webadmin/api/v1
```
