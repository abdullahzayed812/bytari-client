import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import {
  Heart,
  Trash2,
  Edit3,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  UserCheck,
  Search,
  Filter,
} from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useApp } from "@/providers/AppProvider";

interface Pet {
  id: string;
  name: string;
  type: "dog" | "cat" | "rabbit" | "bird" | "other";
  breed?: string;
  age?: number;
  gender?: "male" | "female";
  ownerName: string;
  ownerEmail: string;
  status: "active" | "banned" | "reported";
  isLost?: boolean;
  isForBreeding?: boolean;
  createdAt: string;
  reportCount?: number;
  lastActivity?: string;
}

export default function AdminPetsManagement() {
  const router = useRouter();
  const { user } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<
    | "all"
    | "active"
    | "banned"
    | "reported"
    | "lost"
    | "breeding"
    | "pending_approval"
  >("all");
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<
    "ban" | "unban" | "delete" | null
  >(null);
  const [actionReason, setActionReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // tRPC Queries
  const {
    data: allPetsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    trpc.pets.getAllForAdmin.queryOptions({
      adminId: user?.id ? Number(user.id) : 0,
    })
  );
  const { data: searchResultsData, isLoading: isSearching } = useQuery(
    trpc.admin.pets.search.queryOptions(
      { query: searchQuery },
      { enabled: !!searchQuery }
    )
  );
  const allPets = useMemo(() => (allPetsData as any)?.pets, [allPetsData]);
  const searchResults = useMemo(
    () => (searchResultsData as any)?.pets,
    [searchResultsData]
  );

  // tRPC Mutations
  const deletePetMutation = useMutation(
    trpc.admin.pets.delete.mutationOptions({
      onSuccess: () => {
        refetch();
        Alert.alert("نجح", "تم حذف الحيوان بنجاح");
      },
      onError: (err) => Alert.alert("خطأ", err.message),
    })
  );

  const updatePetMutation = useMutation(
    trpc.admin.pets.updateProfile.mutationOptions({
      onSuccess: () => {
        refetch();
        Alert.alert("نجح", "تم تحديث حالة الحيوان بنجاح");
      },
      onError: (err) => Alert.alert("خطأ", err.message),
    })
  );

  const getFilteredPets = () => {
    const petsSource = searchQuery.trim() ? searchResults : allPets;
    if (!petsSource) return [];

    switch (selectedFilter) {
      case "active":
        return petsSource.filter((pet) => pet.status === "active");
      case "banned":
        return petsSource.filter((pet) => pet.status === "banned");
      case "reported":
        return petsSource.filter((pet) => pet.status === "reported");
      case "lost":
        return petsSource.filter((pet) => pet.isLost);
      case "breeding":
        return petsSource.filter((pet) => pet.isForBreeding);
      default:
        return petsSource;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#27AE60";
      case "banned":
        return "#E74C3C";
      case "reported":
        return "#F39C12";
      default:
        return "#666";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "نشط";
      case "banned":
        return "محظور";
      case "reported":
        return "مبلغ عنه";
      default:
        return "غير محدد";
    }
  };

  const getPetTypeText = (type: string) => {
    switch (type) {
      case "dog":
        return "كلب";
      case "cat":
        return "قطة";
      case "rabbit":
        return "أرنب";
      case "bird":
        return "طائر";
      case "other":
        return "آخر";
      default:
        return "غير محدد";
    }
  };

  const handleAction = (pet: Pet, action: "ban" | "unban" | "delete") => {
    setSelectedPet(pet);
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = () => {
    if (!selectedPet || !actionType) return;

    if (
      (actionType === "ban" || actionType === "delete") &&
      !actionReason.trim()
    ) {
      Alert.alert("خطأ", "يرجى إدخال سبب الإجراء");
      return;
    }

    switch (actionType) {
      case "ban":
        updatePetMutation.mutate({ petId: selectedPet.id, status: "banned" });
        break;
      case "unban":
        updatePetMutation.mutate({ petId: selectedPet.id, status: "active" });
        break;
      case "delete":
        deletePetMutation.mutate({ petId: selectedPet.id });
        break;
    }

    setShowActionModal(false);
    setShowDetailModal(false);
    setActionReason("");
  };

  const renderDetailModal = () => {
    if (!selectedPet) return null;

    return (
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.detailModalHeader}>
              <Text style={styles.modalTitle}>تفاصيل الحيوان</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetailModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailModalScroll}>
              <View style={styles.petInfoSection}>
                <Text style={styles.sectionTitle}>معلومات الحيوان</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>الاسم:</Text>
                  <Text style={styles.infoValue}>{selectedPet.name}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>النوع:</Text>
                  <Text style={styles.infoValue}>
                    {getPetTypeText(selectedPet.type)}
                  </Text>
                </View>

                {selectedPet.breed && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>السلالة:</Text>
                    <Text style={styles.infoValue}>{selectedPet.breed}</Text>
                  </View>
                )}

                {selectedPet.age && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>العمر:</Text>
                    <Text style={styles.infoValue}>{selectedPet.age} سنة</Text>
                  </View>
                )}

                {selectedPet.gender && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>الجنس:</Text>
                    <Text style={styles.infoValue}>
                      {selectedPet.gender === "male" ? "ذكر" : "أنثى"}
                    </Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>الحالة:</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(selectedPet.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(selectedPet.status)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.ownerInfoSection}>
                <Text style={styles.sectionTitle}>معلومات المالك</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>الاسم:</Text>
                  <Text style={styles.infoValue}>{selectedPet.ownerName}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>البريد الإلكتروني:</Text>
                  <Text style={styles.infoValue}>{selectedPet.ownerEmail}</Text>
                </View>
              </View>

              <View style={styles.statusInfoSection}>
                <Text style={styles.sectionTitle}>معلومات إضافية</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>تاريخ التسجيل:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(selectedPet.createdAt).toLocaleDateString(
                      "ar-SA"
                    )}
                  </Text>
                </View>

                {selectedPet.lastActivity && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>آخر نشاط:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(selectedPet.lastActivity).toLocaleDateString(
                        "ar-SA"
                      )}
                    </Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>عدد البلاغات:</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color:
                          selectedPet.reportCount && selectedPet.reportCount > 0
                            ? "#E74C3C"
                            : "#27AE60",
                      },
                    ]}
                  >
                    {selectedPet.reportCount || 0}
                  </Text>
                </View>

                {selectedPet.isLost && (
                  <View style={styles.specialBadge}>
                    <AlertTriangle size={16} color="#E74C3C" />
                    <Text style={styles.specialBadgeText}>حيوان مفقود</Text>
                  </View>
                )}

                {selectedPet.isForBreeding && (
                  <View style={styles.specialBadge}>
                    <Heart size={16} color="#9B59B6" />
                    <Text style={styles.specialBadgeText}>متاح للتزاوج</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.actionButtons}>
              {selectedPet.status === "active" && (
                <TouchableOpacity
                  style={styles.banButton}
                  onPress={() => handleAction(selectedPet, "ban")}
                >
                  <Ban size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>حظر</Text>
                </TouchableOpacity>
              )}

              {selectedPet.status === "banned" && (
                <TouchableOpacity
                  style={styles.unbanButton}
                  onPress={() => handleAction(selectedPet, "unban")}
                >
                  <CheckCircle size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>إلغاء الحظر</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleAction(selectedPet, "delete")}
              >
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
            {actionType === "ban" && "حظر الحيوان"}
            {actionType === "unban" && "إلغاء حظر الحيوان"}
            {actionType === "delete" && "حذف الحيوان"}
          </Text>

          {(actionType === "ban" || actionType === "delete") && (
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

          {actionType === "unban" && (
            <Text style={styles.confirmText}>
              هل أنت متأكد من إلغاء حظر هذا الحيوان؟
            </Text>
          )}

          <View style={styles.actionModalButtons}>
            <TouchableOpacity
              style={styles.confirmActionButton}
              onPress={confirmAction}
            >
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

  const renderPetItem = ({ item }: { item: Pet }) => (
    <TouchableOpacity
      style={styles.petCard}
      onPress={() => {
        setSelectedPet(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.petHeader}>
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petType}>
            {getPetTypeText(item.type)} - {item.breed}
          </Text>
          <Text style={styles.ownerName}>المالك: {item.ownerName}</Text>
        </View>

        <View style={styles.petMeta}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>

          {item.reportCount && item.reportCount > 0 && (
            <View style={styles.reportBadge}>
              <Text style={styles.reportText}>{item.reportCount} بلاغ</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.petFooter}>
        <View style={styles.specialTags}>
          {item.isLost && (
            <View style={styles.lostTag}>
              <AlertTriangle size={12} color="#E74C3C" />
              <Text style={styles.tagText}>مفقود</Text>
            </View>
          )}

          {item.isForBreeding && (
            <View style={styles.breedingTag}>
              <Heart size={12} color="#9B59B6" />
              <Text style={styles.tagText}>تزاوج</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.viewButton}>
          <Eye size={16} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const filteredPets = getFilteredPets();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text>جاري تحميل بيانات الحيوانات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text>حدث خطأ: {error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "إدارة الحيوانات",
          headerStyle: { backgroundColor: "#E91E63" },
          headerTintColor: "#fff",
        }}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث عن حيوان أو مالك..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabs}
      >
        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === "all" && styles.activeFilterTab,
          ]}
          onPress={() => setSelectedFilter("all")}
        >
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === "all" && styles.activeFilterTabText,
            ]}
          >
            الكل ({allPets?.length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === "active" && styles.activeFilterTab,
          ]}
          onPress={() => setSelectedFilter("active")}
        >
          <CheckCircle
            size={16}
            color={selectedFilter === "active" ? "#fff" : "#27AE60"}
          />
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === "active" && styles.activeFilterTabText,
            ]}
          >
            نشط ({allPets?.filter((p) => p.status === "active").length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === "reported" && styles.activeFilterTab,
          ]}
          onPress={() => setSelectedFilter("reported")}
        >
          <AlertTriangle
            size={16}
            color={selectedFilter === "reported" ? "#fff" : "#F39C12"}
          />
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === "reported" && styles.activeFilterTabText,
            ]}
          >
            مبلغ عنه (
            {allPets?.filter((p) => p.status === "reported").length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === "banned" && styles.activeFilterTab,
          ]}
          onPress={() => setSelectedFilter("banned")}
        >
          <Ban
            size={16}
            color={selectedFilter === "banned" ? "#fff" : "#E74C3C"}
          />
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === "banned" && styles.activeFilterTabText,
            ]}
          >
            محظور ({allPets?.filter((p) => p.status === "banned").length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === "lost" && styles.activeFilterTab,
          ]}
          onPress={() => setSelectedFilter("lost")}
        >
          <AlertTriangle
            size={16}
            color={selectedFilter === "lost" ? "#fff" : "#E74C3C"}
          />
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === "lost" && styles.activeFilterTabText,
            ]}
          >
            مفقود ({allPets?.filter((p) => p.isLost).length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === "breeding" && styles.activeFilterTab,
          ]}
          onPress={() => setSelectedFilter("breeding")}
        >
          <Heart
            size={16}
            color={selectedFilter === "breeding" ? "#fff" : "#9B59B6"}
          />
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === "breeding" && styles.activeFilterTabText,
            ]}
          >
            تزاوج ({allPets?.filter((p) => p.isForBreeding).length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === "pending_approval" && styles.activeFilterTab,
          ]}
          onPress={() => router.push("/admin-pet-approvals")}
        >
          <UserCheck
            size={16}
            color={selectedFilter === "pending_approval" ? "#fff" : "#3498DB"}
          />
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === "pending_approval" &&
                styles.activeFilterTabText,
            ]}
          >
            طلبات الموافقة
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Pets List */}
      <FlatList
        data={filteredPets}
        renderItem={renderPetItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Heart size={48} color="#ccc" />
            <Text style={styles.emptyText}>لا توجد حيوانات</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? "لا توجد نتائج للبحث"
                : "لا توجد حيوانات في هذه الفئة"}
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
    flex: 1,
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
  filterTabs: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    gap: 5,
  },
  activeFilterTab: {
    backgroundColor: "#E91E63",
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
    padding: 15,
  },
  petCard: {
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
  petHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    fontFamily: "System",
  },
  petType: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
    marginTop: 2,
    fontFamily: "System",
  },
  ownerName: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 2,
    fontFamily: "System",
  },
  petMeta: {
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
  petFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  specialTags: {
    flexDirection: "row",
    gap: 5,
  },
  lostTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffebee",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  breedingTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3e5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 10,
    color: "#666",
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
  petInfoSection: {
    marginBottom: 20,
  },
  ownerInfoSection: {
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
  specialBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 10,
    gap: 5,
    alignSelf: "flex-end",
  },
  specialBadgeText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "System",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
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
  cancelActionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "System",
  },
});
