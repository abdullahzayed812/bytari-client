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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Clock, Eye, XCircle } from "lucide-react-native";
import { useApp } from "@/providers/AppProvider";

interface PetApprovalRequest {
  id: number;
  petId: number;
  ownerId: number;
  requestType: "adoption" | "breeding" | "lost_pet";
  title: string;
  description?: string | null;
  images: any; // This will be parsed from JSON
  contactInfo?: string | null;
  location?: string | null;
  price?: number | null;
  specialRequirements?: string | null;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "normal" | "high" | "urgent";
  createdAt: Date;
  // Pet details
  petName: string | null;
  petType: string | null;
  petBreed?: string | null;
  petAge?: number | null;
  petColor?: string | null;
  petGender?: string | null;
  petImage?: string | null;
  // Owner details
  ownerName: string | null;
  ownerEmail: string | null;
  ownerPhone?: string | null;
}

export default function AdminPetApprovals() {
  const { user } = useApp();
  const [selectedRequest, setSelectedRequest] =
    useState<PetApprovalRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Fetch pending approvals
  const {
    data: pendingApprovalsData,
    isLoading,
    refetch,
  } = useQuery(
    trpc.admin.pets.getPendingApprovals.queryOptions({
      adminId: user?.id ? Number(user.id) : 0,
    })
  );
  const { data: approvalStatsData } = useQuery(
    trpc.admin.pets.getApprovalStats.queryOptions()
  );

  const pendingApprovals = useMemo(
    () => (pendingApprovalsData as any)?.requests,
    [pendingApprovalsData]
  );
  const approvalStats = useMemo(
    () => approvalStatsData as any,
    [approvalStatsData]
  );

  // Review approval mutation
  const reviewApprovalMutation = useMutation(
    trpc.admin.pets.reviewApproval.mutationOptions()
  );

  const getRequestTypeText = (type: string) => {
    switch (type) {
      case "adoption":
        return "تبني";
      case "breeding":
        return "تزويج";
      case "lost_pet":
        return "حيوان مفقود";
      default:
        return "غير محدد";
    }
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case "adoption":
        return "#27AE60";
      case "breeding":
        return "#9B59B6";
      case "lost_pet":
        return "#E74C3C";
      default:
        return "#666";
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "#E74C3C";
      case "high":
        return "#F39C12";
      case "normal":
        return "#3498DB";
      case "low":
        return "#95A5A6";
      default:
        return "#666";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "عاجل";
      case "high":
        return "عالي";
      case "normal":
        return "عادي";
      case "low":
        return "منخفض";
      default:
        return "غير محدد";
    }
  };

  const handleAction = (
    request: PetApprovalRequest,
    action: "approve" | "reject"
  ) => {
    setSelectedRequest(request);
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = () => {
    if (!selectedRequest || !actionType) return;

    if (actionType === "reject" && !rejectionReason.trim()) {
      Alert.alert("خطأ", "يرجى إدخال سبب الرفض");
      return;
    }

    reviewApprovalMutation.mutate(
      {
        requestId: selectedRequest.id,
        action: actionType,
        rejectionReason: rejectionReason.trim() || undefined,
        adminNotes: adminNotes.trim() || undefined,
        reviewerId: 1, // Replace with actual admin ID
      },
      {
        onSuccess: () => {
          refetch();
          setShowActionModal(false);
          setShowDetailModal(false);
          setRejectionReason("");
          setAdminNotes("");
          Alert.alert("تم", "تم معالجة الطلب بنجاح");
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message);
        },
      }
    );
  };

  const renderDetailModal = () => {
    if (!selectedRequest) return null;

    return (
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.detailModalHeader}>
              <Text style={styles.modalTitle}>تفاصيل طلب الموافقة</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDetailModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailModalScroll}>
              {/* Request Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>معلومات الطلب</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>نوع الطلب:</Text>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor: getRequestTypeColor(
                          selectedRequest.requestType
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.typeBadgeText}>
                      {getRequestTypeText(selectedRequest.requestType)}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>الأولوية:</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor: getPriorityColor(
                          selectedRequest.priority
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.priorityBadgeText}>
                      {getPriorityText(selectedRequest.priority)}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>تاريخ الطلب:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(selectedRequest.createdAt).toLocaleDateString(
                      "ar-SA"
                    )}
                  </Text>
                </View>

                {selectedRequest.description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.infoLabel}>الوصف:</Text>
                    <Text style={styles.descriptionText}>
                      {selectedRequest.description}
                    </Text>
                  </View>
                )}
              </View>

              {/* Pet Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>معلومات الحيوان</Text>

                {selectedRequest.petImage && (
                  <Image
                    source={{ uri: selectedRequest.petImage }}
                    style={styles.petImage}
                  />
                )}

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>الاسم:</Text>
                  <Text style={styles.infoValue}>
                    {selectedRequest.petName || "غير محدد"}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>النوع:</Text>
                  <Text style={styles.infoValue}>
                    {getPetTypeText(selectedRequest.petType || "")}
                  </Text>
                </View>

                {selectedRequest.petBreed && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>السلالة:</Text>
                    <Text style={styles.infoValue}>
                      {selectedRequest.petBreed}
                    </Text>
                  </View>
                )}

                {selectedRequest.petAge && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>العمر:</Text>
                    <Text style={styles.infoValue}>
                      {selectedRequest.petAge} سنة
                    </Text>
                  </View>
                )}

                {selectedRequest.petGender && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>الجنس:</Text>
                    <Text style={styles.infoValue}>
                      {selectedRequest.petGender === "male" ? "ذكر" : "أنثى"}
                    </Text>
                  </View>
                )}

                {selectedRequest.petColor && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>اللون:</Text>
                    <Text style={styles.infoValue}>
                      {selectedRequest.petColor}
                    </Text>
                  </View>
                )}
              </View>

              {/* Owner Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>معلومات المالك</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>الاسم:</Text>
                  <Text style={styles.infoValue}>
                    {selectedRequest.ownerName || "غير محدد"}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>البريد الإلكتروني:</Text>
                  <Text style={styles.infoValue}>
                    {selectedRequest.ownerEmail || "غير محدد"}
                  </Text>
                </View>

                {selectedRequest.ownerPhone && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>الهاتف:</Text>
                    <Text style={styles.infoValue}>
                      {selectedRequest.ownerPhone}
                    </Text>
                  </View>
                )}
              </View>

              {/* Additional Info */}
              {(selectedRequest.contactInfo ||
                selectedRequest.location ||
                selectedRequest.price ||
                selectedRequest.specialRequirements) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>معلومات إضافية</Text>

                  {selectedRequest.contactInfo && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>معلومات التواصل:</Text>
                      <Text style={styles.infoValue}>
                        {selectedRequest.contactInfo}
                      </Text>
                    </View>
                  )}

                  {selectedRequest.location && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>الموقع:</Text>
                      <Text style={styles.infoValue}>
                        {selectedRequest.location}
                      </Text>
                    </View>
                  )}

                  {selectedRequest.price && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>السعر:</Text>
                      <Text style={styles.infoValue}>
                        {selectedRequest.price} ريال
                      </Text>
                    </View>
                  )}

                  {selectedRequest.specialRequirements && (
                    <View style={styles.descriptionContainer}>
                      <Text style={styles.infoLabel}>متطلبات خاصة:</Text>
                      <Text style={styles.descriptionText}>
                        {selectedRequest.specialRequirements}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Images */}
              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>الصور المرفقة</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imagesContainer}
                  >
                    {selectedRequest.images.map(
                      (image: string, index: number) => (
                        <Image
                          key={`image-${selectedRequest.id}-${index}`}
                          source={{ uri: image }}
                          style={styles.attachedImage}
                        />
                      )
                    )}
                  </ScrollView>
                </View>
              )}
            </ScrollView>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleAction(selectedRequest, "approve")}
              >
                <CheckCircle size={20} color="#fff" />
                <Text style={styles.actionButtonText}>موافقة</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleAction(selectedRequest, "reject")}
              >
                <XCircle size={20} color="#fff" />
                <Text style={styles.actionButtonText}>رفض</Text>
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
            {actionType === "approve" ? "موافقة على الطلب" : "رفض الطلب"}
          </Text>

          {actionType === "reject" && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>سبب الرفض *</Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="اكتب سبب رفض الطلب..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                textAlign="right"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>ملاحظات إدارية (اختياري)</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="ملاحظات للمراجعة الداخلية..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              value={adminNotes}
              onChangeText={setAdminNotes}
              textAlign="right"
            />
          </View>

          <View style={styles.actionModalButtons}>
            <TouchableOpacity
              style={[
                styles.confirmActionButton,
                {
                  backgroundColor:
                    actionType === "approve" ? "#27AE60" : "#E74C3C",
                },
              ]}
              onPress={confirmAction}
              disabled={reviewApprovalMutation.isPending}
            >
              <Text style={styles.confirmActionButtonText}>
                {reviewApprovalMutation.isPending
                  ? "جاري المعالجة..."
                  : "تأكيد"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelActionButton}
              onPress={() => {
                setShowActionModal(false);
                setRejectionReason("");
                setAdminNotes("");
              }}
            >
              <Text style={styles.cancelActionButtonText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderRequestItem = ({ item }: { item: PetApprovalRequest }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => {
        setSelectedRequest(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <Text style={styles.requestTitle}>{item?.title}</Text>
          <Text style={styles.petInfo}>
            {getPetTypeText(item?.petType || "")} -{" "}
            {item?.petName || "غير محدد"}
          </Text>
          <Text style={styles.ownerInfo}>
            المالك: {item?.ownerName || "غير محدد"}
          </Text>
        </View>

        <View style={styles.requestMeta}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: getRequestTypeColor(item?.requestType) },
            ]}
          >
            <Text style={styles.typeBadgeText}>
              {getRequestTypeText(item?.requestType)}
            </Text>
          </View>

          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(item?.priority) },
            ]}
          >
            <Text style={styles.priorityBadgeText}>
              {getPriorityText(item?.priority)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.requestFooter}>
        <View style={styles.requestDate}>
          <Clock size={12} color="#666" />
          <Text style={styles.dateText}>
            {new Date(item?.createdAt).toLocaleDateString("ar-SA")}
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickApproveButton}
            onPress={(e) => {
              e.stopPropagation();
              handleAction(item, "approve");
            }}
          >
            <CheckCircle size={16} color="#27AE60" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickRejectButton}
            onPress={(e) => {
              e.stopPropagation();
              handleAction(item, "reject");
            }}
          >
            <XCircle size={16} color="#E74C3C" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.viewButton}>
            <Eye size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "طلبات موافقة الحيوانات",
            headerStyle: { backgroundColor: "#E91E63" },
            headerTintColor: "#fff",
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "طلبات موافقة الحيوانات",
          headerStyle: { backgroundColor: "#E91E63" },
          headerTintColor: "#fff",
        }}
      />

      {/* Stats Cards */}
      {approvalStats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {approvalStats?.stats?.pending}
            </Text>
            <Text style={styles.statLabel}>في الانتظار</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#27AE60" }]}>
              {approvalStats.stats.approved}
            </Text>
            <Text style={styles.statLabel}>تمت الموافقة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#E74C3C" }]}>
              {approvalStats.stats.rejected}
            </Text>
            <Text style={styles.statLabel}>مرفوضة</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#3498DB" }]}>
              {approvalStats.stats.total}
            </Text>
            <Text style={styles.statLabel}>المجموع</Text>
          </View>
        </View>
      )}

      {/* Requests List */}
      <FlatList
        data={
          (pendingApprovals || [])?.map((request) => ({
            ...request,
            requestType: request.requestType as
              | "adoption"
              | "breeding"
              | "lost_pet",
            images: Array.isArray(request.images) ? request.images : [],
          })) as PetApprovalRequest[]
        }
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CheckCircle size={48} color="#ccc" />
            <Text style={styles.emptyText}>لا توجد طلبات موافقة</Text>
            <Text style={styles.emptySubtext}>جميع الطلبات تمت معالجتها</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "System",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F39C12",
    fontFamily: "System",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
    fontFamily: "System",
  },
  listContainer: {
    padding: 15,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    // textAlign: "right",
    fontFamily: "System",
  },
  petInfo: {
    fontSize: 14,
    color: "#666",
    // textAlign: "right",
    marginTop: 2,
    fontFamily: "System",
  },
  ownerInfo: {
    fontSize: 12,
    color: "#999",
    // textAlign: "right",
    marginTop: 2,
    fontFamily: "System",
  },
  requestMeta: {
    alignItems: "flex-end",
    gap: 5,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "System",
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "System",
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  requestDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "System",
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
  },
  quickApproveButton: {
    padding: 5,
  },
  quickRejectButton: {
    padding: 5,
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
  section: {
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
  descriptionContainer: {
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    marginTop: 5,
    lineHeight: 20,
    fontFamily: "System",
  },
  petImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  imagesContainer: {
    marginTop: 10,
  },
  attachedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  actionButtons: {
    flexDirection: "row",
    padding: 20,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  approveButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#27AE60",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  rejectButton: {
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
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    textAlign: "right",
    fontFamily: "System",
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    textAlignVertical: "top",
    minHeight: 100,
    fontFamily: "System",
  },
  actionModalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  confirmActionButton: {
    flex: 1,
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
