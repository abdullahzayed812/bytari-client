import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, FlatList, TextInput, ActivityIndicator } from "react-native";
import React, { useState, useMemo } from "react";
import { COLORS } from "../constants/colors";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Search, Users, Phone, Plus, Stethoscope, Bell, Syringe } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

const PAGE_SIZE = 20;

const FILTER_CHIPS = [
  { key: "all", label: "الكل" },
  { key: "vaccines", label: "لقاحات" },
  { key: "treatments", label: "علاجات" },
  { key: "reminders", label: "تذكيرات" },
] as const;

const STATUS_COLORS: Record<string, string> = {
  مريض: COLORS.error,
  متعافي: COLORS.success,
  قريب: COLORS.warning,
  متابع: COLORS.primary,
};

export default function ClinicAnimals() {
  const router = useRouter();
  const { clinicId, clinicName } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useQuery({
    ...trpc.pets.getAllPets.queryOptions({
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
  });

  const allPets = data?.pets ?? [];

  const filteredData = useMemo(() => {
    return allPets.filter((pet: any) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        pet.id?.toLowerCase().includes(q) ||
        pet.name?.toLowerCase().includes(q) ||
        pet.ownerName?.toLowerCase().includes(q) ||
        pet.type?.toLowerCase().includes(q) ||
        pet.breed?.toLowerCase().includes(q)
      );
    });
  }, [allPets, searchQuery]);

  const handleAnimalPress = (pet: any) => {
    router.push({
      pathname: "/(tabs)/pet-details",
      params: {
        petId: pet.id,
        clinicId: clinicId as string,
        fromClinic: "true",
      },
    });
  };

  const handleQuickAction = (pet: any, action: "treatment" | "reminder" | "vaccine") => {
    if (action === "treatment") {
      router.push({
        pathname: "/clinic-quick-review",
        params: { clinicId: clinicId as string, petId: pet.id },
      });
    } else if (action === "reminder") {
      router.push({
        pathname: "/(tabs)/pet-details",
        params: { petId: pet.id, clinicId: clinicId as string, fromClinic: "true", openSection: "reminders" },
      });
    } else {
      router.push({
        pathname: "/(tabs)/pet-details",
        params: { petId: pet.id, clinicId: clinicId as string, fromClinic: "true", openSection: "vaccinations" },
      });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const renderPetCard = ({ item: pet }: { item: any }) => (
    <TouchableOpacity style={styles.petCard} activeOpacity={0.85} onPress={() => handleAnimalPress(pet)}>
      <View style={styles.petCardInner}>
        <Image
          source={{ uri: pet.image || "https://via.placeholder.com/70" }}
          style={styles.petImage}
          defaultSource={{ uri: "https://via.placeholder.com/70" }}
        />
        <View style={styles.petInfo}>
          <View style={styles.petNameRow}>
            <Text style={styles.petName}>{pet.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[pet.status ?? ""] ?? COLORS.darkGray }]}>
              <Text style={styles.statusText}>{pet.status ?? "مسجل"}</Text>
            </View>
          </View>
          <Text style={styles.petDetails}>
            {pet.type}{pet.breed ? ` • ${pet.breed}` : ""}{pet.age ? ` • ${pet.age} سنة` : ""}
          </Text>

          <View style={styles.ownerRow}>
            <Users size={12} color={COLORS.darkGray} />
            <Text style={styles.ownerName}>{pet.ownerName ?? "غير معروف"}</Text>
          </View>
          {pet.ownerPhone && (
            <View style={styles.ownerRow}>
              <Phone size={12} color={COLORS.darkGray} />
              <Text style={styles.ownerPhone}>{pet.ownerPhone}</Text>
            </View>
          )}
          {pet.createdAt && (
            <Text style={styles.dateAdded}>تاريخ التسجيل: {formatDate(pet.createdAt)}</Text>
          )}

          {/* Action chips */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionChip, { backgroundColor: "#FCE4EC" }]}
              onPress={(e) => { e.stopPropagation?.(); handleQuickAction(pet, "treatment"); }}
            >
              <Stethoscope size={12} color={COLORS.error} />
              <Text style={[styles.actionChipText, { color: COLORS.error }]}>علاج</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionChip, { backgroundColor: "#FFF3E0" }]}
              onPress={(e) => { e.stopPropagation?.(); handleQuickAction(pet, "reminder"); }}
            >
              <Bell size={12} color={COLORS.warning} />
              <Text style={[styles.actionChipText, { color: COLORS.warning }]}>تذكير</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionChip, { backgroundColor: "#E8F5E9" }]}
              onPress={(e) => { e.stopPropagation?.(); handleQuickAction(pet, "vaccine"); }}
            >
              <Syringe size={12} color={COLORS.success} />
              <Text style={[styles.actionChipText, { color: COLORS.success }]}>لقاح</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>جميع الحيوانات</Text>
            {clinicName ? <Text style={styles.clinicNameText}>{clinicName}</Text> : null}
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push({ pathname: "/clinic-quick-review", params: { clinicId: clinicId as string } })}
          >
            <Plus size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={18} color={COLORS.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="ابحث عن اسم الحيوان، المالك، النوع..."
              placeholderTextColor={COLORS.darkGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {FILTER_CHIPS.map((chip) => (
              <TouchableOpacity
                key={chip.key}
                style={[styles.filterChip, filterStatus === chip.key && styles.filterChipActive]}
                onPress={() => setFilterStatus(chip.key)}
              >
                <Text style={[styles.filterChipText, filterStatus === chip.key && styles.filterChipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>جاري التحميل...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderPetCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.resultsCount}>
                {filteredData.length} حيوان{searchQuery ? " (نتائج البحث)" : ""}
              </Text>
            }
            ListFooterComponent={
              <View style={styles.pagination}>
                {page > 0 && (
                  <TouchableOpacity style={styles.pageBtn} onPress={() => setPage((p) => p - 1)}>
                    <Text style={styles.pageBtnText}>السابق</Text>
                  </TouchableOpacity>
                )}
                {allPets.length === PAGE_SIZE && (
                  <TouchableOpacity style={styles.pageBtn} onPress={() => setPage((p) => p + 1)} disabled={isFetching}>
                    {isFetching ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={styles.pageBtnText}>التالي</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>لا توجد نتائج</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: { padding: 8 },
  headerInfo: { alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.black },
  clinicNameText: { fontSize: 12, color: COLORS.darkGray, marginTop: 2 },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  searchSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.black },
  chipsRow: { gap: 8, paddingRight: 4 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 13, color: COLORS.darkGray, fontWeight: "500" },
  filterChipTextActive: { color: COLORS.white, fontWeight: "bold" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 15, color: COLORS.darkGray },
  listContent: { padding: 16, gap: 12, paddingBottom: 40 },
  resultsCount: { fontSize: 13, color: COLORS.darkGray, marginBottom: 4 },
  petCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  petCardInner: { flexDirection: "row", padding: 14, gap: 12 },
  petImage: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#F0F0F0" },
  petInfo: { flex: 1 },
  petNameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  petName: { fontSize: 16, fontWeight: "bold", color: COLORS.black, flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginLeft: 6 },
  statusText: { color: COLORS.white, fontSize: 10, fontWeight: "bold" },
  petDetails: { fontSize: 13, color: COLORS.darkGray, marginBottom: 4 },
  ownerRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  ownerName: { fontSize: 12, color: COLORS.darkGray },
  ownerPhone: { fontSize: 12, color: COLORS.primary },
  dateAdded: { fontSize: 11, color: COLORS.darkGray, marginTop: 2, marginBottom: 6 },
  actionRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  actionChipText: { fontSize: 12, fontWeight: "600" },
  pagination: { flexDirection: "row", justifyContent: "center", gap: 12, paddingVertical: 16 },
  pageBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 90,
    alignItems: "center",
  },
  pageBtnText: { color: COLORS.white, fontWeight: "bold", fontSize: 14 },
  emptyContainer: { paddingVertical: 60, alignItems: "center" },
  emptyText: { fontSize: 16, color: COLORS.darkGray },
});
