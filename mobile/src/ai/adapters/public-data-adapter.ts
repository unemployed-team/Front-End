import type { Building } from "@/types";
import type {
  AuctionRecord,
  BuildingRegistryData,
  DistrictBenchmark,
  MortgageData,
  OfficialPriceData,
  SafetyContext,
  TradeRecord,
} from "../types/public-api";
import type { HRIInput } from "../hri-score/calculator";

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

function latestSalePrice(trades: TradeRecord[]): number {
  const sales = trades
    .filter((t) => t.type === "sale")
    .sort((a, b) => b.contractDate.localeCompare(a.contractDate));
  return sales[0]?.price ?? 0;
}

function latestDeposit(trades: TradeRecord[]): number {
  const leases = trades
    .filter((t) => t.type === "jeonse" || t.type === "monthly")
    .sort((a, b) => b.contractDate.localeCompare(a.contractDate));
  return leases[0]?.deposit ?? 0;
}

function salePriceHistory(trades: TradeRecord[]): number[] {
  return trades
    .filter((t) => t.type === "sale")
    .sort((a, b) => a.contractDate.localeCompare(b.contractDate))
    .map((t) => t.price);
}

/** 공공 API 원천 데이터 → HRI 알고리즘 입력 변환 */
export function toHRIInput(params: {
  building: Building;
  userDeposit?: number;
  registry?: BuildingRegistryData;
  trades?: TradeRecord[];
  auction?: AuctionRecord | null;
  officialPrice?: OfficialPriceData;
  mortgage?: MortgageData;
  district?: DistrictBenchmark;
  fieldReports?: HRIInput["fieldReports"];
  safety?: SafetyContext;
}): HRIInput {
  const trades = params.trades ?? [];
  const deposit = params.userDeposit || latestDeposit(trades) || 50_000_000;
  const salePrice = latestSalePrice(trades) || deposit * 1.6;

  const district = params.district ?? {
    adminDong: params.building.adminDong,
    avgDeposit: deposit * 0.9,
    avgSalePrice: salePrice * 0.95,
    avgJeonseRatio: 65,
    tradeCount12m: trades.length,
  };

  const registry = params.registry;
  const building: Building = registry
    ? {
        ...params.building,
        isViolation: registry.isViolation,
        buildYear: registry.buildYear,
        floors: registry.floors,
        householdCount: registry.householdCount,
        pnu: registry.pnu,
      }
    : params.building;

  const officialPrice =
    params.officialPrice?.officialPrice ?? salePrice * 0.85;
  const mortgage = params.mortgage ?? {
    totalMortgage: officialPrice * 0.35,
    seniorMortgage: officialPrice * 0.2,
    juniorMortgage: officialPrice * 0.15,
  };

  return {
    building,
    deposit,
    salePrice,
    districtAvgDeposit: district.avgDeposit,
    districtAvgSalePrice: district.avgSalePrice,
    contractHistoryCount: trades.filter(
      (t) => t.type === "jeonse" || t.type === "monthly"
    ).length,
    hasActiveAuction: !!params.auction,
    auctionStatus: params.auction?.status,
    mortgageAmount: mortgage.totalMortgage,
    officialPrice,
    seniorMortgageAmount: mortgage.seniorMortgage,
    adminDongCrimeIndex: params.safety?.crimeIndex ?? 30,
    fireIncidentCount: params.safety?.fireIncidentCount ?? 0,
    fieldReports: params.fieldReports ?? [],
    priceHistory: salePriceHistory(trades).length
      ? salePriceHistory(trades)
      : [salePrice * 0.92, salePrice * 0.96, salePrice],
  };
}

/** 실거래 기반 동 벤치마크 산출 (백엔드 집계 대체용 클라이언트 헬퍼) */
export function computeDistrictBenchmark(
  adminDong: string,
  trades: TradeRecord[]
): DistrictBenchmark {
  const deposits = trades
    .filter((t) => t.type === "jeonse" || t.type === "monthly")
    .map((t) => t.deposit);
  const sales = trades.filter((t) => t.type === "sale").map((t) => t.price);
  const avgDeposit = avg(deposits) || 45_000_000;
  const avgSale = avg(sales) || 75_000_000;
  const avgJeonseRatio = avgSale > 0 ? (avgDeposit / avgSale) * 100 : 70;

  return {
    adminDong,
    avgDeposit,
    avgSalePrice: avgSale,
    avgJeonseRatio,
    tradeCount12m: trades.length,
  };
}
