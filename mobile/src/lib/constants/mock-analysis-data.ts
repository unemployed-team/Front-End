import type { Building } from "@/types";
import type { BuildingAnalysisInput } from "@/ai/types/analysis";
import type {
  AuctionRecord,
  BuildingRegistryData,
  DistrictBenchmark,
  MortgageData,
  OfficialPriceData,
  SafetyContext,
  TradeRecord,
} from "@/ai/types/public-api";
import type { FieldReport } from "@/types";

function seed(id: string): number {
  return id.charCodeAt(id.length - 1);
}

function mockTrades(building: Building): TradeRecord[] {
  const s = seed(building.id);
  const saleBase = 70_000_000 + s * 10_000_000;
  const deposit = 45_000_000 + s * 5_000_000;

  return [
    {
      type: "sale",
      deposit: 0,
      monthlyRent: 0,
      price: saleBase * 0.92,
      contractDate: "2023-06-01",
    },
    {
      type: "sale",
      deposit: 0,
      monthlyRent: 0,
      price: saleBase * 0.96,
      contractDate: "2024-03-01",
    },
    {
      type: "sale",
      deposit: 0,
      monthlyRent: 0,
      price: saleBase,
      contractDate: "2025-01-01",
    },
    {
      type: "jeonse",
      deposit,
      monthlyRent: 0,
      price: saleBase,
      contractDate: "2024-08-01",
    },
    {
      type: "monthly",
      deposit: deposit * 0.5,
      monthlyRent: 400_000 + s * 20_000,
      price: saleBase,
      contractDate: "2025-06-01",
    },
  ];
}

function mockRegistry(building: Building): BuildingRegistryData {
  return {
    pnu: building.pnu,
    isViolation: building.isViolation,
    mainUse: building.buildingType === "officetel" ? "업무시설" : "공동주택",
    structure: building.buildYear < 1995 ? "철근콘크리트구조" : "철근콘크리트구조",
    floors: building.floors,
    householdCount: building.householdCount,
    buildYear: building.buildYear,
  };
}

function mockAuction(building: Building): AuctionRecord | null {
  if (!building.isViolation || seed(building.id) % 2 !== 0) return null;
  return {
    caseNumber: `2024타경${10000 + seed(building.id)}`,
    courtName: "대구지방법원",
    address: building.roadAddress,
    status: "progress",
    auctionType: "부동산강제경매",
    registeredAt: "2024-11-15",
  };
}

function mockFieldReports(building: Building): FieldReport[] {
  if (building.id !== "bld-003") return [];
  return [
    {
      id: "fr-001",
      buildingId: building.id,
      type: "registry",
      description: "법원 우편물 방치 확인",
      createdAt: "2025-02-01",
      verified: true,
    },
    {
      id: "fr-002",
      buildingId: building.id,
      type: "defect",
      description: "외벽 누수 흔적",
      createdAt: "2025-03-10",
      verified: true,
    },
  ];
}

/** 건물별 공공 API 목 데이터 → AI 엔진 입력 */
export function buildMockAnalysisInput(building: Building): BuildingAnalysisInput {
  const s = seed(building.id);
  const trades = mockTrades(building);
  const latestSale =
    trades.filter((t) => t.type === "sale").sort((a, b) => b.contractDate.localeCompare(a.contractDate))[0]
      ?.price ?? 80_000_000;
  const latestDeposit =
    trades.find((t) => t.type === "jeonse")?.deposit ?? 50_000_000;

  const officialPrice: OfficialPriceData = {
    pnu: building.pnu,
    officialPrice: latestSale * 0.85,
    baseYear: 2024,
  };

  const mortgage: MortgageData = {
    totalMortgage: officialPrice.officialPrice * (0.35 + (s % 4) * 0.08),
    seniorMortgage: officialPrice.officialPrice * (0.2 + (s % 3) * 0.05),
    juniorMortgage: officialPrice.officialPrice * 0.1,
  };

  const district: DistrictBenchmark = {
    adminDong: building.adminDong,
    avgDeposit: latestDeposit * 0.9,
    avgSalePrice: latestSale * 0.95,
    avgJeonseRatio: 68,
    tradeCount12m: trades.length,
  };

  const safety: SafetyContext = {
    crimeIndex: 25 + s * 4 + (building.isViolation ? 10 : 0),
    fireIncidentCount: building.isViolation ? 2 : s % 2,
  };

  return {
    building,
    userDeposit: latestDeposit,
    registry: mockRegistry(building),
    trades,
    auction: mockAuction(building),
    officialPrice,
    mortgage,
    district,
    fieldReports: mockFieldReports(building),
    safety,
    contractYears: 2,
  };
}

export const DATA_SOURCE_LABELS = [
  "국토교통부 실거래가",
  "건축물대장",
  "대법원 경매정보",
  "공시지가",
  "현장 제보",
] as const;
