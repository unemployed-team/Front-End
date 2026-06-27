"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { deleteMe, updateMe } from "@/lib/api/users";
import { logoutApi } from "@/lib/api/auth";

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const updated = await updateMe({ nickname });
      setUser(updated);
      setMessage("저장되었습니다.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // 토큰 만료 등으로 실패해도 로컬 로그아웃
    }
    logout();
    router.push("/");
  };

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      await deleteMe();
      logout();
      router.push("/");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "탈퇴 처리에 실패했습니다.");
      setLoading(false);
    }
  };

  return (
    <MobileLayout hideNav>
      <Header title="회원 정보 수정" showBack />
      <div className="space-y-4 p-4">
        <div>
          <label className="text-xs font-medium text-slate-600">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">관심 지역</label>
          <p className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {user?.interestRegion ?? "미설정"}
          </p>
        </div>

        {message && (
          <p className="text-center text-sm text-saferoom-600">{message}</p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="w-full rounded-xl bg-saferoom-600 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          저장
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl border border-slate-200 py-3 text-sm text-slate-600"
        >
          로그아웃
        </button>

        <div className="border-t border-slate-200 pt-4">
          {!showWithdraw ? (
            <button
              type="button"
              onClick={() => setShowWithdraw(true)}
              className="text-sm text-risk-danger"
            >
              회원 탈퇴
            </button>
          ) : (
            <div className="rounded-xl border border-risk-danger/30 bg-risk-danger/5 p-4">
              <p className="text-sm text-slate-700">
                탈퇴 시 북마크, 계약 정보가 삭제됩니다.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2 text-sm"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-risk-danger py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  탈퇴 확인
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
