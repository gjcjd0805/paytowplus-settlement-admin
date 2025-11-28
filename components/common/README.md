# 공통 컴포넌트 사용 가이드

페이플러스1센터 디자인 시스템에 맞춘 공통 컴포넌트입니다.

## 디자인 시스템

### 색상 스킴
- **헤더**: 빨간색 배경 (#d9534f)
- **사이드바**: 짙은 파란-회색 배경 (#3a4f63)
- **테이블 헤더**: 회색 배경 (#9aa7b5)
- **검색 영역 탭**: 회색 배경 (#c4cbd4)

## 컴포넌트

### 1. SearchSection
페이지 상단의 검색 영역을 구성하는 컨테이너 컴포넌트

```tsx
import { SearchSection, TabBar, TabButton, SearchForm, FormRow } from "@/components/common"

<SearchSection title="업체 관리" breadcrumb="업체 목록">
  <TabBar>
    <TabButton active>요일</TabButton>
    <TabButton>어제</TabButton>
  </TabBar>

  <SearchForm>
    <FormRow label="등록일자" required>
      <input type="date" />
    </FormRow>
  </SearchForm>
</SearchSection>
```

**Props:**
- `title`: 페이지 제목
- `breadcrumb`: 브레드크럼 (선택사항)
- `children`: 탭바와 검색 폼

### 2. TabBar & TabButton
검색 영역 상단의 탭 네비게이션

```tsx
<TabBar>
  <TabButton active onClick={() => setTab("요일")}>요일</TabButton>
  <TabButton onClick={() => setTab("어제")}>어제</TabButton>
</TabBar>
```

**TabButton Props:**
- `active`: 활성 상태 (boolean)
- `onClick`: 클릭 핸들러
- `children`: 버튼 텍스트

### 3. SearchForm & FormRow
검색 조건 입력 폼

```tsx
<SearchForm>
  <FormRow label="검색조건" required>
    <input type="text" />
  </FormRow>
  <FormRow label="기간">
    <input type="date" />
    <span>~</span>
    <input type="date" />
  </FormRow>
</SearchForm>
```

**FormRow Props:**
- `label`: 레이블 텍스트
- `required`: 필수 표시 (선택사항)
- `children`: 입력 필드들

### 4. DataTable
데이터 테이블 컴포넌트 (정렬, 렌더링 커스터마이징 지원)

```tsx
import { DataTable } from "@/components/common"

const columns = [
  {
    key: "no",
    header: "NO",
    width: "60px",
    align: "center",
    sortable: true,
    render: (row, index) => index + 1
  },
  {
    key: "name",
    header: "이름",
    width: "150px"
  },
  {
    key: "status",
    header: "상태",
    align: "center",
    render: (row) => row.status || "정상"
  }
]

<DataTable
  columns={columns}
  data={data}
  loading={loading}
  onSort={handleSort}
  sortKey={sortKey}
  sortDirection={sortDirection}
  emptyMessage="데이터가 없습니다."
/>
```

**Props:**
- `columns`: 컬럼 정의 배열
  - `key`: 데이터 키
  - `header`: 헤더 텍스트
  - `width`: 컬럼 너비 (선택사항)
  - `align`: 정렬 ("left" | "center" | "right")
  - `sortable`: 정렬 가능 여부
  - `render`: 커스텀 렌더링 함수
- `data`: 표시할 데이터 배열
- `loading`: 로딩 상태
- `onSort`: 정렬 핸들러
- `sortKey`: 현재 정렬 키
- `sortDirection`: 정렬 방향 ("asc" | "desc")
- `emptyMessage`: 데이터 없을 때 메시지

### 5. Pagination
페이징 네비게이션

```tsx
import { Pagination } from "@/components/common"

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  maxVisiblePages={5}
/>
```

**Props:**
- `currentPage`: 현재 페이지 번호 (1부터 시작)
- `totalPages`: 전체 페이지 수
- `onPageChange`: 페이지 변경 핸들러
- `maxVisiblePages`: 최대 표시 페이지 수 (기본값: 5)

## 전체 예제

```tsx
"use client"
import { useState } from "react"
import { SearchSection, TabBar, TabButton, SearchForm, FormRow, DataTable, Pagination } from "@/components/common"
import { Button } from "@/components/ui/button"

export default function ListPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const itemsPerPage = 15

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const columns = [
    { key: "no", header: "NO", width: "60px", align: "center" as const, render: (_: any, i: number) => i + 1 },
    { key: "name", header: "이름", width: "150px" },
    { key: "date", header: "등록일", width: "120px", sortable: true },
  ]

  const totalPages = Math.ceil(data.length / itemsPerPage)
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-3">
      <SearchSection title="목록 관리" breadcrumb="목록 조회">
        <TabBar>
          <TabButton active>전체</TabButton>
          <TabButton>최근</TabButton>
        </TabBar>

        <SearchForm>
          <FormRow label="검색어">
            <input type="text" className="px-2 py-1 border rounded" />
          </FormRow>

          <div className="flex justify-center gap-2 pt-2">
            <Button size="sm">검색</Button>
            <Button size="sm" variant="outline">초기화</Button>
          </div>
        </SearchForm>
      </SearchSection>

      <DataTable
        columns={columns}
        data={paginatedData}
        loading={loading}
        onSort={handleSort}
        sortKey={sortKey}
        sortDirection={sortDirection}
      />

      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}
```

## 스타일 커스터마이징

전역 CSS 변수를 통해 색상을 커스터마이징할 수 있습니다 (`styles/globals.css`):

```css
:root {
  --header-bg: 3 65% 58%;        /* 헤더 배경 */
  --sidebar-bg: 210 25% 32%;     /* 사이드바 배경 */
  --tab-bg: 210 17% 82%;         /* 탭 배경 */
  --table-header-bg: 210 17% 70%; /* 테이블 헤더 */
}
```
