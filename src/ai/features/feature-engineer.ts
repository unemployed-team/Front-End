import type { DepositRiskFeatures } from "../types/analysis";
import type { HRIInput } from "../hri-score/calculator";
import { calcJeonseRatio } from "../hri-score/categories";

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

/** HRI 입력 → ML 피처 벡터 추출 */
export function extractDepositRiskFeatures(
  input: HRIInput,
  contractYears = 2,
  tradeLiquidity = 3
): DepositRiskFeatures {
  const jeonseRatio = calcJeonseRatio(input.deposit, input.salePrice);
  const districtAvgJeonseRatio = calcJeonseRatio(
    input.districtAvgDeposit,
    input.districtAvgSalePrice
  );
  const verifiedCount = input.fieldReports.filter((r) => r.verified).length;
  const priceHistory = input.priceHistory ?? [];

  return {
    jeonseRatio,
    districtDeviation: jeonseRatio - districtAvgJeonseRatio,
    ltv: input.officialPrice > 0 ? input.mortgageAmount / input.officialPrice : 0,
    seniorLtv:
      input.officialPrice > 0
        ? input.seniorMortgageAmount / input.officialPrice
        : 0,
    hasActiveAuction: input.hasActiveAuction ? 1 : 0,
    fieldReportCount: verifiedCount,
    priceTrend: calcPriceTrend(priceHistory),
    priceVolatility: calcVolatility(priceHistory),
    contractYears,
    tradeLiquidity,
  };
}

/** 피처 정규화 (0~1) */
export function normalizeFeatures(f: DepositRiskFeatures): Record<string, number> {
  return {
    jeonse_ratio: Math.min(f.jeonseRatio / 100, 1),
    district_dev: Math.min(Math.max(f.districtDeviation + 20, 0) / 40, 1),
    ltv: Math.min(f.ltv, 1),
    senior_ltv: Math.min(f.seniorLtv, 1),
    auction: f.hasActiveAuction,
    field_reports: Math.min(f.fieldReportCount / 5, 1),
    price_trend_down: Math.min(Math.max(-f.priceTrend, 0) / 20, 1),
    volatility: Math.min(f.priceVolatility / 15, 1),
    contract_years: Math.min(f.contractYears / 3, 1),
    trade_liquidity_low: Math.min(Math.max(3 - f.tradeLiquidity, 0) / 3, 1),
  };
}
