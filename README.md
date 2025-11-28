# 다배달 정산 관리자 시스템 (Dabaedal Settlement Admin)

다배달 결제 시스템의 정산 관리를 위한 웹 어드민 시스템입니다.

## 프로젝트 개요

이 프로젝트는 **다배달 정산 관리자 웹 사이트**로, 업체 및 가맹점의 정산 관리, 수수료 설정, 결제 관리 등을 담당하는 관리자용 웹 애플리케이션입니다.

- **프로젝트명**: 다배달 정산 관리자 (dabaedal-settlement_admin)
- **대상 사용자**: 정산 관리 어드민 (본사, 지사, 총판, 대리점)
- **백엔드 API**: Spring Boot (dabaedal-payment-backend)
- **API 엔드포인트**: `http://localhost:18080/webadmin/api/v1`
- **개발 서버 포트**: 3100

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **UI Components**: ShadCN UI 패턴 기반 커스텀 컴포넌트
- **Table**: TanStack Table (React Table v8)
- **State Management**: React Hooks (useState, useEffect)
- **Loading State**: LoadingModal 컴포넌트 (전역 로딩 표시)

## 주요 기능

### 1. 인증 관리
- **로그인** (`/login`)
  - JWT 토큰 기반 인증
  - WEB_ADMIN 역할 필요
  - 로그인 성공 시 토큰 및 사용자 정보 저장

### 2. 업체 관리 (`/company`)
- **업체 목록** (`/company/list`) - 업체 목록 조회
- **업체 등록** (`/company/register`) - 계층적 구조 지원 (본사 → 지사 → 총판 → 대리점)
- **업체 수정** (`/company/edit/[id]`) - 업체 정보 수정
- **업체 수수료율 관리** (`/company/commission`) - 업체별 수수료율 설정

### 3. 가맹점 관리 (`/merchant`)
- **가맹점 목록** (`/merchant/list`) - 가맹점 목록 조회
- **가맹점 등록** (`/merchant/register`) - 신규 가맹점 등록
- **가맹점 수정** (`/merchant/edit/[id]`) - 가맹점 정보 수정

### 4. 단말기 관리 (`/terminal`)
- **터미널 목록** (`/terminal/list`) - 터미널 목록 조회
- **터미널 등록** (`/terminal/register`) - 앱 가맹점을 웹어드민 가맹점에 연결
- **터미널 수정** (`/terminal/edit/[id]`) - 터미널 정보 수정

### 5. 결제 관리 (`/payment`)
- **결제 목록 조회** (`/payment/list`) - 결제 내역 조회
- **보류내역 조회** (`/payment/deferred`) - 🚧 구현 예정
- **간편결제내역 조회** (`/payment/simple`) - 🚧 구현 예정
- **단말기미등록 결제내역 처리** (`/payment/unregistered`) - 🚧 구현 예정

### 6. 정산 관리 (`/settlement`)
- **가맹점별 일정산** (`/settlement/merchant/daily`) - 일별 정산 내역 조회
- **가맹점별 기간정산** (`/settlement/merchant/period`) - 기간별 정산 내역 조회
- **가맹점별 거래내역조회** (`/settlement/merchant/sales`) - 매출 정보 조회
- **업체 정산금액 조회** (`/settlement/amount`) - 🚧 구현 예정

### 7. 게시판 관리 (`/notice`) - 🚧 구현 예정
- **공지사항 목록** (`/notice/list`) - 공지사항 조회
- **공지사항 등록** (`/notice/register`) - 공지사항 작성

## 주요 특징

### 계층적 업체 구조
- **본사** (HEADQUARTERS, 레벨 0)
  - ↓ **지사** (BRANCH, 레벨 1)
    - ↓ **총판** (DISTRIBUTOR, 레벨 2)
      - ↓ **대리점** (AGENT, 레벨 3)
        - ↓ **가맹점** (MERCHANT)

### 인증 시스템
- **JWT 기반 토큰 인증**
  - localStorage에 토큰 저장 (`auth_token`)
  - 모든 API 요청 시 자동으로 Authorization 헤더에 토큰 추가
  - 401 에러 시 자동 로그아웃 및 로그인 페이지로 리다이렉트

### UI/UX
- **일관된 디자인 시스템**
  - 헤더/타이틀: `#5F7C94` (청회색)
  - 테이블 본문: `#E8EAED` (밝은 회색)
  - 호버: `#DDE0E4`
  - 강조: `#4A90E2` (파란색)
- **로딩 상태 표시**
  - LoadingModal 컴포넌트를 통한 전역 로딩 표시
  - DataTable의 loading 속성은 사용하지 않음
- **반응형 디자인**
  - 모바일/태블릿/데스크톱 최적화
  - 테이블 수평 스크롤 지원
- **컬럼 리사이징**
  - TanStack Table 사용
  - 드래그로 컬럼 너비 조정 가능

## 프로젝트 구조

```
dabaedal-settlement_admin/
├── app/                          # Next.js App Router 페이지
│   ├── login/                    # 로그인 페이지
│   ├── company/                  # 업체 관리
│   │   ├── list/                 # 업체 목록
│   │   ├── register/             # 업체 등록
│   │   ├── edit/[id]/            # 업체 수정
│   │   └── commission/           # 업체 수수료율 관리
│   ├── merchant/                 # 가맹점 관리
│   │   ├── list/                 # 가맹점 목록
│   │   ├── register/             # 가맹점 등록
│   │   └── edit/[id]/            # 가맹점 수정
│   ├── terminal/                 # 단말기 관리
│   │   ├── list/                 # 터미널 목록
│   │   ├── register/             # 터미널 등록
│   │   └── edit/[id]/            # 터미널 수정
│   ├── payment/                  # 결제 관리
│   │   ├── list/                 # 결제 목록
│   │   ├── deferred/             # 보류내역 (예정)
│   │   ├── simple/               # 간편결제 (예정)
│   │   └── unregistered/         # 미등록단말기 (예정)
│   ├── settlement/               # 정산 관리
│   │   ├── merchant/
│   │   │   ├── daily/            # 일정산
│   │   │   ├── period/           # 기간정산
│   │   │   └── sales/            # 거래내역
│   │   └── amount/               # 정산금액 (예정)
│   ├── notice/                   # 게시판 관리 (예정)
│   │   ├── list/                 # 공지사항 목록
│   │   └── register/             # 공지사항 등록
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 홈 페이지
├── components/
│   ├── common/                   # 공통 컴포넌트
│   │   ├── data-table.tsx        # 데이터 테이블
│   │   ├── pagination.tsx        # 페이지네이션
│   │   └── loading-modal.tsx     # 로딩 모달
│   ├── layout/                   # 레이아웃 컴포넌트
│   │   ├── header.tsx            # 헤더
│   │   ├── sidebar.tsx           # 사이드바
│   │   └── app-shell.tsx         # 앱 셸
│   ├── company/                  # 업체 관련 컴포넌트
│   │   └── company-code-search-modal.tsx
│   ├── merchant/                 # 가맹점 관련 컴포넌트
│   │   └── merchant-code-search-modal.tsx
│   └── ui/                       # UI 컴포넌트
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       └── textarea.tsx
├── lib/
│   ├── api/                      # API 클라이언트
│   │   ├── client.ts             # Axios 인스턴스
│   │   ├── types.ts              # 타입 정의
│   │   ├── auth.ts               # 인증 API
│   │   ├── companies.ts          # 업체 API
│   │   ├── merchants.ts          # 가맹점 API
│   │   ├── terminals.ts          # 터미널 API
│   │   ├── commissions.ts        # 수수료 API
│   │   ├── payments.ts           # 결제 API
│   │   ├── settlements.ts        # 정산 API
│   │   └── index.ts              # API 통합 export
│   └── utils/                    # 유틸리티 함수
│       └── auth.ts               # 인증 관련 유틸
├── contexts/                     # React Context
│   └── app-context.tsx           # 앱 전역 상태
├── styles/
│   └── globals.css               # 전역 스타일
├── public/                       # 정적 파일
├── .env.local                    # 환경 변수 (로컬)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── README.md                     # 프로젝트 설명서 (이 파일)
├── CLAUDE.md                     # 개발 가이드
└── WEB_ADMIN_SETTLEMENT_API.md   # API 명세서
```

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 설정합니다:

```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:18080/webadmin/api/v1
NEXT_PUBLIC_LOGIN_API=http://localhost:18080/webadmin/api/v1/auth/login
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3100](http://localhost:3100) 접속

> **참고**: 백엔드 API 서버가 실행 중이어야 합니다. 백엔드가 `http://localhost:18080`에서 실행되는지 확인하세요.

### 4. 빌드

```bash
npm run build
```

### 5. 프로덕션 실행

```bash
npm start
```

프로덕션 서버도 포트 3100에서 실행됩니다.

## API 클라이언트 사용법

### 기본 사용법

```typescript
import { merchantsApi, authApi, tokenManager } from '@/lib/api'

// 로그인
const response = await authApi.login({
  loginId: 'company001',
  password: 'password123'
})
tokenManager.set(response.data.token)

// 가맹점 목록 조회
const merchants = await merchantsApi.findAll({
  centerId: 1,
  name: '강남',
  page: 0,
  size: 10
})
console.log(merchants.data.merchants)
```

### 통합 API 객체 사용

```typescript
import { api } from '@/lib/api'

await api.merchants.findAll({ centerId: 1 })
await api.companies.findById(10)
await api.terminals.create({ merchantId: 1, appMerchantId: 100 })
```

### 로딩 상태 처리

```typescript
const [isLoading, setIsLoading] = useState(false)

const loadData = async () => {
  setIsLoading(true)
  try {
    const response = await api.getData()
    // 데이터 처리
  } finally {
    setIsLoading(false)
  }
}

// JSX에서 LoadingModal 사용
<LoadingModal isOpen={isLoading} />
```

## 코딩 규칙

- Next.js App Router 사용 (Pages Router 사용 금지)
- TypeScript 엄격 모드 사용
- 클라이언트 컴포넌트 명시: `"use client"`
- 상태 관리: React Hooks (useState, useEffect)
- HTTP 통신: Axios 기반 API 클라이언트 사용
- 로딩 상태: LoadingModal 컴포넌트 사용 (DataTable의 loading 속성 사용 X)
- UI 컴포넌트: ShadCN 스타일 패턴 적용
- 단일 책임 원칙 준수
- **화면 구현 시 CLAUDE.md의 화면 구현 규칙 준수**

## 개발 가이드

프로젝트 개발 시 반드시 다음 문서를 참고하세요:

1. **CLAUDE.md** - 화면 구현 규칙 (목록/등록/수정 화면 레이아웃, 색상, 스타일)
2. **WEB_ADMIN_SETTLEMENT_API.md** - API 명세서 (엔드포인트, 요청/응답 형식)

## 구현 현황

### ✅ 완료된 기능
- [x] **인증 관리**
  - 로그인/로그아웃
  - JWT 토큰 관리
  - 자동 로그아웃 (401 에러)
- [x] **업체 관리**
  - 업체 목록 조회
  - 업체 등록 (계층구조)
  - 업체 수정
  - 업체 수수료율 관리
- [x] **가맹점 관리**
  - 가맹점 목록 조회 (19개 컬럼, 페이징, 정렬)
  - 가맹점 등록 (2열 그리드, 섹션별 입력 폼)
  - 가맹점 수정
- [x] **터미널 관리**
  - 터미널 목록 조회
  - 터미널 등록
  - 터미널 수정
- [x] **결제 관리**
  - 결제 목록 조회
- [x] **정산 관리**
  - 가맹점별 일정산
  - 가맹점별 기간정산
  - 가맹점별 거래내역조회
- [x] **공통 컴포넌트**
  - DataTable (TanStack Table, 컬럼 리사이징)
  - Pagination (페이지 번호, 이동 버튼)
  - LoadingModal (전역 로딩 표시)
  - UI 컴포넌트 (Button, Input, Label, Select, Textarea)
  - 팝업 모달 (업체/가맹점 검색)

### 🚧 구현 예정
- [ ] **결제 관리**
  - 보류내역 조회
  - 간편결제내역 조회
  - 단말기미등록 결제내역 처리
- [ ] **정산 관리**
  - 업체 정산금액 조회
- [ ] **게시판 관리**
  - 공지사항 목록
  - 공지사항 등록
- [ ] **추가 기능**
  - TOTP 관리
  - Excel 내보내기
  - 차트 및 대시보드 통계

## 관련 프로젝트

이 프로젝트는 다배달 결제 시스템의 일부입니다:

- **dabaedal-payment-backend** - Spring Boot API 서버 (백엔드)
- **dabaedal-payment-app** - Flutter 모바일 앱 (사용자 앱)
- **dabaedal-payment-admin** - Next.js 앱 관리자 웹 (앱 어드민)
- **dabaedal-settlement_admin** - Next.js 정산 관리자 웹 (이 프로젝트)

자세한 내용은 상위 디렉토리의 `CLAUDE.md` 파일을 참고하세요.

## 라이선스

Private Project

---

**마지막 업데이트**: 2024-11-22