"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { isDevLoginEnabled } from "@/lib/dev-auth";
import { devSessionGetUser } from "@/lib/dev-session";

export function DevLoginButton() {
  const router = useRouter();
  const { devLogin } = useAuthStore();

  if (!isDevLoginEnabled()) return null;

  const handleDevLogin = () => {
    devLogin();
    const { interestRegion } = devSessionGetUser();
    router.push(interestRegion ? "/" : "/onboarding");
  };

  return (
    <div className="mt-6 border-t border-slate-200 pt-6">
      <button
        type="button"
        onClick={handleDevLogin}
        className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 py-3 text-sm font-semibold text-slate-600"
      >
        개발용 임시 로그인
      </button>
      <p className="mt-2 text-center text-xs text-slate-400">
        OAuth 없이 로그인·북마크·계약 UI 테스트 (로컬 저장)
      </p>
    </div>
  );
}
