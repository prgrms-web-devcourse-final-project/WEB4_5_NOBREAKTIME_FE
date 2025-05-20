# WEB4_5_NOBREAKTIME Frontend

## 기술 스택

-   Next.js 15.3.1
-   React 19
-   TypeScript
-   Tailwind CSS 4
-   Radix UI
-   Shadcn UI
-   Recharts (차트 라이브러리)
-   Toss Payments SDK

## 디렉토리 구조

```
frontend/
├── src/                    # 소스 코드
│   ├── app/               # Next.js 13+ App Router 기반 페이지 구성
│   │   ├── (member)/     # 회원 관련 페이지
│   │   │   ├── login/           # 로그인 페이지
│   │   │   ├── membership/      # 멤버십 가입 페이지
│   │   │   └── additional_info/ # 언어 선택 페이지
│   │   ├── dashboard/    # 대시보드 페이지
│   │   │   ├── bookmark/        # 북마크 관리
│   │   │   ├── expression/      # 표현 학습
│   │   │   ├── mypage/         # 마이페이지
│   │   │   ├── video/          # 영상 학습
│   │   │   ├── word/           # 단어 학습
│   │   │   ├── layout.tsx      # 대시보드 레이아웃
│   │   │   └── page.tsx        # 대시보드 메인
│   │   ├── ClientLayout.tsx    # 인증/인가 처리 레이아웃
│   │   ├── layout.tsx    # 루트 레이아웃
│   │   └── page.tsx      # 메인 페이지
│   ├── components/        # 재사용 가능한 UI 컴포넌트
│   │   ├── common/       # 공통 컴포넌트
│   │   ├── dashboard/    # 대시보드 관련 컴포넌트
│   │   ├── icon/         # 아이콘 컴포넌트
│   │   ├── layout/       # 레이아웃 컴포넌트
│   │   ├── learning/     # 학습 관련 컴포넌트
│   │   ├── payment/      # 결제 관련 컴포넌트
│   │   ├── ui/          # 기본 UI 컴포넌트
│   │   └── video/       # 영상 관련 컴포넌트
│   ├── lib/              # 유틸리티 함수 및 설정
│   │   ├── backend/     # 백엔드 통신 관련
│   │   │   ├── apiV1/  # API v1 엔드포인트 타입 정의 및 통신
│   │   │   │   └── schema.d.ts  # API 스키마 타입 정의
│   │   │   └── client.ts  # openapi-fetch 클리언트 설정 파일
│   │   └── utils.ts     # 유틸리티 함수
│   └── styles/           # 전역 스타일
└── public/          # 정적 파일 (이미지, 폰트 등)
```

## 설치

```bash
# 의존성 패키지 설치
npm install
# 또는
yarn install
```

## 개발 서버 실행

```bash
# 개발 서버 실행 (Turbopack 사용)
npm run dev
# 또는
yarn dev
```

## 환경 설정

### 환경변수

-   .env.local.default를 통해 .env.local 파일 생성 후 키 등록

```env
NEXT_PUBLIC_TOSS_WIDGET_CLIENT_KEY=NEED_TO_INPUT
NEXT_PUBLIC_TOSS_BILLING_CLIENT_KEY=NEED_TO_INPUT
```

프로젝트는 다음과 같은 주요 설정 파일들을 포함합니다:s

-   `next.config.ts`: Next.js 설정
-   `tsconfig.json`: TypeScript 설정
-   `tailwind.config.js`: Tailwind CSS 설정
-   `eslint.config.mjs`: ESLint 설정
-   `.prettierrc`: Prettier 설정

## 배포

-   개인레포로 fork 후 vercel를 통한 배포(조직레포는 유료)
-   도메인은 CNAME 등록상태
-   Deploy 후 CI/CD 자동 적용, 빌드 에러시 오류 메시지 확인 필요
-   Settings > Environment Variables에서 .env.local 키 등록 필요
