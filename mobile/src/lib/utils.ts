import type { RiskGrade } from "@/types";
import { colors } from "@/theme/colors";

export function formatCurrency(amount: number): string {
  if (amount >= 100_000_000) {
    return `${(amount / 100_000_000).toFixed(1)}억`;
  }
  if (amount >= 10_000) {
    return `${Math.round(amount / 10_000).toLocaleString()}만`;
  }
  return amount.toLocaleString();
}

export function getRiskGrade(score: number): RiskGrade {
  if (score < 35) return "safe";
  if (score < 65) return "caution";
  return "danger";
}

export function getRiskGradeLabel(grade: RiskGrade): string {
  const labels: Record<RiskGrade, string> = {
    safe: "안전",
    caution: "주의",
    danger: "위험",
  };
  return labels[grade];
}

export function getRiskGradeColor(grade: RiskGrade): string {
  const map: Record<RiskGrade, string> = {
    safe: colors.risk.safe,
    caution: colors.risk.caution,
    danger: colors.risk.danger,
  };
  return map[grade];
}

export function getRiskGradeBg(grade: RiskGrade): { bg: string; border: string } {
  const map: Record<RiskGrade, { bg: string; border: string }> = {
    safe: { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" },
    caution: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
    danger: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" },
  };
  return map[grade];
}

export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateShareToken(buildingId: string): string {
  return `${buildingId}-${Date.now()}`.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
}

export function scoreToMarkerColor(score: number): string {
  if (score < 35) return colors.risk.safe;
  if (score < 65) return colors.risk.caution;
  return colors.risk.danger;
}
