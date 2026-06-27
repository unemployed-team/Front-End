import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { DevLoginButton } from "@/components/auth/DevLoginButton";
import { colors } from "@/theme/colors";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Ionicons name="shield" size={32} color={colors.saferoom[600]} />
        </View>
        <Text style={styles.title}>SafeRoom AI</Text>
        <Text style={styles.subtitle}>
          계약 전에, AI가 위험한 방을 먼저 잡아낸다
        </Text>
        <View style={styles.buttons}>
          <SocialLoginButtons />
          <DevLoginButton />
        </View>
        <Pressable onPress={() => router.replace("/(tabs)")}>
          <Text style={styles.skip}>로그인 없이 둘러보기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.saferoom[100],
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.slate[900],
    marginTop: 24,
  },
  subtitle: {
    fontSize: 14,
    color: colors.slate[500],
    marginTop: 8,
    textAlign: "center",
  },
  buttons: { width: "100%", maxWidth: 360, marginTop: 40 },
  skip: {
    marginTop: 24,
    fontSize: 14,
    color: colors.slate[400],
    textDecorationLine: "underline",
  },
});
