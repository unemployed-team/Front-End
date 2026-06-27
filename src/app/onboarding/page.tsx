"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { useAuthStore } from "@/store/auth-store";
import { updateMe } from "@/lib/api/users";
import { Shield } from "lucide-react";

const CITIES = ["대구광역시", "서울특별시", "부산광역시"];
const DISTRICTS: Record<string, string[]> = {
  대구광역시: ["중구", "남구", "북구", "수성구", "달서구", "동구"],
  서울특별시: ["강남구", "서초구", "마포구", "종로구"],
  부산광역시: ["해운대구", "수영구", "부산진구"],
};

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding, setUser } = useAuthStore();
  const [city, setCity] = useState("대구광역시");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!district) return;
    const interestRegion = `${city} ${district}`;
    setLoading(true);
    setError(null);
    try {
      const user = await updateMe({ interestRegion });
      setUser(user);
      completeOnboarding(interestRegion);
      router.push("/");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "관심 지역 저장에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout hideNav>
      <div className="flex min-h-screen flex-col px-6 py-12">
        <div className="mx-auto w-full max-w-sm">
          <Shield className="h-10 w-10 text-saferoom-600" />
          <h1 className="mt-4 text-2xl font-black text-slate-900">
            관심 주거 지역을
            <br />
            선택해 주세요
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            맞춤형 HRI 분석과 알림을 제공합니다
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600">시/도</label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setDistrict("");
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">구/군</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(DISTRICTS[city] ?? []).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDistrict(d)}
                    className={`rounded-xl border py-2.5 text-sm font-medium transition ${
                      district === d
                        ? "border-saferoom-500 bg-saferoom-50 text-saferoom-700"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-center text-sm text-risk-danger">{error}</p>
          )}

          <button
            type="button"
            disabled={!district || loading}
            onClick={handleComplete}
            className="mt-10 w-full rounded-xl bg-saferoom-600 py-3.5 text-sm font-bold text-white disabled:bg-slate-200 disabled:text-slate-400"
          >
            {loading ? "저장 중..." : "가입 완료"}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
