import { useMemo, Fragment } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import type { Building, HRIReport } from "@/types";
import { getBuildingScores } from "@/lib/api/buildings";
import { UNIVERSITY_ZONES } from "@/ai/spatial/cluster";
import {
  getRiskGradeBg,
  getRiskGradeLabel,
  scoreToMarkerColor,
} from "@/lib/utils";
import { colors } from "@/theme/colors";

interface BuildingMapProps {
  buildings: Building[];
  showHeatmap?: boolean;
  showUniversityLayer?: boolean;
  buildingScores?: Map<string, { score: number; grade: HRIReport["grade"] }>;
  mapLoading?: boolean;
}

export function BuildingMap({
  buildings,
  showHeatmap = true,
  showUniversityLayer = false,
  buildingScores,
  mapLoading = false,
}: BuildingMapProps) {
  const router = useRouter();

  const scores = useMemo(
    () => getBuildingScores(buildings, buildingScores),
    [buildings, buildingScores]
  );

  return (
    <View style={styles.container}>
      {mapLoading && (
        <View style={styles.loadingBadge} pointerEvents="none">
          <Text style={styles.loadingText}>지도 데이터 불러오는 중...</Text>
        </View>
      )}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 35.8719,
          longitude: 128.6016,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12,
        }}
      >
        {showUniversityLayer &&
          Object.values(UNIVERSITY_ZONES).map((zone) => (
            <Circle
              key={zone.name}
              center={{ latitude: zone.lat, longitude: zone.lng }}
              radius={zone.radiusKm * 1000}
              fillColor="rgba(13,148,136,0.15)"
              strokeColor="rgba(13,148,136,0.55)"
              strokeWidth={2}
              zIndex={1}
            />
          ))}

        {buildings.map((building) => {
          const data = scores.get(building.id);
          const score = data?.score ?? 50;
          const grade = data?.grade ?? "caution";
          const gradeStyle = getRiskGradeBg(grade);
          return (
            <Fragment key={building.id}>
              {showHeatmap && (
                <Circle
                  center={{ latitude: building.lat, longitude: building.lng }}
                  radius={220}
                  fillColor={gradeStyle.bg}
                  strokeColor={gradeStyle.border}
                  strokeWidth={1}
                  zIndex={2}
                />
              )}
              <Marker
                coordinate={{ latitude: building.lat, longitude: building.lng }}
                pinColor={
                  showHeatmap ? scoreToMarkerColor(score) : colors.saferoom[600]
                }
                title={building.roadAddress || building.adminDong}
                description={`HRI ${score} · ${getRiskGradeLabel(grade)}`}
                zIndex={3}
                onPress={() => router.push(`/building/${building.id}`)}
              />
            </Fragment>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingBadge: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  loadingText: { fontSize: 11, color: colors.slate[600] },
});
