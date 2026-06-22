import type { Building, FieldReport } from "@/types";

export interface ConstructionInput {
  building: Building;
}

export interface MarketInput {
  deposit: number;
  salePrice: number;
  districtAvgDeposit: number;
  districtAvgSalePrice: number;
  contractHistoryCount: number;
}

export interface LandlordInput {
  hasActiveAuction: boolean;
  auctionStatus?: "progress" | "closed" | "changed";
  mortgageAmount: number;
  officialPrice: number;
  seniorMortgageAmount: number;
}

export interface SafetyInput {
  adminDongCrimeIndex: number;
  fireIncidentCount: number;
  fieldReports: FieldReport[];
}

export function scoreConstruction({ building }: ConstructionInput): number {
  let score = 20;
  if (building.isViolation) score += 50;
  if (building.buildYear < 1990) score += 15;
  else if (building.buildYear < 2000) score += 8;
  const ratio = building.householdCount / Math.max(building.floors, 1);
  if (ratio > 4) score += 20;
  else if (ratio > 2.5) score += 10;
  if (building.buildingType === "oneroom" && building.floors >= 5) score += 5;
  return Math.min(100, Math.max(0, score));
}

export function scoreMarket({
  deposit,
  salePrice,
  districtAvgDeposit,
  districtAvgSalePrice,
  contractHistoryCount,
}: MarketInput): number {
  const jeonseRatio = salePrice > 0 ? (deposit / salePrice) * 100 : 0;
  const districtRatio =
    districtAvgSalePrice > 0
      ? (districtAvgDeposit / districtAvgSalePrice) * 100
      : 70;
  let score = 25;
  const deviation = jeonseRatio - districtRatio;
  if (deviation > 15) score += 35;
  else if (deviation > 8) score += 20;
  else if (deviation > 3) score += 10;
  if (jeonseRatio > 85) score += 25;
  else if (jeonseRatio > 75) score += 15;
  if (contractHistoryCount < 2) score += 10;
  return Math.min(100, Math.max(0, score));
}

export function scoreLandlord({
  hasActiveAuction,
  auctionStatus,
  mortgageAmount,
  officialPrice,
  seniorMortgageAmount,
}: LandlordInput): number {
  let score = 15;
  if (hasActiveAuction) {
    score += auctionStatus === "progress" ? 45 : 25;
  }
  const ltv = officialPrice > 0 ? (mortgageAmount / officialPrice) * 100 : 0;
  if (ltv > 80) score += 30;
  else if (ltv > 60) score += 20;
  else if (ltv > 40) score += 10;
  const seniorRatio =
    officialPrice > 0 ? (seniorMortgageAmount / officialPrice) * 100 : 0;
  if (seniorRatio > 50) score += 20;
  return Math.min(100, Math.max(0, score));
}

export function scoreSafety({
  adminDongCrimeIndex,
  fireIncidentCount,
  fieldReports,
}: SafetyInput): number {
  let score = 15 + adminDongCrimeIndex * 0.3;
  score += Math.min(fireIncidentCount * 8, 24);
  const verified = fieldReports.filter((r) => r.verified);
  for (const report of verified) {
    switch (report.type) {
      case "registry":
        score += 12;
        break;
      case "maintenance_fee":
        score += 6;
        break;
      case "defect":
        score += 10;
        break;
      case "landlord_contact":
        score += 15;
        break;
    }
  }
  return Math.min(100, Math.max(0, score));
}

export function calcJeonseRatio(deposit: number, salePrice: number): number {
  return salePrice > 0 ? (deposit / salePrice) * 100 : 0;
}
