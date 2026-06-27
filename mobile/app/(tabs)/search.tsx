import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { searchAddress, searchNearby, MIN_SEARCH_KEYWORD_LENGTH } from "@/lib/api/buildings";
import { ApiError } from "@/lib/api/client";
import type { AddressSuggestion } from "@/types";
import { colors } from "@/theme/colors";
import * as Location from "expo-location";

const NEARBY_RADIUS_OPTIONS = [500, 1000, 2000] as const;

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [nearbyRadius, setNearbyRadius] = useState<(typeof NEARBY_RADIUS_OPTIONS)[number]>(500);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  const handleNearbySearch = useCallback(async () => {
    setSearchError(null);
    setNearbyLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("위치 권한이 필요합니다.");
      }
      const position = await Location.getCurrentPositionAsync({});
      const results = await searchNearby(
        position.coords.latitude,
        position.coords.longitude,
        nearbyRadius
      );
      setQuery(`내 주변 ${nearbyRadius}m`);
      setSuggestions(results);
    } catch (e) {
      setSuggestions([]);
      setSearchError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "주변 검색에 실패했습니다."
      );
    } finally {
      setNearbyLoading(false);
    }
  }, [nearbyRadius]);

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);
    setSearchError(null);
    if (value.length < MIN_SEARCH_KEYWORD_LENGTH) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchAddress(value);
      setSuggestions(results);
    } catch (e) {
      setSuggestions([]);
      setSearchError(
        e instanceof ApiError ? e.message : "검색 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header title="주소 검색" />
      <View style={styles.content}>
        <View style={styles.inputWrap}>
          <Ionicons
            name="search"
            size={16}
            color={colors.slate[400]}
            style={styles.searchIcon}
          />
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="도로명·지번·구 이름 (2글자 이상)"
            placeholderTextColor={colors.slate[400]}
            style={styles.input}
            autoFocus
          />
        </View>

        <View style={styles.nearbyRow}>
          <Pressable
            style={[styles.nearbyBtn, nearbyLoading && styles.nearbyBtnDisabled]}
            onPress={handleNearbySearch}
            disabled={nearbyLoading}
          >
            <Ionicons name="navigate" size={14} color={colors.saferoom[700]} />
            <Text style={styles.nearbyBtnText}>
              {nearbyLoading ? "주변 검색 중..." : "내 주변 건물"}
            </Text>
          </Pressable>
          {NEARBY_RADIUS_OPTIONS.map((radius) => (
            <Pressable
              key={radius}
              style={[
                styles.radiusBtn,
                nearbyRadius === radius && styles.radiusBtnActive,
              ]}
              onPress={() => setNearbyRadius(radius)}
            >
              <Text
                style={[
                  styles.radiusText,
                  nearbyRadius === radius && styles.radiusTextActive,
                ]}
              >
                {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}
              </Text>
            </Pressable>
          ))}
        </View>

        {query.length > 0 && query.length < MIN_SEARCH_KEYWORD_LENGTH && (
          <Text style={styles.hint}>2글자 이상 입력해 주세요</Text>
        )}

        {loading && (
          <ActivityIndicator color={colors.saferoom[600]} style={styles.loader} />
        )}

        {searchError && <Text style={styles.error}>{searchError}</Text>}

        {!loading &&
          !searchError &&
          query.length >= MIN_SEARCH_KEYWORD_LENGTH &&
          suggestions.length === 0 && (
            <Text style={styles.empty}>검색 결과가 없습니다.</Text>
          )}

        <FlatList
          data={suggestions}
          keyExtractor={(item) => String(item.buildingId ?? item.id ?? item.roadAddress)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const buildingId = item.buildingId ?? item.id;
            return (
            <Pressable
              style={styles.resultItem}
              onPress={() => {
                if (buildingId) router.push(`/building/${buildingId}`);
              }}
            >
              <Ionicons name="location" size={16} color={colors.saferoom[600]} />
              <View style={styles.resultText}>
                <Text style={styles.roadAddress}>{item.roadAddress}</Text>
                <Text style={styles.jibun}>{item.jibunAddress}</Text>
                {item.adminDong && (
                  <Text style={styles.dong}>{item.adminDong}</Text>
                )}
              </View>
            </Pressable>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 16 },
  inputWrap: { position: "relative" },
  searchIcon: { position: "absolute", left: 12, top: 14, zIndex: 1 },
  input: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingLeft: 36,
    paddingRight: 16,
    fontSize: 14,
    color: colors.slate[900],
  },
  nearbyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  nearbyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.saferoom[100],
    backgroundColor: colors.saferoom[50],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  nearbyBtnDisabled: { opacity: 0.5 },
  nearbyBtnText: { fontSize: 12, fontWeight: "600", color: colors.saferoom[700] },
  radiusBtn: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.slate[100],
  },
  radiusBtnActive: { backgroundColor: colors.saferoom[600] },
  radiusText: { fontSize: 12, fontWeight: "500", color: colors.slate[600] },
  radiusTextActive: { color: colors.white },
  hint: { fontSize: 12, color: colors.slate[400], marginTop: 8 },
  error: { fontSize: 14, color: colors.risk.danger, marginTop: 16, textAlign: "center" },
  empty: { fontSize: 14, color: colors.slate[500], marginTop: 16, textAlign: "center" },
  loader: { marginTop: 16 },
  list: { gap: 8, marginTop: 16, paddingBottom: 24 },
  resultItem: {
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 16,
  },
  resultText: { flex: 1 },
  roadAddress: { fontSize: 14, fontWeight: "600", color: colors.slate[900] },
  jibun: { fontSize: 12, color: colors.slate[500], marginTop: 2 },
  dong: { fontSize: 12, color: colors.saferoom[600], marginTop: 4 },
});
