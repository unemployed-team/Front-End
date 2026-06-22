import {
  cn,
  getRiskGradeBg,
  getRiskGradeColor,
  getRiskGradeLabel,
} from "@/lib/utils";
import type { RiskGrade } from "@/types";

interface HRIScoreCardProps {
  score: number;
  grade: RiskGrade;
  depositReturnRisk?: number;
  className?: string;
}

export function HRIScoreCard({
  score,
  grade,
  depositReturnRisk,
  className,
}: HRIScoreCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6 text-center",
        getRiskGradeBg(grade),
        className
      )}
    >
      <p className="text-sm font-medium text-slate-600">HRI Score</p>
      <p className={cn("mt-1 text-5xl font-black tabular-nums", getRiskGradeColor(grade))}>
        {score}
      </p>
      <p className={cn("mt-1 text-lg font-bold", getRiskGradeColor(grade))}>
        {getRiskGradeLabel(grade)}
      </p>
      {depositReturnRisk !== undefined && (
        <p className="mt-3 text-sm text-slate-600">
          2년 후 보증금 미반환 위험{" "}
          <span className="font-semibold text-slate-900">{depositReturnRisk}%</span>
        </p>
      )}
    </div>
  );
}
