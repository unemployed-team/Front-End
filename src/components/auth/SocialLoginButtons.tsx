"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TermsModal } from "./TermsModal";
import { useAuthStore } from "@/store/auth-store";
import type { SocialProvider, User } from "@/types";

const PROVIDERS: { id: SocialProvider; label: string; color: string; emoji: string }[] = [
  { id: "kakao", label: "카카오로 시작", color: "bg-[#FEE500] text-[#191919]", emoji: "💬" },
  { id: "naver", label: "네이버로 시작", color: "bg-[#03C75A] text-white", emoji: "N" },
];

export function SocialLoginButtons() {
  const router = useRouter();
  const { login, setPendingTerms } = useAuthStore();
  const [showTerms, setShowTerms] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);

  const handleSocialLogin = (provider: SocialProvider) => {
    setPendingProvider(provider);
    setShowTerms(true);
  };

  const handleTermsAgree = (terms: { service: boolean; privacy: boolean; location: boolean }) => {
    setShowTerms(false);
    setPendingTerms(terms);

    const mockUser: User = {
      id: `user-${Date.now()}`,
      email: pendingProvider === "kakao" ? "user@kakao.com" : "user@naver.com",
      nickname: pendingProvider === "kakao" ? "카카오유저" : "네이버유저",
      provider: pendingProvider ?? "kakao",
      createdAt: new Date().toISOString(),
    };

    login(mockUser);
    router.push("/onboarding");
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
      <TermsModal open={showTerms} onAgree={handleTermsAgree} />
    </>
  );
}
