import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme/colors";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuthStore();
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [showWithdraw, setShowWithdraw] = useState(false);

  const handleSave = () => {
    updateProfile({ nickname });
  };

  const handleWithdraw = () => {
    logout();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header title="회원 정보 수정" showBack />
      <View style={styles.content}>
        <Text style={styles.label}>닉네임</Text>
        <TextInput
          value={nickname}
          onChangeText={setNickname}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 16 }]}>관심 지역</Text>
        <View style={styles.readonly}>
          <Text style={styles.readonlyText}>
            {user?.interestRegion
              ? `${user.interestRegion.city} ${user.interestRegion.district}`
              : "미설정"}
          </Text>
        </View>

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>저장</Text>
        </Pressable>

        <View style={styles.withdrawSection}>
          {!showWithdraw ? (
            <Pressable onPress={() => setShowWithdraw(true)}>
              <Text style={styles.withdrawLink}>회원 탈퇴</Text>
            </Pressable>
          ) : (
            <View style={styles.withdrawCard}>
              <Text style={styles.withdrawDesc}>
                탈퇴 시 북마크, 계약 정보가 영구 삭제되며 소셜 연동이 해제됩니다.
              </Text>
              <View style={styles.withdrawActions}>
                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => setShowWithdraw(false)}
                >
                  <Text style={styles.cancelText}>취소</Text>
                </Pressable>
                <Pressable style={styles.confirmBtn} onPress={handleWithdraw}>
                  <Text style={styles.confirmText}>탈퇴 확인</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  label: { fontSize: 12, fontWeight: "500", color: colors.slate[600] },
  input: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.slate[900],
    backgroundColor: colors.white,
  },
  readonly: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.slate[50],
  },
  readonlyText: { fontSize: 14, color: colors.slate[600] },
  saveBtn: {
    marginTop: 24,
    backgroundColor: colors.saferoom[600],
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveText: { fontSize: 14, fontWeight: "700", color: colors.white },
  withdrawSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.slate[200],
    paddingTop: 16,
  },
  withdrawLink: { fontSize: 14, color: colors.risk.danger },
  withdrawCard: {
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    backgroundColor: "rgba(239,68,68,0.05)",
    borderRadius: 12,
    padding: 16,
  },
  withdrawDesc: { fontSize: 14, color: colors.slate[700] },
  withdrawActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelText: { fontSize: 14, color: colors.slate[700] },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.risk.danger,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  confirmText: { fontSize: 14, fontWeight: "600", color: colors.white },
});
