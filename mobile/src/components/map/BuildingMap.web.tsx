import { useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type { Building } from "@/types";
import { getBuildingScores } from "@/lib/api/buildings";
import { getRiskGradeLabel, scoreToMarkerColor } from "@/lib/utils";
import { colors } from "@/theme/colors";

interface BuildingMapProps {
  buildings: Building[];
  showHeatmap?: boolean;
  showUniversityLayer?: boolean;
}

/** 웹 미리보기용 지도 대체 UI */
export function BuildingMap({
  buildings,
  showHeatmap = true,
  showUniversityLayer = false,
}: BuildingMapProps) {
  const router = useRouter();
  const scores = useMemo(() => getBuildingScores(buildings), [buildings]);

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapTitle}>대구 지역 지도 (웹 미리보기)</Text>
        <Text style={styles.mapHint}>
          실제 Android 앱에서는 Google Maps가 표시됩니다
        </Text>
        {showUniversityLayer && (
          <Text style={styles.layerBadge}>대학가 레이어 ON</Text>
        )}
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {buildings.map((building) => {
          const data = scores.get(building.id);
          const score = data?.score ?? 50;
          const grade = data?.grade ?? "caution";
          return (
            <Pressable
              key={building.id}
              style={styles.card}
              onPress={() => router.push(`/building/${building.id}`)}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: showHeatmap
                      ? scoreToMarkerColor(score)
                      : colors.saferoom[600],
                  },
                ]}
              />
              <View style={styles.cardBody}>
                <Text style={styles.dong}>{building.adminDong}</Text>
                <Text style={styles.address} numberOfLines={1}>
                  {building.roadAddress}
                </Text>
                <Text style={styles.score}>
                  HRI {score} · {getRiskGradeLabel(grade)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapPlaceholder: {
    backgroundColor: colors.saferoom[100],
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate[200],
  },
  mapTitle: { fontSize: 14, fontWeight: "700", color: colors.saferoom[700] },
  mapHint: { fontSize: 12, color: colors.slate[500], marginTop: 4 },
  layerBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    fontSize: 11,
    color: colors.saferoom[700],
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  list: { flex: 1 },
  listContent: { padding: 12, gap: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate[200],
    padding: 12,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  cardBody: { flex: 1 },
  dong: { fontSize: 14, fontWeight: "600", color: colors.slate[900] },
  address: { fontSize: 12, color: colors.slate[500], marginTop: 2 },
  score: { fontSize: 12, fontWeight: "600", color: colors.saferoom[600], marginTop: 4 },
});
