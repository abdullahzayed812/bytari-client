/**
 * poultry-dashboard.tsx
 * Main poultry dashboard shown after farm/trader is approved.
 * Inspired by UI reference image 2.
 */
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Plus } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { PoultryFeatureCard } from "../components/poultry/PoultryFeatureCard";

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
});
