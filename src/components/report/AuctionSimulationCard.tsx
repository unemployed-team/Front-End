import type { RecoverySimulation } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Gavel } from "lucide-react";

interface AuctionSimulationCardProps {
  simulation: RecoverySimulation;
  deposit: number;
}

export function AuctionSimulationCard({
  simulation,
  deposit,
}: AuctionSimulationCardProps) {
  const rateColor =
    simulation.depositRecoveryRate >= 80
      ? "text-risk-safe"
      : simulation.depositRecoveryRate >= 50
        ? "text-risk-caution"
        : "text-risk-danger";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <Gavel className="h-4 w-4 text-saferoom-600" />
        <h3 className="text-base font-bold text-slate-900">경매 배당 시뮬레이션</h3>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        주택임대차보호법 · 공시지가 · 선순위 근저당 · 낙찰가율 반영
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">보증금</p>
          <p className="text-sm font-bold text-slate-900">{formatCurrency(deposit)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">예상 회수율</p>
          <p className={cn("text-sm font-bold", rateColor)}>
            {simulation.depositRecoveryRate}%
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">낙찰가율</p>
          <p className="text-sm font-bold text-slate-900">
            {simulation.auctionBidRate.toFixed(0)}%
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">소액임차인 보호</p>
          <p className="text-sm font-bold text-slate-900">
            {simulation.smallTenantProtection ? "적용" : "미적용"}
          </p>
        </div>
      </div>

      {simulation.expectedLoss > 0 && (
        <p className="mt-3 rounded-lg bg-risk-danger/5 px-3 py-2 text-sm text-risk-danger">
          예상 손실액 {formatCurrency(simulation.expectedLoss)}
        </p>
      )}

      {simulation.smallTenantProtection && (
        <p className="mt-2 text-xs text-slate-500">
          최우선변제 보장액 {formatCurrency(simulation.protectedAmount)}
        </p>
      )}
    </div>
  );
}
