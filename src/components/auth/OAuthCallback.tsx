"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeGoogleCode, exchangeKakaoCode } from "@/lib/api/auth";
import { fetchMe } from "@/lib/api/users";
import { useAuthStore } from "@/store/auth-store";
import type { SocialProvider } from "@/types";
import { MobileLayout } from "@/components/layout/MobileLayout";

interface OAuthCallbackProps {
  provider: SocialProvider;
}

export function OAuthCallback({ provider }: OAuthCallbackProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, setTokens } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const oauthError = searchParams.get("error");

    if (oauthError || !code) {
      setError("로그인이 취소되었거나 인증 코드를 받지 못했습니다.");
      return;
    }

    (async () => {
      try {
        const tokens =
          provider === "kakao"
            ? await exchangeKakaoCode(code)
            : await exchangeGoogleCode(code);

        setTokens(tokens.accessToken, tokens.refreshToken);
        const user = await fetchMe();
        login(user, {
          access: tokens.accessToken,
          refresh: tokens.refreshToken,
        });

        if (!user.interestRegion) {
          router.replace("/onboarding");
        } else {
          router.replace("/");
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "로그인 처리 중 오류가 발생했습니다."
        );
      }
    })();
  }, [provider, searchParams, login, setTokens, router]);

  if (error) {
    return (
      <MobileLayout hideNav>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <p className="text-sm text-risk-danger">{error}</p>
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="rounded-xl bg-saferoom-600 px-6 py-2.5 text-sm font-semibold text-white"
          >
            로그인으로 돌아가기
          </button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideNav>
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        로그인 처리 중...
      </div>
    </MobileLayout>
  );
}
