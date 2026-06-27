# SafeRoom AI — Mobile (Expo Go)

Expo Go로 실기기에서 테스트하는 방법입니다.

## 1. 준비

- 폰에 **Expo Go** 설치 (App Store / Play Store)
- Expo Go 버전: **SDK 54**
- PC에 **인터넷** 연결 (터널 모드 사용)

> PC와 폰 Wi‑Fi가 **달라도** 됩니다. `npm start`가 터널 모드로 실행됩니다.

## 2. 실행

```bash
cd mobile
npm install
npm start
```

터미널에 QR 코드가 나옵니다 (처음엔 터널 연결까지 10~30초 걸릴 수 있음).

| 기기 | 방법 |
|------|------|
| **Android** | Expo Go → **Scan QR code** |
| **iPhone** | 카메라로 QR 스캔 → Expo Go에서 열기 |

### 같은 Wi‑Fi일 때 (더 빠름)

```bash
npm run start:lan
```

## 3. 환경 변수 (`mobile/.env`)

```env
EXPO_PUBLIC_API_BASE_URL=http://54.116.153.193:8080/api
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_ENABLE_DEV_LOGIN=true
```

- **앱 JS 번들**: Expo 터널 → PC Metro
- **검색·리포트 API**: EC2 공인 IP → Wi‑Fi와 무관

`.env` 수정 후 Expo 서버 **재시작**.

## 4. 테스트 순서

1. **검색** → `수성구`
2. 건물 → HRI 리포트
3. **개발용 임시 로그인**
4. 북마크 → **마이**

## 5. 문제 해결

| 증상 | 해결 |
|------|------|
| Tunnel connected 안 됨 | VPN 끄기, 방화벽 허용, `npm start` 재시도 |
| `@expo/ngrok` 오류 | `cd mobile && npm install` |
| QR 후 로딩만 됨 | 터널 URL 만료 → Expo 재시작 후 QR 다시 스캔 |
| 검색/API 실패 | EC2 서버·`EXPO_PUBLIC_API_BASE_URL` 확인 |
| Metro 오류 | `npx expo start --tunnel -c` |

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm start` | **터널** (Wi‑Fi 달라도 OK, 기본) |
| `npm run start:lan` | LAN (같은 Wi‑Fi, 빠름) |
| `npm run start:tunnel` | 터널 (start와 동일) |
