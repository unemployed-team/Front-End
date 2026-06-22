"use client";

import Link from "next/link";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Header } from "@/components/layout/Header";
import { useAppStore } from "@/store/app-store";
import {
  getRiskGradeBg,
  getRiskGradeColor,
  getRiskGradeLabel,
} from "@/lib/utils";
import { Trash2 } from "lucide-react";

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useAppStore();

  return (
    <MobileLayout hideNav>
      <Header title="관심 건물" showBack />
      <div className="p-4">
        {bookmarks.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            저장된 관심 건물이 없습니다
          </p>
        ) : (
          <ul className="space-y-3">
            {bookmarks.map((bm) => (
              <li
                key={bm.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <Link href={`/building/${bm.buildingId}`} className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {bm.building.roadAddress}
                  </p>
                  <div
                    className={`mt-1 inline-flex rounded-lg border px-2 py-0.5 text-xs font-bold ${getRiskGradeBg(bm.report.grade)} ${getRiskGradeColor(bm.report.grade)}`}
                  >
                    HRI {bm.report.totalScore} · {getRiskGradeLabel(bm.report.grade)}
                  </div>
                  {bm.previousGrade && bm.previousGrade !== bm.report.grade && (
                    <p className="mt-1 text-xs text-risk-caution">
                      등급 변동: {getRiskGradeLabel(bm.previousGrade)} →{" "}
                      {getRiskGradeLabel(bm.report.grade)}
                    </p>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => removeBookmark(bm.id)}
                  className="rounded-lg p-2 text-slate-400 hover:text-risk-danger"
                  aria-label="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MobileLayout>
  );
}
