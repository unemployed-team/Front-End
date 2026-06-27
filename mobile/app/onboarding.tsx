import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/auth-store";
import { updateMe } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { colors } from "@/theme/colors";

const CITIES = ["대구광역시", "서울특별시", "부산광역시"];
const DISTRICTS: Record<string, string[]> = {
  대구광역시: ["중구", "남구", "북구", "수성구", "달서구", "동구"],
  서울특별시: ["강남구", "서초구", "마포구", "종로구"],
  부산광역시: ["해운대구", "수영구", "부산진구"],
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding, setUser } = useAuthStore();
  const [city, setCity] = useState("대구광역시");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!district) return;
    setLoading(true);
    try {
      const interestRegion = `${city} ${district}`;
      const updatedUser = await updateMe({ interestRegion });
      setUser(updatedUser);
      completeOnboarding({ city, district });
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert(
        "저장 실패",
        e instanceof ApiError ? e.message : "관심 지역 저장에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Ionicons name="shield" size={40} color={colors.saferoom[600]} />
        <Text style={styles.title}>
          관심 주거 지역을{"\n"}선택해 주세요
        </Text>
        <Text style={styles.subtitle}>
          맞춤형 HRI 분석과 알림을 제공합니다
        </Text>

        <Text style={styles.label}>시/도</Text>
        <View style={styles.cityRow}>
          {CITIES.map((c) => (
            <Pressable
              key={c}
              style={[styles.cityBtn, city === c && styles.cityBtnActive]}
              onPress={() => {
                setCity(c);
                setDistrict("");
              }}
            >
              <Text
                style={[styles.cityText, city === c && styles.cityTextActive]}
              >
                {c.replace("광역시", "").replace("특별시", "")}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { marginTop: 20 }]}>구/군</Text>
        <View style={styles.districtGrid}>
          {(DISTRICTS[city] ?? []).map((d) => (
            <Pressable
              key={d}
              style={[styles.districtBtn, district === d && styles.districtBtnActive]}
              onPress={() => setDistrict(d)}
            >
              <Text
                style={[
                  styles.districtText,
                  district === d && styles.districtTextActive,
                ]}
              >
                {d}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.completeBtn, (!district || loading) && styles.completeBtnDisabled]}
          disabled={!district || loading}
          onPress={handleComplete}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
          <Text
            style={[
              styles.completeText,
              !district && styles.completeTextDisabled,
            ]}
          >
            가입 완료
          </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 48 },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.slate[900],
    marginTop: 16,
    lineHeight: 32,
  },
  subtitle: { fontSize: 14, color: colors.slate[500], marginTop: 8 },
  label: { fontSize: 12, fontWeight: "500", color: colors.slate[600], marginTop: 24 },
  cityRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  cityBtn: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
  cityBtnActive: {
    borderColor: colors.saferoom[500],
    backgroundColor: colors.saferoom[50],
  },
  cityText: { fontSize: 13, color: colors.slate[700] },
  cityTextActive: { color: colors.saferoom[700], fontWeight: "600" },
  districtGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  districtBtn: {
    width: "30%",
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  districtBtnActive: {
    borderColor: colors.saferoom[500],
    backgroundColor: colors.saferoom[50],
  },
  districtText: { fontSize: 14, fontWeight: "500", color: colors.slate[700] },
  districtTextActive: { color: colors.saferoom[700] },
  completeBtn: {
    marginTop: 40,
    backgroundColor: colors.saferoom[600],
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  completeBtnDisabled: { backgroundColor: colors.slate[200] },
  completeText: { fontSize: 14, fontWeight: "700", color: colors.white },
  completeTextDisabled: { color: colors.slate[400] },
});
