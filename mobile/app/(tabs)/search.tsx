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
import { searchAddress } from "@/lib/api/buildings";
import type { AddressSuggestion } from "@/types";
import { colors } from "@/theme/colors";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchAddress(value);
      setSuggestions(results);
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
            placeholder="도로명·지번 주소 입력 (3글자 이상)"
            placeholderTextColor={colors.slate[400]}
            style={styles.input}
            autoFocus
          />
        </View>

        {query.length > 0 && query.length < 3 && (
          <Text style={styles.hint}>3글자 이상 입력해 주세요</Text>
        )}

        {loading && (
          <ActivityIndicator color={colors.saferoom[600]} style={styles.loader} />
        )}

        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.roadAddress}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <Pressable
              style={styles.resultItem}
              onPress={() => router.push(`/building/bld-00${index + 1}`)}
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
          )}
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
  hint: { fontSize: 12, color: colors.slate[400], marginTop: 8 },
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
