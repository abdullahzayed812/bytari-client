import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { Building2, MapPin, Phone, Mail, Users, Bell, BellOff, Search, Edit3, Star } from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UnionBranch {
  id: string;
  name: string;
  governorate: string;
  region: "central" | "northern" | "southern" | "kurdistan";
  address: string;
  phone: string;
  email: string;
  president: string;
  membersCount: number;
  isFollowing: boolean;
  announcements: number;
  rating: number;
}

export default function UnionBranchesScreen() {
  const { t, isRTL } = useI18n();
  const { isSuperAdmin } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: branches, isLoading, error } = useQuery(trpc.union.branch.list.queryOptions());

  const followMutation = useMutation(
    trpc.union.follow.toggle.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.union.branch.list.queryKey as any);
      },
    })
  );

  const regions = [
    { id: "all", name: "جميع المناطق", color: COLORS.primary },
    { id: "central", name: "المنطقة الوسطى", color: "#3B82F6" },
    { id: "northern", name: "المنطقة الشمالية", color: "#10B981" },
    { id: "southern", name: "المنطقة الجنوبية", color: "#F59E0B" },
    { id: "kurdistan", name: "إقليم كردستان", color: "#EF4444" },
  ];

  const handleFollowToggle = (branchId: string) => {
    followMutation.mutate({ branchId: parseInt(branchId) });
  };

  const handleBranchPress = (branch: UnionBranch) => {
    router.push(`/union-branch-details?id=${branch.id}`);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={12} color="#FFD700" fill="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={12} color="#FFD700" fill="#FFD700" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={12} color="#E5E7EB" />);
    }

    return stars;
  };

  const filteredBranches =
    branches?.filter((branch) => {
      const matchesSearch =
        branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch?.governorate.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === "all" || branch.region === selectedRegion;
      return matchesSearch && matchesRegion;
    }) || [];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error fetching data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "فروع النقابة البيطرية في العراق",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "bold" },
          headerRight: () =>
            isSuperAdmin ? (
              <TouchableOpacity
                onPress={() => router.push("/union-branches-management")}
                style={[styles.headerButton, styles.editButton]}
              >
                <Edit3 size={20} color={COLORS.white} />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث عن فرع النقابة أو المحافظة..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.darkGray}
            />
          </View>
        </View>

        {/* Region Filter */}
        <View style={styles.regionsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionsList}>
            {regions.map((region) => (
              <TouchableOpacity
                key={region.id}
                style={[
                  styles.regionItem,
                  { backgroundColor: selectedRegion === region.id ? region.color : COLORS.white },
                  selectedRegion === region.id && styles.selectedRegionItem,
                ]}
                onPress={() => setSelectedRegion(region.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.regionText, { color: selectedRegion === region.id ? COLORS.white : COLORS.black }]}
                >
                  {region.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Branches List */}
        <View style={styles.branchesSection}>
          <Text style={styles.sectionTitle}>النتائج ({filteredBranches.length} فرع)</Text>

          {filteredBranches.map((branch) => (
            <TouchableOpacity
              key={branch.id}
              style={styles.branchCard}
              onPress={() => handleBranchPress(branch)}
              activeOpacity={0.8}
            >
              <View style={styles.branchHeader}>
                <View style={styles.branchIcon}>
                  <Building2 size={24} color={COLORS.primary} />
                </View>
                <View style={styles.branchInfo}>
                  <Text style={styles.branchName}>{branch.name}</Text>
                  <Text style={styles.branchGovernorate}>{branch.governorate}</Text>
                  <View style={styles.ratingContainer}>
                    <View style={styles.starsContainer}>{renderStars(branch.rating)}</View>
                    <Text style={styles.ratingText}>({branch.rating})</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.followButton} onPress={() => handleFollowToggle(branch.id)}>
                  {branch.isFollowing ? (
                    <Bell size={20} color={COLORS.primary} fill={COLORS.primary} />
                  ) : (
                    <BellOff size={20} color={COLORS.darkGray} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.branchDetails}>
                <View style={styles.detailItem}>
                  <MapPin size={16} color={COLORS.darkGray} />
                  <Text style={styles.detailText}>{branch.address}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Phone size={16} color={COLORS.darkGray} />
                  <Text style={styles.detailText}>{branch.phone}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Mail size={16} color={COLORS.darkGray} />
                  <Text style={styles.detailText}>{branch.email}</Text>
                </View>
              </View>

              <View style={styles.branchStats}>
                <View style={styles.statItem}>
                  <Users size={16} color={COLORS.primary} />
                  <Text style={styles.statText}>{branch.membersCount} عضو</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.presidentLabel}>الرئيس:</Text>
                  <Text style={styles.presidentName}>{branch.president}</Text>
                </View>

                {branch.announcements > 0 && (
                  <View style={styles.announcementsBadge}>
                    <Text style={styles.announcementsText}>{branch.announcements} إعلان جديد</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredBranches.length === 0 && (
          <View style={styles.emptyState}>
            <Building2 size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyStateTitle}>لا توجد فروع</Text>
            <Text style={styles.emptyStateText}>لم يتم العثور على فروع تطابق البحث المحدد</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    textAlign: "right",
  },
  regionsSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  regionsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  regionItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedRegionItem: {
    borderColor: "transparent",
  },
  regionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  branchesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "right",
  },
  branchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  branchHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  branchIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  branchInfo: {
    flex: 1,
  },
  branchName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "right",
  },
  branchGovernorate: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "right",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  followButton: {
    padding: 8,
  },
  branchDetails: {
    marginBottom: 12,
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.darkGray,
    flex: 1,
    textAlign: "right",
  },
  branchStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  presidentLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  presidentName: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: "600",
  },
  announcementsBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  announcementsText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: COLORS.success || "#28a745",
  },
  editButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
});
