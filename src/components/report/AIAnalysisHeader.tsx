import { Brain, Sparkles } from "lucide-react";

export function AIAnalysisHeader() {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-saferoom-600 to-saferoom-700 px-4 py-3 text-white">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
        <Brain className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium opacity-90">SafeRoom AI 분석</p>
        <p className="text-sm font-bold">공공데이터 + 현장 제보 기반 HRI 리포트</p>
      </div>
      <Sparkles className="h-4 w-4 opacity-80" />
    </div>
  );
}
