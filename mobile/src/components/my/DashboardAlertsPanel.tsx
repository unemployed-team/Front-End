import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { DashboardAlert } from "@/ai/types/analysis";
import { colors } from "@/theme/colors";

interface DashboardAlertsPanelProps {
  alerts: DashboardAlert[];
}

export function DashboardAlertsPanel({ alerts }: DashboardAlertsPanelProps) {
  if (!alerts.length) return null;

  const contractAlerts = alerts.filter((a) => a.type === "contract_expiry");
  const gradeAlerts = alerts.filter((a) => a.type === "grade_change");

  return (
    <View style={styles.wrap}>
      {contractAlerts.length > 0 && (
        <View style={styles.cautionCard}>
          <View style={styles.header}>
            <Ionicons name="warning" size={16} color={colors.risk.caution} />
            <Text style={styles.cautionTitle}>계약 만기 알림 (D-90 / D-30 / D-7)</Text>
          </View>
          {contractAlerts.map((alert) => (
            <Text key={alert.id} style={styles.item}>
              · {alert.message}
            </Text>
          ))}
        </View>
      )}

      {gradeAlerts.length > 0 && (
        <View style={styles.dangerCard}>
          <View style={styles.header}>
            <Ionicons name="trending-down" size={16} color={colors.risk.danger} />
            <Text style={styles.dangerTitle}>관심 건물 등급 변동</Text>
          </View>
          {gradeAlerts.map((alert) => (
            <Text
              key={alert.id}
              style={[
                styles.item,
                alert.currentGrade === "danger" && { color: colors.risk.danger },
              ]}
            >
              · {alert.message}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  cautionCard: {
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.3)",
    backgroundColor: "rgba(245,158,11,0.05)",
    borderRadius: 12,
    padding: 14,
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
    backgroundColor: "rgba(239,68,68,0.05)",
    borderRadius: 12,
    padding: 14,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  cautionTitle: { fontSize: 14, fontWeight: "600", color: colors.risk.caution },
  dangerTitle: { fontSize: 14, fontWeight: "600", color: colors.risk.danger },
  item: { fontSize: 12, color: colors.slate[700], marginTop: 4 },
});
