import { View, Text, Pressable, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { useAppStore } from "@/store/app-store";
import {
  getRiskGradeBg,
  getRiskGradeColor,
  getRiskGradeLabel,
} from "@/lib/utils";
import { colors } from "@/theme/colors";

export default function BookmarksScreen() {
  const router = useRouter();
  const { bookmarks, removeBookmark } = useAppStore();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header title="관심 건물" showBack />
      {bookmarks.length === 0 ? (
        <Text style={styles.empty}>저장된 관심 건물이 없습니다</Text>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const gradeStyle = getRiskGradeBg(item.report.grade);
            return (
              <View style={styles.item}>
                <Pressable
                  style={styles.itemContent}
                  onPress={() => router.push(`/building/${item.buildingId}`)}
                >
                  <Text style={styles.address}>{item.building.roadAddress}</Text>
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
                </Pressable>
                <Pressable
                  onPress={() => removeBookmark(item.id)}
                  hitSlop={8}
                >
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
