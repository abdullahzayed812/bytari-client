import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import {
  Store,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  Trash2,
  Search,
  MapPin,
  Phone,
  Mail,
  Star,
  Package,
  TrendingUp,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { FilterTab, FilterTabs } from "@/components/FilterTabs";

interface StoreData {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  ownerName: string;
  ownerEmail: string;
  status: "active" | "pending" | "banned" | "suspended";
  rating: number;
  reviewsCount: number;
  category: string;
  productsCount: number;
  totalSales: number;
  createdAt: string;
  lastActivity?: string;
  reportCount?: number;
  isPremium: boolean;
  businessLicense?: string;
}

const StoreProducts = ({ storeId }: { storeId: string }) => {
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery(trpc.stores.products.list.queryOptions({ storeId: parseInt(storeId, 10) }));

  if (productsLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading products...</Text>
      </View>
    );
  }

  if (productsError) {
    return (
      <View style={styles.centered}>
        <Text>Error: {productsError.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.productsSection}>
      <Text style={styles.sectionTitle}>Products</Text>
      <FlatList
        data={(productsData as any)?.products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.price} SAR</Text>
          </View>
        )}
      />
    </View>
  );
};

export default function AdminStoresManagement() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "pending" | "banned" | "premium">("all");
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"activate" | "ban" | "unban" | "delete" | "suspend" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: storesData,
    isLoading: storesLoading,
    error: storesError,
  } = useQuery(trpc.stores.list.queryOptions({}));
  const stores: StoreData[] = useMemo(() => (storesData as any)?.stores, [storesData]);

  const storeTabs: FilterTab<"all" | "active" | "pending" | "banned" | "premium">[] = [
    {
      id: "all",
      label: "الكل",
      count: stores?.length || 0,
    },
    {
      id: "active",
      label: "نشط",
      icon: CheckCircle,
      iconColor: "#27AE60",
      count: stores?.filter((s) => s.status === "active").length || 0,
    },
    {
      id: "pending",
      label: "معلق",
      icon: XCircle,
      iconColor: "#F39C12",
      count: stores?.filter((s) => s.status === "pending").length || 0,
    },
    {
      id: "banned",
      label: "محظور",
      icon: Ban,
      iconColor: "#E74C3C",
      count: stores?.filter((s) => s.status === "banned").length || 0,
    },
    {
      id: "premium",
      label: "مميز",
      icon: Star,
      iconColor: "#FFD700",
      count: stores?.filter((s) => s.isPremium).length || 0,
    },
  ];

  const getFilteredStores = () => {
    if (!stores) return [];
    let filtered = stores;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (store) =>
          store?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
          store?.ownerName?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
          store?.address?.toLowerCase()?.includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case "active":
        return filtered.filter((store) => store.status === "active");
      case "pending":
        return filtered.filter((store) => store.status === "pending");
      case "banned":
        return filtered.filter((store) => store.status === "banned");
      case "premium":
        return filtered.filter((store) => store.isPremium);
      default:
        return filtered;
    }
  };

  if (storesLoading) {
    return (
      <View style={styles.centered}>
        <Text>Loading stores...</Text>
      </View>
    );
  }

  if (storesError) {
    return (
      <View style={styles.centered}>
        <Text>Error: {storesError.message}</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#27AE60";
      case "pending":
        return "#F39C12";
      case "banned":
        return "#E74C3C";
      case "suspended":
        return "#9B59B6";
      default:
        return "#666";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "نشط";
      case "pending":
        return "معلق";
      case "banned":
        return "محظور";
      case "suspended":
        return "موقوف";
      default:
        return "غير محدد";
    }
  };

  const handleAction = (store: StoreData, action: "activate" | "ban" | "unban" | "delete" | "suspend") => {
    setSelectedStore(store);
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = () => {
    if (!selectedStore || !actionType) return;

    if ((actionType === "ban" || actionType === "delete" || actionType === "suspend") && !actionReason.trim()) {
      Alert.alert("خطأ", "يرجى إدخال سبب الإجراء");
      return;
    }

    let message = "";
    switch (actionType) {
      case "activate":
        message = "تم تفعيل المتجر بنجاح";
        break;
      case "ban":
        message = "تم حظر المتجر بنجاح";
        break;
      case "unban":
        message = "تم إلغاء حظر المتجر بنجاح";
        break;
      case "delete":
        message = "تم حذف المتجر بنجاح";
        break;
      case "suspend":
        message = "تم إيقاف المتجر مؤقتاً";
        break;
    }

    console.log(`${actionType} store:`, selectedStore.id, "Reason:", actionReason);
    Alert.alert("تم", message);
    setShowActionModal(false);
    setShowDetailModal(false);
    setActionReason("");
  };

  const renderDetailModal = () => {
    if (!selectedStore) return null;

    return (
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.detailModalHeader}>
              <Text style={styles.modalTitle}>تفاصيل المتجر</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetailModal(false)}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailModalScroll}>
              <View style={styles.storeInfoSection}>
                <Text style={styles.sectionTitle}>معلومات المتجر</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>الاسم:</Text>
                  <Text style={styles.infoValue}>{selectedStore.name}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>العنوان:</Text>
                  <Text style={styles.infoValue}>{selectedStore.address}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>الهاتف:</Text>
                  <Text style={styles.infoValue}>{selectedStore.phone}</Text>
                </View>

                {selectedStore.email && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>البريد الإلكتروني:</Text>
                    <Text style={styles.infoValue}>{selectedStore.email}</Text>
                  </View>
                )}

                {selectedStore.businessLicense && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>رخصة تجارية:</Text>
                    <Text style={styles.infoValue}>{selectedStore.businessLicense}</Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>الحالة:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedStore.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(selectedStore.status)}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>التقييم:</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{selectedStore.rating.toFixed(1)}</Text>
                    <Text style={styles.reviewsText}>({selectedStore.reviewsCount} تقييم)</Text>
                  </View>
                </View>
              </View>

              <View style={styles.ownerInfoSection}>
                <Text style={styles.sectionTitle}>معلومات المالك</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>الاسم:</Text>
                  <Text style={styles.infoValue}>{selectedStore.ownerName}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>البريد الإلكتروني:</Text>
                  <Text style={styles.infoValue}>{selectedStore.ownerEmail}</Text>
                </View>
              </View>

              <View style={styles.businessInfoSection}>
                <Text style={styles.sectionTitle}>معلومات الأعمال</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>عدد المنتجات:</Text>
                  <Text style={styles.infoValue}>{selectedStore.productsCount}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>إجمالي المبيعات:</Text>
                  <Text style={styles.infoValue}>{selectedStore.totalSales.toLocaleString()} ريال</Text>
                </View>
              </View>

              <View style={styles.categoriesSection}>
                <Text style={styles.sectionTitle}>الفئات</Text>
                <View style={styles.categoriesContainer}>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{selectedStore.category}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.statusInfoSection}>
                <Text style={styles.sectionTitle}>معلومات إضافية</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>تاريخ التسجيل:</Text>
                  <Text style={styles.infoValue}>{new Date(selectedStore.createdAt).toLocaleDateString("ar-SA")}</Text>
                </View>

                {selectedStore.lastActivity && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>آخر نشاط:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(selectedStore.lastActivity).toLocaleDateString("ar-SA")}
                    </Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>عدد البلاغات:</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { color: selectedStore.reportCount && selectedStore.reportCount > 0 ? "#E74C3C" : "#27AE60" },
                    ]}
                  >
                    {selectedStore.reportCount || 0}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>العضوية المميزة:</Text>
                  <Text style={[styles.infoValue, { color: selectedStore.isPremium ? "#FFD700" : "#666" }]}>
                    {selectedStore.isPremium ? "مفعلة" : "غير مفعلة"}
                  </Text>
                </View>
              </View>

              <StoreProducts storeId={selectedStore.id} />
            </ScrollView>

            <View style={styles.actionButtons}>
              {selectedStore.status === "pending" && (
                <TouchableOpacity style={styles.activateButton} onPress={() => handleAction(selectedStore, "activate")}>
                  <CheckCircle size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>تفعيل</Text>
                </TouchableOpacity>
              )}

              {selectedStore.status === "active" && (
                <>
                  <TouchableOpacity style={styles.suspendButton} onPress={() => handleAction(selectedStore, "suspend")}>
                    <XCircle size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>إيقاف مؤقت</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.banButton} onPress={() => handleAction(selectedStore, "ban")}>
                    <Ban size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>حظر</Text>
                  </TouchableOpacity>
                </>
              )}

              {selectedStore.status === "banned" && (
                <TouchableOpacity style={styles.unbanButton} onPress={() => handleAction(selectedStore, "unban")}>
                  <CheckCircle size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>إلغاء الحظر</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.deleteButton} onPress={() => handleAction(selectedStore, "delete")}>
                <Trash2 size={20} color="#fff" />
                <Text style={styles.actionButtonText}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderActionModal = () => (
    <Modal visible={showActionModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.actionModalContent}>
          <Text style={styles.modalTitle}>
            {actionType === "activate" && "تفعيل المتجر"}
            {actionType === "ban" && "حظر المتجر"}
            {actionType === "unban" && "إلغاء حظر المتجر"}
            {actionType === "delete" && "حذف المتجر"}
            {actionType === "suspend" && "إيقاف المتجر مؤقتاً"}
          </Text>

          {(actionType === "ban" || actionType === "delete" || actionType === "suspend") && (
            <TextInput
              style={styles.reasonInput}
              placeholder="اكتب سبب الإجراء..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={actionReason}
              onChangeText={setActionReason}
              textAlign="right"
            />
          )}

          {(actionType === "unban" || actionType === "activate") && (
            <Text style={styles.confirmText}>
              {actionType === "unban" && "هل أنت متأكد من إلغاء حظر هذا المتجر؟"}
              {actionType === "activate" && "هل أنت متأكد من تفعيل هذا المتجر؟"}
            </Text>
          )}

          <View style={styles.actionModalButtons}>
            <TouchableOpacity style={styles.confirmActionButton} onPress={confirmAction}>
              <Text style={styles.confirmActionButtonText}>تأكيد</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelActionButton}
              onPress={() => {
                setShowActionModal(false);
                setActionReason("");
              }}
            >
              <Text style={styles.cancelActionButtonText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderStoreItem = ({ item }: { item: StoreData }) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => {
        setSelectedStore(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.storeHeader}>
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{item.name}</Text>
          <Text style={styles.storeAddress}>{item.address}</Text>
          <Text style={styles.ownerName}>المالك: {item.ownerName}</Text>
        </View>

        <View style={styles.storeMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>

          {item.isPremium && (
            <View style={styles.premiumBadge}>
              <Star size={12} color="#FFD700" />
              <Text style={styles.premiumText}>مميز</Text>
            </View>
          )}

          {item.reportCount && item.reportCount > 0 && (
            <View style={styles.reportBadge}>
              <Text style={styles.reportText}>{item.reportCount} بلاغ</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.storeDetails}>
        <View style={styles.detailItem}>
          <Phone size={14} color="#666" />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>

        <View style={styles.detailItem}>
          <Star size={14} color="#FFD700" />
          <Text style={styles.detailText}>
            {item.rating.toFixed(1)} ({item.reviewsCount} تقييم)
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Package size={14} color="#666" />
          <Text style={styles.detailText}>{item.productsCount} منتج</Text>
        </View>

        <View style={styles.detailItem}>
          <TrendingUp size={14} color="#27AE60" />
          <Text style={styles.detailText}>{item.totalSales.toLocaleString()} ريال</Text>
        </View>
      </View>

      <View style={styles.storeFooter}>
        <View style={styles.categoriesPreview}>
          <Text style={styles.categoriesText}>
            {item.category}
            {/* {item.categories.length > 2 && ` +${item.categories.length - 2} أخرى`} */}
          </Text>
        </View>

        <TouchableOpacity style={styles.viewButton}>
          <Eye size={16} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const filteredStores = getFilteredStores();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "إدارة المتاجر",
          headerStyle: { backgroundColor: "#FF9800" },
          headerTintColor: "#fff",
        }}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث عن متجر أو مالك..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
      </View>

      <FilterTabs tabs={storeTabs} selectedTab={selectedFilter} onTabPress={setSelectedFilter} activeColor="#FF9800" />

      {/* Stores List */}
      <FlatList
        data={filteredStores}
        renderItem={renderStoreItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Store size={48} color="#ccc" />
            <Text style={styles.emptyText}>لا توجد متاجر</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد متاجر في هذه الفئة"}
            </Text>
          </View>
        }
      />

      {renderDetailModal()}
      {renderActionModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
  },
  searchContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontFamily: "System",
  },
  activeFilterTab: {
    backgroundColor: "#FF9800",
  },
  filterTabText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "System",
  },
  activeFilterTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listContainer: {
    paddingBottom: 200,
    padding: 15,
  },
  storeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    // textAlign: "right",
    fontFamily: "System",
  },
  storeAddress: {
    fontSize: 14,
    color: "#666",
    // textAlign: "right",
    marginTop: 2,
    fontFamily: "System",
  },
  ownerName: {
    fontSize: 12,
    color: "#999",
    // textAlign: "right",
    marginTop: 2,
    fontFamily: "System",
  },
  storeMeta: {
    alignItems: "flex-end",
    gap: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "System",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff9c4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  premiumText: {
    color: "#F39C12",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "System",
  },
  reportBadge: {
    backgroundColor: "#F39C12",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  reportText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "System",
  },
  storeDetails: {
    gap: 8,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "System",
  },
  storeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  categoriesPreview: {
    flex: 1,
  },
  categoriesText: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    fontFamily: "System",
  },
  viewButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    marginTop: 10,
    fontFamily: "System",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 5,
    fontFamily: "System",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "95%",
    maxHeight: "90%",
  },
  detailModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "right",
    fontFamily: "System",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
  detailModalScroll: {
    maxHeight: 400,
    padding: 20,
  },
  storeInfoSection: {
    marginBottom: 20,
  },
  ownerInfoSection: {
    marginBottom: 20,
  },
  businessInfoSection: {
    marginBottom: 20,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  statusInfoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "right",
    fontFamily: "System",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontFamily: "System",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
    fontFamily: "System",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
    fontFamily: "System",
  },
  reviewsText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "System",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryTag: {
    backgroundColor: "#fff3e0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  categoryText: {
    fontSize: 12,
    color: "#f57c00",
    fontFamily: "System",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  activateButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#27AE60",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  suspendButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9B59B6",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  banButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F39C12",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  unbanButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#27AE60",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E74C3C",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "System",
  },
  actionModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: "top",
    minHeight: 100,
    fontFamily: "System",
  },
  confirmText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "System",
  },
  actionModalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  confirmActionButton: {
    flex: 1,
    backgroundColor: "#E74C3C",
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmActionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "System",
  },
  cancelActionButton: {
    flex: 1,
    backgroundColor: "#666",
    paddingVertical: 12,
    borderRadius: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productsSection: {
    marginTop: 20,
  },
  productCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "System",
  },
  productPrice: {
    fontSize: 16,
    color: "#27AE60",
    fontFamily: "System",
  },
  cancelActionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "System",
  },
});
