/**
 * poultry-exchange.tsx
 * Daily poultry exchange prices viewer. Inspired by UI reference image 5.
 */
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, Settings } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { usePoultryExchange } from "../hooks/usePoultryExchange";
import { ExchangeTable } from "../components/poultry/ExchangeTable";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatArabicDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ar-IQ", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export default function PoultryExchangeScreen() {
  const router = useRouter();
  const { hasAdminAccess, isModerator } = useApp();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const { data, isLoading } = usePoultryExchange(selectedDate);

  const canManage = hasAdminAccess || isModerator;

  const goToPrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDate(d));
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    if (d <= new Date()) setSelectedDate(formatDate(d));
  };

  const isToday = selectedDate === formatDate(new Date());

  const rows = (data?.rows || []).map((r: any) => ({
    governorate: r.governorate,
    broilerPricePerKg: r.broilerPricePerKg != null ? Number(r.broilerPricePerKg) : null,
    layerPricePerBird: r.layerPricePerBird != null ? Number(r.layerPricePerBird) : null,
    broilerTrend: r.broilerTrend,
    layerTrend: r.layerTrend,
  }));

  return (
    <>
      <Stack.Screen
        options={{
          title: "بورصة الدواجن",
          headerStyle: { backgroundColor: "#064E3B" },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "700" },
          headerRight: canManage
            ? () => (
                <TouchableOpacity style={styles.manageBtn} onPress={() => router.push("/manage-poultry-exchange")}>
                  <Settings size={18} color={COLORS.white} />
                </TouchableOpacity>
              )
            : undefined,
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {/* Date Navigation */}
        <View style={styles.dateNav}>
          <TouchableOpacity style={styles.dateArrow} onPress={goToPrevDay}>
            <Text style={styles.dateArrowText}>›</Text>
          </TouchableOpacity>
          <View style={styles.dateCenter}>
            <Calendar size={14} color="#064E3B" />
            <Text style={styles.dateText}>{formatArabicDate(selectedDate)}</Text>
          </View>
          <TouchableOpacity style={[styles.dateArrow, isToday && styles.dateArrowDisabled]} onPress={goToNextDay} disabled={isToday}>
            <Text style={[styles.dateArrowText, isToday && { color: COLORS.lightGray }]}>‹</Text>
          </TouchableOpacity>
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
              <Text style={styles.emptyIcon}>📈</Text>
              <Text style={styles.emptyText}>لا توجد أسعار لهذا اليوم</Text>
              {canManage && (
                <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/manage-poultry-exchange")}>
                  <Text style={styles.emptyBtnText}>إضافة الأسعار</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <ExchangeTable rows={rows} mode="poultry" />
          )}

          {rows.length > 0 && (
            <View style={styles.note}>
              <Text style={styles.noteText}>* الأسعار بالدينار العراقي. دجاج اللحم سعر الكيلو، دجاج البياض سعر الطير.</Text>
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
  dateNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  dateArrow: { padding: 8 },
  dateArrowDisabled: { opacity: 0.3 },
  dateArrowText: { fontSize: 24, color: "#064E3B", fontWeight: "700" },
  dateCenter: { flexDirection: "row", alignItems: "center", gap: 6 },
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
  note: { marginTop: 16, padding: 10, backgroundColor: "#F0FDF4", borderRadius: 8 },
  noteText: { fontSize: 11, color: "#065F46", textAlign: "right" },
});
