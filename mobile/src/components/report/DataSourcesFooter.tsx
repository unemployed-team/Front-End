import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DATA_SOURCE_LABELS } from "@/lib/constants/mock-analysis-data";
import { colors } from "@/theme/colors";

export function DataSourcesFooter() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="server" size={14} color={colors.slate[600]} />
        <Text style={styles.headerText}>분석 데이터 출처</Text>
      </View>
      <View style={styles.tags}>
        {DATA_SOURCE_LABELS.map((label) => (
          <View key={label} style={styles.tag}>
            <Text style={styles.tagText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.slate[200],
    borderRadius: 12,
    backgroundColor: colors.slate[50],
    padding: 14,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerText: { fontSize: 12, fontWeight: "600", color: colors.slate[600] },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  tag: {
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.slate[200],
  },
  tagText: { fontSize: 10, fontWeight: "500", color: colors.slate[600] },
});
