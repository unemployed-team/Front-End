import type { Bookmark, Contract, RiskGrade } from "@/types";
import { getRiskGradeLabel } from "@/lib/utils";
import type { DashboardAlert } from "../types/analysis";
import { getContractExpiryAlerts } from "../simulator/auction-recovery";

/** 계약 만기 D-90/30/7 인앱 알림 */
export function getDashboardContractAlerts(
  contracts: Contract[]
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  for (const contract of contracts) {
    const messages = getContractExpiryAlerts(contract.endDate);
    const end = new Date(contract.endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    for (const message of messages) {
      alerts.push({
        id: `contract-${contract.id}-${days}`,
        type: "contract_expiry",
        message: `${contract.building.adminDong || contract.building.roadAddress}: ${message}`,
        buildingId: contract.buildingId,
        daysRemaining: days,
      });
    }
  }

  return alerts.sort((a, b) => (a.daysRemaining ?? 999) - (b.daysRemaining ?? 999));
}

/** 북마크 HRI 등급 변동 알림 */
export function getBookmarkGradeChangeAlerts(
  bookmarks: Bookmark[]
): DashboardAlert[] {
  return bookmarks
    .filter(
      (bm) => bm.previousGrade && bm.previousGrade !== bm.report.grade
    )
    .map((bm) => ({
      id: `grade-${bm.id}`,
      type: "grade_change" as const,
      message: `${bm.building.adminDong}: 등급 ${getRiskGradeLabel(bm.previousGrade!)} → ${getRiskGradeLabel(bm.report.grade)}`,
      buildingId: bm.buildingId,
      previousGrade: bm.previousGrade,
      currentGrade: bm.report.grade,
    }));
}

/** 마이페이지 진입 시 통합 스크리닝 알림 */
export function screenDashboardAlerts(params: {
  contracts: Contract[];
  bookmarks: Bookmark[];
}): DashboardAlert[] {
  return [
    ...getDashboardContractAlerts(params.contracts),
    ...getBookmarkGradeChangeAlerts(params.bookmarks),
  ];
}
