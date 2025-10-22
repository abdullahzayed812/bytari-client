import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator } from "react-native";
import React, { useMemo, useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter, Stack } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Phone,
  Star,
  Plus,
  Search,
  Edit3,
  Filter,
  MessageSquare,
} from "lucide-react-native";
import { Clinic } from "../types";
import RatingComponent from "../components/RatingComponent";
import { trpc } from "../lib/trpc";
import { useQuery } from "@tanstack/react-query";

export default function ClinicsListScreen() {
  const { isRTL } = useI18n();
  const { userMode, user, hasRegisteredClinic, isSuperAdmin } = useApp();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "nearest" | "topRated">("all");
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  const { data, isLoading, error } = useQuery(trpc.clinics.getActiveList.queryOptions({}));

  const clinics = useMemo(() => (data as any)?.clinics, [data]);

  // Check if the current user is a veterinarian who switched to pet owner mode
  // and hasn't registered their clinic yet
  const isVetInPetOwnerMode = userMode === "pet_owner" && user?.accountType === "veterinarian";

  // Show the "Add Your Clinic" button only for veterinarians in pet owner mode who haven't registered
  const shouldShowAddClinicButton = isVetInPetOwnerMode && !hasRegisteredClinic;

  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (selectedClinic) {
      console.log("Rating submitted:", { rating, comment, clinicId: selectedClinic.id });
      // TODO: Implement API call to submit rating
      // await submitClinicRating(selectedClinic.id, rating, comment);
    }
  };

  const handleRateClinic = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setShowRatingModal(true);
  };

  // Filter clinics based on user location, search query, and selected filter
  const clinicsToShow = useMemo(() => {
    if (!clinics) return [];
    let filteredClinics = [...clinics];

    // Filter by user's location (country and city)
    if (user?.country && user?.city) {
      filteredClinics = filteredClinics.filter(
        (clinic) => clinic.country === user.country && clinic.city === user.city
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredClinics = filteredClinics.filter(
        (clinic) =>
          clinic.name.toLowerCase().includes(query) ||
          clinic.address.toLowerCase().includes(query) ||
          clinic.services?.some((service) => service.toLowerCase().includes(query)) ||
          clinic.specialty?.toLowerCase().includes(query)
      );
    }

    // Apply filter buttons
    switch (selectedFilter) {
      case "active":
        // Filter for clinics that are currently open (mock logic)
        const now = new Date().getHours();
        filteredClinics = filteredClinics.filter((clinic) => {
          // Assume clinics are open from 8 AM to 8 PM
          return now >= 8 && now <= 20;
        });
        break;
      case "nearest":
        // Sort by nearest (mock logic - in real app would use user location)
        filteredClinics = filteredClinics.sort(() => Math.random() - 0.5);
        break;
      case "topRated":
        // Filter for highly rated clinics (4+ stars)
        filteredClinics = filteredClinics.filter((clinic) => clinic.rating >= 4.0).sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    // Add the user's registered clinic to the list if they have one
    if (hasRegisteredClinic && user?.accountType === "veterinarian") {
      // Create a mock clinic for the registered user
      const userClinic: Clinic = {
        id: "user-clinic",
        name: "عيادتي البيطرية", // This would come from the registration data in a real app
        address: "الموقع المسجل",
        phone: "+966501234567",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400",
        isPremium: false, // Initially false, can be upgraded
        isUserClinic: true, // Flag to identify user's own clinic
        country: user?.country,
        city: user?.city,
      };

      // Add user's clinic at the beginning of the list
      return [userClinic, ...filteredClinics];
    }

    return filteredClinics;
  }, [clinics, hasRegisteredClinic, user, searchQuery, selectedFilter]);

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
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "العيادات المتواجدة",
          headerStyle: { backgroundColor: COLORS.white },
          headerTitleStyle: { color: COLORS.black },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              {isRTL ? <ArrowRight size={24} color={COLORS.black} /> : <ArrowLeft size={24} color={COLORS.black} />}
            </TouchableOpacity>
          ),
          headerRight: () =>
            isSuperAdmin ? (
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => router.push("/add-clinic")}
                  style={[styles.headerButton, styles.addButton]}
                >
                  <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/registered-clinics-management")}
                  style={[styles.headerButton, styles.editButton]}
                >
                  <Edit3 size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : null,
        }}
      />

      <View style={styles.container}>
        {/* Search Container */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث في العيادات..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign={isRTL ? "right" : "left"}
            />
          </View>

          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === "all" && styles.filterChipActive]}
            onPress={() => setSelectedFilter("all")}
          >
            <Text style={[styles.filterChipText, selectedFilter === "all" && styles.filterChipTextActive]}>الكل</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === "active" && styles.filterChipActive]}
            onPress={() => setSelectedFilter("active")}
          >
            <Text style={[styles.filterChipText, selectedFilter === "active" && styles.filterChipTextActive]}>
              نشط الآن
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === "nearest" && styles.filterChipActive]}
            onPress={() => setSelectedFilter("nearest")}
          >
            <Text style={[styles.filterChipText, selectedFilter === "nearest" && styles.filterChipTextActive]}>
              الأقرب
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === "topRated" && styles.filterChipActive]}
            onPress={() => setSelectedFilter("topRated")}
          >
            <Text style={[styles.filterChipText, selectedFilter === "topRated" && styles.filterChipTextActive]}>
              الأعلى تقييماً
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location Info */}
        {user?.country && user?.city && (
          <View style={[styles.locationInfo, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
            <MapPin size={16} color="#10B981" />
            <Text style={[styles.locationText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
              العيادات في {user.city}, {user.country}
            </Text>
          </View>
        )}

        {/* Add Clinic Button - Only show for veterinarians in pet owner mode who haven't registered */}
        {shouldShowAddClinicButton && (
          <TouchableOpacity style={styles.addClinicButton} onPress={() => router.push("/clinic-system")}>
            <View style={[styles.addClinicButtonContent, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Plus size={24} color={COLORS.white} />
              <Text style={[styles.addClinicButtonText, { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}>
                اضف عيادتك
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <FlatList
          data={clinicsToShow}
          renderItem={({ item: clinic }) => (
            <TouchableOpacity
              style={styles.clinicCard}
              onPress={() => router.push({ pathname: "/clinic-profile", params: { id: clinic.id } })}
            >
              <Image source={{ uri: clinic.images[0] }} style={styles.clinicImage} />

              <View style={styles.clinicInfo}>
                <View style={styles.clinicHeader}>
                  <Text style={styles.clinicName}>{clinic.name}</Text>
                  {clinic.isPremium && (
                    <View style={styles.premiumBadge}>
                      <Star size={12} color={COLORS.white} fill={COLORS.white} />
                      <Text style={styles.premiumBadgeText}>مميز</Text>
                    </View>
                  )}
                </View>

                <View style={styles.clinicDetails}>
                  <View style={styles.detailItem}>
                    <MapPin size={14} color={COLORS.darkGray} />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {clinic.address}
                    </Text>
                  </View>

                  <View style={styles.detailItem}>
                    <Phone size={14} color={COLORS.darkGray} />
                    <Text style={styles.detailText}>{clinic.phone}</Text>
                  </View>

                  <View style={styles.ratingContainer}>
                    <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
                    <Text style={styles.rating}>{clinic.rating}</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.clinicActions}>
                <TouchableOpacity
                  style={[styles.clinicActionButton, styles.primaryClinicActionButton]}
                  onPress={() => {
                    console.log(`Call clinic ${clinic.id}: ${clinic.phone}`);
                    // TODO: Implement phone call functionality
                  }}
                >
                  <Text style={[styles.clinicActionButtonText, styles.primaryClinicActionButtonText]}>اتصال</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.clinicActionButton}
                  onPress={() => {
                    router.push({
                      pathname: "/map-location",
                      params: {
                        mode: "directions",
                        name: clinic.name,
                        address: clinic.address,
                        latitude: "24.7136", // Mock coordinates - in real app would come from clinic data
                        longitude: "46.6753",
                      },
                    });
                  }}
                >
                  <MapPin size={16} color="#10B981" />
                  <Text style={styles.clinicActionButtonText}>الخريطة</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.clinicActionButton, styles.ratingActionButton]}
                  onPress={() => handleRateClinic(clinic)}
                >
                  <MessageSquare size={16} color={COLORS.primary} />
                  <Text style={[styles.clinicActionButtonText, styles.ratingActionButtonText]}>تقييم</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.clinicsList}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchQuery.trim() ? "لا توجد عيادات تطابق البحث" : "لا توجد عيادات متاحة"}
              </Text>
            </View>
          )}
        />
      </View>

      <RatingComponent
        visible={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setSelectedClinic(null);
        }}
        onSubmit={handleRatingSubmit}
        title="تقييم العيادة"
        entityName={selectedClinic?.name || ""}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.gray,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    marginRight: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.lightBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonsContainer: {
    flexDirection: "row-reverse",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
    textAlign: "center",
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
  locationInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    marginBottom: 1,
  },
  locationText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
    marginRight: 6,
  },
  clinicsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  clinicCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  clinicImage: {
    width: "100%",
    height: 150,
    backgroundColor: COLORS.lightGray,
  },
  clinicInfo: {
    padding: 16,
  },
  clinicHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    flex: 1,
    textAlign: "right",
  },
  premiumBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  premiumBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  clinicDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  detailText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginRight: 8,
    flex: 1,
    textAlign: "right",
  },
  ratingContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 4,
    fontWeight: "600",
  },
  clinicActions: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  clinicActionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  clinicActionButtonText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },
  primaryClinicActionButton: {
    backgroundColor: "#10B981",
  },
  primaryClinicActionButtonText: {
    color: COLORS.white,
  },
  ratingActionButton: {
    borderColor: COLORS.primary,
  },
  ratingActionButtonText: {
    color: COLORS.primary,
  },
  addClinicButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addClinicButtonContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  addClinicButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
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
    backgroundColor: COLORS.primary,
  },
});
