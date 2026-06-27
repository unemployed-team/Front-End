import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/store/auth-store";
import { logoutApi } from "@/lib/api/auth";
import { getMyBookmarks } from "@/lib/api/bookmarks";
import {
  getMyContracts,
  registerContract,
  updateContract,
  deleteContract,
  simulateContract,
} from "@/lib/api/contracts";
import type { ContractResponse, SimulationResponse } from "@/lib/api/types";
import { formatCurrency } from "@/lib/utils";
import { colors } from "@/theme/colors";
import {
  BuildingSearchPicker,
  DateField,
  type SelectedBuilding,
} from "@/components/contract/BuildingSearchPicker";

export default function MyScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [simulations, setSimulations] = useState<
    Record<number, SimulationResponse>
  >({});
  const [showContractForm, setShowContractForm] = useState(false);
  const [editingContract, setEditingContract] = useState<ContractResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookmarks, contractList] = await Promise.all([
        getMyBookmarks(),
        getMyContracts(),
      ]);
      setBookmarkCount(bookmarks.length);
      setContracts(contractList);

      const simEntries = await Promise.all(
        contractList.map(async (c) => {
          try {
            const sim = await simulateContract(c.contractId);
            return [c.contractId, sim] as const;
          } catch {
            return null;
          }
        })
      );
      const simMap: Record<number, SimulationResponse> = {};
      for (const entry of simEntries) {
        if (entry) simMap[entry[0]] = entry[1];
      }
      setSimulations(simMap);
    } catch {
      setBookmarkCount(0);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated, loadData]);

  const handleDeleteContract = (contractId: number) => {
    Alert.alert("계약 삭제", "이 계약을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteContract(contractId);
            if (editingContract?.contractId === contractId) {
              setEditingContract(null);
              setShowContractForm(false);
            }
            await loadData();
          } catch (e) {
            Alert.alert(
              "삭제 실패",
              e instanceof Error ? e.message : "계약 삭제에 실패했습니다."
            );
          }
        },
      },
    ]);
  };

  const openCreateForm = () => {
    setEditingContract(null);
    setShowContractForm(true);
  };

  const openEditForm = (contract: ContractResponse) => {
    setEditingContract(contract);
    setShowContractForm(true);
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    }
    logout();
  };

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
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileCard}>
          <Text style={styles.nickname}>{user?.nickname}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.interestRegion && (
            <Text style={styles.region}>
              관심 지역: {user.interestRegion.city} {user.interestRegion.district}
            </Text>
          )}
        </View>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push("/my/bookmarks")}
        >
          <Ionicons name="bookmark" size={20} color={colors.saferoom[600]} />
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>관심 건물</Text>
            <Text style={styles.menuSub}>{bookmarkCount}개 저장됨</Text>
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
            <Pressable
              onPress={() => {
                if (showContractForm) {
                  setShowContractForm(false);
                  setEditingContract(null);
                } else {
                  openCreateForm();
                }
              }}
            >
              <Text style={styles.addBtn}>
                {showContractForm ? "닫기" : "+ 등록"}
              </Text>
            </Pressable>
          </View>

          {showContractForm && (
            <ContractForm
              key={editingContract?.contractId ?? "new"}
              initialContract={editingContract}
              onClose={() => {
                setShowContractForm(false);
                setEditingContract(null);
              }}
              onSuccess={loadData}
            />
          )}

          {loading && contracts.length === 0 && (
            <ActivityIndicator color={colors.saferoom[600]} style={{ marginTop: 12 }} />
          )}

          {contracts.map((contract) => {
            const simulation = simulations[contract.contractId];
            const daysLeft = contract.daysUntilExpiry;
            const recoveryRate = simulation
              ? simulation.recoveryRate <= 1
                ? Math.round(simulation.recoveryRate * 100)
                : Math.round(simulation.recoveryRate)
              : null;
            const recoveryColor =
              recoveryRate == null
                ? colors.slate[500]
                : recoveryRate >= 80
                  ? colors.risk.safe
                  : recoveryRate >= 50
                    ? colors.risk.caution
                    : colors.risk.danger;

            return (
              <View key={contract.contractId} style={styles.contractItem}>
                <View style={styles.contractRow}>
                  <Text style={[styles.contractAddress, styles.contractAddressFlex]}>
                    {contract.roadAddress}
                  </Text>
                  <View style={styles.contractActions}>
                    <Pressable
                      onPress={() => openEditForm(contract)}
                      style={styles.actionBtn}
                    >
                      <Ionicons name="pencil" size={14} color={colors.saferoom[600]} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteContract(contract.contractId)}
                      style={styles.actionBtn}
                    >
                      <Ionicons name="trash-outline" size={14} color={colors.risk.danger} />
                    </Pressable>
                  </View>
                </View>
                <Text style={styles.contractMeta}>
                  보증금 {formatCurrency(contract.deposit)} · D-{daysLeft}
                </Text>
                {contract.expiryAlert && (
                  <Text style={styles.expiryAlert}>{contract.expiryAlert}</Text>
                )}
                {recoveryRate != null && (
                  <Text style={styles.recovery}>
                    예상 회수율{" "}
                    <Text style={{ color: recoveryColor, fontWeight: "700" }}>
                      {recoveryRate}%
                    </Text>
                  </Text>
                )}
                {simulation && simulation.expectedLoss > 0 && (
                  <Text style={styles.loss}>
                    예상 손실 {formatCurrency(simulation.expectedLoss)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ContractForm({
  initialContract,
  onClose,
  onSuccess,
}: {
  initialContract?: ContractResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = initialContract != null;
  const [selectedBuilding, setSelectedBuilding] = useState<SelectedBuilding | null>(
    initialContract
      ? {
          buildingId: initialContract.buildingId,
          label: initialContract.roadAddress,
        }
      : null
  );
  const [deposit, setDeposit] = useState(
    initialContract ? String(initialContract.deposit) : ""
  );
  const [contractStart, setContractStart] = useState(
    initialContract?.contractStart ?? ""
  );
  const [contractEnd, setContractEnd] = useState(
    initialContract?.contractEnd ?? ""
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedBuilding) {
      Alert.alert("건물 선택", "건물을 검색해서 선택해 주세요.");
      return;
    }
    if (!deposit || !contractStart || !contractEnd) return;
    setSubmitting(true);
    try {
      const payload = {
        buildingId: selectedBuilding.buildingId,
        deposit: Number(deposit.replace(/,/g, "")),
        monthlyRent: initialContract?.monthlyRent ?? 0,
        contractStart,
        contractEnd,
      };
      if (isEdit && initialContract) {
        await updateContract(initialContract.contractId, payload);
      } else {
        await registerContract(payload);
      }
      onSuccess();
      onClose();
    } catch (e) {
      Alert.alert(
        isEdit ? "수정 실패" : "등록 실패",
        e instanceof Error
          ? e.message
          : isEdit
            ? "계약 수정에 실패했습니다."
            : "계약 등록에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.form}>
      <BuildingSearchPicker
        value={selectedBuilding}
        onChange={setSelectedBuilding}
      />
      <TextInput
        value={deposit}
        onChangeText={setDeposit}
        placeholder="보증금 (원)"
        keyboardType="numeric"
        style={styles.input}
      />
      <DateField
        label="계약 시작일"
        value={contractStart}
        onChange={setContractStart}
      />
      <DateField label="만기일" value={contractEnd} onChange={setContractEnd} />
      <Pressable
        style={[styles.submitBtn, submitting && { opacity: 0.5 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitText}>
          {submitting
            ? isEdit
              ? "수정 중..."
              : "등록 중..."
            : isEdit
              ? "계약 수정"
              : "계약 등록"}
        </Text>
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
  contractRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  contractAddressFlex: { flex: 1 },
  contractActions: { flexDirection: "row", gap: 4 },
  actionBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: colors.white,
  },
  contractAddress: { fontSize: 12, fontWeight: "600", color: colors.slate[900] },
  contractMeta: { fontSize: 12, color: colors.slate[600], marginTop: 4 },
  expiryAlert: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.risk.caution,
    marginTop: 4,
  },
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
