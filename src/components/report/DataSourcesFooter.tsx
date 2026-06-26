import { DATA_SOURCE_LABELS } from "@/lib/constants/mock-analysis-data";
import { Database } from "lucide-react";

export function DataSourcesFooter() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
        <Database className="h-3.5 w-3.5" />
        분석 데이터 출처
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {DATA_SOURCE_LABELS.map((label) => (
          <span
            key={label}
            className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600 ring-1 ring-slate-200"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
