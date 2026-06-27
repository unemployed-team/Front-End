"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { HRIScoreCard } from "@/components/report/HRIScoreCard";
import { CategoryBreakdown } from "@/components/report/CategoryBreakdown";
import { RiskPredictionChart } from "@/components/report/RiskPredictionChart";
import { RiskExplanationCard } from "@/components/report/RiskExplanationCard";
import { DataSourcesFooter } from "@/components/report/DataSourcesFooter";
import { getBuilding, getBuildingAnalysis } from "@/lib/api/buildings";
import type { Building } from "@/types";
import type { BuildingAnalysisResult } from "@/ai/types/analysis";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

/** 공유 링크 전용 읽기 전용 리포트 (/v1/hri/{buildingId}/report) */
export default function SharedHriReportPage() {
  const params = useParams();
  const buildingId = params.buildingId as string;

  const [building, setBuilding] = useState<Building | null>(null);
  const [analysis, setAnalysis] = useState<BuildingAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  const report = analysis?.report;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const result = await getBuildingAnalysis(buildingId);
      if (result) {
        const b = await getBuilding(buildingId);
        setBuilding(b);
        setAnalysis(result);
      } else {
        setBuilding(null);
        setAnalysis(null);
      }
      setLoading(false);
    }
    load();
  }, [buildingId]);

  if (loading) {
    return (
      <MobileLayout hideNav>
        <div className="flex h-screen items-center justify-center text-slate-500">
          리포트를 불러오는 중...
        </div>
      </MobileLayout>
    );
  }

  if (!building || !analysis || !report) {
    return (
      <MobileLayout hideNav>
        <div className="flex h-screen flex-col items-center justify-center gap-2 p-8 text-center text-slate-500">
          <p>리포트를 찾을 수 없습니다.</p>
          <p className="text-xs">링크가 만료되었거나 건물 정보가 없습니다.</p>
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

      <div className="space-y-4 p-4 app-scroll">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start gap-2">
            <Shield className="mt-0.5 h-4 w-4 text-saferoom-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{building.roadAddress}</p>
              <p className="text-xs text-slate-500">{building.jibunAddress}</p>
              <p className="mt-1 text-xs text-slate-600">{building.buildYear}년 건축</p>
            </div>
          </div>
        </div>

        <HRIScoreCard
          score={report.totalScore}
          grade={report.grade}
          depositReturnRisk={report.depositReturnRiskPercent}
        />

        <RiskExplanationCard
          explanations={analysis.riskExplanation}
          depositReturnRisk={report.depositReturnRiskPercent}
        />

        <RiskPredictionChart
          baseRisk={report.depositReturnRiskPercent}
          jeonseRatio={report.jeonseRatio}
          districtAvg={report.districtAvgJeonseRatio}
        />

        <CategoryBreakdown categories={report.categories} />

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-base font-bold text-slate-900">주변 비교</h3>
          <p className="mt-2 text-sm text-slate-600">
            동 평균 전세가율 대비{" "}
            <span
              className={cn(
                "font-bold",
                report.relativeRiskPercent > 0 ? "text-risk-danger" : "text-risk-safe"
              )}
            >
              {report.relativeRiskPercent > 0 ? "+" : ""}
              {report.relativeRiskPercent.toFixed(1)}%
            </span>
          </p>
        </div>

        <DataSourcesFooter />
      </div>
    </MobileLayout>
  );
}
