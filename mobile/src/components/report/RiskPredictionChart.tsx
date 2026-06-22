import { View, Text, StyleSheet, ScrollView } from "react-native";
import { simulateRiskTrend } from "@/ai/prediction/deposit-risk-model";
import { colors } from "@/theme/colors";

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
  const recent = data.slice(-6);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>위험도 추이 예측</Text>
      <Text style={styles.subtitle}>
        동 평균 전세가율 {districtAvg.toFixed(1)}% 대비 상대 분석
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chart}>
        {recent.map((point) => (
          <View key={point.month} style={styles.barGroup}>
            <View style={styles.bars}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(8, point.riskPercent * 0.8),
                    backgroundColor: colors.risk.danger,
                  },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(8, point.jeonseRatio * 0.8),
                    backgroundColor: colors.saferoom[600],
                  },
                ]}
              />
            </View>
            <Text style={styles.month}>{point.month.slice(5)}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.risk.danger }]} />
          <Text style={styles.legendText}>미반환 위험</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.saferoom[600] }]} />
          <Text style={styles.legendText}>전세가율</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate[200],
    backgroundColor: colors.white,
    padding: 16,
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.slate[900] },
  subtitle: { fontSize: 12, color: colors.slate[500], marginTop: 4, marginBottom: 12 },
  chart: { flexGrow: 0 },
  barGroup: { alignItems: "center", marginRight: 12, width: 48 },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 80,
    gap: 4,
  },
  bar: { width: 14, borderRadius: 4 },
  month: { fontSize: 10, color: colors.slate[500], marginTop: 4 },
  legend: { flexDirection: "row", gap: 16, marginTop: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: colors.slate[600] },
});
