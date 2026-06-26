/**
 * SafeRoom AI 통합 엔진
 *
 * 공공 API 데이터 → HRI Score → 보증금 위험 예측 → 경매 시뮬레이션
 * 백엔드 이식 시 이 모듈 전체를 서비스 레이어로 옮기면 됨
 */

import type { Building, CompareItem, Contract, Bookmark } from "@/types";
import type { BuildingAnalysisInput, BuildingAnalysisResult } from "./types/analysis";
import { toHRIInput } from "./adapters/public-data-adapter";
import { calculateHRIScore, generateMockHRIReport } from "./hri-score/calculator";
import { predictFromHRIInput } from "./prediction/deposit-risk-model";
import { simulateAuctionRecovery } from "./simulator/auction-recovery";
import { compareBuildings } from "./compare/building-compare";
import { screenDashboardAlerts } from "./alerts/dashboard-alerts";
import { clusterBuildings, filterByUniversityZone } from "./spatial/cluster";

export class SafeRoomEngine {
  /**
   * 건물 종합 분석 (HRI Score + ML 위험 예측 + 경매 시뮬레이션)
   */
  static analyzeBuilding(input: BuildingAnalysisInput): BuildingAnalysisResult {
    const hriInput = toHRIInput({
      building: input.building,
      userDeposit: input.userDeposit,
      registry: input.registry,
      trades: input.trades,
      auction: input.auction,
      officialPrice: input.officialPrice,
      mortgage: input.mortgage,
      district: input.district,
      fieldReports: input.fieldReports,
      safety: input.safety,
    });

    const report = calculateHRIScore(hriInput);
    const { riskPercent, features, explanations } = predictFromHRIInput(
      hriInput,
      input.contractYears ?? 2
    );

    report.depositReturnRiskPercent = riskPercent;

    const userDeposit = input.userDeposit ?? hriInput.deposit;

    const simulation = userDeposit
      ? simulateAuctionRecovery({
          deposit: userDeposit,
          officialPrice: hriInput.officialPrice,
          seniorMortgage: hriInput.seniorMortgageAmount,
          auctionBidRate: 0,
          region: input.building.roadAddress.includes("대구") ? "대구" : "default",
          moveInDate: new Date().toISOString().split("T")[0],
          contractDate: new Date().toISOString().split("T")[0],
        })
      : undefined;

    return { report, features, riskExplanation: explanations, simulation, userDeposit };
  }

  /** 목 데이터 기반 빠른 분석 */
  static analyzeMock(building: Building): BuildingAnalysisResult {
    const report = generateMockHRIReport(building);
    const hriInput = toHRIInput({ building });
    const { features, explanations } = predictFromHRIInput(hriInput);
    return {
      report,
      features,
      riskExplanation: explanations,
    };
  }

  /** 건물 비교 (최대 3개) */
  static compare(items: CompareItem[]) {
    return compareBuildings(items);
  }

  /** 마이페이지 인앱 알림 스크리닝 */
  static screenAlerts(params: { contracts: Contract[]; bookmarks: Bookmark[] }) {
    return screenDashboardAlerts(params);
  }

  /** 지도 클러스터링 */
  static cluster(
    points: Array<{ building: Building; report: BuildingAnalysisResult["report"] }>,
    zoomLevel: number
  ) {
    return clusterBuildings(points, zoomLevel);
  }

  /** 대학가 레이어 필터 */
  static filterUniversity(
    buildings: Building[],
    zone: "keimyung" | "kyungpook" | "yeungnam"
  ) {
    return filterByUniversityZone(buildings, zone);
  }
}

export default SafeRoomEngine;
