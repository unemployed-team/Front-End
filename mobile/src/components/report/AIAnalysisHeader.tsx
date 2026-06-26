import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/colors";

export function AIAnalysisHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="hardware-chip" size={18} color={colors.white} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.sub}>SafeRoom AI 분석</Text>
        <Text style={styles.title}>공공데이터 + 현장 제보 기반 HRI 리포트</Text>
      </View>
      <Ionicons name="sparkles" size={18} color="rgba(255,255,255,0.8)" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.saferoom[600],
    borderRadius: 12,
    padding: 14,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1 },
  sub: { fontSize: 11, color: "rgba(255,255,255,0.9)" },
  title: { fontSize: 13, fontWeight: "700", color: colors.white, marginTop: 2 },
});
