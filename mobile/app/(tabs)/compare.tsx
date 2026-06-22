import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { useAppStore } from "@/store/app-store";
import {
  getRiskGradeBg,
  getRiskGradeColor,
  getRiskGradeLabel,
} from "@/lib/utils";
import { colors } from "@/theme/colors";

export default function CompareScreen() {
  const router = useRouter();
  const { compareSelection, toggleCompare, clearCompare } = useAppStore();

  const safest = compareSelection.reduce<(typeof compareSelection)[0] | null>(
    (best, item) => {
      if (!best || item.report.totalScore < best.report.totalScore) return item;
      return best;
    },
    null
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header
        title="건물 비교"
        right={
          compareSelection.length > 0 ? (
            <Pressable onPress={clearCompare}>
              <Text style={styles.clearBtn}>초기화</Text>
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {compareSelection.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="git-compare" size={40} color={colors.slate[300]} />
            <Text style={styles.emptyText}>
              건물 리포트에서 최대 3개까지 비교할 수 있습니다
            </Text>
            <Pressable
              style={styles.searchLink}
              onPress={() => router.push("/search")}
            >
              <Text style={styles.searchLinkText}>건물 검색하기</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.meta}>
              {compareSelection.length}/3 선택 · HRI Score 기준 비교
            </Text>

            {[
              {
                label: "HRI Score",
                get: (i: (typeof compareSelection)[0]) => i.report.totalScore,
                format: (v: number) => String(v),
                lowerBetter: true,
              },
              {
                label: "등급",
                get: (i: (typeof compareSelection)[0]) => i.report.grade,
                format: (v: string) =>
                  getRiskGradeLabel(v as "safe" | "caution" | "danger"),
              },
              {
                label: "미반환 위험",
                get: (i: (typeof compareSelection)[0]) =>
                  i.report.depositReturnRiskPercent,
                format: (v: number) => `${v}%`,
                lowerBetter: true,
              },
              {
                label: "전세가율",
                get: (i: (typeof compareSelection)[0]) => i.report.jeonseRatio,
                format: (v: number) => `${v.toFixed(1)}%`,
              },
            ].map((row) => (
              <View key={row.label} style={styles.row}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <View style={styles.rowValues}>
                  {compareSelection.map((item) => {
                    const value = row.get(item);
                    const isBest =
                      safest &&
                      row.lowerBetter &&
                      row.get(safest) === value &&
                      typeof value === "number" &&
                      value ===
                        Math.min(
                          ...compareSelection.map((c) => row.get(c) as number)
                        );
                    return (
                      <View key={item.building.id} style={styles.cell}>
                        {safest?.building.id === item.building.id && (
                          <Ionicons
                            name="trophy"
                            size={12}
                            color={colors.risk.caution}
                          />
                        )}
                        <Text
                          style={[
                            styles.cellText,
                            isBest && { color: colors.saferoom[600] },
                            row.label === "등급" && {
                              color: getRiskGradeColor(item.report.grade),
                            },
                          ]}
                        >
                          {typeof value === "number" || typeof value === "string"
                            ? row.format(value as never)
                            : String(value)}
                        </Text>
                        <Pressable onPress={() => toggleCompare(item)}>
                          <Ionicons name="close" size={14} color={colors.slate[400]} />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}

            {compareSelection.map((item) => {
              const gradeStyle = getRiskGradeBg(item.report.grade);
              const isSafest = safest?.building.id === item.building.id;
              return (
                <Pressable
                  key={item.building.id}
                  style={[
                    styles.card,
                    isSafest && styles.cardHighlight,
                  ]}
                  onPress={() => router.push(`/building/${item.building.id}`)}
                >
                  <Text style={styles.cardAddress}>{item.building.roadAddress}</Text>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: gradeStyle.bg,
                        borderColor: gradeStyle.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: getRiskGradeColor(item.report.grade) },
                      ]}
                    >
                      HRI {item.report.totalScore} ·{" "}
                      {getRiskGradeLabel(item.report.grade)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  clearBtn: { fontSize: 12, color: colors.slate[500] },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.slate[300],
    borderRadius: 12,
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.slate[500],
    marginTop: 12,
    textAlign: "center",
  },
  searchLink: {
    marginTop: 16,
    backgroundColor: colors.saferoom[600],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchLinkText: { fontSize: 14, fontWeight: "600", color: colors.white },
  meta: { fontSize: 12, color: colors.slate[500], marginBottom: 12 },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[100],
    paddingVertical: 12,
  },
  rowLabel: { fontSize: 12, color: colors.slate[600], marginBottom: 8 },
  rowValues: { flexDirection: "row", justifyContent: "space-around" },
  cell: { alignItems: "center", gap: 4, flex: 1 },
  cellText: { fontSize: 14, fontWeight: "600", color: colors.slate[900] },
  card: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 16,
    marginTop: 12,
  },
  cardHighlight: {
    borderColor: colors.saferoom[400],
    backgroundColor: colors.saferoom[50],
  },
  cardAddress: { fontSize: 14, fontWeight: "600", color: colors.slate[900] },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
});
