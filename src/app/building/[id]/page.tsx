"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Header } from "@/components/layout/Header";
import { AIAnalysisHeader } from "@/components/report/AIAnalysisHeader";
import { HRIScoreCard } from "@/components/report/HRIScoreCard";
import { CategoryBreakdown } from "@/components/report/CategoryBreakdown";
import { RiskPredictionChart } from "@/components/report/RiskPredictionChart";
import { RiskExplanationCard } from "@/components/report/RiskExplanationCard";
import { AuctionSimulationCard } from "@/components/report/AuctionSimulationCard";
import { DataSourcesFooter } from "@/components/report/DataSourcesFooter";
import { ShareButton } from "@/components/report/ShareButton";
import { getBuilding, getBuildingAnalysis } from "@/lib/api/buildings";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import type { Building } from "@/types";
import type { BuildingAnalysisResult } from "@/ai/types/analysis";
import { Bookmark, GitCompare, Shield } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BuildingReportPage() {
  const params = useParams();
  const buildingId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  const { bookmarks, addBookmark, removeBookmark, toggleCompare } = useAppStore();

  const [building, setBuilding] = useState<Building | null>(null);
  const [analysis, setAnalysis] = useState<BuildingAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  const bookmark = bookmarks.find((b) => b.buildingId === buildingId);
  const report = analysis?.report;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [b, a] = await Promise.all([
        getBuilding(buildingId),
        getBuildingAnalysis(buildingId),
      ]);
      setBuilding(b);
      setAnalysis(a);
      setLoading(false);
    }
    load();
  }, [buildingId]);

  const handleBookmark = () => {
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    if (!building || !report) return;

    if (bookmark) {
      removeBookmark(bookmark.id);
    } else {
      addBookmark({
        id: `bm-${Date.now()}`,
        buildingId,
        building,
        report,
        addedAt: new Date().toISOString(),
      });
    }
  };

  const handleCompare = () => {
    if (!building || !report) return;
    toggleCompare({ building, report });
  };

  if (loading) {
    return (
      <MobileLayout hideNav>
        <div className="flex h-screen flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-saferoom-600 border-t-transparent" />
          <p className="text-sm text-slate-500">AI가 공공데이터를 분석 중...</p>
        </div>
      </MobileLayout>
    );
  }

  if (!building || !analysis || !report) {
    return (
      <MobileLayout hideNav>
        <Header title="건물 리포트" showBack />
        <div className="p-8 text-center text-slate-500">건물 정보를 찾을 수 없습니다.</div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout hideNav>
      <Header
        title="HRI 분석 리포트"
        showBack
        right={
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleBookmark}
              className={cn(
                "rounded-lg p-2",
                bookmark ? "text-saferoom-600" : "text-slate-400"
              )}
              aria-label="북마크"
            >
              <Bookmark className="h-5 w-5" fill={bookmark ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              onClick={handleCompare}
              className="rounded-lg p-2 text-slate-400"
              aria-label="비교 추가"
            >
              <GitCompare className="h-5 w-5" />
            </button>
          </div>
        }
      />

      <div className="space-y-4 p-4 app-scroll">
        <AIAnalysisHeader />

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-start gap-2">
            <Shield className="mt-0.5 h-4 w-4 text-saferoom-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{building.roadAddress}</p>
              <p className="text-xs text-slate-500">{building.jibunAddress}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                <span>{building.buildYear}년 건축</span>
                <span>·</span>
                <span>{building.floors}층</span>
                <span>·</span>
                <span>{building.householdCount}세대</span>
                {building.universityProximity && (
                  <>
                    <span>·</span>
                    <span className="text-saferoom-600">대학가 인근</span>
                  </>
                )}
                {building.isViolation && (
                  <span className="rounded bg-risk-danger/10 px-1.5 py-0.5 font-medium text-risk-danger">
                    위반건축물
                  </span>
                )}
              </div>
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
          {report.fieldReportPenalty > 0 && (
            <p className="mt-1 text-xs text-risk-caution">
              현장 제보 반영 감점 +{report.fieldReportPenalty}점
            </p>
          )}
        </div>

        {analysis.simulation && analysis.userDeposit && (
          <AuctionSimulationCard
            simulation={analysis.simulation}
            deposit={analysis.userDeposit}
          />
        )}

        <DataSourcesFooter />

        <div className="flex gap-2 pb-4">
          <ShareButton buildingId={buildingId} />
          <Link
            href={`/report/qr/${buildingId}`}
            className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700"
          >
            현장 제보 QR
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
}
