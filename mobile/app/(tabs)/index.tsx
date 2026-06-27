import { useMemo, useState } from "react";

import { View, Text, Pressable, StyleSheet } from "react-native";

import { useRouter } from "expo-router";

import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import { BuildingMap } from "@/components/map/BuildingMap";

import { MOCK_BUILDINGS } from "@/lib/constants/mock-data";

import { USE_MOCK } from "@/lib/config";

import { SafeRoomEngine } from "@/ai";

import type { Building } from "@/types";

import { useHomeMapData } from "@/hooks/useHomeMapData";

import { colors } from "@/theme/colors";



function filterUniversityBuildings(buildings: Building[]) {

  const zones = ["keimyung", "kyungpook", "yeungnam"] as const;

  const filtered = new Map<string, Building>();

  for (const zone of zones) {

    for (const b of SafeRoomEngine.filterUniversity(buildings, zone)) {

      filtered.set(b.id, b);

    }

  }

  return Array.from(filtered.values());

}



export default function HomeScreen() {

  const router = useRouter();

  const [showHeatmap, setShowHeatmap] = useState(true);

  const [showUniversity, setShowUniversity] = useState(false);



  const { buildings: apiBuildings, scoreMap, loading } = useHomeMapData();



  const buildings = useMemo(() => {

    const source = USE_MOCK ? MOCK_BUILDINGS : apiBuildings;

    if (!showUniversity) return source;

    return filterUniversityBuildings(source);

  }, [showUniversity, apiBuildings]);



  return (

    <SafeAreaView style={styles.safe} edges={["top"]}>

      <View style={styles.header}>

        <View style={styles.headerTop}>

          <View>

            <Text style={styles.title}>SafeRoom AI</Text>

            <Text style={styles.subtitle}>

              계약 전에, AI가 위험한 방을 먼저 잡아낸다

            </Text>

          </View>

          <Pressable

            style={styles.searchBtn}

            onPress={() => router.push("/search")}

          >

            <Text style={styles.searchBtnText}>주소 검색</Text>

          </Pressable>

        </View>

        <View style={styles.filters}>

          <Pressable

            style={[styles.filterBtn, showHeatmap && styles.filterBtnActive]}

            onPress={() => setShowHeatmap(!showHeatmap)}

          >

            <Ionicons

              name="layers"

              size={14}

              color={showHeatmap ? colors.saferoom[700] : colors.slate[600]}

            />

            <Text

              style={[styles.filterText, showHeatmap && styles.filterTextActive]}

            >

              위험도 히트맵

            </Text>

          </Pressable>

          <Pressable

            style={[styles.filterBtn, showUniversity && styles.filterBtnActive]}

            onPress={() => setShowUniversity(!showUniversity)}

          >

            <Ionicons

              name="location"

              size={14}

              color={showUniversity ? colors.saferoom[700] : colors.slate[600]}

            />

            <Text

              style={[styles.filterText, showUniversity && styles.filterTextActive]}

            >

              대학가 레이어

            </Text>

          </Pressable>

        </View>

      </View>

      <BuildingMap

        buildings={buildings}

        showHeatmap={showHeatmap}

        showUniversityLayer={showUniversity}

        buildingScores={USE_MOCK ? undefined : scoreMap}

        mapLoading={!USE_MOCK && loading}

      />

    </SafeAreaView>

  );

}



const styles = StyleSheet.create({

  safe: { flex: 1, backgroundColor: colors.background },

  header: {

    borderBottomWidth: 1,

    borderBottomColor: colors.slate[200],

    backgroundColor: colors.white,

    paddingHorizontal: 16,

    paddingBottom: 12,

    paddingTop: 8,

  },

  headerTop: {

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",

  },

  title: { fontSize: 18, fontWeight: "900", color: colors.saferoom[700] },

  subtitle: { fontSize: 12, color: colors.slate[500], marginTop: 2 },

  searchBtn: {

    backgroundColor: colors.saferoom[600],

    borderRadius: 12,

    paddingHorizontal: 12,

    paddingVertical: 8,

  },

  searchBtnText: { fontSize: 12, fontWeight: "600", color: colors.white },

  filters: { flexDirection: "row", gap: 8, marginTop: 12 },

  filterBtn: {

    flexDirection: "row",

    alignItems: "center",

    gap: 4,

    borderRadius: 8,

    paddingHorizontal: 12,

    paddingVertical: 6,

    backgroundColor: colors.slate[100],

  },

  filterBtnActive: { backgroundColor: colors.saferoom[100] },

  filterText: { fontSize: 12, fontWeight: "500", color: colors.slate[600] },

  filterTextActive: { color: colors.saferoom[700] },

});

