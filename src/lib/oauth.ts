import type { SocialProvider } from "@/types";

const KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

function requireEnv(value: string | undefined, label: string): string {
  if (!value || value.startsWith("your_")) {
    throw new Error(
      `${label}이(가) 설정되지 않았습니다. .env.local에 실제 값을 넣고 npm run dev를 재시작하세요.`
    );
  }
  return value;
}

export function getKakaoAuthorizeUrl(): string {
  const clientId = requireEnv(
    process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY,
    "NEXT_PUBLIC_KAKAO_REST_API_KEY"
  );
  const redirectUri = requireEnv(
    process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI,
    "NEXT_PUBLIC_KAKAO_REDIRECT_URI"
  );
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
  });
  return `${KAKAO_AUTH_URL}?${params}`;
}

export function getGoogleAuthorizeUrl(): string {
  const clientId = requireEnv(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    "NEXT_PUBLIC_GOOGLE_CLIENT_ID"
  );
  const redirectUri = requireEnv(
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
    "NEXT_PUBLIC_GOOGLE_REDIRECT_URI"
  );
  // Google Console redirect URI와 요청 redirect_uri가 문자열까지 동일해야 함
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  return `${GOOGLE_AUTH_URL}?${params}`;
}

export function startOAuthRedirect(provider: SocialProvider) {
  const url =
    provider === "kakao" ? getKakaoAuthorizeUrl() : getGoogleAuthorizeUrl();
  window.location.href = url;
}
