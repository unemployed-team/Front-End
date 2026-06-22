import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import type { SocialProvider, TermsAgreement, User } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme/colors";

const PROVIDERS: {
  id: SocialProvider;
  label: string;
  bg: string;
  text: string;
  emoji: string;
}[] = [
  { id: "kakao", label: "카카오로 시작", bg: colors.kakao, text: "#191919", emoji: "💬" },
  { id: "naver", label: "네이버로 시작", bg: colors.naver, text: colors.white, emoji: "N" },
];

export function SocialLoginButtons() {
  const router = useRouter();
  const { login, setPendingTerms } = useAuthStore();
  const [showTerms, setShowTerms] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);

  const handleTermsAgree = (terms: TermsAgreement) => {
    setShowTerms(false);
    setPendingTerms(terms);
    const mockUser: User = {
      id: `user-${Date.now()}`,
      email: pendingProvider === "kakao" ? "user@kakao.com" : "user@naver.com",
      nickname: pendingProvider === "kakao" ? "카카오유저" : "네이버유저",
      provider: pendingProvider ?? "kakao",
      createdAt: new Date().toISOString(),
    };
    login(mockUser);
    router.push("/onboarding");
  };

  return (
    <>
      <View style={styles.container}>
        {PROVIDERS.map(({ id, label, bg, text, emoji }) => (
          <Pressable
            key={id}
            style={[styles.btn, { backgroundColor: bg }]}
            onPress={() => {
              setPendingProvider(id);
              setShowTerms(true);
            }}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={[styles.btnText, { color: text }]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <TermsModal
        visible={showTerms}
        onClose={() => setShowTerms(false)}
        onAgree={handleTermsAgree}
      />
    </>
  );
}

function TermsModal({
  visible,
  onClose,
  onAgree,
}: {
  visible: boolean;
  onClose: () => void;
  onAgree: (terms: TermsAgreement) => void;
}) {
  const [terms, setTerms] = useState<TermsAgreement>({
    service: false,
    privacy: false,
    location: false,
  });

  const allRequired = terms.service && terms.privacy;

  const toggle = (key: keyof TermsAgreement) => {
    setTerms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>약관 동의</Text>
          <Text style={styles.sheetDesc}>
            SafeRoom AI 서비스 이용을 위해 약관에 동의해 주세요.
          </Text>
          <ScrollView style={styles.termsList}>
            {[
              { key: "service" as const, label: "서비스 이용약관 (필수)" },
              { key: "privacy" as const, label: "개인정보 처리방침 (필수)" },
              { key: "location" as const, label: "위치정보 이용 (선택)" },
            ].map(({ key, label }) => (
              <Pressable
                key={key}
                style={styles.termRow}
                onPress={() => toggle(key)}
              >
                <View style={[styles.checkbox, terms[key] && styles.checkboxOn]}>
                  {terms[key] && <Text style={styles.check}>✓</Text>}
                </View>
                <Text style={styles.termLabel}>{label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable
            style={[styles.agreeBtn, !allRequired && styles.agreeBtnDisabled]}
            disabled={!allRequired}
            onPress={() => onAgree(terms)}
          >
            <Text
              style={[
                styles.agreeBtnText,
                !allRequired && styles.agreeBtnTextDisabled,
              ]}
            >
              동의하고 계속
            </Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>취소</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  emoji: { fontSize: 16 },
  btnText: { fontSize: 14, fontWeight: "700" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "80%",
  },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: colors.slate[900] },
  sheetDesc: { fontSize: 14, color: colors.slate[500], marginTop: 4 },
  termsList: { marginTop: 16, maxHeight: 200 },
  termRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.slate[300],
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { backgroundColor: colors.saferoom[600], borderColor: colors.saferoom[600] },
  check: { color: colors.white, fontSize: 12, fontWeight: "700" },
  termLabel: { fontSize: 14, color: colors.slate[700], flex: 1 },
  agreeBtn: {
    marginTop: 16,
    backgroundColor: colors.saferoom[600],
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  agreeBtnDisabled: { backgroundColor: colors.slate[200] },
  agreeBtnText: { fontSize: 14, fontWeight: "700", color: colors.white },
  agreeBtnTextDisabled: { color: colors.slate[400] },
  cancelBtn: { marginTop: 12, alignItems: "center", padding: 8 },
  cancelText: { fontSize: 14, color: colors.slate[500] },
});
