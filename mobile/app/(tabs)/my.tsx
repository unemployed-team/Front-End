import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/store/auth-store";
import { useAppStore } from "@/store/app-store";
import { SafeRoomEngine } from "@/ai";
import { simulateAuctionRecovery } from "@/ai/simulator/auction-recovery";
import { formatCurrency, getDaysUntil } from "@/lib/utils";
import { DashboardAlertsPanel } from "@/components/my/DashboardAlertsPanel";
import { colors } from "@/theme/colors";

export default function MyScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { bookmarks, contracts } = useAppStore();
  const [showContractForm, setShowContractForm] = useState(false);

  const dashboardAlerts = SafeRoomEngine.screenAlerts({ contracts, bookmarks });

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Header title="마이페이지" />
        <View style={styles.guest}>
          <View style={styles.guestIcon}>
            <Ionicons name="log-in" size={32} color={colors.saferoom[600]} />
          </View>
          <Text style={styles.guestText}>
            로그인하고 관심 건물·계약 정보를 관리하세요
          </Text>
          <Pressable
            style={styles.loginBtn}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginBtnText}>로그인 / 회원가입</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header
        title="마이페이지"
        right={
          <Pressable onPress={() => router.push("/my/settings")}>
            <Ionicons name="settings-outline" size={22} color={colors.slate[500]} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          <Text style={styles.nickname}>{user?.nickname}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.interestRegion && (
            <Text style={styles.region}>
              관심 지역: {user.interestRegion.city} {user.interestRegion.district}
            </Text>
          )}
        </View>

        <DashboardAlertsPanel alerts={dashboardAlerts} />

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push("/my/bookmarks")}
        >
          <Ionicons name="bookmark" size={20} color={colors.saferoom[600]} />
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>관심 건물</Text>
            <Text style={styles.menuSub}>{bookmarks.length}개 저장됨</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.slate[400]} />
        </Pressable>

        <View style={styles.contractCard}>
          <View style={styles.contractHeader}>
            <Ionicons name="document-text" size={20} color={colors.saferoom[600]} />
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>내 계약 관리</Text>
              <Text style={styles.menuSub}>{contracts.length}건 등록</Text>
            </View>
            <Pressable onPress={() => setShowContractForm(!showContractForm)}>
              <Text style={styles.addBtn}>
                {showContractForm ? "닫기" : "+ 등록"}
              </Text>
            </Pressable>
          </View>

          {showContractForm && (
            <ContractForm onClose={() => setShowContractForm(false)} />
          )}

          {contracts.map((contract) => {
            const simulation = simulateAuctionRecovery({
              deposit: contract.deposit,
              officialPrice: contract.deposit * 1.6,
              seniorMortgage: contract.deposit * 0.4,
              auctionBidRate: 0,
              region: "대구",
              moveInDate: contract.startDate,
              contractDate: contract.startDate,
            });
            const daysLeft = getDaysUntil(contract.endDate);
            const recoveryColor =
              simulation.depositRecoveryRate >= 80
                ? colors.risk.safe
                : simulation.depositRecoveryRate >= 50
                  ? colors.risk.caution
                  : colors.risk.danger;

            return (
              <View key={contract.id} style={styles.contractItem}>
                <Text style={styles.contractAddress}>
                  {contract.building.roadAddress}
                </Text>
                <Text style={styles.contractMeta}>
                  보증금 {formatCurrency(contract.deposit)} · D-{daysLeft}
                </Text>
                <Text style={styles.recovery}>
                  예상 회수율{" "}
                  <Text style={{ color: recoveryColor, fontWeight: "700" }}>
                    {simulation.depositRecoveryRate}%
                  </Text>
                </Text>
                {simulation.expectedLoss > 0 && (
                  <Text style={styles.loss}>
                    예상 손실 {formatCurrency(simulation.expectedLoss)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <Pressable style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ContractForm({ onClose }: { onClose: () => void }) {
  const { addContract } = useAppStore();
  const [deposit, setDeposit] = useState("");
  const [address, setAddress] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = () => {
    if (!address || !deposit || !endDate) return;
    addContract({
      id: `contract-${Date.now()}`,
      buildingId: "bld-001",
      building: {
        id: "bld-001",
        pnu: "",
        roadAddress: address,
        jibunAddress: address,
        lat: 35.87,
        lng: 128.6,
        buildingType: "oneroom",
        buildYear: 2000,
        floors: 5,
        householdCount: 10,
        isViolation: false,
        adminDong: "",
      },
      deposit: Number(deposit.replace(/,/g, "")),
      monthlyRent: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate,
      hasMonthlyRent: false,
    });
    onClose();
  };

  return (
    <View style={styles.form}>
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="건물 주소"
        style={styles.input}
      />
      <TextInput
        value={deposit}
        onChangeText={setDeposit}
        placeholder="보증금 (원)"
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        value={endDate}
        onChangeText={setEndDate}
        placeholder="만기일 (YYYY-MM-DD)"
        style={styles.input}
      />
      <Pressable style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>계약 등록</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  guest: { alignItems: "center", paddingVertical: 64, paddingHorizontal: 16 },
  guestIcon: {
    backgroundColor: colors.saferoom[100],
    borderRadius: 999,
    padding: 16,
  },
  guestText: {
    fontSize: 14,
    color: colors.slate[600],
    textAlign: "center",
    marginTop: 16,
  },
  loginBtn: {
    marginTop: 24,
    backgroundColor: colors.saferoom[600],
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  loginBtnText: { fontSize: 14, fontWeight: "700", color: colors.white },
  profileCard: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 16,
  },
  nickname: { fontSize: 18, fontWeight: "700", color: colors.slate[900] },
  email: { fontSize: 14, color: colors.slate[500], marginTop: 2 },
  region: { fontSize: 12, color: colors.saferoom[600], marginTop: 4 },
  alertCard: {
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.3)",
    backgroundColor: "rgba(245,158,11,0.05)",
    borderRadius: 12,
    padding: 16,
  },
  alertHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  alertTitle: { fontSize: 14, fontWeight: "600", color: colors.risk.caution },
  alertItem: { fontSize: 12, color: colors.slate[700], marginTop: 4 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 16,
  },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 14, fontWeight: "600", color: colors.slate[900] },
  menuSub: { fontSize: 12, color: colors.slate[500] },
  contractCard: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 16,
  },
  contractHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  addBtn: { fontSize: 12, fontWeight: "500", color: colors.saferoom[600] },
  contractItem: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.slate[100],
    borderRadius: 8,
    backgroundColor: colors.slate[50],
    padding: 12,
  },
  contractAddress: { fontSize: 12, fontWeight: "600", color: colors.slate[900] },
  contractMeta: { fontSize: 12, color: colors.slate[600], marginTop: 4 },
  recovery: { fontSize: 12, color: colors.slate[500], marginTop: 8 },
  loss: { fontSize: 12, color: colors.risk.danger, marginTop: 4 },
  form: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.slate[100],
    paddingTop: 12,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.slate[900],
  },
  submitBtn: {
    backgroundColor: colors.saferoom[600],
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  submitText: { fontSize: 14, fontWeight: "600", color: colors.white },
  logoutBtn: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  logoutText: { fontSize: 14, color: colors.slate[500] },
});
