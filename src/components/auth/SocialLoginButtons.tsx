"use client";

import { useState } from "react";
import { TermsModal } from "./TermsModal";
import { useAuthStore } from "@/store/auth-store";
import { startOAuthRedirect } from "@/lib/oauth";
import type { SocialProvider } from "@/types";

const PROVIDERS: { id: SocialProvider; label: string; color: string; emoji: string }[] = [
  { id: "kakao", label: "카카오로 시작", color: "bg-[#FEE500] text-[#191919]", emoji: "💬" },
  { id: "google", label: "구글로 시작", color: "bg-white text-slate-700 border border-slate-200", emoji: "G" },
];

export function SocialLoginButtons() {
  const { setPendingTerms } = useAuthStore();
  const [showTerms, setShowTerms] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSocialLogin = (provider: SocialProvider) => {
    setPendingProvider(provider);
    setShowTerms(true);
    setError(null);
  };

  const handleTermsAgree = (terms: {
    service: boolean;
    privacy: boolean;
    location: boolean;
  }) => {
    if (!pendingProvider) return;
    setShowTerms(false);
    setPendingTerms(terms);

    try {
      startOAuthRedirect(pendingProvider);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "OAuth 설정이 필요합니다. .env.local을 확인하세요."
      );
    }
  };

  return (
    <>
      <div className="space-y-3">
        {PROVIDERS.map(({ id, label, color, emoji }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleSocialLogin(id)}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition hover:opacity-90 ${color}`}
          >
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-3 text-center text-xs text-risk-danger">{error}</p>
      )}
      <TermsModal open={showTerms} onAgree={handleTermsAgree} />
    </>
  );
}
