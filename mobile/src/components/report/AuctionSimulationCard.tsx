import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RecoverySimulation } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { colors } from "@/theme/colors";

interface AuctionSimulationCardProps {
  simulation: RecoverySimulation;
  deposit: number;
}

export function AuctionSimulationCard({
  simulation,
  deposit,
}: AuctionSimulationCardProps) {
  const rateColor =
    simulation.depositRecoveryRate >= 80
      ? colors.risk.safe
      : simulation.depositRecoveryRate >= 50
        ? colors.risk.caution
        : colors.risk.danger;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="hammer" size={18} color={colors.saferoom[600]} />
        <Text style={styles.title}>경매 배당 시뮬레이션</Text>
      </View>
      <Text style={styles.subtitle}>
        주택임대차보호법 · 공시지가 · 선순위 근저당 · 낙찰가율 반영
      </Text>

      <View style={styles.grid}>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>보증금</Text>
          <Text style={styles.cellValue}>{formatCurrency(deposit)}</Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>예상 회수율</Text>
          <Text style={[styles.cellValue, { color: rateColor }]}>
            {simulation.depositRecoveryRate}%
          </Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>낙찰가율</Text>
          <Text style={styles.cellValue}>
            {simulation.auctionBidRate.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>소액임차인 보호</Text>
          <Text style={styles.cellValue}>
            {simulation.smallTenantProtection ? "적용" : "미적용"}
          </Text>
        </View>
      </View>

      {simulation.expectedLoss > 0 && (
        <Text style={styles.loss}>
          예상 손실액 {formatCurrency(simulation.expectedLoss)}
        </Text>
      )}

      {simulation.smallTenantProtection && (
        <Text style={styles.note}>
          최우선변제 보장액 {formatCurrency(simulation.protectedAmount)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.slate[200],
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 16,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 16, fontWeight: "700", color: colors.slate[900] },
  subtitle: { fontSize: 12, color: colors.slate[500], marginTop: 4 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  cell: {
    width: "48%",
    backgroundColor: colors.slate[50],
    borderRadius: 8,
    padding: 10,
  },
  cellLabel: { fontSize: 11, color: colors.slate[500] },
  cellValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.slate[900],
    marginTop: 4,
  },
  loss: {
    marginTop: 12,
    backgroundColor: "rgba(239,68,68,0.05)",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: colors.risk.danger,
  },
  note: { fontSize: 12, color: colors.slate[500], marginTop: 8 },
});
