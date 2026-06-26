import type { FieldReport } from "@/types";

/**
 * HRI Score 카테고리별 가중치 (기본값)
 * 건축 위험 25%, 시세 이상 25%, 임대인 위험 30%, 생활 안전 20%
 */
export const DEFAULT_WEIGHTS = {
  construction: 0.25,
  market: 0.25,
  landlord: 0.3,
  safety: 0.2,
} as const;

export type CategoryKey = keyof typeof DEFAULT_WEIGHTS;

export interface DynamicWeights {
  construction: number;
  market: number;
  landlord: number;
  safety: number;
}

const FIELD_REPORT_TYPE_BOOST: Record<FieldReport["type"], number> = {
  registry: 0.025,
  maintenance_fee: 0.015,
  defect: 0.02,
  landlord_contact: 0.03,
};

/**
 * 현장 제보 누적 시 가중치 동적 보정
 * 검증된 제보가 많을수록 생활안전·임대인 위험 비중 증가
 */
export function adjustWeightsByFieldReports(
  fieldReports: FieldReport[]
): DynamicWeights {
  const verified = fieldReports.filter((r) => r.verified);
  if (!verified.length) return { ...DEFAULT_WEIGHTS };

  let boost = 0;
  for (const report of verified) {
    boost += FIELD_REPORT_TYPE_BOOST[report.type] ?? 0.02;
  }
  boost = Math.min(boost, 0.12);

  return {
    construction: DEFAULT_WEIGHTS.construction - boost * 0.3,
    market: DEFAULT_WEIGHTS.market - boost * 0.2,
    landlord: DEFAULT_WEIGHTS.landlord + boost * 0.5,
    safety: DEFAULT_WEIGHTS.safety + boost * 0.5,
  };
}

/** 검증된 현장 제보 누적 감점 (HRI Score 직접 가산) */
export function getFieldReportPenalty(fieldReports: FieldReport[]): number {
  const verified = fieldReports.filter((r) => r.verified);
  const typePenalty: Record<FieldReport["type"], number> = {
    registry: 4,
    maintenance_fee: 2,
    defect: 3,
    landlord_contact: 5,
  };

  let penalty = 0;
  for (const report of verified) {
    penalty += typePenalty[report.type] ?? 2;
  }
  return Math.min(penalty, 18);
}
