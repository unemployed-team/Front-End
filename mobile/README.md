# SafeRoom AI — Android (Expo)

Figma [Safe-Room](https://www.figma.com/design/5WtEZv9ljlf0FMCYiT6Tcw/Safe-Room) 디자인을 기반으로 한 Expo React Native 앱입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Expo SDK 52 + Expo Router |
| 언어 | TypeScript |
| 상태 관리 | Zustand + AsyncStorage |
| 지도 | react-native-maps (Google Maps) |
| AI 모듈 | 웹앱과 동일한 HRI 연산 로직 |

## 시작하기

```bash
cd mobile
npm install
npx expo start --android
```

Android 에뮬레이터 또는 실기기에서 Expo Go / 개발 빌드로 실행할 수 있습니다.

## 구현된 화면

- **지도** — HRI 히트맵 마커, 대학가 레이어, 주소 검색 바로가기
- **검색** — 주소 자동완성 (3글자 이상)
- **비교** — 최대 3개 건물 HRI 비교
- **마이** — 로그인, 관심 건물, 계약 관리, 만기 알림
- **로그인** — 카카오/네이버 소셜 로그인 UI + 약관 동의
- **온보딩** — 관심 주거 지역 선택
- **HRI 리포트** — 점수, 카테고리 분석, 위험도 추이, 공유
- **현장 제보** — QR 접근 익명 제보 폼

## 프로젝트 구조

```
mobile/
├── app/                 # Expo Router 화면
├── src/
│   ├── ai/              # HRI Score AI 모듈
│   ├── components/      # UI 컴포넌트
│   ├── lib/             # API, 목 데이터, 유틸
│   ├── store/           # Zustand 스토어
│   └── theme/           # 디자인 토큰 (saferoom 컬러)
```

## 지도 API

Android에서는 `react-native-maps` + Google Maps를 사용합니다. 프로덕션 빌드 시 `app.json`에 Google Maps API 키 설정이 필요할 수 있습니다.

## 웹앱과의 관계

루트의 Next.js PWA(`src/`)와 동일한 비즈니스 로직·목 데이터·디자인 토큰을 공유합니다. 백엔드 연동 시 `src/lib/api/buildings.ts`의 `USE_MOCK` 플래그를 해제하면 됩니다.
