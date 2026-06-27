import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import type { SocialProvider } from "@/types";

WebBrowser.maybeCompleteAuthSession();

const KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

function requireEnv(value: string | undefined, label: string): string {
  if (!value || value.startsWith("your_")) {
    throw new Error(
      `${label}이 설정되지 않았습니다. mobile/.env를 확인하거나 개발용 임시 로그인을 사용하세요.`
    );
  }
  return value;
}

/** Expo Go / 앱 딥링크용 redirect URI (카카오·구글·백엔드 Secrets와 동일해야 함) */
export function getOAuthRedirectUri(provider: "kakao" | "google"): string {
  const fromEnv =
    provider === "kakao"
      ? process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI
      : process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI;

  if (fromEnv && !fromEnv.startsWith("your_")) {
    return fromEnv;
  }

  return AuthSession.makeRedirectUri({
    scheme: "saferoom",
    path: "oauth/callback",
  });
}

function buildKakaoAuthUrl(redirectUri: string): string {
  const clientId = requireEnv(
    process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY,
    "EXPO_PUBLIC_KAKAO_REST_API_KEY"
  );
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
  });
  return `${KAKAO_AUTH_URL}?${params}`;
}

function buildGoogleAuthUrl(redirectUri: string): string {
  const clientId = requireEnv(
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    "EXPO_PUBLIC_GOOGLE_CLIENT_ID"
  );
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

export async function startSocialOAuth(provider: SocialProvider): Promise<string> {
  const redirectUri = getOAuthRedirectUri(provider);
  const authUrl =
    provider === "kakao"
      ? buildKakaoAuthUrl(redirectUri)
      : buildGoogleAuthUrl(redirectUri);

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type === "success" && result.url) {
    const parsed = new URL(result.url);
    const oauthError = parsed.searchParams.get("error");
    if (oauthError) {
      throw new Error(`OAuth 오류: ${oauthError}`);
    }
    const code = parsed.searchParams.get("code");
    if (!code) {
      throw new Error("인증 코드를 받지 못했습니다.");
    }
    return code;
  }

  if (result.type === "cancel" || result.type === "dismiss") {
    throw new Error("로그인이 취소되었습니다.");
  }

  throw new Error("로그인에 실패했습니다.");
}
