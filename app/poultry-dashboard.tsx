/**
 * poultry-dashboard.tsx
 * Main poultry dashboard shown after farm/trader is approved.
 * Inspired by UI reference image 2.
 */
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Plus, Feather, MapPin, Clock } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { trpc } from "../lib/trpc";
import { PoultryFeatureCard } from "../components/poultry/PoultryFeatureCard";

const FARM_TYPE_LABELS: Record<string, string> = { broiler: "تسمين", layer: "بياض" };
const HEALTH_LABELS: Record<string, string> = { healthy: "سليم", quarantine: "حجر صحي", sick: "مريض" };

const DASHBOARD_FEATURES = [
  {
    icon: "🐔",
    title: "سوق الدواجن",
    subtitle: "تصفح وشراء جميع أنواع الدواجن",
    route: "/poultry-market",
  },
  {
    icon: "🥚",
    title: "سوق البيض",
    subtitle: "إعلانات البيض اليومية",
    route: "/egg-market",
  },
  {
    icon: "📈",
    title: "بورصة الدواجن",
    subtitle: "أسعار الدواجن اليومية في جميع المحافظات",
    route: "/poultry-exchange",
  },
  {
    icon: "📊",
    title: "بورصة البيض",
    subtitle: "أسعار البيض في جميع المحافظات",
    route: "/egg-exchange",
  },
  {
    icon: "📉",
    title: "إحصائية الدواجن",
    subtitle: "عرض إحصائيات أعداد الدواجن في العراق",
    route: "/poultry-statistics",
  },
];

export default function PoultryDashboardScreen() {
  const router = useRouter();
  const { user } = useApp();

  const farmsQuery = useQuery({
    ...trpc.poultryFarms.list.queryOptions({ ownerId: Number(user?.id) }),
    enabled: !!user?.id,
  });

  const farms = farmsQuery.data?.farms ?? [];

  return (
    <>
      <Stack.Screen
        options={{
          title: "الرئيسية",
          headerStyle: { backgroundColor: "#064E3B" },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "700" },
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("/(tabs)/notifications")} style={{ marginLeft: 16 }}>
              <Bell size={22} color={COLORS.white} />
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Add Farm Hero Card */}
          <TouchableOpacity style={styles.addFarmCard} onPress={() => router.push("/add-poultry-farm")} activeOpacity={0.9}>
            <View style={styles.addFarmOverlay}>
              <Plus size={36} color={COLORS.white} />
              <Text style={styles.addFarmTitle}>إضافة حقل دواجن</Text>
              <Text style={styles.addFarmSubtitle}>أضف حقل جديد وابدأ إدارة الدواجن</Text>
            </View>
          </TouchableOpacity>

          {/* My Farms */}
          {(farmsQuery.isLoading || farms.length > 0) && (
            <View style={styles.farmsSection}>
              <Text style={styles.farmsSectionTitle}>حقولي ({farms.length})</Text>
              {farmsQuery.isLoading ? (
                <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
              ) : (
                farms.map((farm: any) => {
                  const isPending = !farm.isActive && farm.status !== "active";
                  return (
                    <TouchableOpacity
                      key={farm.id}
                      style={[styles.farmCard, isPending && styles.farmCardPending]}
                      onPress={() => !isPending && router.push({ pathname: "/poultry-farm-details", params: { id: farm.id } })}
                      activeOpacity={isPending ? 1 : 0.8}
                    >
                      <View style={styles.farmCardHeader}>
                        {farm.images?.[0] ? (
                          <Image source={{ uri: farm.images[0] }} style={styles.farmImage} />
                        ) : (
                          <View style={styles.farmIconBox}>
                            <Feather size={24} color={COLORS.white} />
                          </View>
                        )}
                        <View style={styles.farmCardInfo}>
                          <Text style={styles.farmCardName}>{farm.name}</Text>
                          {farm.governorate ? (
                            <View style={styles.farmCardRow}>
                              <MapPin size={12} color={COLORS.darkGray} />
                              <Text style={styles.farmCardSub}>{farm.governorate}</Text>
                            </View>
                          ) : null}
                          <View style={styles.farmCardBadges}>
                            {isPending ? (
                              <View style={styles.pendingBadge}>
                                <Clock size={11} color="#92400E" />
                                <Text style={styles.pendingBadgeText}>قيد المراجعة</Text>
                              </View>
                            ) : (
                              <View style={[styles.activeBadge, { backgroundColor: COLORS.success }]}>
                                <Text style={styles.activeBadgeText}>نشط</Text>
                              </View>
                            )}
                            <View style={[styles.activeBadge, { backgroundColor: COLORS.primary }]}>
                              <Text style={styles.activeBadgeText}>{FARM_TYPE_LABELS[farm.farmType] ?? farm.farmType}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      {!isPending && (
                        <View style={styles.farmCardStats}>
                          <View style={styles.farmStat}>
                            <Text style={styles.farmStatLabel}>الطاقة</Text>
                            <Text style={styles.farmStatValue}>{(farm.capacity ?? 0).toLocaleString()}</Text>
                          </View>
                          <View style={styles.farmStat}>
                            <Text style={styles.farmStatLabel}>الحالي</Text>
                            <Text style={styles.farmStatValue}>{(farm.currentPopulation ?? 0).toLocaleString()}</Text>
                          </View>
                          <View style={styles.farmStat}>
                            <Text style={styles.farmStatLabel}>الصحة</Text>
                            <Text style={styles.farmStatValue}>{HEALTH_LABELS[farm.healthStatus] ?? farm.healthStatus}</Text>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}

          {/* Feature Cards */}
          <View style={styles.section}>
            {DASHBOARD_FEATURES.map((item) => (
              <PoultryFeatureCard
                key={item.route}
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onPress={() => router.push(item.route as any)}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  addFarmCard: {
    margin: 16,
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#064E3B",
  },
  addFarmOverlay: {
    flex: 1,
    backgroundColor: "rgba(6,78,59,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  addFarmTitle: { fontSize: 22, fontWeight: "800", color: COLORS.white, marginTop: 8 },
  addFarmSubtitle: { fontSize: 13, color: "#A7F3D0", marginTop: 4, textAlign: "center" },
  section: { paddingHorizontal: 16, paddingBottom: 24 },

  farmsSection: { paddingHorizontal: 16, marginBottom: 8 },
  farmsSectionTitle: { fontSize: 17, fontWeight: "700", color: COLORS.black, marginBottom: 12 },
  farmCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  farmCardPending: { borderWidth: 1.5, borderStyle: "dashed", borderColor: "#F59E0B", opacity: 0.85 },
  farmCardHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 12 },
  farmImage: { width: 52, height: 52, borderRadius: 26 },
  farmIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  farmCardInfo: { flex: 1 },
  farmCardName: { fontSize: 15, fontWeight: "700", color: COLORS.black, marginBottom: 4 },
  farmCardRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  farmCardSub: { fontSize: 12, color: COLORS.darkGray },
  farmCardBadges: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF9C3",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  pendingBadgeText: { fontSize: 11, color: "#92400E", fontWeight: "600" },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  activeBadgeText: { fontSize: 11, color: COLORS.white, fontWeight: "600" },
  farmCardStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  farmStat: { alignItems: "center" },
  farmStatLabel: { fontSize: 11, color: COLORS.darkGray, marginBottom: 2 },
  farmStatValue: { fontSize: 13, fontWeight: "700", color: COLORS.black },
});
