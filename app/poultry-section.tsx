/**
 * poultry-section.tsx
 * Entry screen — user chooses between "Farm Owner" and "Poultry Trader" registration.
 * Inspired by UI reference image 1.
 */
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { trpc } from "../lib/trpc";

const FARM_FEATURES = [
  "إدارة حقول الدواجن",
  "متابعة الدفعات اليومية",
  "سوق الدواجن والبيض",
  "بورصة الأسعار اليومية",
  "إحصائيات الدواجن",
  "ربط الأطباء البيطريين",
  "تقارير الأرباح والخسائر",
  "إدارة الموظفين والصلاحيات",
];

const TRADER_FEATURES = [
  "سوق الدواجن",
  "سوق البيض",
  "بورصة الدواجن اليومية",
  "بورصة البيض اليومية",
  "إحصائيات المحافظات",
  "ملف التاجر",
  "العقود والتوثيق",
  "المستشار الأسبوعي",
];

export default function PoultrySectionScreen() {
  const router = useRouter();
  const { user } = useApp();

  // Check if user has a trader account already
  const traderQuery = useQuery({
    ...trpc.poultry.traders.getMyProfile.queryOptions(),
    enabled: !!user?.id,
  });

  const trader = traderQuery.data?.trader;
  const traderEndDate = trader?.activationEndDate ? new Date(trader.activationEndDate as any) : null;
  const isTraderExpired = traderEndDate ? traderEndDate.getTime() < Date.now() : true;
  const hasActiveTrader = trader?.status === "active" && !isTraderExpired && !trader?.needsRenewal;
  const hasPendingTrader = trader?.status === "pending" || !!trader?.reviewingRenewalRequest;

  const handleFarmOwner = () => router.push("/add-poultry-farm");
  const handleTrader = () => {
    if (hasActiveTrader) {
      router.push("/poultry-dashboard");
    } else if (hasPendingTrader) {
      // Show pending state — do nothing
    } else {
      router.push("/register-poultry-trader");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🐔</Text>
          <Text style={styles.heroTitle}>مرحباً بك في{"\n"}قسم الدواجن</Text>
          <Text style={styles.heroSubtitle}>اختر نوع الحساب المناسب لطبيعة عمل الدواجن</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Farm Owner Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🏚️</Text>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>إضافة حقل دواجن</Text>
                <Text style={styles.cardSubtitle}>إدارة حقولك ومتابعة أداء الدواجن</Text>
              </View>
            </View>

            <View style={styles.features}>
              {FARM_FEATURES.map((f) => (
                <View key={f} style={styles.featureRow}>
                  <CheckCircle size={14} color={COLORS.primary} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleFarmOwner}>
              <Text style={styles.primaryBtnText}>إنشاء حقل دواجن</Text>
            </TouchableOpacity>
          </View>

          {/* Trader Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🛒</Text>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>حساب تاجر</Text>
                <Text style={styles.cardSubtitle}>البيع والشراء وإدارة التجارة في الدواجن</Text>
              </View>
            </View>

            <View style={styles.features}>
              {TRADER_FEATURES.map((f) => (
                <View key={f} style={styles.featureRow}>
                  <CheckCircle size={14} color="#F59E0B" />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            {hasPendingTrader ? (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>طلبك قيد المراجعة من الإدارة</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity style={[styles.primaryBtn, styles.traderBtn]} onPress={handleTrader}>
                  <Text style={styles.primaryBtnText}>{hasActiveTrader ? "الذهاب إلى لوحة التحكم" : "تسجيل كتاجر"}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>📋 ملاحظة: حساب التاجر يتطلب موافقة الإدارة قبل التفعيل. حقول الدواجن تتطلب موافقة أيضاً لكل حقل جديد.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  hero: {
    backgroundColor: "#064E3B",
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  heroEmoji: { fontSize: 48, marginBottom: 8 },
  heroTitle: { fontSize: 24, fontWeight: "800", color: COLORS.white, textAlign: "center", lineHeight: 32 },
  heroSubtitle: { fontSize: 14, color: "#A7F3D0", textAlign: "center", marginTop: 8 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 12, marginBottom: 16 },
  cardIcon: { fontSize: 36 },
  cardHeaderText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: "700", color: COLORS.black },
  cardSubtitle: { fontSize: 13, color: COLORS.darkGray, marginTop: 2 },
  features: { marginBottom: 16, gap: 8 },
  featureRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13, color: COLORS.black, flex: 1 },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  traderBtn: { backgroundColor: "#D97706" },
  primaryBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 16 },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F59E0B",
    alignItems: "center",
  },
  pendingText: { color: "#D97706", fontWeight: "600", fontSize: 14 },
  infoBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  infoText: { fontSize: 13, color: "#1976D2", lineHeight: 20 },
});
