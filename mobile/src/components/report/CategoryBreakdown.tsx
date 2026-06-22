import { View, Text, StyleSheet } from "react-native";
import type { HRICategoryScore } from "@/types";
import { colors } from "@/theme/colors";

interface CategoryBreakdownProps {
  categories: HRICategoryScore[];
}

function scoreColor(score: number): string {
  if (score >= 65) return colors.risk.danger;
  if (score >= 35) return colors.risk.caution;
  return colors.risk.safe;
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>카테고리별 분석</Text>
      {categories.map((cat) => (
        <View key={cat.category} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.label}>{cat.label}</Text>
              <Text style={styles.weight}>
                가중치 {(cat.weight * 100).toFixed(0)}%
              </Text>
            </View>
            <Text style={[styles.score, { color: scoreColor(cat.score) }]}>
              {cat.score}
            </Text>
          </View>
          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${cat.score}%`,
                  backgroundColor: scoreColor(cat.score),
                },
              ]}
            />
          </View>
          {cat.details.map((d) => (
            <Text key={d} style={styles.detail}>
              · {d}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heading: { fontSize: 16, fontWeight: "700", color: colors.slate[900] },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate[200],
    backgroundColor: colors.white,
    padding: 16,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  info: { flex: 1 },
  label: { fontSize: 15, fontWeight: "600", color: colors.slate[900] },
  weight: { fontSize: 12, color: colors.slate[500], marginTop: 2 },
  score: { fontSize: 22, fontWeight: "700" },
  barBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.slate[100],
    marginTop: 8,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
  detail: { fontSize: 12, color: colors.slate[500], marginTop: 4 },
});
