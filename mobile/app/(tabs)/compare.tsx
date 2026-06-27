import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import { SafeRoomEngine } from "@/ai";
import { compareBookmarks } from "@/lib/api/bookmarks";
import { toRiskGrade } from "@/lib/api/mappers";
import type { BuildingCompareItem, CompareResponse } from "@/lib/api/types";
import { USE_MOCK } from "@/lib/config";
import {
  formatCurrency,
  getRiskGradeBg,
  getRiskGradeColor,
  getRiskGradeLabel,
} from "@/lib/utils";
import { colors } from "@/theme/colors";

const API_COMPARE_ROWS: {
  metric: string;
  lowerIsBetter?: boolean;
  getValue: (item: BuildingCompareItem) => string | number;
}[] = [
  { metric: "HRI 점수", lowerIsBetter: true, getValue: (b) => b.hriScore },
  {
    metric: "등급",
    getValue: (b) => getRiskGradeLabel(toRiskGrade(b.riskGrade)),
  },
  { metric: "건물 위험", lowerIsBetter: true, getValue: (b) => b.buildingRiskScore },
  { metric: "시장 위험", lowerIsBetter: true, getValue: (b) => b.marketRiskScore },
  {
    metric: "임대인 위험",
    lowerIsBetter: true,
    getValue: (b) => b.landlordRiskScore,
  },
  { metric: "생활 위험", lowerIsBetter: true, getValue: (b) => b.livingRiskScore },
  {
    metric: "평균 보증금",
    lowerIsBetter: true,
    getValue: (b) => formatCurrency(b.avgDepositPrice),
  },
];

export default function CompareScreen() {
  const router = useRouter();
  const { compareSelection, toggleCompare, clearCompare } = useAppStore();
  const isDevSession = useAuthStore((s) => s.isDevSession);

  const buildingIds = useMemo(
    () =>
      compareSelection
        .map((c) => Number(c.building.id))
        .filter((id) => id > 0 && !Number.isNaN(id)),
    [compareSelection]
  );

  const [apiCompare, setApiCompare] = useState<CompareResponse | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);

  const mockResult = useMemo(
    () => SafeRoomEngine.compare(compareSelection),
    [compareSelection]
  );

  const useApiCompare =
    !USE_MOCK && !isDevSession && buildingIds.length >= 2;

  useEffect(() => {
    if (!useApiCompare) {
      setApiCompare(null);
      return;
    }
    setCompareLoading(true);
    compareBookmarks(buildingIds)
      .then(setApiCompare)
      .catch(() => setApiCompare(null))
      .finally(() => setCompareLoading(false));
  }, [buildingIds, useApiCompare]);

  const apiSafest = apiCompare?.buildings.find(
    (b) => b.buildingId === apiCompare.safestBuildingId
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
        ) : useApiCompare && apiCompare ? (
          <>
            {apiSafest && (
              <View style={styles.aiBanner}>
                <Ionicons name="sparkles" size={16} color={colors.saferoom[700]} />
                <Text style={styles.aiBannerText}>
                  AI 추천:{" "}
                  <Text style={styles.aiBannerBold}>{apiSafest.buildingName}</Text>
                  이 종합 안전 지표가 가장 우수합니다
                </Text>
              </View>
            )}

            <Text style={styles.meta}>
              {compareSelection.length}/3 선택 · 백엔드 HRI 비교
            </Text>

            {compareLoading && (
              <ActivityIndicator color={colors.saferoom[600]} style={{ marginBottom: 8 }} />
            )}

            {API_COMPARE_ROWS.map((row) => (
              <View key={row.metric} style={styles.row}>
                <Text style={styles.rowLabel}>{row.metric}</Text>
                <View style={styles.rowValues}>
                  {apiCompare.buildings.map((item) => {
                    const value = row.getValue(item);
                    return (
                      <View key={item.buildingId} style={styles.cell}>
                        {item.isHighlighted && (
                          <Ionicons
                            name="trophy"
                            size={12}
                            color={colors.risk.caution}
                          />
                        )}
                        <Text
                          style={[
                            styles.cellText,
                            row.metric === "등급" && {
                              color: getRiskGradeColor(toRiskGrade(item.riskGrade)),
                            },
                          ]}
                        >
                          {value}
                        </Text>
                        <Pressable
                          onPress={() => {
                            const full = compareSelection.find(
                              (c) => c.building.id === String(item.buildingId)
                            );
                            if (full) toggleCompare(full);
                          }}
                        >
                          <Ionicons name="close" size={14} color={colors.slate[400]} />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}

            {apiCompare.buildings.map((item) => {
              const grade = toRiskGrade(item.riskGrade);
              const gradeStyle = getRiskGradeBg(grade);
              return (
                <Pressable
                  key={item.buildingId}
                  style={[styles.card, item.isHighlighted && styles.cardHighlight]}
                  onPress={() => router.push(`/building/${item.buildingId}`)}
                >
                  <Text style={styles.cardAddress}>{item.roadAddress}</Text>
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
                        { color: getRiskGradeColor(grade) },
                      ]}
                    >
                      HRI {item.hriScore} · {getRiskGradeLabel(grade)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </>
        ) : (
          <>
            {mockResult.safestBuildingId && (
              <View style={styles.aiBanner}>
                <Ionicons name="sparkles" size={16} color={colors.saferoom[700]} />
                <Text style={styles.aiBannerText}>
                  AI 추천:{" "}
                  <Text style={styles.aiBannerBold}>
                    {mockResult.items.find((i) => i.isSafest)?.adminDong}
                  </Text>
                  이 종합 안전 지표가 가장 우수합니다
                </Text>
              </View>
            )}

            <Text style={styles.meta}>
              {compareSelection.length}/3 선택 · HRI Score 기준 비교
            </Text>

            {mockResult.comparisonMatrix.map((row) => (
              <View key={row.metric} style={styles.row}>
                <Text style={styles.rowLabel}>{row.metric}</Text>
                <View style={styles.rowValues}>
                  {mockResult.items.map((item) => {
                    const value = row.values[item.buildingId];
                    return (
                      <View key={item.buildingId} style={styles.cell}>
                        {item.isSafest && (
                          <Ionicons
                            name="trophy"
                            size={12}
                            color={colors.risk.caution}
                          />
                        )}
                        <Text
                          style={[
                            styles.cellText,
                            row.metric === "등급" && {
                              color: getRiskGradeColor(item.report.grade),
                            },
                          ]}
                        >
                          {value}
                        </Text>
                        <Pressable
                          onPress={() => {
                            const full = compareSelection.find(
                              (c) => c.building.id === item.buildingId
                            );
                            if (full) toggleCompare(full);
                          }}
                        >
                          <Ionicons name="close" size={14} color={colors.slate[400]} />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}

            {mockResult.items.map((item) => {
              const gradeStyle = getRiskGradeBg(item.report.grade);
              return (
                <Pressable
                  key={item.buildingId}
                  style={[styles.card, item.isSafest && styles.cardHighlight]}
                  onPress={() => router.push(`/building/${item.buildingId}`)}
                >
                  <Text style={styles.cardAddress}>
                    {
                      compareSelection.find((c) => c.building.id === item.buildingId)
                        ?.building.roadAddress
                    }
                  </Text>
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
                  {item.isSafest && (
                    <Text style={styles.highlight}>
                      {item.highlightMetrics.join(" · ")}
                    </Text>
                  )}
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
  aiBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.saferoom[50],
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  aiBannerText: { flex: 1, fontSize: 13, color: colors.saferoom[700] },
  aiBannerBold: { fontWeight: "700" },
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
    borderColor: colors.saferoom[500],
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
  highlight: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "500",
    color: colors.saferoom[700],
  },
});
