import type { DashboardAlert } from "@/ai/types/analysis";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardAlertsPanelProps {
  alerts: DashboardAlert[];
}

export function DashboardAlertsPanel({ alerts }: DashboardAlertsPanelProps) {
  if (!alerts.length) return null;

  const contractAlerts = alerts.filter((a) => a.type === "contract_expiry");
  const gradeAlerts = alerts.filter((a) => a.type === "grade_change");

  return (
    <div className="space-y-3">
      {contractAlerts.length > 0 && (
        <div className="rounded-xl border border-risk-caution/30 bg-risk-caution/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-risk-caution">
            <AlertTriangle className="h-4 w-4" />
            계약 만기 알림 (D-90 / D-30 / D-7)
          </div>
          <ul className="mt-2 space-y-1">
            {contractAlerts.map((alert) => (
              <li key={alert.id} className="text-xs text-slate-700">
                · {alert.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {gradeAlerts.length > 0 && (
        <div className="rounded-xl border border-risk-danger/20 bg-risk-danger/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-risk-danger">
            <TrendingDown className="h-4 w-4" />
            관심 건물 등급 변동
          </div>
          <ul className="mt-2 space-y-1">
            {gradeAlerts.map((alert) => (
              <li
                key={alert.id}
                className={cn(
                  "text-xs",
                  alert.currentGrade === "danger"
                    ? "text-risk-danger"
                    : "text-slate-700"
                )}
              >
                · {alert.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
