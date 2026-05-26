/**
 * poultry-statistics.tsx
 * Poultry statistics aggregated from registered farms per governorate.
 */
import React from "react";
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { COLORS } from "../constants/colors";
import { trpc } from "../lib/trpc";
import { StatisticsTable } from "../components/poultry/StatisticsTable";

export default function PoultryStatisticsScreen() {
  const { data, isLoading } = useQuery(trpc.poultry.statistics.get.queryOptions());

  const totalFarms = data?.totalFarms ?? 0;
  const totalBirds = data?.totalBirds ?? 0;

  const rows = (data?.governorateStats || []).map((r: any) => ({
    governorate: r.governorate,
    totalBirds: r.totalBirds,
    farmCount: r.farmCount,
    lastUpdated: null,
  }));

  return (
    <>
      <Stack.Screen
        options={{
          title: "إحصائية الدواجن",
          headerStyle: { backgroundColor: "#064E3B" },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalFarms.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>مزرعة مسجلة</Text>
            <Text style={styles.summaryIcon}>🏚️</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardGreen]}>
            <Text style={[styles.summaryValue, { color: "#059669" }]}>{totalBirds.toLocaleString()}</Text>
            <Text style={styles.summaryLabel}>مجموع الدجاج</Text>
            <Text style={styles.summaryIcon}>🐔</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 40 }} />
          ) : rows.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>لا توجد بيانات حالياً</Text>
              <Text style={styles.emptySubtext}>البيانات تُحسب من المزارع النشطة المسجلة</Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>التوزيع حسب المحافظة</Text>
              <StatisticsTable rows={rows} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  summaryRow: {
    flexDirection: "row-reverse",
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  summaryCardGreen: { backgroundColor: "#ECFDF5", borderColor: "#6EE7B7" },
  summaryValue: { fontSize: 24, fontWeight: "800", color: COLORS.primary },
  summaryLabel: { fontSize: 12, color: COLORS.darkGray, marginTop: 2, textAlign: "center" },
  summaryIcon: { fontSize: 24, marginTop: 4 },
  content: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.black, textAlign: "right", marginBottom: 12 },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: COLORS.darkGray, marginBottom: 8 },
  emptySubtext: { fontSize: 13, color: COLORS.lightGray, textAlign: "center" },
});
