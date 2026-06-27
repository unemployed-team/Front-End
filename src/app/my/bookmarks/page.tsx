"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Header } from "@/components/layout/Header";
import { getMyBookmarks, removeBookmark } from "@/lib/api/bookmarks";
import type { BookmarkResponse } from "@/lib/api/types";
import { toRiskGradeFromApi } from "@/lib/api/mappers-user";
import {
  getRiskGradeBg,
  getRiskGradeColor,
  getRiskGradeLabel,
} from "@/lib/utils";
import { Trash2 } from "lucide-react";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const list = await getMyBookmarks();
      setBookmarks(list);
    } catch {
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleRemove = async (buildingId: number) => {
    try {
      await removeBookmark(buildingId);
      setBookmarks((prev) => prev.filter((b) => b.buildingId !== buildingId));
    } catch {
      alert("북마크 삭제에 실패했습니다.");
    }
  };

  return (
    <MobileLayout hideNav>
      <Header title="관심 건물" showBack />
      <div className="p-4">
        {loading ? (
          <p className="py-12 text-center text-sm text-slate-500">불러오는 중...</p>
        ) : bookmarks.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            저장된 관심 건물이 없습니다
          </p>
        ) : (
          <ul className="space-y-3">
            {bookmarks.map((bm) => {
              const grade = toRiskGradeFromApi(bm.riskGrade);
              return (
                <li
                  key={bm.bookmarkId}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
                >
                  <Link href={`/building/${bm.buildingId}`} className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {bm.roadAddress}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{bm.buildingName}</p>
                    <div
                      className={`mt-1 inline-flex rounded-lg border px-2 py-0.5 text-xs font-bold ${getRiskGradeBg(grade)} ${getRiskGradeColor(grade)}`}
                    >
                      HRI {bm.hriScore} · {getRiskGradeLabel(grade)}
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(bm.buildingId)}
                    className="rounded-lg p-2 text-slate-400 hover:text-risk-danger"
                    aria-label="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </MobileLayout>
  );
}
