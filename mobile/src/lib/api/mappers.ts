import type { Building, HRIReport, RiskGrade } from "@/types";
import { buildSharePath } from "@/lib/share-url";
import type { BuildingResponse, HriReportResponse } from "./types";

export function toRiskGrade(riskGrade: string | null | undefined): RiskGrade {
  switch (riskGrade?.toUpperCase()) {
    case "SAFE":
      return "safe";
    case "DANGER":
      return "danger";
    case "CAUTION":
    default:
      return "caution";
  }
}

function toBuildingType(buildingType: string): Building["buildingType"] {
  if (buildingType.includes("오피스텔")) return "officetel";
  if (buildingType.includes("다가구") || buildingType.includes("다세대")) {
    return "multifamily";
  }
  return "oneroom";
}

function ratioToPercent(ratio: number | null | undefined): number {
  if (ratio == null || Number.isNaN(ratio)) return 0;
  return ratio <= 1 ? ratio * 100 : ratio;
}

export function toBuilding(res: BuildingResponse): Building {
  return {
    id: String(res.buildingId),
    pnu: "",
    roadAddress: res.roadAddress,
    jibunAddress: res.jibunAddress,
    lat: res.latitude,
    lng: res.longitude,
    buildingType: toBuildingType(res.buildingType),
    buildYear: res.buildYear,
    floors: 0,
    householdCount: 0,
    isViolation: res.isIllegalBuilding,
    adminDong: "",
  };
}

export function toHRIReport(res: HriReportResponse): HRIReport {
  const jeonsePercent = ratioToPercent(res.buildingJeonseRatio);
  const districtAvgPercent = ratioToPercent(res.districtAvgJeonseRatio);
  const relativeRiskPercent =
    districtAvgPercent > 0
      ? ((jeonsePercent - districtAvgPercent) / districtAvgPercent) * 100
      : 0;

  return {
    buildingId: String(res.buildingId),
    totalScore: res.totalScore,
    grade: toRiskGrade(res.riskGrade),
    categories: [
      {
        category: "construction",
        label: "건축 위험",
        score: res.buildingRiskScore,
        maxScore: 25,
        weight: 0.25,
        details: [],
      },
      {
        category: "market",
        label: "시세 이상",
        score: res.marketRiskScore,
        maxScore: 25,
        weight: 0.25,
        details: [],
      },
      {
        category: "landlord",
        label: "임대인 위험",
        score: res.landlordRiskScore,
        maxScore: 30,
        weight: 0.3,
        details: [],
      },
      {
        category: "safety",
        label: "생활 안전",
        score: res.livingRiskScore,
        maxScore: 20,
        weight: 0.2,
        details: [],
      },
    ],
    depositReturnRiskPercent: res.riskProbability * 100,
    jeonseRatio: jeonsePercent,
    districtAvgJeonseRatio: districtAvgPercent,
    relativeRiskPercent,
    fieldReportPenalty: 0,
    updatedAt: res.calculatedAt,
    shareUrl: buildSharePath(res.buildingId),
  };
}

export function toAnalysisExplanations(res: HriReportResponse): string[] {
  const lines: string[] = [];
  if (res.districtCompareComment) lines.push(res.districtCompareComment);
  if (res.riskTrend && res.riskTrend !== "UNKNOWN") {
    const trendLabel: Record<string, string> = {
      RISING: "상승 추세",
      FALLING: "하락 추세",
      STABLE: "안정 추세",
    };
    lines.push(`전세가율 추세: ${trendLabel[res.riskTrend] ?? res.riskTrend}`);
  }
  if (res.auctions.length > 0) {
    lines.push(`등록된 경매 정보 ${res.auctions.length}건`);
  }
  return lines;
}
