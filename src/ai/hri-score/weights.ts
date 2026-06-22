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

/**
 * 현장 제보 누적 시 가중치 동적 보정
 * 검증된 제보가 많을수록 생활안전·임대인 위험 비중 증가
 */
export function adjustWeightsByFieldReports(
  verifiedReportCount: number
): DynamicWeights {
  const base = { ...DEFAULT_WEIGHTS };
  if (verifiedReportCount === 0) return base;

  const boost = Math.min(verifiedReportCount * 0.02, 0.1);
  return {
    construction: base.construction - boost * 0.3,
    market: base.market - boost * 0.2,
    landlord: base.landlord + boost * 0.5,
    safety: base.safety + boost * 0.5,
  };
}

export function getFieldReportPenalty(verifiedReportCount: number): number {
  return Math.min(verifiedReportCount * 3, 15);
}
