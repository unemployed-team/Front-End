import { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import type { Building } from "@/types";
import { generateMockHRIReport } from "@/ai/hri-score/calculator";
import { scoreToMarkerColor } from "@/lib/utils";
import { colors } from "@/theme/colors";

const UNIVERSITY_ZONES = [
  { name: "계명대", lat: 35.8531, lng: 128.4856 },
  { name: "경북대", lat: 35.8903, lng: 128.6124 },
  { name: "영남대", lat: 35.8714, lng: 128.6014 },
];

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

  const buildingScores = useMemo(
    () =>
      buildings.map((b) => ({
        building: b,
        score: generateMockHRIReport(b).totalScore,
      })),
    [buildings]
  );

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
          UNIVERSITY_ZONES.map((zone) => (
            <Circle
              key={zone.name}
              center={{ latitude: zone.lat, longitude: zone.lng }}
              radius={2000}
              fillColor="rgba(13,148,136,0.12)"
              strokeColor="rgba(13,148,136,0.4)"
              strokeWidth={1}
            />
          ))}

        {buildingScores.map(({ building, score }) => (
          <Marker
            key={building.id}
            coordinate={{ latitude: building.lat, longitude: building.lng }}
            pinColor={showHeatmap ? scoreToMarkerColor(score) : colors.saferoom[600]}
            title={building.adminDong}
            description={`HRI ${score}`}
            onPress={() => router.push(`/building/${building.id}`)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
