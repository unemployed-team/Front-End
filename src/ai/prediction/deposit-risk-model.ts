/**
 * 보증금 미반환 위험 확률 예측 모델 (로지스틱 회귀 기반)
 *
 * 입력: 공공 API + 현장 제보에서 추출한 피처 벡터
 * 출력: 2년 뒤 계약 만기 시점 보증금 미반환 위험 확률 (%)
 *
 * 백엔드 ML 파이프라인 연동 시 predictDepositReturnRiskFromFeatures 인터페이스 유지
 */

import type { DepositRiskFeatures } from "../types/analysis";
import {
  extractDepositRiskFeatures,
  normalizeFeatures,
} from "../features/feature-engineer";
import type { HRIInput } from "../hri-score/calculator";
import {
  DEPOSIT_RISK_MODEL_WEIGHTS,
  FEATURE_LABELS,
} from "./model-weights";

export interface DepositRiskInput {
  jeonseRatio: number;
  districtAvgJeonseRatio: number;
  hasActiveAuction: boolean;
  ltv: number;
  fieldReportCount: number;
  priceHistory: number[];
  contractYears: number;
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/** 피처 벡터 → 로지스틱 회귀 위험 확률 (0~100%) */
export function predictDepositReturnRiskFromFeatures(
  features: DepositRiskFeatures
): number {
  const normalized = normalizeFeatures(features);
  let logit = DEPOSIT_RISK_MODEL_WEIGHTS.bias;

  for (const [key, value] of Object.entries(normalized)) {
    logit += (DEPOSIT_RISK_MODEL_WEIGHTS[key] ?? 0) * value;
  }

  const probability = sigmoid(logit) * 100;
  return Math.min(95, Math.max(1, Math.round(probability * 10) / 10));
}

/** 주요 위험 요인 설명 (인앱 리포트용) */
export function explainDepositRisk(features: DepositRiskFeatures): string[] {
  const normalized = normalizeFeatures(features);
  const contributions = Object.entries(normalized)
    .map(([key, value]) => ({
      key,
      label: FEATURE_LABELS[key] ?? key,
      impact: value * (DEPOSIT_RISK_MODEL_WEIGHTS[key] ?? 0),
    }))
    .filter((c) => c.impact > 0.15)
    .sort((a, b) => b.impact - a.impact);

  const explanations: string[] = [];

  if (features.hasActiveAuction) {
    explanations.push("해당 건물에 경매 진행 이력이 확인되었습니다.");
  }
  if (features.jeonseRatio > 80) {
    explanations.push(`전세가율이 ${features.jeonseRatio.toFixed(1)}%로 높은 편입니다.`);
  }
  if (features.districtDeviation > 10) {
    explanations.push(
      `동 평균 대비 전세가율이 ${features.districtDeviation.toFixed(1)}%p 높습니다.`
    );
  }
  if (features.ltv > 0.7) {
    explanations.push(`담보대출 비율(LTV)이 ${(features.ltv * 100).toFixed(0)}%입니다.`);
  }
  if (features.fieldReportCount > 0) {
    explanations.push(
      `검증된 현장 제보 ${features.fieldReportCount}건이 위험도에 반영되었습니다.`
    );
  }
  if (features.priceTrend < -3) {
    explanations.push("주변 매매가가 하락 추세입니다.");
  }

  for (const c of contributions.slice(0, 3)) {
    if (!explanations.some((e) => e.includes(c.label))) {
      explanations.push(`${c.label} 지표가 위험도를 높이고 있습니다.`);
    }
  }

  return explanations.length ? explanations : ["현재 공개 데이터 기준 특이 위험 요인이 적습니다."];
}

/** 레거시 인터페이스 호환 */
export function predictDepositReturnRisk(input: DepositRiskInput): number {
  const features: DepositRiskFeatures = {
    jeonseRatio: input.jeonseRatio,
    districtDeviation: input.jeonseRatio - input.districtAvgJeonseRatio,
    ltv: input.ltv,
    seniorLtv: input.ltv * 0.6,
    hasActiveAuction: input.hasActiveAuction ? 1 : 0,
    fieldReportCount: input.fieldReportCount,
    priceTrend: calcPriceTrend(input.priceHistory),
    priceVolatility: calcVolatility(input.priceHistory),
    contractYears: input.contractYears,
    tradeLiquidity: 3,
  };
  return predictDepositReturnRiskFromFeatures(features);
}

export function predictFromHRIInput(
  input: HRIInput,
  contractYears = 2
): { riskPercent: number; features: DepositRiskFeatures; explanations: string[] } {
  const features = extractDepositRiskFeatures(input, contractYears);
  const riskPercent = predictDepositReturnRiskFromFeatures(features);
  const explanations = explainDepositRisk(features);
  return { riskPercent, features, explanations };
}

function calcPriceTrend(history: number[]): number {
  if (history.length < 2) return 0;
  const first = history[0];
  const last = history[history.length - 1];
  return first > 0 ? ((last - first) / first) * 100 : 0;
}

function calcVolatility(history: number[]): number {
  if (history.length < 2) return 0;
  const returns: number[] = [];
  for (let i = 1; i < history.length; i++) {
    if (history[i - 1] > 0) {
      returns.push((history[i] - history[i - 1]) / history[i - 1]);
    }
  }
  if (!returns.length) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance) * 100;
}

export interface RiskTrendPoint {
  month: string;
  riskPercent: number;
  jeonseRatio: number;
}

/** 24개월 위험도 추이 시뮬레이션 (차트용) */
export function simulateRiskTrend(
  baseRisk: number,
  baseJeonseRatio: number
): RiskTrendPoint[] {
  const points: RiskTrendPoint[] = [];
  const now = new Date();

  for (let i = 23; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const month = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
    const noise = Math.sin(i * 0.5) * 3 + (23 - i) * 0.15;
    points.push({
      month,
      riskPercent: Math.min(95, Math.max(1, baseRisk + noise - 5)),
      jeonseRatio: baseJeonseRatio + Math.sin(i * 0.3) * 2,
    });
  }

  return points;
}
