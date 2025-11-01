import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  Users,
  UserCheck,
  UserX,
  Shield,
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  Edit3,
  Eye,
} from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { trpc } from "../lib/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";

interface SupervisionRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  education: string;
  experience: string;
  qualifications: string;
  previousExperience: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

interface FieldAssignment {
  id: string;
  farmId: string;
  farmName: string;
  ownerId: string;
  ownerName: string;
  assignedVetId?: string;
  assignedVetName?: string;
  assignedVetPhone?: string;
  assignedSupervisorId?: string;
  assignedSupervisorName?: string;
  assignedSupervisorPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminFieldAssignmentsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"requests" | "assignments">(
    "requests"
  );
  const [selectedRequest, setSelectedRequest] =
    useState<SupervisionRequest | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [newAssignmentModalVisible, setNewAssignmentModalVisible] =
    useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<FieldAssignment | null>(null);

  // Queries
  const supervisionRequestsQuery = useQuery(
    trpc.admin.fieldAssignments.getSupervisionRequests.queryOptions()
  );
  const fieldAssignmentsQuery = useQuery(
    trpc.admin.fieldAssignments.getAll.queryOptions()
  );
  const availableVetsQuery = useQuery(
    trpc.admin.fieldAssignments.getAvailableVets.queryOptions()
  );
  const availableSupervisorsQuery = useQuery(
    trpc.admin.fieldAssignments.getAvailableSupervisors.queryOptions()
  );
  const allFarmsQuery = useQuery(
    trpc.poultryFarms.getAllForAdmin.queryOptions()
  );

  // Mutations
  const reviewRequestMutation = useMutation(
    trpc.admin.fieldAssignments.reviewSupervisionRequest.mutationOptions({
      onSuccess: () => {
        supervisionRequestsQuery.refetch();
        setReviewModalVisible(false);
        setSelectedRequest(null);
        setReviewNotes("");
        Alert.alert("نجح", "تم مراجعة الطلب بنجاح");
      },
      onError: (error) => {
        Alert.alert("خطأ", error.message);
      },
    })
  );

  const assignVetMutation = useMutation(
    trpc.admin.fieldAssignments.assignVet.mutationOptions({
      onSuccess: () => {
        fieldAssignmentsQuery.refetch();
        Alert.alert("نجح", "تم تعيين الطبيب البيطري بنجاح");
      },
      onError: (error) => {
        Alert.alert("خطأ", error.message);
      },
    })
  );

  const assignSupervisorMutation = useMutation(
    trpc.admin.fieldAssignments.assignSupervisor.mutationOptions({
      onSuccess: () => {
        fieldAssignmentsQuery.refetch();
        Alert.alert("نجح", "تم تعيين المشرف بنجاح");
      },
      onError: (error) => {
        Alert.alert("خطأ", error.message);
      },
    })
  );

  const removeVetMutation = useMutation(
    trpc.admin.fieldAssignments.removeVet.mutationOptions({
      onSuccess: () => {
        fieldAssignmentsQuery.refetch();
        Alert.alert("نجح", "تم إلغاء تعيين الطبيب البيطري");
      },
      onError: (error) => {
        Alert.alert("خطأ", error.message);
      },
    })
  );

  const removeSupervisorMutation = useMutation(
    trpc.admin.fieldAssignments.removeSupervisor.mutationOptions({
      onSuccess: () => {
        fieldAssignmentsQuery.refetch();
        Alert.alert("نجح", "تم إلغاء تعيين المشرف");
      },
      onError: (error) => {
        Alert.alert("خطأ", error.message);
      },
    })
  );

  const handleReviewRequest = (request: SupervisionRequest) => {
    setSelectedRequest(request);
    setReviewModalVisible(true);
  };

  const handleApproveRequest = () => {
    if (!selectedRequest) return;

    reviewRequestMutation.mutate({
      requestId: selectedRequest.id,
      status: "approved",
      notes: reviewNotes,
      reviewedBy: "Admin",
    });
  };

  const handleRejectRequest = () => {
    if (!selectedRequest) return;

    reviewRequestMutation.mutate({
      requestId: selectedRequest.id,
      status: "rejected",
      notes: reviewNotes,
      reviewedBy: "Admin",
    });
  };

  const handleAssignVet = (
    assignment: FieldAssignment,
    vetId: string,
    vetName: string,
    vetPhone: string
  ) => {
    assignVetMutation.mutate({
      farmId: assignment.farmId,
      vetId,
      vetName,
      vetPhone,
    });
  };

  const handleAssignSupervisor = (
    assignment: FieldAssignment,
    supervisorId: string,
    supervisorName: string,
    supervisorPhone: string
  ) => {
    assignSupervisorMutation.mutate({
      farmId: assignment.farmId,
      supervisorId,
      supervisorName,
      supervisorPhone,
    });
  };

  const handleRemoveVet = (assignment: FieldAssignment) => {
    Alert.alert(
      "تأكيد الإلغاء",
      "هل أنت متأكد من إلغاء تعيين الطبيب البيطري؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد",
          style: "destructive",
          onPress: () =>
            removeVetMutation.mutate({ farmId: assignment.farmId }),
        },
      ]
    );
  };

  const handleRemoveSupervisor = (assignment: FieldAssignment) => {
    Alert.alert("تأكيد الإلغاء", "هل أنت متأكد من إلغاء تعيين المشرف؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تأكيد",
        style: "destructive",
        onPress: () =>
          removeSupervisorMutation.mutate({ farmId: assignment.farmId }),
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      default:
        return COLORS.darkGray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "قيد المراجعة";
      case "approved":
        return "مقبول";
      case "rejected":
        return "مرفوض";
      default:
        return status;
    }
  };

  const renderSupervisionRequests = () => {
    if (supervisionRequestsQuery.isLoading) {
      return <Text style={styles.loadingText}>جاري التحميل...</Text>;
    }

    const requests = supervisionRequestsQuery.data || [];

    if (requests.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Shield size={48} color={COLORS.lightGray} />
          <Text style={styles.emptyStateText}>لا توجد طلبات إشراف</Text>
        </View>
      );
    }

    return (
      <View style={styles.requestsList}>
        {requests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <Text style={styles.requestName}>{request.fullName}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(request.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusText(request.status)}
                </Text>
              </View>
            </View>

            <View style={styles.requestInfo}>
              <View style={styles.infoRow}>
                <Mail size={16} color={COLORS.darkGray} />
                <Text style={styles.infoText}>{request.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Phone size={16} color={COLORS.darkGray} />
                <Text style={styles.infoText}>{request.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <MapPin size={16} color={COLORS.darkGray} />
                <Text style={styles.infoText}>{request.location}</Text>
              </View>
            </View>

            <Text style={styles.requestEducation}>
              المؤهل: {request.education}
            </Text>

            {request.status === "pending" && (
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => handleReviewRequest(request)}
                >
                  <Eye size={16} color={COLORS.white} />
                  <Text style={styles.reviewButtonText}>مراجعة</Text>
                </TouchableOpacity>
              </View>
            )}

            {request.status !== "pending" && request.reviewedAt && (
              <View style={styles.reviewInfo}>
                <Text style={styles.reviewedBy}>
                  تمت المراجعة بواسطة: {request.reviewedBy}
                </Text>
                <Text style={styles.reviewedAt}>
                  في: {new Date(request.reviewedAt).toLocaleDateString("ar-SA")}
                </Text>
                {request.notes && (
                  <Text style={styles.reviewNotes}>
                    ملاحظات: {request.notes}
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderFieldAssignments = () => {
    if (fieldAssignmentsQuery.isLoading) {
      return <Text style={styles.loadingText}>جاري التحميل...</Text>;
    }

    const assignments = fieldAssignmentsQuery.data || [];

    if (assignments.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Users size={48} color={COLORS.lightGray} />
          <Text style={styles.emptyStateText}>لا توجد تعيينات حقول</Text>
        </View>
      );
    }

    return (
      <View style={styles.assignmentsList}>
        <Button
          title="Create New Assignment"
          onPress={() => setNewAssignmentModalVisible(true)}
        />
        {assignments.map((assignment) => (
          <View key={assignment.id} style={styles.assignmentCard}>
            <View style={styles.assignmentHeader}>
              <Text style={styles.farmName}>{assignment.farmName}</Text>
              <Text style={styles.ownerName}>
                المالك: {assignment.ownerName}
              </Text>
            </View>

            <View style={styles.assignmentDetails}>
              <View style={styles.assignmentSection}>
                <Text style={styles.sectionTitle}>الطبيب البيطري</Text>
                {assignment.assignedVetName ? (
                  <View style={styles.assignedPerson}>
                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>
                        {assignment.assignedVetName}
                      </Text>
                      <Text style={styles.personPhone}>
                        {assignment.assignedVetPhone}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveVet(assignment)}
                    >
                      <UserX size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.unassigned}>
                    <Text style={styles.unassignedText}>غير معين</Text>
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => {
                        setSelectedAssignment(assignment);
                        setAssignmentModalVisible(true);
                      }}
                    >
                      <Plus size={16} color={COLORS.white} />
                      <Text style={styles.assignButtonText}>تعيين</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.assignmentSection}>
                <Text style={styles.sectionTitle}>المشرف</Text>
                {assignment.assignedSupervisorName ? (
                  <View style={styles.assignedPerson}>
                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>
                        {assignment.assignedSupervisorName}
                      </Text>
                      <Text style={styles.personPhone}>
                        {assignment.assignedSupervisorPhone}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveSupervisor(assignment)}
                    >
                      <UserX size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.unassigned}>
                    <Text style={styles.unassignedText}>غير معين</Text>
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => {
                        setSelectedAssignment(assignment);
                        setAssignmentModalVisible(true);
                      }}
                    >
                      <Plus size={16} color={COLORS.white} />
                      <Text style={styles.assignButtonText}>تعيين</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "إدارة التعيينات والإشراف",
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "requests" && styles.activeTab]}
          onPress={() => setActiveTab("requests")}
        >
          <Shield
            size={20}
            color={activeTab === "requests" ? COLORS.white : COLORS.darkGray}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "requests" && styles.activeTabText,
            ]}
          >
            طلبات الإشراف
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "assignments" && styles.activeTab]}
          onPress={() => setActiveTab("assignments")}
        >
          <Users
            size={20}
            color={activeTab === "assignments" ? COLORS.white : COLORS.darkGray}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "assignments" && styles.activeTabText,
            ]}
          >
            التعيينات
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "requests"
          ? renderSupervisionRequests()
          : renderFieldAssignments()}
      </ScrollView>

      {/* Review Request Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>مراجعة طلب الإشراف</Text>

            {selectedRequest && (
              <View style={styles.requestDetails}>
                <Text style={styles.detailLabel}>
                  الاسم: {selectedRequest.fullName}
                </Text>
                <Text style={styles.detailLabel}>
                  البريد: {selectedRequest.email}
                </Text>
                <Text style={styles.detailLabel}>
                  الهاتف: {selectedRequest.phone}
                </Text>
                <Text style={styles.detailLabel}>
                  الموقع: {selectedRequest.location}
                </Text>
                <Text style={styles.detailLabel}>
                  المؤهل: {selectedRequest.education}
                </Text>
                <Text style={styles.detailLabel}>
                  الخبرة: {selectedRequest.experience}
                </Text>
                <Text style={styles.detailLabel}>
                  المؤهلات: {selectedRequest.qualifications}
                </Text>
                <Text style={styles.detailLabel}>
                  الخبرة السابقة: {selectedRequest.previousExperience}
                </Text>
              </View>
            )}

            <Text style={styles.notesLabel}>ملاحظات المراجعة:</Text>
            <TextInput
              style={styles.notesInput}
              value={reviewNotes}
              onChangeText={setReviewNotes}
              placeholder="أضف ملاحظات (اختياري)"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={handleApproveRequest}
                disabled={reviewRequestMutation.isPending}
              >
                <UserCheck size={16} color={COLORS.white} />
                <Text style={styles.approveButtonText}>قبول</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rejectButton}
                onPress={handleRejectRequest}
                disabled={reviewRequestMutation.isPending}
              >
                <UserX size={16} color={COLORS.white} />
                <Text style={styles.rejectButtonText}>رفض</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setReviewModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* New Assignment Modal */}
      <Modal
        visible={newAssignmentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNewAssignmentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إنشاء تعيين جديد</Text>
            {/* Farm Selector */}
            <Text style={styles.notesLabel}>اختر مزرعة:</Text>
            {/* TODO: Implement a proper dropdown component */}
            <ScrollView style={{ maxHeight: 100 }}>
              {allFarmsQuery.data?.map((farm) => (
                <TouchableOpacity
                  key={farm.id}
                  onPress={() => console.log("Selected farm:", farm.id)}
                >
                  <Text>{farm.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Vet Selector */}
            <Text style={styles.notesLabel}>اختر طبيب بيطري:</Text>
            <ScrollView style={{ maxHeight: 100 }}>
              {availableVetsQuery.data?.map((vet) => (
                <TouchableOpacity
                  key={vet.id}
                  onPress={() => console.log("Selected vet:", vet.id)}
                >
                  <Text>{vet.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Supervisor Selector */}
            <Text style={styles.notesLabel}>اختر مشرف:</Text>
            <ScrollView style={{ maxHeight: 100 }}>
              {availableSupervisorsQuery.data?.map((supervisor) => (
                <TouchableOpacity
                  key={supervisor.id}
                  onPress={() =>
                    console.log("Selected supervisor:", supervisor.id)
                  }
                >
                  <Text>{supervisor.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() =>
                  Alert.alert("TODO", "Implement assignment logic")
                }
              >
                <Text style={styles.approveButtonText}>حفظ التعيين</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setNewAssignmentModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  activeTabText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 32,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 16,
  },
  requestsList: {
    gap: 16,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  requestName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  requestInfo: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  requestEducation: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  requestActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  reviewButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  reviewInfo: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  reviewedBy: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  reviewedAt: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  reviewNotes: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  assignmentsList: {
    gap: 16,
  },
  assignmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assignmentHeader: {
    marginBottom: 16,
  },
  farmName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  assignmentDetails: {
    gap: 16,
  },
  assignmentSection: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 8,
  },
  assignedPerson: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  personPhone: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  removeButton: {
    backgroundColor: "#F44336",
    padding: 8,
    borderRadius: 6,
  },
  unassigned: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unassignedText: {
    fontSize: 14,
    color: COLORS.lightGray,
    fontStyle: "italic",
  },
  assignButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  assignButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 20,
  },
  requestDetails: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.black,
    minHeight: 80,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  approveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  approveButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  rejectButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lightGray,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: COLORS.darkGray,
    fontSize: 14,
    fontWeight: "600",
  },
});
