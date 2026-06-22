"use client";

import { MobileLayout } from "@/components/layout/MobileLayout";
import { Header } from "@/components/layout/Header";
import { useAppStore } from "@/store/app-store";
import {
  cn,
  getRiskGradeBg,
  getRiskGradeColor,
  getRiskGradeLabel,
} from "@/lib/utils";
import { GitCompare, X, Trophy } from "lucide-react";
import Link from "next/link";

export default function ComparePage() {
  const { compareSelection, toggleCompare, clearCompare } = useAppStore();

  const safest = compareSelection.reduce<(typeof compareSelection)[0] | null>(
    (best, item) => {
      if (!best || item.report.totalScore < best.report.totalScore) return item;
      return best;
    },
    null
  );

  return (
    <MobileLayout>
      <Header
        title="건물 비교"
        right={
          compareSelection.length > 0 ? (
            <button
              type="button"
              onClick={clearCompare}
              className="text-xs text-slate-500"
            >
              초기화
            </button>
          ) : undefined
        }
      />

      <div className="p-4">
        {compareSelection.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
            <GitCompare className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              건물 리포트에서 최대 3개까지 비교할 수 있습니다
            </p>
            <Link
              href="/search"
              className="mt-4 inline-block rounded-xl bg-saferoom-600 px-4 py-2 text-sm font-semibold text-white"
            >
              건물 검색하기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              {compareSelection.length}/3 선택 · HRI Score 기준 비교
            </p>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 text-left text-xs font-medium text-slate-500">
                      지표
                    </th>
                    {compareSelection.map((item) => (
                      <th key={item.building.id} className="px-2 py-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {safest?.building.id === item.building.id && (
                            <Trophy className="h-3.5 w-3.5 text-risk-caution" />
                          )}
                          <span className="max-w-[80px] truncate text-xs font-semibold text-slate-900">
                            {item.building.adminDong}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleCompare(item)}
                            className="text-slate-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: "HRI Score",
                      get: (i: (typeof compareSelection)[0]) => i.report.totalScore,
                      format: (v: number) => String(v),
                      lowerBetter: true,
                    },
                    {
                      label: "등급",
                      get: (i: (typeof compareSelection)[0]) => i.report.grade,
                      format: (v: string) => getRiskGradeLabel(v as "safe" | "caution" | "danger"),
                    },
                    {
                      label: "미반환 위험",
                      get: (i: (typeof compareSelection)[0]) =>
                        i.report.depositReturnRiskPercent,
                      format: (v: number) => `${v}%`,
                      lowerBetter: true,
                    },
                    {
                      label: "전세가율",
                      get: (i: (typeof compareSelection)[0]) => i.report.jeonseRatio,
                      format: (v: number) => `${v.toFixed(1)}%`,
                    },
                  ].map((row) => (
                    <tr key={row.label} className="border-b border-slate-100">
                      <td className="py-3 text-xs text-slate-600">{row.label}</td>
                      {compareSelection.map((item) => {
                        const value = row.get(item);
                        const isBest =
                          safest &&
                          row.lowerBetter !== undefined &&
                          row.get(safest) === value &&
                          (typeof value === "number"
                            ? value ===
                              Math.min(
                                ...compareSelection.map((c) => row.get(c) as number)
                              )
                            : false);

                        return (
                          <td
                            key={item.building.id}
                            className={cn(
                              "px-2 py-3 text-center font-semibold",
                              isBest && "text-saferoom-600",
                              row.label === "등급" &&
                                getRiskGradeColor(item.report.grade)
                            )}
                          >
                            {typeof value === "number" || typeof value === "string"
                              ? row.format(value as never)
                              : value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3">
              {compareSelection.map((item) => (
                <Link
                  key={item.building.id}
                  href={`/building/${item.building.id}`}
                  className={cn(
                    "block rounded-xl border p-4 transition",
                    safest?.building.id === item.building.id
                      ? "border-saferoom-400 bg-saferoom-50"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {item.building.roadAddress}
                  </p>
                  <div
                    className={cn(
                      "mt-2 inline-flex rounded-lg border px-2 py-1 text-xs font-bold",
                      getRiskGradeBg(item.report.grade),
                      getRiskGradeColor(item.report.grade)
                    )}
                  >
                    HRI {item.report.totalScore} · {getRiskGradeLabel(item.report.grade)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
