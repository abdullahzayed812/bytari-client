import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Heart,
  Plus,
  Edit3,
} from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { trpc } from "../lib/trpc";
import { useQuery } from "@tanstack/react-query";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = (screenWidth - 48) / 2; // 2 columns with padding

type TabType = "adoption" | "breeding";

export default function AdoptionBreedingListScreen() {
  const { t } = useI18n();
  const { userMode, user, isSuperAdmin } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("adoption");

  // Fetch approved pets from database
  const {
    data: petsData,
    isLoading,
    error,
  } = useQuery(
    trpc.pets.getApproved.queryOptions({
      requestType: activeTab,
      limit: 50,
      offset: 0,
    })
  );

  // Filter pets based on user's location (country and city)
  const filteredPets = useMemo(() => {
    if (!petsData?.pets) return [];

    if (!user?.country || !user?.city) {
      return petsData.pets; // Show all if user location is not available
    }

    // Filter pets based on user's location
    return petsData.pets.filter((pet) => {
      const petLocation = pet.location || "";
      return (
        petLocation.includes(user.city || "") ||
        petLocation.includes(user.country || "")
      );
    });
  }, [petsData?.pets, user?.country, user?.city]);

  const handlePetPress = (petId: string) => {
    router.push({
      pathname: "/adoption-pet-details",
      params: { id: petId, type: activeTab },
    });
  };

  const renderPetCard = ({ item: pet }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.petCard}
        onPress={() => handlePetPress(pet.id)}
      >
        {/* Pet Image */}
        <Image
          source={{
            uri:
              pet.petImage ||
              pet.images?.[0] ||
              "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          }}
          style={styles.petImage}
        />

        {/* Status Badge */}
        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.badge,
              activeTab === "adoption"
                ? styles.adoptionBadge
                : styles.breedingBadge,
            ]}
          >
            <Text style={styles.badgeText}>
              {activeTab === "adoption" ? "للتبني" : "للتزاوج"}
            </Text>
          </View>
        </View>

        {/* Pet Info */}
        <View style={styles.petDetails}>
          <Text style={styles.petName} numberOfLines={1}>
            {pet.petName || pet.title}
          </Text>
          <Text style={styles.petType} numberOfLines={1}>
            {pet.petType ? `${pet.petType}` : pet.petType}
          </Text>

          {/* Age */}
          {pet.petAge && (
            <View style={styles.petInfoRow}>
              <Calendar size={12} color="#10B981" />
              <Text style={styles.petInfoRowText} numberOfLines={1}>
                عمر {pet.petAge} سنة
              </Text>
            </View>
          )}

          {/* Location */}
          <View style={styles.petInfoRow}>
            <MapPin size={12} color="#10B981" />
            <Text style={styles.petInfoRowText} numberOfLines={1}>
              {pet.location}
            </Text>
          </View>

          {/* Price for breeding */}
          {activeTab === "breeding" && pet.price && (
            <View style={styles.petInfoRow}>
              <Text style={styles.priceText}>{pet.price} ريال</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.petActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePetPress(pet.id)}
          >
            <Text style={styles.actionButtonText}>التفاصيل</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => {
              console.log(`Add to favorites: ${pet.id}`);
              // TODO: Implement add to favorites functionality
            }}
          >
            <Heart size={14} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={() => {
              console.log(`Contact owner for ${activeTab} pet ${pet.id}`);
              console.log("Contact info:", pet.contactInfo);
              // TODO: Implement contact owner functionality
            }}
          >
            <Text
              style={[styles.actionButtonText, styles.primaryActionButtonText]}
            >
              اتصال
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "حيوانات للتبني أو للتزاوج",
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTintColor: COLORS.black,
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
          headerRight: () =>
            isSuperAdmin ? (
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => router.push("/add-adoption-pet")}
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

      {/* Add Pet Button */}
      {userMode === "pet_owner" && (
        <View style={styles.addPetButtonContainer}>
          <TouchableOpacity
            onPress={() => router.push("/add-adoption-pet")}
            style={styles.addPetButton}
          >
            <Plus size={20} color={COLORS.white} />
            <Text style={styles.addPetButtonText}>
              عرض حيوان للتبني أو التزاوج
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "adoption" && styles.activeTab]}
          onPress={() => setActiveTab("adoption")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "adoption" && styles.activeTabText,
            ]}
          >
            للتبني
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "breeding" && styles.activeTab]}
          onPress={() => setActiveTab("breeding")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "breeding" && styles.activeTabText,
            ]}
          >
            للتزاوج
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري تحميل الحيوانات...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>حدث خطأ في تحميل البيانات</Text>
          <Text style={styles.errorSubText}>{error.message}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPets}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          columnWrapperStyle={
            filteredPets.length % 2 !== 0 ? styles.row : styles.row
          }
          renderItem={renderPetCard}
          keyExtractor={(item) => `${activeTab}-${item.id}`}
          ListEmptyComponent={() => (
            <View style={styles.emptyPetsContainer}>
              <Text style={styles.emptyPetsText}>
                لا توجد حيوانات{" "}
                {activeTab === "adoption" ? "للتبني" : "للتزاوج"} في منطقتك
                حالياً
              </Text>
              <Text style={styles.emptyPetsSubText}>
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
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#10B981",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  activeTabText: {
    color: COLORS.white,
  },
  content: {
    padding: 16,
    paddingTop: 16,
  },
  row: {
    justifyContent: "space-between",
  },
  petCard: {
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
  petImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  petDetails: {
    marginBottom: 12,
  },
  badgeContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  adoptionBadge: {
    backgroundColor: "#10B981",
  },
  breedingBadge: {
    backgroundColor: "#8B5CF6",
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  petName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 2,
    textAlign: "center",
  },
  petType: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 6,
    textAlign: "center",
  },
  petInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
    justifyContent: "center",
  },
  petInfoRowText: {
    fontSize: 10,
    color: COLORS.darkGray,
    marginLeft: 4,
    flex: 1,
  },
  petActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 10,
    color: "#10B981",
    fontWeight: "600",
  },
  favoriteButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionButton: {
    backgroundColor: "#10B981",
  },
  primaryActionButtonText: {
    color: COLORS.white,
  },
  addPetButtonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  addPetButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addPetButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyPetsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyPetsText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyPetsSubText: {
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
  priceText: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },
});
