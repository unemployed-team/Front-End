/**
 * 보증금 미반환 위험 확률 예측 모델 (시계열 기반)
 *
 * MVP: 통계적 휴리스틱 모델
 * 백엔드 ML 파이프라인 연동 시 이 인터페이스를 유지하고 모델만 교체
 */

export interface DepositRiskInput {
  jeonseRatio: number;
  districtAvgJeonseRatio: number;
  hasActiveAuction: boolean;
  ltv: number;
  fieldReportCount: number;
  priceHistory: number[];
  contractYears: number;
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
  if (returns.length === 0) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance) * 100;
}

/**
 * 2년 뒤 계약 만기 시점 보증금 미반환 위험 확률 (%)
 */
export function predictDepositReturnRisk(input: DepositRiskInput): number {
  let risk = 5;

  const ratioDeviation = input.jeonseRatio - input.districtAvgJeonseRatio;
  if (ratioDeviation > 15) risk += 25;
  else if (ratioDeviation > 8) risk += 15;
  else if (ratioDeviation > 3) risk += 8;

  if (input.jeonseRatio > 85) risk += 20;
  else if (input.jeonseRatio > 75) risk += 12;

  if (input.hasActiveAuction) risk += 30;

  if (input.ltv > 0.8) risk += 18;
  else if (input.ltv > 0.6) risk += 10;

  risk += Math.min(input.fieldReportCount * 4, 16);

  const trend = calcPriceTrend(input.priceHistory);
  if (trend < -5) risk += 12;
  else if (trend < 0) risk += 5;

  const volatility = calcVolatility(input.priceHistory);
  if (volatility > 8) risk += 8;

  risk += input.contractYears * 1.5;

  return Math.min(95, Math.max(1, Math.round(risk * 10) / 10));
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
