import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { Building2, CheckCircle, XCircle, Eye, Ban, Trash2, Search, Phone, Clock, Star } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { FilterTab, FilterTabs } from "@/components/FilterTabs";

interface Clinic {
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
  services: string[];
  workingHours: string | object;
  createdAt: string;
  lastActivity?: string;
  reportCount?: number;
  isPremium: boolean;
}

const formatWorkingHours = (workingHours: any) => {
  if (typeof workingHours === "string") {
    try {
      const parsed = JSON.parse(workingHours);
      return Object.entries(parsed)
        .map(([day, hours]) => `${day}: ${hours}`)
        .join("\n");
    } catch (e) {
      return workingHours;
    }
  }
  if (typeof workingHours === "object" && workingHours !== null) {
    return Object.entries(workingHours)
      .map(([day, hours]) => `${day}: ${hours}`)
      .join("\n");
  }
  return "غير متوفر";
};

export default function AdminClinicsManagement() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "pending" | "banned" | "premium">("all");
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"activate" | "ban" | "unban" | "delete" | "suspend" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading: clinicsLoading, error } = useQuery(trpc.clinics.getActiveList.queryOptions({}));
  const clinics: Clinic[] = useMemo(() => (data as any)?.clinics || [], [data]);

  // Define getFilteredClinics BEFORE using it in useMemo
  const getFilteredClinics = useCallback(
    (clinicsList: Clinic[], search: string, filter: "all" | "active" | "pending" | "banned" | "premium") => {
      let filtered = clinicsList;

      // Apply search filter
      if (search.trim()) {
        filtered = filtered.filter(
          (clinic) =>
            clinic.name.toLowerCase().includes(search.toLowerCase()) ||
            clinic.ownerName.toLowerCase().includes(search.toLowerCase()) ||
            clinic.address.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Apply status filter
      switch (filter) {
        case "active":
          return filtered.filter((clinic) => clinic.status === "active");
        case "pending":
          return filtered.filter((clinic) => clinic.status === "pending");
        case "banned":
          return filtered.filter((clinic) => clinic.status === "banned");
        case "premium":
          return filtered.filter((clinic) => clinic.isPremium);
        default:
          return filtered;
      }
    },
    []
  );

  const clinicTabs: FilterTab<"all" | "active" | "pending" | "banned" | "premium">[] = useMemo(
    () => [
      {
        id: "all",
        label: "الكل",
        count: clinics?.length || 0,
      },
      {
        id: "active",
        label: "نشط",
        icon: CheckCircle,
        iconColor: "#27AE60",
        count: clinics?.filter((c) => c.status === "active").length || 0,
      },
      {
        id: "pending",
        label: "معلق",
        icon: XCircle,
        iconColor: "#F39C12",
        count: clinics?.filter((c) => c.status === "pending").length || 0,
      },
      {
        id: "banned",
        label: "محظور",
        icon: Ban,
        iconColor: "#E74C3C",
        count: clinics?.filter((c) => c.status === "banned").length || 0,
      },
      {
        id: "premium",
        label: "مميز",
        icon: Star,
        iconColor: "#FFD700",
        count: clinics?.filter((c) => c.isPremium).length || 0,
      },
    ],
    [clinics]
  );

  const filteredClinics = useMemo(
    () => getFilteredClinics(clinics, searchQuery, selectedFilter),
    [clinics, searchQuery, selectedFilter, getFilteredClinics]
  );

  const getStatusColor = useCallback((status: string) => {
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
  }, []);

  const getStatusText = useCallback((status: string) => {
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
  }, []);

  const handleAction = useCallback((clinic: Clinic, action: "activate" | "ban" | "unban" | "delete" | "suspend") => {
    setSelectedClinic(clinic);
    setActionType(action);
    setShowActionModal(true);
  }, []);

  const confirmAction = useCallback(() => {
    if (!selectedClinic || !actionType) return;

    if ((actionType === "ban" || actionType === "delete" || actionType === "suspend") && !actionReason.trim()) {
      Alert.alert("خطأ", "يرجى إدخال سبب الإجراء");
      return;
    }

    let message = "";
    switch (actionType) {
      case "activate":
        message = "تم تفعيل العيادة بنجاح";
        break;
      case "ban":
        message = "تم حظر العيادة بنجاح";
        break;
      case "unban":
        message = "تم إلغاء حظر العيادة بنجاح";
        break;
      case "delete":
        message = "تم حذف العيادة بنجاح";
        break;
      case "suspend":
        message = "تم إيقاف العيادة مؤقتاً";
        break;
    }

    console.log(`${actionType} clinic:`, selectedClinic.id, "Reason:", actionReason);
    Alert.alert("تم", message);
    setShowActionModal(false);
    setShowDetailModal(false);
    setActionReason("");
  }, [selectedClinic, actionType, actionReason]);

  // Early returns AFTER all hooks
  if (clinicsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "إدارة العيادات",
            headerStyle: { backgroundColor: "#2196F3" },
            headerTintColor: "#fff",
          }}
        />
        <View style={styles.errorContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "إدارة العيادات",
            headerStyle: { backgroundColor: "#2196F3" },
            headerTintColor: "#fff",
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading clinics: {error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderDetailModal = () => {
    if (!selectedClinic) return null;

    return (
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.detailModalHeader}>
              <Text style={styles.modalTitle}>تفاصيل العيادة</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetailModal(false)}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailModalScroll}>
              <View style={styles.clinicInfoSection}>
                <Text style={styles.sectionTitle}>معلومات العيادة</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>الاسم:</Text>
                  <Text style={styles.infoValue}>{selectedClinic.name}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>العنوان:</Text>
                  <Text style={styles.infoValue}>{selectedClinic.address}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>الهاتف:</Text>
                  <Text style={styles.infoValue}>{selectedClinic.phone}</Text>
                </View>

                {selectedClinic.email && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>البريد الإلكتروني:</Text>
                    <Text style={styles.infoValue}>{selectedClinic.email}</Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>ساعات العمل:</Text>
                  <Text style={styles.infoValue}>{formatWorkingHours(selectedClinic.workingHours)}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>الحالة:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedClinic.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(selectedClinic.status)}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>التقييم:</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={16} color="#FFD700" />
                    <Text style={styles.ratingText}>{selectedClinic.rating.toFixed(1)}</Text>
                    <Text style={styles.reviewsText}>({selectedClinic.reviewsCount} تقييم)</Text>
                  </View>
                </View>
              </View>

              <View style={styles.ownerInfoSection}>
                <Text style={styles.sectionTitle}>معلومات المالك</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>الاسم:</Text>
                  <Text style={styles.infoValue}>{selectedClinic.ownerName}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>البريد الإلكتروني:</Text>
                  <Text style={styles.infoValue}>{selectedClinic.ownerEmail}</Text>
                </View>
              </View>

              <View style={styles.servicesSection}>
                <Text style={styles.sectionTitle}>الخدمات المتاحة</Text>
                <View style={styles.servicesContainer}>
                  {selectedClinic.services.map((service, index) => (
                    <View key={index} style={styles.serviceTag}>
                      <Text style={styles.serviceText}>{service}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.statusInfoSection}>
                <Text style={styles.sectionTitle}>معلومات إضافية</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>تاريخ التسجيل:</Text>
                  <Text style={styles.infoValue}>{new Date(selectedClinic.createdAt).toLocaleDateString("ar-SA")}</Text>
                </View>

                {selectedClinic.lastActivity && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>آخر نشاط:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(selectedClinic.lastActivity).toLocaleDateString("ar-SA")}
                    </Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>عدد البلاغات:</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { color: selectedClinic.reportCount && selectedClinic.reportCount > 0 ? "#E74C3C" : "#27AE60" },
                    ]}
                  >
                    {selectedClinic.reportCount || 0}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>العضوية المميزة:</Text>
                  <Text style={[styles.infoValue, { color: selectedClinic.isPremium ? "#FFD700" : "#666" }]}>
                    {selectedClinic.isPremium ? "مفعلة" : "غير مفعلة"}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.actionButtons}>
              {selectedClinic.status === "pending" && (
                <TouchableOpacity
                  style={styles.activateButton}
                  onPress={() => handleAction(selectedClinic, "activate")}
                >
                  <CheckCircle size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>تفعيل</Text>
                </TouchableOpacity>
              )}

              {selectedClinic.status === "active" && (
                <>
                  <TouchableOpacity
                    style={styles.suspendButton}
                    onPress={() => handleAction(selectedClinic, "suspend")}
                  >
                    <XCircle size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>إيقاف مؤقت</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.banButton} onPress={() => handleAction(selectedClinic, "ban")}>
                    <Ban size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>حظر</Text>
                  </TouchableOpacity>
                </>
              )}

              {selectedClinic.status === "banned" && (
                <TouchableOpacity style={styles.unbanButton} onPress={() => handleAction(selectedClinic, "unban")}>
                  <CheckCircle size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>إلغاء الحظر</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.deleteButton} onPress={() => handleAction(selectedClinic, "delete")}>
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
            {actionType === "activate" && "تفعيل العيادة"}
            {actionType === "ban" && "حظر العيادة"}
            {actionType === "unban" && "إلغاء حظر العيادة"}
            {actionType === "delete" && "حذف العيادة"}
            {actionType === "suspend" && "إيقاف العيادة مؤقتاً"}
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
              {actionType === "unban" && "هل أنت متأكد من إلغاء حظر هذه العيادة؟"}
              {actionType === "activate" && "هل أنت متأكد من تفعيل هذه العيادة؟"}
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

  const renderClinicItem = ({ item }: { item: Clinic }) => (
    <TouchableOpacity
      style={styles.clinicCard}
      onPress={() => {
        setSelectedClinic(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.clinicHeader}>
        <View style={styles.clinicInfo}>
          <Text style={styles.clinicName}>{item.name}</Text>
          <Text style={styles.clinicAddress}>{item.address}</Text>
          <Text style={styles.ownerName}>المالك: {item.ownerName}</Text>
        </View>

        <View style={styles.clinicMeta}>
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

      <View style={styles.clinicDetails}>
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
          <Clock size={14} color="#666" />
          <Text style={styles.detailText}>{formatWorkingHours(item.workingHours)}</Text>
        </View>
      </View>

      <View style={styles.clinicFooter}>
        <View style={styles.servicesPreview}>
          <Text style={styles.servicesText}>
            {item.services.slice(0, 2).join("، ")}
            {item.services.length > 2 && ` +${item.services.length - 2} أخرى`}
          </Text>
        </View>

        <TouchableOpacity style={styles.viewButton}>
          <Eye size={16} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "إدارة العيادات",
          headerStyle: { backgroundColor: "#2196F3" },
          headerTintColor: "#fff",
        }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث عن عيادة أو مالك..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>
      </View>

      <FilterTabs tabs={clinicTabs} selectedTab={selectedFilter} onTabPress={setSelectedFilter} activeColor="#2196F3" />

      <FlatList
        data={filteredClinics}
        renderItem={renderClinicItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Building2 size={48} color="#ccc" />
            <Text style={styles.emptyText}>لا توجد عيادات</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? "لا توجد نتائج للبحث" : "لا توجد عيادات في هذه الفئة"}
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
    // flex: 1,
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
    // alignSelf: "flex-end",
    backgroundColor: "#fff",
    // paddingVertical: 10,
    // paddingHorizontal: 15,
    // borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  // filterTab: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   paddingHorizontal: 15,
  //   paddingVertical: 8,
  //   marginRight: 10,
  //   borderRadius: 20,
  //   backgroundColor: "#f0f0f0",
  //   gap: 5,
  // },
  // activeFilterTab: {
  //   backgroundColor: "#2196F3",
  // },
  // filterTabText: {
  //   lineHeight: 12,
  //   fontSize: 14,
  //   color: "#666",
  //   fontFamily: "System",
  // },
  // activeFilterTabText: {
  //   color: "#fff",
  //   fontWeight: "bold",
  // },
  listContainer: {
    padding: 15,
  },
  clinicCard: {
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
  clinicHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    // textAlign: "right",
    fontFamily: "System",
  },
  clinicAddress: {
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
  clinicMeta: {
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
  clinicDetails: {
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
  clinicFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  servicesPreview: {
    flex: 1,
  },
  servicesText: {
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
  clinicInfoSection: {
    marginBottom: 20,
  },
  ownerInfoSection: {
    marginBottom: 20,
  },
  servicesSection: {
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
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  serviceTag: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  serviceText: {
    fontSize: 12,
    color: "#1976d2",
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#E74C3C",
    textAlign: "center",
    fontFamily: "System",
  },
});
