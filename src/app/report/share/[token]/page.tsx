"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { HRIScoreCard } from "@/components/report/HRIScoreCard";
import { CategoryBreakdown } from "@/components/report/CategoryBreakdown";
import { getBuilding, getBuildingReport } from "@/lib/api/buildings";
import type { Building, HRIReport } from "@/types";

export default function SharedReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const buildingId =
    (searchParams.get("building") as string) ?? (params.token as string);

  const [building, setBuilding] = useState<Building | null>(null);
  const [report, setReport] = useState<HRIReport | null>(null);

  useEffect(() => {
    async function load() {
      const [b, r] = await Promise.all([
        getBuilding(buildingId),
        getBuildingReport(buildingId),
      ]);
      setBuilding(b);
      setReport(r);
    }
    if (buildingId) load();
  }, [buildingId]);

  if (!building || !report) {
    return (
      <MobileLayout hideNav>
        <div className="flex h-screen items-center justify-center text-slate-500">
          리포트를 불러오는 중...
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideNav>
      <div className="border-b border-slate-200 bg-white px-4 py-4 text-center">
        <p className="text-xs text-saferoom-600">SafeRoom AI 공유 리포트</p>
        <h1 className="mt-1 text-sm font-bold text-slate-900">{building.roadAddress}</h1>
      </div>
      <div className="space-y-4 p-4">
        <HRIScoreCard
          score={report.totalScore}
          grade={report.grade}
          depositReturnRisk={report.depositReturnRiskPercent}
        />
        <CategoryBreakdown categories={report.categories} />
      </div>
    </MobileLayout>
  );
}
