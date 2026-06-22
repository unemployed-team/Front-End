# SafeRoom AI — Frontend & AI Module

> **"계약 전에, AI가 위험한 방을 먼저 잡아낸다"**  
> 공공데이터 기반 청년 주거 안전 플랫폼 (프론트엔드 + AI 연산 모듈)

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) + TypeScript |
| 스타일 | Tailwind CSS (모바일 퍼스트 PWA) |
| 상태 관리 | Zustand (persist) |
| 차트 | Recharts |
| 지도 | Kakao Maps SDK |
| AI 모듈 | TypeScript 순수 연산 (백엔드 이식 가능) |

## 시작하기

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# NEXT_PUBLIC_KAKAO_APP_KEY 등 입력

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 프로젝트 구조

```
src/
├── ai/                          # AI 연산 모듈 (백엔드 이식 가능)
│   ├── hri-score/
│   │   ├── calculator.ts        # HRI Score 종합 산출
│   │   ├── categories.ts        # 4대 카테고리 점수
│   │   └── weights.ts           # 가중치 + 현장제보 동적 보정
│   ├── prediction/
│   │   └── deposit-risk-model.ts # 보증금 미반환 위험 예측
│   └── simulator/
│       └── auction-recovery.ts  # 경매 배당 시뮬레이터
├── app/                         # 페이지 (App Router)
├── components/                  # UI 컴포넌트
├── lib/api/                     # API 클라이언트 (목 데이터 포함)
├── store/                       # Zustand 스토어
└── types/                       # TypeScript 타입
```

## 구현된 기능 (MVP)

### 프론트엔드
- [x] 소셜 로그인 UI (카카오/네이버) + 약관 동의
- [x] 온보딩 (관심 주거 지역 선택)
- [x] 지도 기반 HRI 히트맵 (카카오맵 + Fallback UI)
- [x] 주소 검색 자동완성 (3글자 이상)
- [x] 건물 HRI 분석 리포트 페이지
- [x] 리포트 URL 공유
- [x] QR 현장 제보 (비로그인 익명)
- [x] 관심 건물 북마크 (최대 3개 비교)
- [x] 내 계약 관리 + 만기 알림 (D-90/30/7)
- [x] 회원 정보 수정 / 탈퇴

### AI 모듈
- [x] **HRI Score 알고리즘**: 4대 카테고리 가중 합산 (건축 25% / 시세 25% / 임대인 30% / 생활 20%)
- [x] **현장 제보 가중치 동적 보정**: 검증된 제보 누적 시 실시간 Score 감점
- [x] **보증금 미반환 위험 예측**: 시계열 + 전세가율 + LTV + 경매 상태 기반 (%)
- [x] **경매 배당 시뮬레이터**: 소액임차인 최우선변제 + 낙찰가율 + 선순위 근저당

## AI 모듈 사용 예시

```typescript
import { calculateHRIScore, simulateAuctionRecovery } from "@/ai";

const report = calculateHRIScore({
  building,
  deposit: 50_000_000,
  salePrice: 80_000_000,
  // ... 공공 API 데이터
});

const simulation = simulateAuctionRecovery({
  deposit: 50_000_000,
  officialPrice: 120_000_000,
  seniorMortgage: 40_000_000,
  auctionBidRate: 0,
  region: "대구",
  moveInDate: "2024-01-01",
  contractDate: "2024-01-01",
});
```

## 백엔드 연동

`src/lib/api/buildings.ts`의 `USE_MOCK = true`를 `false`로 변경하고 `NEXT_PUBLIC_API_BASE_URL` 설정

## 필요 API 키

- `NEXT_PUBLIC_KAKAO_APP_KEY` — [Kakao Developers](https://developers.kakao.com)
- `NEXT_PUBLIC_NAVER_CLIENT_ID` — [Naver Developers](https://developers.naver.com)
- `NEXT_PUBLIC_API_BASE_URL` — 백엔드 서버 URL
