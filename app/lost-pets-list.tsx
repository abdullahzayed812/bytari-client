import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Dimensions, ActivityIndicator } from "react-native";
import React, { useMemo } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { ArrowLeft, ArrowRight, Calendar, MapPin, Plus, Edit3 } from "lucide-react-native";
import { Stack, useRouter } from "expo-router";
import { trpc } from "../lib/trpc";
import { useQuery } from "@tanstack/react-query";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = (screenWidth - 48) / 2; // 2 columns with padding

export default function LostPetsListScreen() {
  const { t, isRTL } = useI18n();
  const { user, isSuperAdmin } = useApp();
  const router = useRouter();

  // Fetch approved lost pets from database
  const {
    data: lostPetsData,
    isLoading,
    error,
  } = useQuery(
    trpc.pets.getApproved.queryOptions({
      requestType: "lost_pet",
      limit: 50,
      offset: 0,
    })
  );

  // Filter lost pets based on user's location (country and city)
  const filteredLostPets = useMemo(() => {
    if (!lostPetsData?.pets) return [];

    if (!user?.country || !user?.city) {
      return lostPetsData.pets; // Show all if user location is not available
    }

    // Filter lost pets based on user's location
    return lostPetsData.pets.filter((pet) => {
      const petLocation = pet.location || "";
      return petLocation.includes(user.city || "") || petLocation.includes(user.country || "");
    });
  }, [lostPetsData?.pets, user?.country, user?.city]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "الحيوانات المفقودة",
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
                  onPress={() => router.push("/report-lost-pet")}
                  style={[styles.headerButton, styles.addButton]}
                >
                  <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/admin-pets-management")}
                  style={[styles.headerButton, styles.editButton]}
                >
                  <Edit3 size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : null,
        }}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري تحميل الحيوانات المفقودة...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>حدث خطأ في تحميل البيانات</Text>
          <Text style={styles.errorSubText}>{error.message}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLostPets}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          columnWrapperStyle={filteredLostPets.length % 2 !== 0 ? styles.row : styles.row}
          renderItem={({ item: pet }) => (
            <TouchableOpacity
              style={styles.lostPetCard}
              onPress={() => router.push({ pathname: "/lost-pet", params: { id: pet.id } })}
            >
              {/* Pet Image */}
              <Image
                source={{
                  uri:
                    pet.petImage ||
                    pet.images?.[0] ||
                    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                }}
                style={styles.lostPetImage}
              />

              {/* Status Badge */}
              <View style={styles.statusBadgeContainer}>
                <View style={[styles.statusBadge, styles.lostBadge]}>
                  <Text style={styles.statusBadgeText}>مفقود</Text>
                </View>
              </View>

              {/* Pet Info */}
              <View style={styles.lostPetDetails}>
                <Text style={styles.lostPetName} numberOfLines={1}>
                  {pet.petName || pet.title}
                </Text>
                <Text style={styles.lostPetType} numberOfLines={1}>
                  {pet.petType ? t(`pets.types.${pet.petType}`) : pet.petType}
                </Text>

                {/* Location */}
                <View style={styles.lostPetInfoRow}>
                  <MapPin size={12} color="#10B981" />
                  <Text style={styles.lostPetInfoRowText} numberOfLines={1}>
                    {pet.location}
                  </Text>
                </View>

                {/* Date */}
                <View style={styles.lostPetInfoRow}>
                  <Calendar size={12} color="#10B981" />
                  <Text style={styles.lostPetInfoRowText} numberOfLines={1}>
                    {new Date(pet.createdAt).toLocaleDateString("ar-SA")}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.lostPetActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    router.push({
                      pathname: "/map-location",
                      params: {
                        mode: "directions",
                        name: `موقع فقدان ${pet.petName || pet.title}`,
                        address: pet.location,
                        latitude: "24.7136", // Mock coordinates - in real app would come from pet data
                        longitude: "46.6753",
                      },
                    });
                  }}
                >
                  <Text style={styles.actionButtonText}>الموقع</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    console.log(`Report found pet ${pet.id}`);
                    console.log("Contact info:", pet.contactInfo);
                    // TODO: Implement report found functionality
                  }}
                >
                  <Text style={styles.actionButtonText}>ابلاغ</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد حيوانات مفقودة في منطقتك حالياً</Text>
              <Text style={styles.emptySubText}>
                {user?.city && user?.country
                  ? `البحث في: ${user.city}, ${user.country}`
                  : "يرجى تحديث معلومات الموقع في الملف الشخصي"}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  backButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  row: {
    justifyContent: "space-between",
  },
  lostPetCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: cardWidth,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lostPetImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  lostPetDetails: {
    marginBottom: 12,
  },
  statusBadgeContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  lostBadge: {
    backgroundColor: "#EF4444",
  },
  foundBadge: {
    backgroundColor: "#10B981",
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  lostPetName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 2,
    textAlign: "center",
  },
  lostPetType: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 6,
    textAlign: "center",
  },
  lostPetInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    justifyContent: "center",
  },
  lostPetInfoRowText: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginLeft: 4,
    flex: 1,
  },
  lostPetActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 10,
    color: "#10B981",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    opacity: 0.7,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 16,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error || "#EF4444",
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    opacity: 0.7,
  },
});
