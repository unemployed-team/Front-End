"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { simulateRiskTrend } from "@/ai/prediction/deposit-risk-model";

interface RiskPredictionChartProps {
  baseRisk: number;
  jeonseRatio: number;
  districtAvg: number;
}

export function RiskPredictionChart({
  baseRisk,
  jeonseRatio,
  districtAvg,
}: RiskPredictionChartProps) {
  const data = simulateRiskTrend(baseRisk, jeonseRatio);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-1 text-base font-bold text-slate-900">위험도 추이 예측</h3>
      <p className="mb-4 text-xs text-slate-500">
        동 평균 전세가율 {districtAvg.toFixed(1)}% 대비 상대 분석
      </p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}${name === "riskPercent" ? "%" : "%"}`,
                name === "riskPercent" ? "미반환 위험" : "전세가율",
              ]}
            />
            <Legend
              formatter={(value) =>
                value === "riskPercent" ? "미반환 위험" : "전세가율"
              }
            />
            <Line
              type="monotone"
              dataKey="riskPercent"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="jeonseRatio"
              stroke="#0d9488"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
