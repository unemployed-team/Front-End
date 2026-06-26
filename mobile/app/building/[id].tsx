import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Header } from "@/components/layout/Header";
import { AIAnalysisHeader } from "@/components/report/AIAnalysisHeader";
import { HRIScoreCard } from "@/components/report/HRIScoreCard";
import { CategoryBreakdown } from "@/components/report/CategoryBreakdown";
import { RiskPredictionChart } from "@/components/report/RiskPredictionChart";
import { RiskExplanationCard } from "@/components/report/RiskExplanationCard";
import { AuctionSimulationCard } from "@/components/report/AuctionSimulationCard";
import { DataSourcesFooter } from "@/components/report/DataSourcesFooter";
import { getBuilding, getBuildingAnalysis } from "@/lib/api/buildings";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import { generateShareToken } from "@/lib/utils";
import type { Building } from "@/types";
import type { BuildingAnalysisResult } from "@/ai/types/analysis";
import { colors } from "@/theme/colors";

export default function BuildingReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { bookmarks, addBookmark, removeBookmark, toggleCompare } = useAppStore();

  const [building, setBuilding] = useState<Building | null>(null);
  const [analysis, setAnalysis] = useState<BuildingAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  const bookmark = bookmarks.find((b) => b.buildingId === id);
  const report = analysis?.report;

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      const [b, a] = await Promise.all([
        getBuilding(id),
        getBuildingAnalysis(id),
      ]);
      setBuilding(b);
      setAnalysis(a);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleBookmark = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!building || !report) return;
    if (bookmark) {
      removeBookmark(bookmark.id);
    } else {
      addBookmark({
        id: `bm-${Date.now()}`,
        buildingId: id!,
        building,
        report,
        addedAt: new Date().toISOString(),
      });
    }
  };

  const handleShare = async () => {
    const token = generateShareToken(id!);
    const url = `https://saferoom.ai/report/share/${token}`;
    await Clipboard.setStringAsync(url);
    Alert.alert("링크 복사됨", "리포트 공유 링크가 클립보드에 복사되었습니다.");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.saferoom[600]} />
          <Text style={styles.loadingText}>AI가 공공데이터를 분석 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!building || !analysis || !report) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title="건물 리포트" showBack />
        <Text style={styles.error}>건물 정보를 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header
        title="HRI 분석 리포트"
        showBack
        right={
          <View style={styles.headerActions}>
            <Pressable onPress={handleBookmark} hitSlop={8}>
              <Ionicons
                name={bookmark ? "bookmark" : "bookmark-outline"}
                size={22}
                color={bookmark ? colors.saferoom[600] : colors.slate[400]}
              />
            </Pressable>
            <Pressable
              onPress={() => toggleCompare({ building, report })}
              hitSlop={8}
            >
              <Ionicons
                name="git-compare-outline"
                size={22}
                color={colors.slate[400]}
              />
            </Pressable>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <AIAnalysisHeader />

        <View style={styles.addressCard}>
          <Ionicons name="shield" size={16} color={colors.saferoom[600]} />
          <View style={styles.addressText}>
            <Text style={styles.road}>{building.roadAddress}</Text>
            <Text style={styles.jibun}>{building.jibunAddress}</Text>
            <Text style={styles.meta}>
              {building.buildYear}년 건축 · {building.floors}층 ·{" "}
              {building.householdCount}세대
              {building.universityProximity ? " · 대학가 인근" : ""}
              {building.isViolation ? " · 위반건축물" : ""}
            </Text>
          </View>
        </View>

        <HRIScoreCard
          score={report.totalScore}
          grade={report.grade}
          depositReturnRisk={report.depositReturnRiskPercent}
        />

        <RiskExplanationCard
          explanations={analysis.riskExplanation}
          depositReturnRisk={report.depositReturnRiskPercent}
        />

        <RiskPredictionChart
          baseRisk={report.depositReturnRiskPercent}
          jeonseRatio={report.jeonseRatio}
          districtAvg={report.districtAvgJeonseRatio}
        />

        <CategoryBreakdown categories={report.categories} />

        <View style={styles.compareCard}>
          <Text style={styles.compareTitle}>주변 비교</Text>
          <Text style={styles.compareBody}>
            동 평균 전세가율 대비{" "}
            <Text
              style={{
                fontWeight: "700",
                color:
                  report.relativeRiskPercent > 0
                    ? colors.risk.danger
                    : colors.risk.safe,
              }}
            >
              {report.relativeRiskPercent > 0 ? "+" : ""}
              {report.relativeRiskPercent.toFixed(1)}%
            </Text>
          </Text>
          {report.fieldReportPenalty > 0 && (
            <Text style={styles.penalty}>
              현장 제보 반영 감점 +{report.fieldReportPenalty}점
            </Text>
          )}
        </View>

        {analysis.simulation && analysis.userDeposit && (
          <AuctionSimulationCard
            simulation={analysis.simulation}
            deposit={analysis.userDeposit}
          />
        )}

        <DataSourcesFooter />

        <View style={styles.actions}>
          <Pressable style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={18} color={colors.slate[700]} />
            <Text style={styles.actionText}>공유</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnFlex]}
            onPress={() => router.push(`/report/qr/${id}`)}
          >
            <Text style={styles.actionText}>현장 제보 QR</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 12, color: colors.slate[500], fontSize: 14 },
  error: { padding: 32, textAlign: "center", color: colors.slate[500] },
  headerActions: { flexDirection: "row", gap: 8 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  addressCard: {
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 16,
  },
  addressText: { flex: 1 },
  road: { fontSize: 14, fontWeight: "600", color: colors.slate[900] },
  jibun: { fontSize: 12, color: colors.slate[500], marginTop: 2 },
  meta: { fontSize: 12, color: colors.slate[600], marginTop: 8 },
  compareCard: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 16,
  },
  compareTitle: { fontSize: 16, fontWeight: "700", color: colors.slate[900] },
  compareBody: { fontSize: 14, color: colors.slate[600], marginTop: 8 },
  penalty: { fontSize: 12, color: colors.risk.caution, marginTop: 4 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionBtnFlex: { flex: 1 },
  actionText: { fontSize: 14, fontWeight: "500", color: colors.slate[700] },
});
