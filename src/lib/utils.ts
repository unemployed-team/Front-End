import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskGrade } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 100_000_000) {
    return `${(amount / 100_000_000).toFixed(1)}억`;
  }
  if (amount >= 10_000) {
    return `${Math.round(amount / 10_000).toLocaleString()}만`;
  }
  return amount.toLocaleString();
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
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
  const colors: Record<RiskGrade, string> = {
    safe: "text-risk-safe",
    caution: "text-risk-caution",
    danger: "text-risk-danger",
  };
  return colors[grade];
}

export function getRiskGradeBg(grade: RiskGrade): string {
  const colors: Record<RiskGrade, string> = {
    safe: "bg-risk-safe/10 border-risk-safe/30",
    caution: "bg-risk-caution/10 border-risk-caution/30",
    danger: "bg-risk-danger/10 border-risk-danger/30",
  };
  return colors[grade];
}

export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateShareToken(buildingId: string): string {
  return btoa(`${buildingId}-${Date.now()}`).replace(/=/g, "").slice(0, 16);
}
