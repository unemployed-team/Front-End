"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { submitFieldReport } from "@/lib/api/buildings";
import { FIELD_REPORT_TYPES } from "@/lib/constants/mock-data";
import { CheckCircle } from "lucide-react";

export default function QRReportPage() {
  const params = useParams();
  const buildingId = params.buildingId as string;
  const [type, setType] = useState<string>("defect");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitFieldReport({ buildingId, type, description });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <MobileLayout hideNav>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <CheckCircle className="h-16 w-16 text-risk-safe" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">제보가 접수되었습니다</h1>
          <p className="mt-2 text-sm text-slate-500">
            익명으로 처리되며, 검증 후 HRI Score에 반영됩니다
          </p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideNav>
      <div className="px-6 py-8">
        <div className="rounded-xl bg-saferoom-600 px-4 py-3 text-white">
          <p className="text-xs opacity-80">현장 제보 · 로그인 불필요</p>
          <h1 className="text-lg font-bold">건물 현장 제보</h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">제보 유형</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {Object.entries(FIELD_REPORT_TYPES).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key)}
                  className={`rounded-xl border py-2.5 text-xs font-medium transition ${
                    type === key
                      ? "border-saferoom-500 bg-saferoom-50 text-saferoom-700"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">상세 내용</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="현장에서 확인한 내용을 입력해 주세요"
              required
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-saferoom-500"
            />
          </div>

          <p className="text-xs text-slate-400">
            제보는 익명으로 처리되며, 개인을 특정할 수 있는 정보는 입력하지 마세요.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-saferoom-600 py-3.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {loading ? "제출 중..." : "익명 제보하기"}
          </button>
        </form>
      </div>
    </MobileLayout>
  );
}
