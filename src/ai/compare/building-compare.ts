import type { CompareItem } from "@/types";
import { getRiskGradeLabel } from "@/lib/utils";
import type { BuildingCompareResult } from "../types/analysis";

const MAX_COMPARE = 3;

/** 최대 3개 건물 비교 + 최안전 건물 자동 하이라이트 */
export function compareBuildings(items: CompareItem[]): BuildingCompareResult {
  if (!items.length) {
    return { items: [], safestBuildingId: null, comparisonMatrix: [] };
  }

  const capped = items.slice(0, MAX_COMPARE);

  const safest = capped.reduce<CompareItem | null>((best, item) => {
    if (!best || item.report.totalScore < best.report.totalScore) return item;
    return best;
  }, null);

  const comparisonMatrix = [
    {
      metric: "HRI Score",
      lowerIsBetter: true,
      values: Object.fromEntries(
        capped.map((i) => [i.building.id, i.report.totalScore])
      ),
    },
    {
      metric: "등급",
      values: Object.fromEntries(
        capped.map((i) => [
          i.building.id,
          getRiskGradeLabel(i.report.grade),
        ])
      ),
    },
    {
      metric: "미반환 위험",
      lowerIsBetter: true,
      values: Object.fromEntries(
        capped.map((i) => [
          i.building.id,
          `${i.report.depositReturnRiskPercent}%`,
        ])
      ),
    },
    {
      metric: "전세가율",
      values: Object.fromEntries(
        capped.map((i) => [i.building.id, `${i.report.jeonseRatio.toFixed(1)}%`])
      ),
    },
  ];

  return {
    items: capped.map((item) => ({
      buildingId: item.building.id,
      adminDong: item.building.adminDong,
      report: item.report,
      isSafest: safest?.building.id === item.building.id,
      highlightMetrics:
        safest?.building.id === item.building.id
          ? ["HRI Score 최저", "종합 안전 지표 우수"]
          : [],
    })),
    safestBuildingId: safest?.building.id ?? null,
    comparisonMatrix,
  };
}

export { MAX_COMPARE };
