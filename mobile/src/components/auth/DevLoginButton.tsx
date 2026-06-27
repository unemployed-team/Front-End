import { Pressable, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth-store";
import { isDevLoginEnabled } from "@/lib/dev-auth";
import { colors } from "@/theme/colors";

export function DevLoginButton() {
  const router = useRouter();
  const { devLogin } = useAuthStore();

  if (!isDevLoginEnabled()) return null;

  const handleDevLogin = () => {
    devLogin();
    const user = useAuthStore.getState().user;
    if (user?.interestRegion) {
      router.replace("/(tabs)");
    } else {
      router.push("/onboarding");
    }
  };

  return (
    <>
      <Pressable style={styles.btn} onPress={handleDevLogin}>
        <Text style={styles.btnText}>개발용 임시 로그인</Text>
      </Pressable>
      <Text style={styles.hint}>OAuth 없이 로그인·북마크 테스트</Text>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    marginTop: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.slate[300],
    borderRadius: 12,
    backgroundColor: colors.slate[50],
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: { fontSize: 14, fontWeight: "600", color: colors.slate[600] },
  hint: {
    marginTop: 8,
    fontSize: 11,
    color: colors.slate[400],
    textAlign: "center",
  },
});
