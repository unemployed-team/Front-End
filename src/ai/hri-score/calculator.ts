import type { Building, FieldReport, HRICategoryScore, HRIReport } from "@/types";
import { getRiskGrade } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants/mock-data";
import {
  scoreConstruction,
  scoreMarket,
  scoreLandlord,
  scoreSafety,
  calcJeonseRatio,
} from "./categories";
import {
  adjustWeightsByFieldReports,
  getFieldReportPenalty,
  type CategoryKey,
} from "./weights";
import { predictDepositReturnRisk } from "../prediction/deposit-risk-model";

export interface HRIInput {
  building: Building;
  deposit: number;
  salePrice: number;
  districtAvgDeposit: number;
  districtAvgSalePrice: number;
  contractHistoryCount: number;
  hasActiveAuction: boolean;
  auctionStatus?: "progress" | "closed" | "changed";
  mortgageAmount: number;
  officialPrice: number;
  seniorMortgageAmount: number;
  adminDongCrimeIndex: number;
  fireIncidentCount: number;
  fieldReports: FieldReport[];
  priceHistory?: number[];
}

function buildCategoryScore(
  category: CategoryKey,
  score: number,
  weight: number,
  details: string[]
): HRICategoryScore {
  return {
    category,
    label: CATEGORY_LABELS[category],
    score: Math.round(score),
    maxScore: 100,
    weight,
    details,
  };
}

/**
 * HRI Score 종합 산출 (0~100, 높을수록 위험)
 */
export function calculateHRIScore(input: HRIInput): HRIReport {
  const verifiedCount = input.fieldReports.filter((r) => r.verified).length;
  const weights = adjustWeightsByFieldReports(verifiedCount);
  const fieldPenalty = getFieldReportPenalty(verifiedCount);

  const constructionScore = scoreConstruction({ building: input.building });
  const marketScore = scoreMarket({
    deposit: input.deposit,
    salePrice: input.salePrice,
    districtAvgDeposit: input.districtAvgDeposit,
    districtAvgSalePrice: input.districtAvgSalePrice,
    contractHistoryCount: input.contractHistoryCount,
  });
  const landlordScore = scoreLandlord({
    hasActiveAuction: input.hasActiveAuction,
    auctionStatus: input.auctionStatus,
    mortgageAmount: input.mortgageAmount,
    officialPrice: input.officialPrice,
    seniorMortgageAmount: input.seniorMortgageAmount,
  });
  const safetyScore = scoreSafety({
    adminDongCrimeIndex: input.adminDongCrimeIndex,
    fireIncidentCount: input.fireIncidentCount,
    fieldReports: input.fieldReports,
  });

  const scores: Record<CategoryKey, number> = {
    construction: constructionScore,
    market: marketScore,
    landlord: landlordScore,
    safety: safetyScore,
  };

  let weightedSum = 0;
  for (const key of Object.keys(weights) as CategoryKey[]) {
    weightedSum += scores[key] * weights[key];
  }

  const totalScore = Math.min(
    100,
    Math.max(0, Math.round(weightedSum + fieldPenalty))
  );

  const jeonseRatio = calcJeonseRatio(input.deposit, input.salePrice);
  const districtAvgJeonseRatio = calcJeonseRatio(
    input.districtAvgDeposit,
    input.districtAvgSalePrice
  );
  const relativeRiskPercent =
    districtAvgJeonseRatio > 0
      ? ((jeonseRatio - districtAvgJeonseRatio) / districtAvgJeonseRatio) * 100
      : 0;

  const depositReturnRiskPercent = predictDepositReturnRisk({
    jeonseRatio,
    districtAvgJeonseRatio,
    hasActiveAuction: input.hasActiveAuction,
    ltv: input.officialPrice > 0 ? input.mortgageAmount / input.officialPrice : 0,
    fieldReportCount: verifiedCount,
    priceHistory: input.priceHistory ?? [],
    contractYears: 2,
  });

  const constructionDetails = [
    ...(input.building.isViolation ? ["위반건축물 등재 확인"] : ["위반건축물 없음"]),
    ...(input.building.buildYear < 1990
      ? [`노후 건물 (${input.building.buildYear}년)`]
      : []),
  ];

  const categories: HRICategoryScore[] = [
    buildCategoryScore("construction", constructionScore, weights.construction, constructionDetails),
    buildCategoryScore("market", marketScore, weights.market, [
      `전세가율 ${jeonseRatio.toFixed(1)}%`,
      `동 평균 ${districtAvgJeonseRatio.toFixed(1)}%`,
    ]),
    buildCategoryScore("landlord", landlordScore, weights.landlord, [
      ...(input.hasActiveAuction
        ? [`경매 ${input.auctionStatus === "progress" ? "진행 중" : "이력 있음"}`]
        : ["경매 이력 없음"]),
    ]),
    buildCategoryScore("safety", safetyScore, weights.safety, [
      verifiedCount > 0 ? `현장 제보 ${verifiedCount}건 반영` : "현장 제보 없음",
    ]),
  ];

  return {
    buildingId: input.building.id,
    totalScore,
    grade: getRiskGrade(totalScore),
    categories,
    depositReturnRiskPercent,
    jeonseRatio,
    districtAvgJeonseRatio,
    relativeRiskPercent,
    fieldReportPenalty: fieldPenalty,
    updatedAt: new Date().toISOString(),
  };
}

/** 건물별 목 데이터용 HRI 리포트 생성 */
export function generateMockHRIReport(building: Building): HRIReport {
  const seed = building.id.charCodeAt(building.id.length - 1);
  const baseDeposit = 50_000_000 + seed * 5_000_000;
  const baseSale = 80_000_000 + seed * 8_000_000;

  return calculateHRIScore({
    building,
    deposit: baseDeposit,
    salePrice: baseSale,
    districtAvgDeposit: 45_000_000,
    districtAvgSalePrice: 75_000_000,
    contractHistoryCount: 3 + (seed % 4),
    hasActiveAuction: building.isViolation && seed % 2 === 0,
    auctionStatus: building.isViolation ? "progress" : undefined,
    mortgageAmount: baseSale * (0.3 + (seed % 5) * 0.08),
    officialPrice: baseSale * 0.85,
    seniorMortgageAmount: baseSale * 0.2,
    adminDongCrimeIndex: 30 + seed * 3,
    fireIncidentCount: seed % 3,
    fieldReports: [],
    priceHistory: [baseSale * 0.9, baseSale * 0.95, baseSale, baseSale * 1.02],
  });
}
