/**
 * egg-exchange.tsx
 * Daily egg exchange prices viewer.
 */
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useEggExchange } from "../hooks/usePoultryExchange";
import { ExchangeTable } from "../components/poultry/ExchangeTable";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function formatArabicDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-IQ", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export default function EggExchangeScreen() {
  const router = useRouter();
  const { hasAdminAccess, isModerator } = useApp();
  const today = todayStr();

  const { data, isLoading } = useEggExchange(today);

  const canManage = hasAdminAccess || isModerator;

  const rows = (data?.rows || []).map((r: any) => ({
    governorate: r.governorate,
    broilerPricePerKg: r.pricePerTray != null ? Number(r.pricePerTray) : null,
    layerPricePerBird: null,
    broilerTrend: r.trend,
    layerTrend: null,
  }));

  return (
    <>
      <Stack.Screen
        options={{
          title: "بورصة البيض",
          headerStyle: { backgroundColor: "#064E3B" },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "700" },
          headerRight: canManage
            ? () => (
                <TouchableOpacity style={styles.manageBtn} onPress={() => router.push("/manage-egg-exchange")}>
                  <Settings size={18} color={COLORS.white} />
                </TouchableOpacity>
              )
            : undefined,
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {/* Date header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{formatArabicDate(today)}</Text>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
            <Text style={styles.legendText}>ارتفاع</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
            <Text style={styles.legendText}>انخفاض</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.darkGray }]} />
            <Text style={styles.legendText}>ثابت</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 40 }} />
          ) : rows.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🥚</Text>
              <Text style={styles.emptyText}>لا توجد أسعار لهذا اليوم</Text>
              {canManage && (
                <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/manage-egg-exchange")}>
                  <Text style={styles.emptyBtnText}>إضافة الأسعار</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <ExchangeTable rows={rows} mode="egg" />
          )}

          {rows.length > 0 && (
            <View style={styles.note}>
              <Text style={styles.noteText}>* الأسعار بالدينار العراقي. سعر الطبقة (30 بيضة).</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  manageBtn: { marginLeft: 12, padding: 4 },
  dateHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },
  dateText: { fontSize: 14, fontWeight: "600", color: COLORS.black },
  legend: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: COLORS.darkGray },
  content: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: COLORS.darkGray, marginBottom: 16 },
  emptyBtn: { backgroundColor: "#064E3B", paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  emptyBtnText: { color: COLORS.white, fontWeight: "600" },
  note: { marginTop: 16, padding: 10, backgroundColor: "#FFFBEB", borderRadius: 8 },
  noteText: { fontSize: 11, color: "#92400E" },
});
