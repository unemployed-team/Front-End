import { AlertCircle } from "lucide-react";

interface RiskExplanationCardProps {
  explanations: string[];
  depositReturnRisk: number;
}

export function RiskExplanationCard({
  explanations,
  depositReturnRisk,
}: RiskExplanationCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-risk-caution" />
        <h3 className="text-base font-bold text-slate-900">AI 위험 요인 분석</h3>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        2년 후 보증금 미반환 위험{" "}
        <span className="font-bold text-slate-800">{depositReturnRisk}%</span> 예측
      </p>
      <ul className="mt-3 space-y-2">
        {explanations.map((text) => (
          <li
            key={text}
            className="flex gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
          >
            <span className="text-saferoom-600">·</span>
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}
