import { View, Text, StyleSheet } from "react-native";
import type { RiskGrade } from "@/types";
import { colors } from "@/theme/colors";
import {
  getRiskGradeBg,
  getRiskGradeColor,
  getRiskGradeLabel,
} from "@/lib/utils";

interface HRIScoreCardProps {
  score: number;
  grade: RiskGrade;
  depositReturnRisk?: number;
}

export function HRIScoreCard({ score, grade, depositReturnRisk }: HRIScoreCardProps) {
  const gradeStyle = getRiskGradeBg(grade);
  const textColor = getRiskGradeColor(grade);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: gradeStyle.bg, borderColor: gradeStyle.border },
      ]}
    >
      <Text style={styles.label}>HRI Score</Text>
      <Text style={[styles.score, { color: textColor }]}>{score}</Text>
      <Text style={[styles.grade, { color: textColor }]}>
        {getRiskGradeLabel(grade)}
      </Text>
      {depositReturnRisk !== undefined && (
        <Text style={styles.risk}>
          2년 후 보증금 미반환 위험{" "}
          <Text style={styles.riskValue}>{depositReturnRisk}%</Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  label: { fontSize: 14, fontWeight: "500", color: colors.slate[600] },
  score: { fontSize: 48, fontWeight: "900", marginTop: 4 },
  grade: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  risk: { fontSize: 14, color: colors.slate[600], marginTop: 12 },
  riskValue: { fontWeight: "600", color: colors.slate[900] },
});
