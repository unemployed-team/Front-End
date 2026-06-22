import type { RecoverySimulation } from "@/types";

/**
 * 경매 배당 시뮬레이터
 * 주택임대차보호법(소액임차인) + 공시지가 + 선순위 근저당 + 낙찰가율 적용
 */

export interface AuctionSimulationInput {
  deposit: number;
  officialPrice: number;
  seniorMortgage: number;
  auctionBidRate: number;
  region: string;
  moveInDate: string;
  contractDate: string;
}

/** 지역별 평균 낙찰가율 (대법원 경매정보 기반 목값) */
export const REGION_BID_RATES: Record<string, number> = {
  default: 0.72,
  "대구": 0.68,
  "대구광역시": 0.68,
  "서울": 0.78,
  "부산": 0.7,
};

/** 소액임차인 최우선변제금 (2024 기준, 지역별 상이) */
const SMALL_TENANT_THRESHOLDS = {
  daegu: { maxDeposit: 70_000_000, priorityAmount: 25_000_000 },
  seoul: { maxDeposit: 165_000_000, priorityAmount: 55_000_000 },
  default: { maxDeposit: 55_000_000, priorityAmount: 20_000_000 },
};

function getSmallTenantProtection(
  deposit: number,
  region: string
): { eligible: boolean; protectedAmount: number } {
  const threshold = region.includes("서울")
    ? SMALL_TENANT_THRESHOLDS.seoul
    : region.includes("대구")
      ? SMALL_TENANT_THRESHOLDS.daegu
      : SMALL_TENANT_THRESHOLDS.default;

  if (deposit <= threshold.maxDeposit) {
    return { eligible: true, protectedAmount: threshold.priorityAmount };
  }
  return { eligible: false, protectedAmount: 0 };
}

export function simulateAuctionRecovery(
  input: AuctionSimulationInput
): RecoverySimulation {
  const bidRate =
    REGION_BID_RATES[input.region] ?? REGION_BID_RATES.default;
  const effectiveBidRate = input.auctionBidRate || bidRate;

  const estimatedAuctionPrice = input.officialPrice * effectiveBidRate;
  const { eligible, protectedAmount } = getSmallTenantProtection(
    input.deposit,
    input.region
  );

  let remaining = estimatedAuctionPrice;
  const seniorRepayment = Math.min(input.seniorMortgage, remaining);
  remaining -= seniorRepayment;

  const priorityRepayment = eligible
    ? Math.min(protectedAmount, remaining)
    : 0;
  remaining -= priorityRepayment;

  const depositRecovery = Math.min(input.deposit, Math.max(0, remaining));
  const depositRecoveryRate =
    input.deposit > 0 ? (depositRecovery / input.deposit) * 100 : 0;
  const expectedLoss = Math.max(0, input.deposit - depositRecovery);

  return {
    depositRecoveryRate: Math.round(depositRecoveryRate * 10) / 10,
    expectedLoss,
    priorityRepayment,
    auctionBidRate: effectiveBidRate * 100,
    officialPrice: input.officialPrice,
    seniorMortgage: input.seniorMortgage,
    smallTenantProtection: eligible,
    protectedAmount,
  };
}

export function getContractExpiryAlerts(endDate: string): string[] {
  const end = new Date(endDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const alerts: string[] = [];
  if (days <= 7 && days > 0) {
    alerts.push(`계약 만기 D-${days}: 보증금 반환 준비를 확인하세요.`);
  } else if (days <= 30 && days > 7) {
    alerts.push(`계약 만기 D-${days}: 등기부등본 갱신을 권장합니다.`);
  } else if (days <= 90 && days > 30) {
    alerts.push(`계약 만기 D-${days}: 임대인 연락 및 갱신 협의를 시작하세요.`);
  }
  return alerts;
}
