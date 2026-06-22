import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { submitFieldReport } from "@/lib/api/buildings";
import { FIELD_REPORT_TYPES } from "@/lib/constants/mock-data";
import { colors } from "@/theme/colors";

export default function QRReportScreen() {
  const { buildingId } = useLocalSearchParams<{ buildingId: string }>();
  const [type, setType] = useState<string>("defect");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setLoading(true);
    try {
      await submitFieldReport({
        buildingId: buildingId!,
        type,
        description,
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.success}>
          <Ionicons name="checkmark-circle" size={64} color={colors.risk.safe} />
          <Text style={styles.successTitle}>제보가 접수되었습니다</Text>
          <Text style={styles.successDesc}>
            익명으로 처리되며, 검증 후 HRI Score에 반영됩니다
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.banner}>
          <Text style={styles.bannerSub}>현장 제보 · 로그인 불필요</Text>
          <Text style={styles.bannerTitle}>건물 현장 제보</Text>
        </View>

        <Text style={styles.label}>제보 유형</Text>
        <View style={styles.typeGrid}>
          {Object.entries(FIELD_REPORT_TYPES).map(([key, label]) => (
            <Pressable
              key={key}
              style={[styles.typeBtn, type === key && styles.typeBtnActive]}
              onPress={() => setType(key)}
            >
              <Text
                style={[styles.typeText, type === key && styles.typeTextActive]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>상세 내용</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="현장에서 확인한 내용을 입력해 주세요"
          multiline
          numberOfLines={4}
          style={styles.textarea}
          textAlignVertical="top"
        />

        <Text style={styles.notice}>
          제보는 익명으로 처리되며, 개인을 특정할 수 있는 정보는 입력하지 마세요.
        </Text>

        <Pressable
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitText}>익명 제보하기</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24 },
  banner: {
    backgroundColor: colors.saferoom[600],
    borderRadius: 12,
    padding: 16,
  },
  bannerSub: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  bannerTitle: { fontSize: 18, fontWeight: "700", color: colors.white, marginTop: 4 },
  label: { fontSize: 14, fontWeight: "500", color: colors.slate[700], marginTop: 24 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  typeBtn: {
    width: "48%",
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  typeBtnActive: {
    borderColor: colors.saferoom[500],
    backgroundColor: colors.saferoom[50],
  },
  typeText: { fontSize: 12, fontWeight: "500", color: colors.slate[600] },
  typeTextActive: { color: colors.saferoom[700] },
  textarea: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 100,
    color: colors.slate[900],
    backgroundColor: colors.white,
  },
  notice: { fontSize: 12, color: colors.slate[400], marginTop: 8 },
  submitBtn: {
    marginTop: 24,
    backgroundColor: colors.saferoom[600],
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontSize: 14, fontWeight: "700", color: colors.white },
  success: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.slate[900],
    marginTop: 16,
  },
  successDesc: {
    fontSize: 14,
    color: colors.slate[500],
    marginTop: 8,
    textAlign: "center",
  },
});
