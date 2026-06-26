import { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import type { Building } from "@/types";
import { getBuildingScores } from "@/lib/api/buildings";
import { UNIVERSITY_ZONES } from "@/ai/spatial/cluster";
import { scoreToMarkerColor, getRiskGradeLabel } from "@/lib/utils";
import { colors } from "@/theme/colors";

interface BuildingMapProps {
  buildings: Building[];
  showHeatmap?: boolean;
  showUniversityLayer?: boolean;
}

export function BuildingMap({
  buildings,
  showHeatmap = true,
  showUniversityLayer = false,
}: BuildingMapProps) {
  const router = useRouter();

  const scores = useMemo(() => getBuildingScores(buildings), [buildings]);

  return (
    <View style={styles.container}>
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
              radius={2000}
              fillColor="rgba(13,148,136,0.12)"
              strokeColor="rgba(13,148,136,0.4)"
              strokeWidth={1}
            />
          ))}

        {buildings.map((building) => {
          const data = scores.get(building.id);
          const score = data?.score ?? 50;
          const grade = data?.grade ?? "caution";
          return (
            <Marker
              key={building.id}
              coordinate={{ latitude: building.lat, longitude: building.lng }}
              pinColor={showHeatmap ? scoreToMarkerColor(score) : colors.saferoom[600]}
              title={building.adminDong}
              description={`HRI ${score} · ${getRiskGradeLabel(grade)}`}
              onPress={() => router.push(`/building/${building.id}`)}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
