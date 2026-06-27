"use client";

import { useEffect, useMemo, useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Header } from "@/components/layout/Header";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import { SafeRoomEngine } from "@/ai";
import { compareBookmarks } from "@/lib/api/bookmarks";
import { toRiskGrade } from "@/lib/api/mappers";
import type { BuildingCompareItem, CompareResponse } from "@/lib/api/types";
import {
  cn,
  formatCurrency,
  getRiskGradeBg,
  getRiskGradeColor,
  getRiskGradeLabel,
} from "@/lib/utils";
import { GitCompare, X, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const API_COMPARE_ROWS: {
  metric: string;
  lowerIsBetter?: boolean;
  getValue: (item: BuildingCompareItem) => string | number;
}[] = [
  { metric: "HRI 점수", lowerIsBetter: true, getValue: (b) => b.hriScore },
  {
    metric: "등급",
    getValue: (b) => getRiskGradeLabel(toRiskGrade(b.riskGrade)),
  },
  { metric: "건물 위험", lowerIsBetter: true, getValue: (b) => b.buildingRiskScore },
  { metric: "시장 위험", lowerIsBetter: true, getValue: (b) => b.marketRiskScore },
  {
    metric: "임대인 위험",
    lowerIsBetter: true,
    getValue: (b) => b.landlordRiskScore,
  },
  { metric: "생활 위험", lowerIsBetter: true, getValue: (b) => b.livingRiskScore },
  {
    metric: "평균 보증금",
    lowerIsBetter: true,
    getValue: (b) => formatCurrency(b.avgDepositPrice),
  },
];

export default function ComparePage() {
  const { compareSelection, toggleCompare, clearCompare } = useAppStore();
  const isDevSession = useAuthStore((s) => s.isDevSession);

  const buildingIds = useMemo(
    () =>
      compareSelection
        .map((c) => Number(c.building.id))
        .filter((id) => id > 0 && !Number.isNaN(id)),
    [compareSelection]
  );

  const [apiCompare, setApiCompare] = useState<CompareResponse | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const mockResult = useMemo(
    () => SafeRoomEngine.compare(compareSelection),
    [compareSelection]
  );

  const useApiCompare =
    !USE_MOCK && !isDevSession && buildingIds.length >= 2;

  useEffect(() => {
    if (!useApiCompare) {
      setApiCompare(null);
      return;
    }
    setCompareLoading(true);
    compareBookmarks(buildingIds)
      .then(setApiCompare)
      .catch(() => setApiCompare(null))
      .finally(() => setCompareLoading(false));
  }, [buildingIds, useApiCompare]);

  const apiSafest = apiCompare?.buildings.find(
    (b) => b.buildingId === apiCompare.safestBuildingId
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
        ) : useApiCompare && apiCompare ? (
          <div className="space-y-4">
            {apiSafest && (
              <div className="flex items-center gap-2 rounded-xl bg-saferoom-50 px-4 py-3 text-sm text-saferoom-800">
                <Sparkles className="h-4 w-4" />
                AI 추천:{" "}
                <span className="font-bold">{apiSafest.buildingName}</span>이
                종합 안전 지표가 가장 우수합니다
              </div>
            )}

            <p className="text-xs text-slate-500">
              {compareSelection.length}/3 선택 · 백엔드 HRI 비교
            </p>

            {compareLoading && (
              <p className="text-xs text-slate-400">비교 데이터 갱신 중...</p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 text-left text-xs font-medium text-slate-500">
                      지표
                    </th>
                    {apiCompare.buildings.map((item) => (
                      <th key={item.buildingId} className="px-2 py-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {item.isHighlighted && (
                            <Trophy className="h-3.5 w-3.5 text-risk-caution" />
                          )}
                          <span className="max-w-[80px] truncate text-xs font-semibold text-slate-900">
                            {item.buildingName}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const full = compareSelection.find(
                                (c) => c.building.id === String(item.buildingId)
                              );
                              if (full) toggleCompare(full);
                            }}
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
                  {API_COMPARE_ROWS.map((row) => (
                    <tr key={row.metric} className="border-b border-slate-100">
                      <td className="py-3 text-xs text-slate-600">{row.metric}</td>
                      {apiCompare.buildings.map((item) => {
                        const value = row.getValue(item);
                        const numericValues = apiCompare.buildings
                          .map((b) => row.getValue(b))
                          .filter((v): v is number => typeof v === "number");
                        const isBest =
                          row.lowerIsBetter &&
                          typeof value === "number" &&
                          numericValues.length > 0 &&
                          value === Math.min(...numericValues);

                        return (
                          <td
                            key={item.buildingId}
                            className={cn(
                              "px-2 py-3 text-center font-semibold",
                              isBest && "text-saferoom-600",
                              row.metric === "등급" &&
                                getRiskGradeColor(toRiskGrade(item.riskGrade))
                            )}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3">
              {apiCompare.buildings.map((item) => {
                const grade = toRiskGrade(item.riskGrade);
                return (
                  <Link
                    key={item.buildingId}
                    href={`/building/${item.buildingId}`}
                    className={cn(
                      "block rounded-xl border p-4 transition",
                      item.isHighlighted
                        ? "border-saferoom-400 bg-saferoom-50"
                        : "border-slate-200 bg-white"
                    )}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {item.roadAddress}
                    </p>
                    <div
                      className={cn(
                        "mt-2 inline-flex rounded-lg border px-2 py-1 text-xs font-bold",
                        getRiskGradeBg(grade),
                        getRiskGradeColor(grade)
                      )}
                    >
                      HRI {item.hriScore} · {getRiskGradeLabel(grade)}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {mockResult.safestBuildingId && (
              <div className="flex items-center gap-2 rounded-xl bg-saferoom-50 px-4 py-3 text-sm text-saferoom-800">
                <Sparkles className="h-4 w-4" />
                AI 추천:{" "}
                <span className="font-bold">
                  {mockResult.items.find((i) => i.isSafest)?.adminDong}
                </span>
                이 종합 안전 지표가 가장 우수합니다
              </div>
            )}

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
                    {mockResult.items.map((item) => (
                      <th key={item.buildingId} className="px-2 py-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {item.isSafest && (
                            <Trophy className="h-3.5 w-3.5 text-risk-caution" />
                          )}
                          <span className="max-w-[80px] truncate text-xs font-semibold text-slate-900">
                            {item.adminDong}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const full = compareSelection.find(
                                (c) => c.building.id === item.buildingId
                              );
                              if (full) toggleCompare(full);
                            }}
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
                  {mockResult.comparisonMatrix.map((row) => (
                    <tr key={row.metric} className="border-b border-slate-100">
                      <td className="py-3 text-xs text-slate-600">{row.metric}</td>
                      {mockResult.items.map((item) => {
                        const value = row.values[item.buildingId];
                        const numericValues = mockResult.items
                          .map((i) => row.values[i.buildingId])
                          .filter((v): v is number => typeof v === "number");
                        const isBest =
                          row.lowerIsBetter &&
                          typeof value === "number" &&
                          numericValues.length > 0 &&
                          value === Math.min(...numericValues);

                        return (
                          <td
                            key={item.buildingId}
                            className={cn(
                              "px-2 py-3 text-center font-semibold",
                              isBest && "text-saferoom-600",
                              row.metric === "등급" &&
                                getRiskGradeColor(item.report.grade)
                            )}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3">
              {mockResult.items.map((item) => (
                <Link
                  key={item.buildingId}
                  href={`/building/${item.buildingId}`}
                  className={cn(
                    "block rounded-xl border p-4 transition",
                    item.isSafest
                      ? "border-saferoom-400 bg-saferoom-50"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {
                      compareSelection.find((c) => c.building.id === item.buildingId)
                        ?.building.roadAddress
                    }
                  </p>
                  <div
                    className={cn(
                      "mt-2 inline-flex rounded-lg border px-2 py-1 text-xs font-bold",
                      getRiskGradeBg(item.report.grade),
                      getRiskGradeColor(item.report.grade)
                    )}
                  >
                    HRI {item.report.totalScore} ·{" "}
                    {getRiskGradeLabel(item.report.grade)}
                  </div>
                  {item.isSafest && (
                    <p className="mt-2 text-xs font-medium text-saferoom-700">
                      {item.highlightMetrics.join(" · ")}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
