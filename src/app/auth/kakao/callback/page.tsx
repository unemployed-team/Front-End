"use client";

import { Suspense } from "react";
import { OAuthCallback } from "@/components/auth/OAuthCallback";

export default function KakaoCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          로그인 처리 중...
        </div>
      }
    >
      <OAuthCallback provider="kakao" />
    </Suspense>
  );
}
