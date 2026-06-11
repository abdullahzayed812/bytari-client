/**
 * poultry-market.tsx
 * Poultry market listing. Inspired by UI reference image 3.
 */
import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Filter } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { usePoultryMarket } from "../hooks/usePoultryMarket";
import { PoultryMarketCard } from "../components/poultry/PoultryMarketCard";

const IRAQ_GOVERNORATES = ["الكل", "بغداد", "نينوى", "البصرة", "النجف", "أربيل", "السليمانية", "كربلاء", "ديالى", "واسط", "صلاح الدين"];

const POULTRY_TYPES = [
  { key: "", label: "جميع الأنواع" },
  { key: "broiler", label: "دجاج لحم" },
  { key: "layer", label: "دجاج بياض" },
  { key: "local", label: "دجاج بلدي" },
  { key: "turkey", label: "ديك رومي" },
  { key: "rooster", label: "ديوك" },
];

export default function PoultryMarketScreen() {
  const router = useRouter();
  const { hasAdminAccess, isModerator, user } = useApp();

  const [selectedType, setSelectedType] = useState("");
  const [selectedGov, setSelectedGov] = useState("");
  const [showGovFilter, setShowGovFilter] = useState(false);

  const { ads, isLoading, refetch, adminDelete, deleteMyAd } = usePoultryMarket({
    poultryType: selectedType || undefined,
    governorate: selectedGov || undefined,
  });

  const canModerate = hasAdminAccess || isModerator;

  const handleDelete = (adId: number, isOwner: boolean) => {
    if (canModerate) {
      adminDelete({ adId });
    } else if (isOwner) {
      deleteMyAd({ adId });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "سوق الدواجن",
          headerStyle: { backgroundColor: "#064E3B" },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "700" },
          headerLeft: () => (
            <TouchableOpacity style={styles.addBtn} onPress={() => router.push("/create-poultry-market-ad")}>
              <Plus size={16} color={COLORS.white} />
              <Text style={styles.addBtnText}>إضافة عرض بيع</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {/* Filters */}
        <View style={styles.filters}>
          {/* Type filter */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={POULTRY_TYPES}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.typeList}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.typeChip, selectedType === item.key && styles.typeChipActive]} onPress={() => setSelectedType(item.key)}>
                <Text style={[styles.typeChipText, selectedType === item.key && styles.typeChipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />

          {/* Governorate dropdown */}
          <TouchableOpacity style={styles.govBtn} onPress={() => setShowGovFilter(!showGovFilter)}>
            <Filter size={14} color={COLORS.primary} />
            <Text style={styles.govBtnText}>{selectedGov || "جميع المحافظات"}</Text>
          </TouchableOpacity>
        </View>

        {/* Governorate picker */}
        {showGovFilter && (
          <View style={styles.govPicker}>
            {IRAQ_GOVERNORATES.map((gov) => (
              <TouchableOpacity
                key={gov}
                style={[styles.govItem, (gov === "الكل" ? "" : gov) === selectedGov && styles.govItemActive]}
                onPress={() => {
                  setSelectedGov(gov === "الكل" ? "" : gov);
                  setShowGovFilter(false);
                }}
              >
                <Text style={styles.govItemText}>{gov}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator style={styles.loader} color={COLORS.primary} size="large" />
        ) : ads.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🐔</Text>
            <Text style={styles.emptyText}>لا توجد إعلانات حالياً</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/create-poultry-market-ad")}>
              <Text style={styles.emptyBtnText}>أضف أول إعلان</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={ads}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isOwner = user?.id != null && Number(user.id) === (item as any).sellerId;
              const canDelete = canModerate || isOwner;
              return (
                <PoultryMarketCard
                  ad={item as any}
                  currentUserId={user?.id ? Number(user.id) : null}
                  onDelete={canDelete ? () => handleDelete(item.id, isOwner) : undefined}
                />
              );
            }}
            contentContainerStyle={styles.list}
            onRefresh={refetch}
            refreshing={isLoading}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: { color: COLORS.white, fontSize: 12, fontWeight: "600" },
  filters: { backgroundColor: COLORS.white, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  typeList: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#E5E7EB" },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeChipText: { fontSize: 13, color: COLORS.darkGray },
  typeChipTextActive: { color: COLORS.white, fontWeight: "600" },
  govBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  govBtnText: { fontSize: 13, color: COLORS.darkGray },
  govPicker: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: "#E5E7EB", flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 12 },
  govItem: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#E5E7EB" },
  govItemActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  govItemText: { fontSize: 12, color: COLORS.black },
  list: { padding: 12 },
  loader: { flex: 1, marginTop: 40 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16, color: COLORS.darkGray, marginBottom: 16 },
  emptyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  emptyBtnText: { color: COLORS.white, fontWeight: "600" },
});
