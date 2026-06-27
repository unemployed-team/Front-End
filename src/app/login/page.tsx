"use client";

import Link from "next/link";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { DevLoginButton } from "@/components/auth/DevLoginButton";
import { Shield } from "lucide-react";

export default function LoginPage() {
  return (
    <MobileLayout hideNav>
      <div className="flex min-h-screen flex-col px-6 py-16">
        <div className="mx-auto w-full max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-saferoom-100">
            <Shield className="h-8 w-8 text-saferoom-600" />
          </div>
          <h1 className="mt-6 text-2xl font-black text-slate-900">SafeRoom AI</h1>
          <p className="mt-2 text-sm text-slate-500">
            계약 전에, AI가 위험한 방을 먼저 잡아낸다
          </p>

          <div className="mt-10">
            <SocialLoginButtons />
            <DevLoginButton />
          </div>

          <Link
            href="/"
            className="mt-6 inline-block text-sm text-slate-400 underline"
          >
            로그인 없이 둘러보기
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
}
