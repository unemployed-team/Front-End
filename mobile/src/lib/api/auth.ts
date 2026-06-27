import { apiClient } from "./client";
import { useAuthStore } from "@/store/auth-store";
import type { TokenResponse } from "./types";

export async function exchangeKakaoCode(code: string) {
  return apiClient<TokenResponse>(
    `/auth/kakao?code=${encodeURIComponent(code)}`,
    { auth: false }
  );
}

export async function exchangeGoogleCode(code: string) {
  return apiClient<TokenResponse>(
    `/auth/google?code=${encodeURIComponent(code)}`,
    { auth: false }
  );
}

export async function reissueToken(refreshToken: string) {
  return apiClient<TokenResponse>("/auth/reissue", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    auth: false,
  });
}

export async function logoutApi() {
  if (useAuthStore.getState().isDevSession) return;
  return apiClient<void>("/auth/logout", { method: "POST" });
}
