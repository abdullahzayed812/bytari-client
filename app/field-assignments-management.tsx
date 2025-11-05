import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { trpc } from "../lib/trpc";
import {
  ArrowLeft,
  Users,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Shield,
  Stethoscope,
  Building2,
  X,
  GraduationCap,
} from "lucide-react-native";
import { useMutation, useQuery } from "@tanstack/react-query";

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

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: "vet" | "user";
  specialization?: string;
  experience?: string;
}

interface Farm {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  location: string;
}

export default function FieldAssignmentsManagement() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"assignments" | "requests">("assignments");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState<"vet" | "supervisor">("vet");
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "assigned" | "unassigned">("all");

  // Mock data for supervision requests from poultry farm owners
  const { data: assignmentsData, refetch: refetchAssignments } = useQuery(
    trpc.assignmentRequests.getAll.queryOptions()
  );
  const { data: supervisionRequestsData, refetch: refetchRequests } = useQuery(
    trpc.assignmentRequests.getAll.queryOptions()
  );
  const supervisionRequests = useMemo(() => (supervisionRequestsData as any)?.requests, [supervisionRequestsData]);
  const assignments = useMemo(() => (assignmentsData as any)?.requests, [assignmentsData]);

  // Get available vets and supervisors
  const { data: availableVets } = useQuery(trpc.admin.fieldAssignments.getAvailableVets.queryOptions());
  const { data: availableSupervisors } = useQuery(trpc.admin.fieldAssignments.getAvailableSupervisors.queryOptions());

  // Mutations
  const approveMutation = useMutation(trpc.assignmentRequests.approve.mutationOptions());

  const rejectMutation = useMutation(trpc.assignmentRequests.reject.mutationOptions());

  const handleApproveRequest = (requestId: number) => {
    Alert.alert("تأكيد الموافقة", "هل أنت متأكد من الموافقة على هذا الطلب؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تأكيد",
        style: "destructive",
        onPress: () =>
          approveMutation.mutate(
            { assignmentRequestId: requestId },
            {
              onSuccess: () => {
                Alert.alert("نجح", "تمت الموافقة على الطلب");
                refetchRequests();
              },
              onError: (error) => {
                Alert.alert("خطأ", error.message);
              },
            }
          ),
      },
    ]);
  };

  const handleRejectRequest = (requestId: number) => {
    Alert.alert("تأكيد الرفض", "هل أنت متأكد من رفض هذا الطلب؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تأكيد",
        style: "destructive",
        onPress: () =>
          rejectMutation.mutate(
            { assignmentRequestId: requestId },
            {
              onSuccess: () => {
                Alert.alert("نجح", "تم رفض الطلب");
                refetchRequests();
              },
              onError: (error) => {
                Alert.alert("خطأ", error.message);
              },
            }
          ),
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
        return "#666";
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
        return "غير محدد";
    }
  };

  const filteredAssignments = assignments?.filter((assignment) => {
    const matchesSearch =
      assignment.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "assigned" && (assignment.assignedVetId || assignment.assignedSupervisorId)) ||
      (filterStatus === "unassigned" && !assignment.assignedVetId && !assignment.assignedSupervisorId);

    return matchesSearch && matchesFilter;
  });

  const renderAssignmentCard = ({ item }: { item: FieldAssignment }) => (
    <View style={styles.assignmentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.farmInfo}>
          <Text style={styles.farmName}>{item.farmName}</Text>
          <Text style={styles.ownerName}>المالك: {item.ownerName}</Text>
        </View>
        <View style={styles.statusBadge}>
          {item.assignedVetId || item.assignedSupervisorId ? (
            <CheckCircle size={16} color="#4CAF50" />
          ) : (
            <AlertCircle size={16} color="#FFA500" />
          )}
        </View>
      </View>

      <View style={styles.assignmentDetails}>
        {item.assignedVetId ? (
          <View style={styles.assignmentRow}>
            <View style={styles.assignmentInfo}>
              <Stethoscope size={16} color="#4ECDC4" />
              <View style={styles.assignmentText}>
                <Text style={styles.assignmentTitle}>الطبيب البيطري</Text>
                <Text style={styles.assignmentName}>{item.assignedVetName}</Text>
                <Text style={styles.assignmentPhone}>{item.assignedVetPhone}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {item.assignedSupervisorId ? (
          <View style={styles.assignmentRow}>
            <View style={styles.assignmentInfo}>
              <Shield size={16} color="#96CEB4" />
              <View style={styles.assignmentText}>
                <Text style={styles.assignmentTitle}>المشرف</Text>
                <Text style={styles.assignmentName}>{item.assignedSupervisorName}</Text>
                <Text style={styles.assignmentPhone}>{item.assignedSupervisorPhone}</Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );

  const getRequestTypeText = (type: string) => {
    switch (type) {
      case "supervision":
        return "طلب إشراف";
      case "vet_assignment":
        return "طلب تعيين طبيب بيطري";
      case "both":
        return "طلب إشراف وتعيين طبيب";
      default:
        return "طلب عام";
    }
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case "supervision":
        return "#96CEB4";
      case "vet_assignment":
        return "#4ECDC4";
      case "both":
        return "#6f42c1";
      default:
        return "#666";
    }
  };

  const renderRequestCard = ({ item }: { item: any }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>{item.farmName}</Text>
          <Text style={styles.requestLocation}>{item.requestedBy}</Text>
          <View style={[styles.requestTypeBadge, { backgroundColor: getRequestTypeColor(item.requestType) }]}>
            <Text style={styles.requestTypeText}>{getRequestTypeText(item.requestType)}</Text>
          </View>
        </View>
        <View style={[styles.requestStatusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.requestStatusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.requestDetailRow}>
          <Mail size={14} color="#666" />
          <Text style={styles.requestDetailText}>{item.notes}</Text>
        </View>
      </View>

      {item.status === "pending" && (
        <View style={styles.requestActions}>
          <TouchableOpacity style={styles.approveButton} onPress={() => handleApproveRequest(item.id)}>
            <CheckCircle size={16} color="#fff" />
            <Text style={styles.approveButtonText}>موافقة</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={() => handleRejectRequest(item.id)}>
            <X size={16} color="#fff" />
            <Text style={styles.rejectButtonText}>رفض</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "إدارة التعيين والإشراف",
          headerStyle: { backgroundColor: "#FF6B6B" },
          headerTintColor: "#fff",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "assignments" && styles.activeTab]}
          onPress={() => setSelectedTab("assignments")}
        >
          <Building2 size={20} color={selectedTab === "assignments" ? "#FF6B6B" : "#666"} />
          <Text style={[styles.tabText, selectedTab === "assignments" && styles.activeTabText]}>التعيينات الحالية</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === "requests" && styles.activeTab]}
          onPress={() => setSelectedTab("requests")}
        >
          <Clock size={20} color={selectedTab === "requests" ? "#FF6B6B" : "#666"} />
          <Text style={[styles.tabText, selectedTab === "requests" && styles.activeTabText]}>طلبات أصحاب المزارع</Text>
        </TouchableOpacity>
      </View>

      {selectedTab === "assignments" ? (
        <View style={styles.content}>
          {/* Search and Filter */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="البحث في الحقول..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[styles.filterButton, filterStatus === "all" && styles.activeFilter]}
                onPress={() => setFilterStatus("all")}
              >
                <Text style={[styles.filterText, filterStatus === "all" && styles.activeFilterText]}>الكل</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filterStatus === "assigned" && styles.activeFilter]}
                onPress={() => setFilterStatus("assigned")}
              >
                <Text style={[styles.filterText, filterStatus === "assigned" && styles.activeFilterText]}>معين</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, filterStatus === "unassigned" && styles.activeFilter]}
                onPress={() => setFilterStatus("unassigned")}
              >
                <Text style={[styles.filterText, filterStatus === "unassigned" && styles.activeFilterText]}>
                  غير معين
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Assignments List */}
          <FlatList
            data={filteredAssignments}
            renderItem={renderAssignmentCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <View style={styles.content}>
          {/* Requests Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Clock size={24} color="#FFA500" />
              <Text style={styles.statNumber}>
                {supervisionRequests?.filter((r) => r.status === "pending").length || 0}
              </Text>
              <Text style={styles.statLabel}>قيد المراجعة</Text>
            </View>
            <View style={styles.statCard}>
              <CheckCircle size={24} color="#4CAF50" />
              <Text style={styles.statNumber}>
                {supervisionRequests?.filter((r) => r.status === "approved").length || 0}
              </Text>
              <Text style={styles.statLabel}>مقبول</Text>
            </View>
            <View style={styles.statCard}>
              <X size={24} color="#F44336" />
              <Text style={styles.statNumber}>
                {supervisionRequests?.filter((r) => r.status === "rejected").length || 0}
              </Text>
              <Text style={styles.statLabel}>مرفوض</Text>
            </View>
          </View>

          {/* Requests List */}
          <FlatList
            data={supervisionRequests}
            renderItem={renderRequestCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  backButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF6B6B",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#333",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeFilter: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#fff",
  },
  listContainer: {
    paddingBottom: 20,
  },
  assignmentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  farmInfo: {
    flex: 1,
  },
  farmName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    padding: 4,
  },
  assignmentDetails: {
    gap: 12,
  },
  assignmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  assignmentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  assignmentText: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  assignmentName: {
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  assignmentPhone: {
    fontSize: 14,
    color: "#666",
  },
  removeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#fff2f2",
  },
  assignButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f8ff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    gap: 8,
  },
  assignButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
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
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  requestLocation: {
    fontSize: 14,
    color: "#666",
  },
  requestStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requestStatusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  requestDetails: {
    gap: 8,
    marginBottom: 12,
  },
  requestDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requestDetailText: {
    fontSize: 14,
    color: "#666",
  },
  experienceText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
  },
  requestActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  approveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  approveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  rejectButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  submittedDate: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
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
  },
  closeButton: {
    padding: 4,
  },
  farmDetails: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  farmDetailsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  farmDetailsText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  modalScroll: {
    maxHeight: 400,
    padding: 16,
  },
  personCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  personInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  personSpecialization: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  personContact: {
    fontSize: 14,
    color: "#666",
  },
  requestTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  requestTypeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  farmInfoSection: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  farmInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  farmInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  farmInfoText: {
    fontSize: 14,
    color: "#666",
  },
});
