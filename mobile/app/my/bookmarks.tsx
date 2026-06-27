import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { getMyBookmarks, removeBookmark } from "@/lib/api/bookmarks";
import { toRiskGrade } from "@/lib/api/mappers";
import type { BookmarkResponse } from "@/lib/api/types";
import {
  getRiskGradeBg,
  getRiskGradeColor,
  getRiskGradeLabel,
} from "@/lib/utils";
import { colors } from "@/theme/colors";

export default function BookmarksScreen() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getMyBookmarks();
      setBookmarks(list);
    } catch {
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleRemove = async (buildingId: number) => {
    try {
      await removeBookmark(buildingId);
      setBookmarks((prev) => prev.filter((b) => b.buildingId !== buildingId));
    } catch {
      Alert.alert("삭제 실패", "북마크 삭제에 실패했습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header title="관심 건물" showBack />
      {loading ? (
        <ActivityIndicator color={colors.saferoom[600]} style={{ marginTop: 48 }} />
      ) : bookmarks.length === 0 ? (
        <Text style={styles.empty}>저장된 관심 건물이 없습니다</Text>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => String(item.bookmarkId)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const grade = toRiskGrade(item.riskGrade);
            const gradeStyle = getRiskGradeBg(grade);
            return (
              <View style={styles.item}>
                <Pressable
                  style={styles.itemContent}
                  onPress={() => router.push(`/building/${item.buildingId}`)}
                >
                  <Text style={styles.address}>{item.roadAddress}</Text>
                  <Text style={styles.buildingName}>{item.buildingName}</Text>
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
                <Pressable onPress={() => handleRemove(item.buildingId)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color={colors.slate[400]} />
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  empty: {
    paddingVertical: 48,
    textAlign: "center",
    fontSize: 14,
    color: colors.slate[500],
  },
  list: { padding: 16, gap: 12 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 16,
  },
  itemContent: { flex: 1 },
  address: { fontSize: 14, fontWeight: "600", color: colors.slate[900] },
  buildingName: { fontSize: 12, color: colors.slate[500], marginTop: 2 },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 6,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
});
