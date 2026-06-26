import type { Building, FieldReport, HRIReport, RecoverySimulation, RiskGrade } from "@/types";
import type {
  AuctionRecord,
  BuildingRegistryData,
  DistrictBenchmark,
  MortgageData,
  OfficialPriceData,
  SafetyContext,
  TradeRecord,
} from "./public-api";

/** SafeRoom AI 엔진 통합 입력 */
export interface BuildingAnalysisInput {
  building: Building;
  userDeposit?: number;
  registry?: BuildingRegistryData;
  trades?: TradeRecord[];
  auction?: AuctionRecord | null;
  officialPrice?: OfficialPriceData;
  mortgage?: MortgageData;
  district?: DistrictBenchmark;
  fieldReports?: FieldReport[];
  safety?: SafetyContext;
  contractYears?: number;
}

/** ML 피처 벡터 (보증금 미반환 위험 예측용) */
export interface DepositRiskFeatures {
  jeonseRatio: number;
  districtDeviation: number;
  ltv: number;
  seniorLtv: number;
  hasActiveAuction: number;
  fieldReportCount: number;
  priceTrend: number;
  priceVolatility: number;
  contractYears: number;
  tradeLiquidity: number;
}

/** HRI 종합 분석 결과 */
export interface BuildingAnalysisResult {
  report: HRIReport;
  features: DepositRiskFeatures;
  riskExplanation: string[];
  simulation?: RecoverySimulation;
  userDeposit?: number;
}

/** 건물 비교 결과 */
export interface BuildingCompareResult {
  items: Array<{
    buildingId: string;
    adminDong: string;
    report: HRIReport;
    isSafest: boolean;
    highlightMetrics: string[];
  }>;
  safestBuildingId: string | null;
  comparisonMatrix: Array<{
    metric: string;
    values: Record<string, string | number>;
    lowerIsBetter?: boolean;
  }>;
}

/** 대시보드 인앱 알림 */
export interface DashboardAlert {
  id: string;
  type: "contract_expiry" | "grade_change";
  message: string;
  buildingId?: string;
  daysRemaining?: number;
  previousGrade?: RiskGrade;
  currentGrade?: RiskGrade;
}
