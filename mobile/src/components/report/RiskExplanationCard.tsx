import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";

interface RiskExplanationCardProps {
  explanations: string[];
  depositReturnRisk: number;
}

export function RiskExplanationCard({
  explanations,
  depositReturnRisk,
}: RiskExplanationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="alert-circle" size={18} color={colors.risk.caution} />
        <Text style={styles.title}>AI 위험 요인 분석</Text>
      </View>
      <Text style={styles.subtitle}>
        2년 후 보증금 미반환 위험{" "}
        <Text style={styles.bold}>{depositReturnRisk}%</Text> 예측
      </Text>
      {explanations.map((text) => (
        <View key={text} style={styles.item}>
          <Text style={styles.bullet}>·</Text>
          <Text style={styles.itemText}>{text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 16,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 16, fontWeight: "700", color: colors.slate[900] },
  subtitle: { fontSize: 12, color: colors.slate[500], marginTop: 6 },
  bold: { fontWeight: "700", color: colors.slate[900] },
  item: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.slate[50],
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  bullet: { color: colors.saferoom[600], fontWeight: "700" },
  itemText: { flex: 1, fontSize: 14, color: colors.slate[700] },
});
