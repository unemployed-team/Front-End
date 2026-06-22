import type { HRICategoryScore } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryBreakdownProps {
  categories: HRICategoryScore[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-slate-900">카테고리별 분석</h3>
      {categories.map((cat) => (
        <div key={cat.category} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">{cat.label}</p>
              <p className="text-xs text-slate-500">
                가중치 {(cat.weight * 100).toFixed(0)}%
              </p>
            </div>
            <span
              className={cn(
                "text-xl font-bold tabular-nums",
                cat.score >= 65
                  ? "text-risk-danger"
                  : cat.score >= 35
                    ? "text-risk-caution"
                    : "text-risk-safe"
              )}
            >
              {cat.score}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                cat.score >= 65
                  ? "bg-risk-danger"
                  : cat.score >= 35
                    ? "bg-risk-caution"
                    : "bg-risk-safe"
              )}
              style={{ width: `${cat.score}%` }}
            />
          </div>
          {cat.details.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {cat.details.map((d) => (
                <li key={d} className="text-xs text-slate-500">
                  · {d}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
