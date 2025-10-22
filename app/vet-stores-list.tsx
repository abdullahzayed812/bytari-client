import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, TextInput, ActivityIndicator } from "react-native";
import React, { useMemo, useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { Search, MapPin, Star, Phone, Clock, Filter, Plus, Edit3, MessageSquare } from "lucide-react-native";
import { router, Stack } from "expo-router";
import { mockVetStores, VetStore } from "../mocks/data";
import RatingComponent from "../components/RatingComponent";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

export default function VetStoresListScreen() {
  const { isRTL } = useI18n();
  const { userMode, isSuperAdmin } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "nearest" | "topRated">("all");
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<VetStore | null>(null);

  // Real backend data for vet stores (when userMode is veterinarian)
  const { data: rawVetStores, isLoading: vetStoresLoading } = useQuery(
    trpc.stores.list.queryOptions(undefined, {
      enabled: userMode === "veterinarian",
    })
  );

  const vetStores = useMemo(() => (rawVetStores as any)?.stores, [rawVetStores]);
  const vetStoresData = vetStores?.filter((store) => store.isActive) || [];

  const filteredStores = vetStoresData
    .filter((store) => {
      const matchesSearch =
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      switch (selectedFilter) {
        case "active":
          // Filter for stores that are currently open (mock logic)
          const now = new Date().getHours();
          const openHour = parseInt(store?.workingHours?.open?.split(":")[0]);
          const closeHour = parseInt(store?.workingHours?.close?.split(":")[0]);
          return now >= openHour && now <= closeHour;
        case "nearest":
          // Sort by nearest (mock logic - in real app would use user location)
          return true; // For now, show all but will be sorted
        case "topRated":
          // Filter for highly rated stores (4+ stars)
          return store.rating >= 4.0;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      if (selectedFilter === "nearest") {
        // Mock sorting by distance (in real app would calculate actual distance)
        return Math.random() - 0.5;
      }
      if (selectedFilter === "topRated") {
        return b.rating - a.rating;
      }
      return 0;
    });

  const handleStorePress = (store: VetStore) => {
    router.push({ pathname: "/store-details", params: { id: store.id } } as any);
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (selectedStore) {
      console.log("Rating submitted:", { rating, comment, storeId: selectedStore.id });
      // TODO: Implement API call to submit rating
      // await submitStoreRating(selectedStore.id, rating, comment);
    }
  };

  const handleRateStore = (store: VetStore, event: any) => {
    event.stopPropagation(); // Prevent navigation to store details
    setSelectedStore(store);
    setShowRatingModal(true);
  };

  const renderStoreCard = ({ item }: { item: VetStore }) => (
    <TouchableOpacity style={styles.storeCard} onPress={() => handleStorePress(item)}>
      <Image source={{ uri: item.image }} style={styles.storeImage} />

      <View style={styles.storeInfo}>
        <View style={styles.storeHeader}>
          <Text style={styles.storeName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color={COLORS.warning} fill={COLORS.warning} />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>
        </View>

        <Text style={styles.storeDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.storeDetails}>
          <View style={styles.detailItem}>
            <MapPin size={14} color={COLORS.darkGray} />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.address}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Phone size={14} color={COLORS.darkGray} />
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>

          <View style={styles.detailItem}>
            <Clock size={14} color={COLORS.darkGray} />
            <Text style={styles.detailText}>
              {item?.workingHours?.open} - {item?.workingHours?.close}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.storeActions}>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={(event) => {
              event.stopPropagation();
              router.push({
                pathname: "/map-location",
                params: {
                  mode: "directions",
                  name: item.name,
                  address: item.address,
                  latitude: "24.7136", // Mock coordinates - in real app would come from store data
                  longitude: "46.6753",
                },
              });
            }}
          >
            <MapPin size={16} color={COLORS.info} />
            <Text style={styles.mapButtonText}>الخريطة</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.ratingButton} onPress={(event) => handleRateStore(item, event)}>
            <MessageSquare size={16} color={COLORS.primary} />
            <Text style={styles.ratingButtonText}>تقييم المذخر</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "المذاخر البيطرية",
          headerRight: () =>
            isSuperAdmin ? (
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => router.push("/add-store")}
                  style={[styles.headerButton, styles.addButton]}
                >
                  <Plus size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/stores-admin-management")}
                  style={[styles.headerButton, styles.editButton]}
                >
                  <Edit3 size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ) : null,
        }}
      />

      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث في المذاخر..."
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

        {vetStoresLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={filteredStores}
            renderItem={renderStoreCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.storesList}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>لا توجد مذاخر متاحة</Text>
              </View>
            )}
          />
        )}
      </View>

      <RatingComponent
        visible={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setSelectedStore(null);
        }}
        onSubmit={handleRatingSubmit}
        title="تقييم المذخر"
        entityName={selectedStore?.name || ""}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
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

  storesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  storeCard: {
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
  storeImage: {
    width: "100%",
    height: 150,
    backgroundColor: COLORS.lightGray,
  },
  storeInfo: {
    padding: 16,
  },
  storeHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
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
  reviewCount: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginRight: 4,
  },
  storeDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 12,
    textAlign: "right",
    lineHeight: 20,
  },
  storeDetails: {
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
  storeActions: {
    marginTop: 12,
    flexDirection: "row",
    gap: 8,
  },
  mapButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.info,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mapButtonText: {
    color: COLORS.info,
    fontSize: 14,
    fontWeight: "600",
  },
  ratingButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ratingButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
