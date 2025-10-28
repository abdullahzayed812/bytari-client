import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { trpc } from "../lib/trpc";
import {
  FileText,
  User,
  Building,
  Store,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Mail,
  AlertTriangle,
  Heart,
  UserCheck,
  CreditCard,
  Receipt,
  Image,
  Download,
  Shield,
  DollarSign,
  Clock,
} from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useMutation, useQuery } from "@tanstack/react-query";

interface ApprovalRequest {
  id: number;
  requestType:
    | "vet_registration"
    | "clinic_activation"
    | "store_activation"
    | "clinic_renewal"
    | "store_renewal";
  requesterId: number;
  resourceId: number;
  title: string;
  description: string | null;
  documents: string | null;
  licenseImages: string | null;
  identityImages: string | null;
  officialDocuments: string | null;
  paymentStatus: "pending" | "completed" | "failed" | "not_required";
  paymentAmount: number | null;
  paymentMethod: string | null;
  paymentTransactionId: string | null;
  paymentCompletedAt: Date | null;
  paymentReceipt: string | null;
  status: string;
  priority: string;
  createdAt: Date;
  requesterName: string;
  requesterEmail: string;
}

export default function AdminApprovalsScreen() {
  const [currentUser] = useState({ id: 1, name: "مدير النظام" });
  const [selectedType, setSelectedType] = useState<
    | "all"
    | "vet_registration"
    | "clinic_activation"
    | "store_activation"
    | "clinic_renewal"
    | "store_renewal"
    | "lost_pets"
    | "breeding_pets"
    | "pet_management"
  >("all");
  const [selectedRequest, setSelectedRequest] =
    useState<ApprovalRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activationStartDate, setActivationStartDate] = useState("");
  const [activationEndDate, setActivationEndDate] = useState("");

  // Get pending approvals with error handling and performance optimization
  const {
    data: approvalsData,
    isLoading,
    refetch,
    error: approvalsError,
  } = useQuery({
    ...trpc.admin.approvals.getPending.queryOptions({
      adminId: currentUser.id,
      type:
        selectedType === "lost_pets" ||
        selectedType === "breeding_pets" ||
        selectedType === "pet_management"
          ? "all"
          : selectedType,
    }),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
    refetchInterval: false,
  });

  const approvals = useMemo(
    () => (approvalsData as any)?.approvals,
    [approvalsData]
  );

  // Use mock data if server request fails with memoization
  const effectiveApprovals = useMemo(() => {
    if (approvalsError) {
      console.error("Approvals error:", approvalsError);
      // Rich mock data for testing when server fails
      return [
        {
          id: 1,
          requestType: "vet_registration" as const,
          requesterId: 1,
          resourceId: 1,
          title: "طلب تسجيل طبيب بيطري - د. أحمد محمد",
          description: "طلب تسجيل جديد للحصول على ترخيص مزاولة المهنة",
          documents: null,
          licenseImages: JSON.stringify([
            "vet_license_ahmad_2024.jpg",
            "professional_certificate.pdf",
          ]),
          identityImages: JSON.stringify([
            "national_id_front.jpg",
            "national_id_back.jpg",
            "doctor_id_card.jpg",
          ]),
          officialDocuments: JSON.stringify([
            "graduation_certificate.pdf",
            "medical_license.pdf",
            "specialization_cert.pdf",
          ]),
          paymentStatus: "completed" as const,
          paymentAmount: 750,
          paymentMethod: "بطاقة ائتمان - فيزا",
          paymentTransactionId: "TXN_VET_2024_001234",
          paymentCompletedAt: new Date("2024-01-15T10:30:00"),
          paymentReceipt: "payment_receipt_vet_001234.pdf",
          status: "pending",
          priority: "high",
          createdAt: new Date("2024-01-10T09:15:00"),
          requesterName: "د. أحمد محمد علي",
          requesterEmail: "dr.ahmed.mohamed@vetclinic.com",
        },
        {
          id: 2,
          requestType: "clinic_activation" as const,
          requesterId: 2,
          resourceId: 2,
          title: "طلب تفعيل عيادة الرحمة البيطرية",
          description:
            "طلب تفعيل عيادة بيطرية متخصصة في علاج الحيوانات الأليفة",
          documents: null,
          licenseImages: JSON.stringify([
            "clinic_license_2024.jpg",
            "health_permit.pdf",
          ]),
          identityImages: JSON.stringify([
            "owner_national_id.jpg",
            "business_owner_id.jpg",
          ]),
          officialDocuments: JSON.stringify([
            "commercial_register.pdf",
            "tax_certificate.pdf",
            "municipality_permit.pdf",
            "fire_safety_cert.pdf",
          ]),
          paymentStatus: "completed" as const,
          paymentAmount: 1200,
          paymentMethod: "تحويل بنكي - البنك الأهلي",
          paymentTransactionId: "BANK_TXN_CLI_2024_005678",
          paymentCompletedAt: new Date("2024-01-12T14:45:00"),
          paymentReceipt: "bank_transfer_receipt_005678.pdf",
          status: "pending",
          priority: "normal",
          createdAt: new Date("2024-01-08T11:20:00"),
          requesterName: "محمد سالم الأحمدي",
          requesterEmail: "mohammed.salem@rahma-clinic.com",
        },
        {
          id: 10001,
          requestType: "clinic_renewal" as const,
          requesterId: 6,
          resourceId: 1,
          title: "طلب تجديد اشتراك عيادة الشفاء البيطرية",
          description: "انتهت صلاحية تفعيل العيادة في 15/12/2024",
          documents: null,
          licenseImages: null,
          identityImages: null,
          officialDocuments: null,
          paymentStatus: "pending" as const,
          paymentAmount: 1200,
          paymentMethod: null,
          paymentTransactionId: null,
          paymentCompletedAt: null,
          paymentReceipt: null,
          status: "pending",
          priority: "high",
          createdAt: new Date("2024-12-15T10:00:00"),
          requesterName: "د. علي أحمد",
          requesterEmail: "dr.ali@shifa-clinic.com",
        },
        {
          id: 20001,
          requestType: "store_renewal" as const,
          requesterId: 7,
          resourceId: 1,
          title: "طلب تجديد اشتراك مخزن الأدوية البيطرية",
          description: "انتهت صلاحية تفعيل المخزن في 10/12/2024",
          documents: null,
          licenseImages: null,
          identityImages: null,
          officialDocuments: null,
          paymentStatus: "completed" as const,
          paymentAmount: 800,
          paymentMethod: "بطاقة ائتمان - فيزا",
          paymentTransactionId: "TXN_STORE_RENEWAL_2024_001",
          paymentCompletedAt: new Date("2024-12-10T14:30:00"),
          paymentReceipt: "renewal_receipt_001.pdf",
          status: "pending",
          priority: "normal",
          createdAt: new Date("2024-12-10T09:00:00"),
          requesterName: "أحمد محمود",
          requesterEmail: "ahmed@vet-pharmacy.com",
        },
        {
          id: 3,
          requestType: "store_activation" as const,
          requesterId: 3,
          resourceId: 3,
          title: "طلب تفعيل متجر أليف للحيوانات الأليفة",
          description: "متجر متخصص في بيع مستلزمات وأغذية الحيوانات الأليفة",
          documents: null,
          licenseImages: JSON.stringify([
            "store_license.jpg",
            "retail_permit.pdf",
          ]),
          identityImages: JSON.stringify([
            "owner_id_front.jpg",
            "owner_id_back.jpg",
            "student_id.jpg",
          ]),
          officialDocuments: JSON.stringify([
            "commercial_license.pdf",
            "vat_certificate.pdf",
            "store_lease_contract.pdf",
          ]),
          paymentStatus: "pending" as const,
          paymentAmount: 800,
          paymentMethod: null,
          paymentTransactionId: null,
          paymentCompletedAt: null,
          paymentReceipt: null,
          status: "pending",
          priority: "normal",
          createdAt: new Date("2024-01-14T16:30:00"),
          requesterName: "فاطمة أحمد الزهراني",
          requesterEmail: "fatima.ahmed@aleef-store.com",
        },
        {
          id: 4,
          requestType: "vet_registration" as const,
          requesterId: 4,
          resourceId: 4,
          title: "طلب تسجيل طبيب بيطري - د. سارة خالد",
          description: "طبيبة بيطرية متخصصة في جراحة الحيوانات الصغيرة",
          documents: null,
          licenseImages: JSON.stringify([
            "vet_license_sarah.jpg",
            "surgery_specialization.pdf",
          ]),
          identityImages: JSON.stringify([
            "doctor_national_id.jpg",
            "medical_association_card.jpg",
          ]),
          officialDocuments: JSON.stringify([
            "phd_certificate.pdf",
            "residency_completion.pdf",
            "board_certification.pdf",
          ]),
          paymentStatus: "failed" as const,
          paymentAmount: 750,
          paymentMethod: "بطاقة ائتمان - ماستركارد",
          paymentTransactionId: "FAILED_TXN_2024_009876",
          paymentCompletedAt: null,
          paymentReceipt: null,
          status: "pending",
          priority: "high",
          createdAt: new Date("2024-01-13T13:45:00"),
          requesterName: "د. سارة خالد المطيري",
          requesterEmail: "dr.sarah.khalid@surgery-vet.com",
        },
        {
          id: 5,
          requestType: "clinic_activation" as const,
          requesterId: 5,
          resourceId: 5,
          title: "طلب تفعيل مستشفى الحيوان المتقدم",
          description: "مستشفى بيطري متكامل مع أحدث التقنيات والمعدات",
          documents: null,
          licenseImages: JSON.stringify([
            "hospital_license.jpg",
            "advanced_equipment_cert.pdf",
          ]),
          identityImages: JSON.stringify([
            "director_id.jpg",
            "medical_director_card.jpg",
          ]),
          officialDocuments: JSON.stringify([
            "hospital_permit.pdf",
            "equipment_certificates.pdf",
            "staff_qualifications.pdf",
            "insurance_policy.pdf",
          ]),
          paymentStatus: "not_required" as const,
          paymentAmount: null,
          paymentMethod: null,
          paymentTransactionId: null,
          paymentCompletedAt: null,
          paymentReceipt: null,
          status: "pending",
          priority: "urgent",
          createdAt: new Date("2024-01-16T08:00:00"),
          requesterName: "د. عبدالله الراشد",
          requesterEmail: "dr.abdullah@advanced-animal-hospital.com",
        },
      ];
    }
    return approvals || [];
  }, [approvals, approvalsError]);

  // Filter approvals based on selected type for better performance
  const filteredApprovals = useMemo(() => {
    if (!effectiveApprovals || effectiveApprovals.length === 0) return [];

    if (selectedType === "all") return effectiveApprovals;

    return effectiveApprovals.filter((approval) => {
      if (
        selectedType === "lost_pets" ||
        selectedType === "breeding_pets" ||
        selectedType === "pet_management"
      ) {
        return true;
      }
      return approval.requestType === selectedType;
    });
  }, [effectiveApprovals, selectedType]);

  // Get approval details with optimization
  const { data: approvalDetails } = useQuery({
    ...trpc.admin.approvals.getDetails.queryOptions({
      requestId: selectedRequest?.id || 0,
      adminId: currentUser.id,
    }),
    enabled: !!selectedRequest,
    staleTime: 60000,
  });

  // Approve mutation
  const approveMutation = useMutation(
    trpc.admin.approvals.approve.mutationOptions()
  );

  // Reject mutation
  const rejectMutation = useMutation(
    trpc.admin.approvals.reject.mutationOptions()
  );

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case "vet_registration":
        return <User size={20} color={COLORS.primary} />;
      case "clinic_activation":
        return <Building size={20} color={COLORS.info} />;
      case "store_activation":
        return <Store size={20} color={COLORS.warning} />;
      case "clinic_renewal":
        return <Building size={20} color={COLORS.success} />;
      case "store_renewal":
        return <Store size={20} color={COLORS.success} />;
      case "lost_pets":
        return <AlertTriangle size={20} color="#E74C3C" />;
      case "breeding_pets":
        return <Heart size={20} color="#9B59B6" />;
      case "pet_management":
        return <UserCheck size={20} color="#3498DB" />;
      default:
        return <FileText size={20} color={COLORS.gray} />;
    }
  };

  const getRequestTypeText = (type: string) => {
    switch (type) {
      case "vet_registration":
        return "تسجيل طبيب بيطري";
      case "clinic_activation":
        return "تفعيل عيادة";
      case "store_activation":
        return "تفعيل متجر";
      case "clinic_renewal":
        return "تجديد عيادة";
      case "store_renewal":
        return "تجديد متجر";
      case "lost_pets":
        return "حيوانات مفقودة";
      case "breeding_pets":
        return "حيوانات تزاوج";
      case "pet_management":
        return "إدارة الحيوانات";
      default:
        return "طلب موافقة";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return COLORS.error;
      case "high":
        return COLORS.warning;
      case "normal":
        return COLORS.info;
      case "low":
        return COLORS.success;
      default:
        return COLORS.gray;
    }
  };

  const handleApprove = (request: ApprovalRequest) => {
    if (
      request.requestType === "clinic_activation" ||
      request.requestType === "store_activation" ||
      request.requestType === "clinic_renewal" ||
      request.requestType === "store_renewal"
    ) {
      // Show modal for activation dates
      setSelectedRequest(request);
      const today = new Date();
      const nextYear = new Date(
        today.getFullYear() + 1,
        today.getMonth(),
        today.getDate()
      );
      setActivationStartDate(today.toISOString().split("T")[0]);
      setActivationEndDate(nextYear.toISOString().split("T")[0]);
      setShowApprovalModal(true);
    } else {
      // Direct approval for vet registration
      Alert.alert(
        "تأكيد الموافقة",
        `هل أنت متأكد من الموافقة على ${request.title}؟`,
        [
          { text: "إلغاء", style: "cancel" },
          {
            text: "موافقة",
            style: "default",
            onPress: () => {
              approveMutation.mutate(
                {
                  requestId: request.id,
                  adminId: currentUser.id,
                  adminNotes: "تم قبول الطلب من قبل الإدارة",
                },
                {
                  onSuccess: () => {
                    Alert.alert("نجح", "تم قبول الطلب بنجاح");
                    refetch();
                    setShowDetailsModal(false);
                  },
                  onError: (error) => {
                    Alert.alert("خطأ", error.message);
                  },
                }
              );
            },
          },
        ]
      );
    }
  };

  const confirmApprovalWithDates = () => {
    if (!selectedRequest || !activationStartDate || !activationEndDate) {
      Alert.alert("خطأ", "يجب تحديد تواريخ التفعيل");
      return;
    }

    approveMutation.mutate(
      {
        requestId: selectedRequest.id,
        adminId: currentUser.id,
        adminNotes: "تم قبول الطلب من قبل الإدارة مع تحديد تواريخ التفعيل",
        activationStartDate: new Date(activationStartDate),
        activationEndDate: new Date(activationEndDate),
      },
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم قبول الطلب بنجاح");
          refetch();
          setShowApprovalModal(false);
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message);
        },
      }
    );
    setShowApprovalModal(false);
  };

  const handleReject = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!selectedRequest) return;

    if (rejectionReason.trim()) {
      rejectMutation.mutate(
        {
          requestId: selectedRequest.id,
          adminId: currentUser.id,
          rejectionReason: rejectionReason.trim(),
          adminNotes: "تم رفض الطلب من قبل الإدارة",
        },
        {
          onSuccess: () => {
            Alert.alert("نجح", "تم رفض الطلب");
            refetch();
            setShowRejectModal(false);
            setRejectionReason("");
          },
          onError: (error) => {
            Alert.alert("خطأ", error.message);
          },
        }
      );
      setShowRejectModal(false);
      setRejectionReason("");
    } else {
      Alert.alert("خطأ", "يجب إدخال سبب الرفض");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return COLORS.success;
      case "pending":
        return COLORS.warning;
      case "failed":
        return COLORS.error;
      case "not_required":
        return COLORS.gray;
      default:
        return COLORS.gray;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "مكتمل";
      case "pending":
        return "في الانتظار";
      case "failed":
        return "فشل";
      case "not_required":
        return "غير مطلوب";
      default:
        return "غير محدد";
    }
  };

  const renderApprovalModal = () => (
    <Modal visible={showApprovalModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.rejectModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>تحديد تواريخ التفعيل</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowApprovalModal(false);
                setActivationStartDate("");
                setActivationEndDate("");
              }}
            >
              <XCircle size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.rejectModalBody}>
            <Text style={styles.rejectLabel}>تاريخ بدء التفعيل:</Text>
            <TextInput
              style={styles.dateInput}
              value={activationStartDate}
              onChangeText={setActivationStartDate}
              placeholder="YYYY-MM-DD"
            />

            <Text style={[styles.rejectLabel, { marginTop: 16 }]}>
              تاريخ انتهاء التفعيل:
            </Text>
            <TextInput
              style={styles.dateInput}
              value={activationEndDate}
              onChangeText={setActivationEndDate}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.dateNote}>
              ملاحظة: سيتم تفعيل{" "}
              {selectedRequest?.requestType?.includes("clinic")
                ? "العيادة"
                : "المتجر"}{" "}
              من التاريخ المحدد وحتى تاريخ الانتهاء
            </Text>
          </View>

          <View style={styles.rejectModalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setShowApprovalModal(false);
                setActivationStartDate("");
                setActivationEndDate("");
              }}
            >
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={confirmApprovalWithDates}
              disabled={
                approveMutation.isPending ||
                !activationStartDate ||
                !activationEndDate
              }
            >
              <CheckCircle size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>موافقة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderRejectModal = () => (
    <Modal visible={showRejectModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.rejectModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>رفض الطلب</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowRejectModal(false);
                setRejectionReason("");
              }}
            >
              <XCircle size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <View style={styles.rejectModalBody}>
            <Text style={styles.rejectLabel}>يرجى إدخال سبب الرفض:</Text>
            <TextInput
              style={styles.rejectInput}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="اكتب سبب الرفض هنا..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.rejectModalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setShowRejectModal(false);
                setRejectionReason("");
              }}
            >
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={confirmReject}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
            >
              <XCircle size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>رفض</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDetailsModal = () => (
    <Modal visible={showDetailsModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>تفاصيل الطلب</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <XCircle size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            {(approvalDetails || selectedRequest) && (
              <>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>معلومات الطلب</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>النوع:</Text>
                    <Text style={styles.detailValue}>
                      {getRequestTypeText(
                        (approvalDetails || selectedRequest)!.requestType
                      )}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>العنوان:</Text>
                    <Text style={styles.detailValue}>
                      {(approvalDetails || selectedRequest)!.title}
                    </Text>
                  </View>
                  {(approvalDetails || selectedRequest)!.description && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>الوصف:</Text>
                      <Text style={styles.detailValue}>
                        {(approvalDetails || selectedRequest)!.description}
                      </Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>تاريخ التقديم:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(
                        (approvalDetails || selectedRequest)!.createdAt
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>معلومات مقدم الطلب</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>الاسم:</Text>
                    <Text style={styles.detailValue}>
                      {(approvalDetails || selectedRequest)!.requesterName}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>البريد الإلكتروني:</Text>
                    <Text style={styles.detailValue}>
                      {(approvalDetails || selectedRequest)!.requesterEmail}
                    </Text>
                  </View>
                  {approvalDetails && approvalDetails.requesterPhone && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>الهاتف:</Text>
                      <Text style={styles.detailValue}>
                        {approvalDetails.requesterPhone}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Payment Status Section */}
                <View style={styles.detailSection}>
                  <View style={styles.sectionHeaderWithIcon}>
                    <DollarSign size={20} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>حالة الرسوم والدفع</Text>
                    <View
                      style={[
                        styles.paymentMainStatusBadge,
                        {
                          backgroundColor: getPaymentStatusColor(
                            (approvalDetails || selectedRequest)!.paymentStatus
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.paymentMainStatusText}>
                        {getPaymentStatusText(
                          (approvalDetails || selectedRequest)!.paymentStatus
                        )}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.paymentStatusContainer}>
                    {/* Payment Requirements for Clinics and Stores */}
                    {((approvalDetails || selectedRequest)!.requestType ===
                      "clinic_activation" ||
                      (approvalDetails || selectedRequest)!.requestType ===
                        "store_activation") && (
                      <View style={styles.paymentRequirementCard}>
                        <View style={styles.paymentRequirementHeader}>
                          <View style={styles.paymentRequirementIcon}>
                            <CreditCard size={18} color={COLORS.white} />
                          </View>
                          <Text style={styles.paymentRequirementTitle}>
                            {(approvalDetails || selectedRequest)!
                              .requestType === "clinic_activation"
                              ? "رسوم تفعيل العيادة"
                              : "رسوم تفعيل المتجر"}
                          </Text>
                        </View>

                        <View style={styles.paymentRequirementDetails}>
                          <View style={styles.paymentRequirementRow}>
                            <Text style={styles.paymentRequirementLabel}>
                              المبلغ المطلوب:
                            </Text>
                            <Text style={styles.paymentRequirementAmount}>
                              {(approvalDetails || selectedRequest)!
                                .paymentAmount || "غير محدد"}{" "}
                              ريال
                            </Text>
                          </View>

                          <View style={styles.paymentStatusIndicator}>
                            <View
                              style={[
                                styles.paymentStatusDot,
                                {
                                  backgroundColor:
                                    (approvalDetails || selectedRequest)!
                                      .paymentStatus === "completed"
                                      ? COLORS.success
                                      : (approvalDetails || selectedRequest)!
                                          .paymentStatus === "pending"
                                      ? COLORS.warning
                                      : COLORS.error,
                                },
                              ]}
                            />
                            <Text
                              style={[
                                styles.paymentStatusIndicatorText,
                                {
                                  color:
                                    (approvalDetails || selectedRequest)!
                                      .paymentStatus === "completed"
                                      ? COLORS.success
                                      : (approvalDetails || selectedRequest)!
                                          .paymentStatus === "pending"
                                      ? COLORS.warning
                                      : COLORS.error,
                                },
                              ]}
                            >
                              {(approvalDetails || selectedRequest)!
                                .paymentStatus === "completed"
                                ? "تم دفع الرسوم"
                                : (approvalDetails || selectedRequest)!
                                    .paymentStatus === "pending"
                                ? "في انتظار الدفع"
                                : (approvalDetails || selectedRequest)!
                                    .paymentStatus === "failed"
                                ? "فشل في الدفع"
                                : "غير مطلوب"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Payment Details */}
                    {(approvalDetails || selectedRequest)!.paymentStatus !==
                      "not_required" && (
                      <View style={styles.paymentDetailsCard}>
                        <Text style={styles.paymentDetailsTitle}>
                          تفاصيل الدفع
                        </Text>

                        {(approvalDetails || selectedRequest)!
                          .paymentMethod && (
                          <View style={styles.paymentDetailRow}>
                            <CreditCard size={16} color={COLORS.gray} />
                            <Text style={styles.paymentDetailLabel}>
                              طريقة الدفع:
                            </Text>
                            <Text style={styles.paymentDetailValue}>
                              {
                                (approvalDetails || selectedRequest)!
                                  .paymentMethod
                              }
                            </Text>
                          </View>
                        )}

                        {(approvalDetails || selectedRequest)!
                          .paymentTransactionId && (
                          <View style={styles.paymentDetailRow}>
                            <Receipt size={16} color={COLORS.gray} />
                            <Text style={styles.paymentDetailLabel}>
                              رقم المعاملة:
                            </Text>
                            <Text
                              style={[
                                styles.paymentDetailValue,
                                styles.transactionId,
                              ]}
                            >
                              {
                                (approvalDetails || selectedRequest)!
                                  .paymentTransactionId
                              }
                            </Text>
                          </View>
                        )}

                        {(approvalDetails || selectedRequest)!
                          .paymentCompletedAt && (
                          <View style={styles.paymentDetailRow}>
                            <Clock size={16} color={COLORS.gray} />
                            <Text style={styles.paymentDetailLabel}>
                              تاريخ الدفع:
                            </Text>
                            <Text style={styles.paymentDetailValue}>
                              {formatDate(
                                (approvalDetails || selectedRequest)!
                                  .paymentCompletedAt!
                              )}
                            </Text>
                          </View>
                        )}

                        {(approvalDetails || selectedRequest)!
                          .paymentReceipt && (
                          <TouchableOpacity style={styles.paymentReceiptButton}>
                            <Receipt size={18} color={COLORS.primary} />
                            <Text style={styles.paymentReceiptButtonText}>
                              عرض إيصال الدفع
                            </Text>
                            <Eye size={16} color={COLORS.primary} />
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    {/* Payment Status Messages */}
                    {(approvalDetails || selectedRequest)!.paymentStatus ===
                      "pending" &&
                      (approvalDetails || selectedRequest)!.paymentAmount && (
                        <View style={styles.paymentAlert}>
                          <View style={styles.paymentAlertIcon}>
                            <AlertTriangle size={20} color={COLORS.warning} />
                          </View>
                          <View style={styles.paymentAlertContent}>
                            <Text style={styles.paymentAlertTitle}>
                              في انتظار دفع الرسوم
                            </Text>
                            <Text style={styles.paymentAlertText}>
                              لم يتم دفع رسوم التفعيل المطلوبة بعد. يجب على
                              المتقدم إكمال عملية الدفع قبل الموافقة على الطلب.
                            </Text>
                          </View>
                        </View>
                      )}

                    {(approvalDetails || selectedRequest)!.paymentStatus ===
                      "completed" && (
                      <View
                        style={[
                          styles.paymentAlert,
                          {
                            backgroundColor: "#D4EDDA",
                            borderColor: COLORS.success,
                          },
                        ]}
                      >
                        <View style={styles.paymentAlertIcon}>
                          <CheckCircle size={20} color={COLORS.success} />
                        </View>
                        <View style={styles.paymentAlertContent}>
                          <Text
                            style={[
                              styles.paymentAlertTitle,
                              { color: COLORS.success },
                            ]}
                          >
                            تم دفع الرسوم بنجاح
                          </Text>
                          <Text
                            style={[
                              styles.paymentAlertText,
                              { color: "#155724" },
                            ]}
                          >
                            تم دفع جميع الرسوم المطلوبة بنجاح. يمكن الآن
                            الموافقة على الطلب.
                          </Text>
                        </View>
                      </View>
                    )}

                    {(approvalDetails || selectedRequest)!.paymentStatus ===
                      "failed" && (
                      <View
                        style={[
                          styles.paymentAlert,
                          {
                            backgroundColor: "#F8D7DA",
                            borderColor: COLORS.error,
                          },
                        ]}
                      >
                        <View style={styles.paymentAlertIcon}>
                          <XCircle size={20} color={COLORS.error} />
                        </View>
                        <View style={styles.paymentAlertContent}>
                          <Text
                            style={[
                              styles.paymentAlertTitle,
                              { color: COLORS.error },
                            ]}
                          >
                            فشل في دفع الرسوم
                          </Text>
                          <Text
                            style={[
                              styles.paymentAlertText,
                              { color: "#721C24" },
                            ]}
                          >
                            فشلت عملية دفع الرسوم. يجب على المتقدم إعادة
                            المحاولة أو استخدام طريقة دفع أخرى.
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                {/* Documents Section */}
                {((approvalDetails || selectedRequest)!.licenseImages ||
                  (approvalDetails || selectedRequest)!.identityImages ||
                  (approvalDetails || selectedRequest)!.officialDocuments) && (
                  <View style={styles.detailSection}>
                    <View style={styles.sectionHeaderWithIcon}>
                      <Shield size={20} color={COLORS.primary} />
                      <Text style={styles.sectionTitle}>
                        الأوراق الرسمية والمستندات
                      </Text>
                      <View style={styles.documentsStatusBadge}>
                        <Text style={styles.documentsStatusText}>مرفقة</Text>
                      </View>
                    </View>

                    {/* Identity Images - Most Important First */}
                    {(approvalDetails || selectedRequest)!.identityImages && (
                      <View style={styles.documentGroup}>
                        <View style={styles.documentHeader}>
                          <View style={styles.documentIconContainer}>
                            <User size={18} color={COLORS.white} />
                          </View>
                          <View style={styles.documentTitleContainer}>
                            <Text style={styles.documentTitle}>
                              صور الهوية الشخصية
                            </Text>
                            <Text style={styles.documentSubtitle}>
                              هوية المتقدم الرسمية
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.documentBadge,
                              { backgroundColor: "#E67E22" },
                            ]}
                          >
                            <Text style={styles.documentBadgeText}>هوية</Text>
                          </View>
                        </View>

                        <View style={styles.documentPreviewContainer}>
                          <Text style={styles.documentCount}>
                            {
                              JSON.parse(
                                (approvalDetails || selectedRequest)!
                                  .identityImages!
                              ).length
                            }{" "}
                            صورة مرفقة
                          </Text>
                          <View style={styles.documentImageGrid}>
                            {JSON.parse(
                              (approvalDetails || selectedRequest)!
                                .identityImages!
                            ).map((doc: string, index: number) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.documentImageItem}
                              >
                                <View style={styles.documentImageContainer}>
                                  <Image size={24} color={COLORS.primary} />
                                  <Text style={styles.documentImageLabel}>
                                    صورة {index + 1}
                                  </Text>
                                </View>
                                <View style={styles.documentImageInfo}>
                                  <Text style={styles.documentImageName}>
                                    {doc}
                                  </Text>
                                  <Text style={styles.documentImageType}>
                                    {doc.includes("student") ||
                                    doc.includes("طالب")
                                      ? "هوية طالب"
                                      : doc.includes("doctor") ||
                                        doc.includes("طبيب")
                                      ? "هوية طبيب"
                                      : doc.includes("national") ||
                                        doc.includes("وطنية")
                                      ? "هوية وطنية"
                                      : "هوية شخصية"}
                                  </Text>
                                </View>
                                <TouchableOpacity
                                  style={styles.viewImageButton}
                                >
                                  <Eye size={16} color={COLORS.white} />
                                </TouchableOpacity>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </View>
                    )}

                    {/* License Images */}
                    {(approvalDetails || selectedRequest)!.licenseImages && (
                      <View style={styles.documentGroup}>
                        <View style={styles.documentHeader}>
                          <View
                            style={[
                              styles.documentIconContainer,
                              { backgroundColor: COLORS.info },
                            ]}
                          >
                            <Shield size={18} color={COLORS.white} />
                          </View>
                          <View style={styles.documentTitleContainer}>
                            <Text style={styles.documentTitle}>
                              صور التراخيص المهنية
                            </Text>
                            <Text style={styles.documentSubtitle}>
                              تراخيص مزاولة المهنة
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.documentBadge,
                              { backgroundColor: COLORS.info },
                            ]}
                          >
                            <Text style={styles.documentBadgeText}>ترخيص</Text>
                          </View>
                        </View>

                        <View style={styles.documentPreviewContainer}>
                          <Text style={styles.documentCount}>
                            {
                              JSON.parse(
                                (approvalDetails || selectedRequest)!
                                  .licenseImages!
                              ).length
                            }{" "}
                            صورة مرفقة
                          </Text>
                          <View style={styles.documentImageGrid}>
                            {JSON.parse(
                              (approvalDetails || selectedRequest)!
                                .licenseImages!
                            ).map((doc: string, index: number) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.documentImageItem}
                              >
                                <View style={styles.documentImageContainer}>
                                  <Image size={24} color={COLORS.info} />
                                  <Text style={styles.documentImageLabel}>
                                    ترخيص {index + 1}
                                  </Text>
                                </View>
                                <View style={styles.documentImageInfo}>
                                  <Text style={styles.documentImageName}>
                                    {doc}
                                  </Text>
                                  <Text style={styles.documentImageType}>
                                    ترخيص مهني
                                  </Text>
                                </View>
                                <TouchableOpacity
                                  style={[
                                    styles.viewImageButton,
                                    { backgroundColor: COLORS.info },
                                  ]}
                                >
                                  <Eye size={16} color={COLORS.white} />
                                </TouchableOpacity>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Official Documents */}
                    {(approvalDetails || selectedRequest)!
                      .officialDocuments && (
                      <View style={styles.documentGroup}>
                        <View style={styles.documentHeader}>
                          <View
                            style={[
                              styles.documentIconContainer,
                              { backgroundColor: COLORS.success },
                            ]}
                          >
                            <FileText size={18} color={COLORS.white} />
                          </View>
                          <View style={styles.documentTitleContainer}>
                            <Text style={styles.documentTitle}>
                              المستندات الرسمية
                            </Text>
                            <Text style={styles.documentSubtitle}>
                              شهادات ومستندات إضافية
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.documentBadge,
                              { backgroundColor: COLORS.success },
                            ]}
                          >
                            <Text style={styles.documentBadgeText}>
                              مستندات
                            </Text>
                          </View>
                        </View>

                        <View style={styles.documentPreviewContainer}>
                          <Text style={styles.documentCount}>
                            {
                              JSON.parse(
                                (approvalDetails || selectedRequest)!
                                  .officialDocuments!
                              ).length
                            }{" "}
                            مستند مرفق
                          </Text>
                          <View style={styles.documentList}>
                            {JSON.parse(
                              (approvalDetails || selectedRequest)!
                                .officialDocuments!
                            ).map((doc: string, index: number) => (
                              <TouchableOpacity
                                key={index}
                                style={styles.documentFileItem}
                              >
                                <View
                                  style={[
                                    styles.documentFileIcon,
                                    { backgroundColor: COLORS.success },
                                  ]}
                                >
                                  <FileText size={16} color={COLORS.white} />
                                </View>
                                <View style={styles.documentFileInfo}>
                                  <Text style={styles.documentFileName}>
                                    {doc}
                                  </Text>
                                  <Text style={styles.documentFileType}>
                                    {doc.includes("license") ||
                                    doc.includes("إجازة")
                                      ? "إجازة مهنية"
                                      : doc.includes("cert") ||
                                        doc.includes("شهادة")
                                      ? "شهادة"
                                      : doc.includes("commercial") ||
                                        doc.includes("تجاري")
                                      ? "سجل تجاري"
                                      : doc.includes("tax") ||
                                        doc.includes("ضريبي")
                                      ? "شهادة ضريبية"
                                      : "مستند رسمي"}
                                  </Text>
                                </View>
                                <View style={styles.documentFileActions}>
                                  <TouchableOpacity
                                    style={styles.downloadButton}
                                  >
                                    <Download
                                      size={14}
                                      color={COLORS.primary}
                                    />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={styles.viewFileButton}
                                  >
                                    <Eye size={14} color={COLORS.success} />
                                  </TouchableOpacity>
                                </View>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {/* Resource Details */}
                {approvalDetails && approvalDetails.resourceDetails && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>تفاصيل إضافية</Text>
                    {approvalDetails.requestType === "vet_registration" &&
                      approvalDetails.resourceDetails &&
                      "licenseNumber" in approvalDetails.resourceDetails && (
                        <>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>رقم الترخيص:</Text>
                            <Text style={styles.detailValue}>
                              {approvalDetails.resourceDetails.licenseNumber}
                            </Text>
                          </View>
                          {"specialization" in
                            approvalDetails.resourceDetails &&
                            approvalDetails.resourceDetails.specialization && (
                              <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>التخصص:</Text>
                                <Text style={styles.detailValue}>
                                  {
                                    approvalDetails.resourceDetails
                                      .specialization
                                  }
                                </Text>
                              </View>
                            )}
                        </>
                      )}
                    {(approvalDetails.requestType === "clinic_activation" ||
                      approvalDetails.requestType === "store_activation") &&
                      approvalDetails.resourceDetails &&
                      "name" in approvalDetails.resourceDetails && (
                        <>
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>الاسم:</Text>
                            <Text style={styles.detailValue}>
                              {approvalDetails.resourceDetails.name}
                            </Text>
                          </View>
                          {"address" in approvalDetails.resourceDetails && (
                            <View style={styles.detailRow}>
                              <Text style={styles.detailLabel}>العنوان:</Text>
                              <Text style={styles.detailValue}>
                                {approvalDetails.resourceDetails.address}
                              </Text>
                            </View>
                          )}
                          {"phone" in approvalDetails.resourceDetails &&
                            approvalDetails.resourceDetails.phone && (
                              <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>الهاتف:</Text>
                                <Text style={styles.detailValue}>
                                  {approvalDetails.resourceDetails.phone}
                                </Text>
                              </View>
                            )}
                        </>
                      )}
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => selectedRequest && handleApprove(selectedRequest)}
              disabled={approveMutation.isPending}
            >
              <CheckCircle size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>موافقة</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => selectedRequest && handleReject(selectedRequest)}
              disabled={rejectMutation.isPending}
            >
              <XCircle size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>رفض</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Show loading with better UX
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "إدارة الموافقات والمحتوى",
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.white,
          }}
        />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <Text style={styles.loadingText}>جاري تحميل الطلبات...</Text>
            <Text style={styles.loadingSubtext}>يرجى الانتظار</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "إدارة الموافقات والمحتوى",
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
        }}
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedType === "all" && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedType("all")}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedType === "all" && styles.activeFilterTabText,
              ]}
            >
              الكل
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedType === "vet_registration" && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedType("vet_registration")}
          >
            <User
              size={16}
              color={
                selectedType === "vet_registration" ? COLORS.white : COLORS.gray
              }
            />
            <Text
              style={[
                styles.filterTabText,
                selectedType === "vet_registration" &&
                  styles.activeFilterTabText,
              ]}
            >
              الأطباء
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedType === "clinic_activation" && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedType("clinic_activation")}
          >
            <Building
              size={16}
              color={
                selectedType === "clinic_activation"
                  ? COLORS.white
                  : COLORS.gray
              }
            />
            <Text
              style={[
                styles.filterTabText,
                selectedType === "clinic_activation" &&
                  styles.activeFilterTabText,
              ]}
            >
              العيادات
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedType === "store_activation" && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedType("store_activation")}
          >
            <Store
              size={16}
              color={
                selectedType === "store_activation" ? COLORS.white : COLORS.gray
              }
            />
            <Text
              style={[
                styles.filterTabText,
                selectedType === "store_activation" &&
                  styles.activeFilterTabText,
              ]}
            >
              المتاجر
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedType === "clinic_renewal" && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedType("clinic_renewal")}
          >
            <Building
              size={16}
              color={
                selectedType === "clinic_renewal"
                  ? COLORS.white
                  : COLORS.success
              }
            />
            <Text
              style={[
                styles.filterTabText,
                selectedType === "clinic_renewal" && styles.activeFilterTabText,
              ]}
            >
              تجديد عيادات
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedType === "store_renewal" && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedType("store_renewal")}
          >
            <Store
              size={16}
              color={
                selectedType === "store_renewal" ? COLORS.white : COLORS.success
              }
            />
            <Text
              style={[
                styles.filterTabText,
                selectedType === "store_renewal" && styles.activeFilterTabText,
              ]}
            >
              تجديد متاجر
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedType === "lost_pets" && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedType("lost_pets")}
          >
            <AlertTriangle
              size={16}
              color={selectedType === "lost_pets" ? COLORS.white : "#E74C3C"}
            />
            <Text
              style={[
                styles.filterTabText,
                selectedType === "lost_pets" && styles.activeFilterTabText,
              ]}
            >
              مفقودة
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedType === "breeding_pets" && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedType("breeding_pets")}
          >
            <Heart
              size={16}
              color={
                selectedType === "breeding_pets" ? COLORS.white : "#9B59B6"
              }
            />
            <Text
              style={[
                styles.filterTabText,
                selectedType === "breeding_pets" && styles.activeFilterTabText,
              ]}
            >
              تزاوج
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              selectedType === "pet_management" && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedType("pet_management")}
          >
            <UserCheck
              size={16}
              color={
                selectedType === "pet_management" ? COLORS.white : "#3498DB"
              }
            />
            <Text
              style={[
                styles.filterTabText,
                selectedType === "pet_management" && styles.activeFilterTabText,
              ]}
            >
              إدارة الحيوانات
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredApprovals && filteredApprovals.length > 0 ? (
          filteredApprovals.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.requestInfo}>
                  {getRequestTypeIcon(request.requestType)}
                  <View style={styles.requestContent}>
                    <Text style={styles.requestTitle}>{request.title}</Text>
                    <Text style={styles.requestType}>
                      {getRequestTypeText(request.requestType)}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestMeta}>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(request.priority) },
                    ]}
                  >
                    <Text style={styles.priorityText}>{request.priority}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.requestDetails}>
                <View style={styles.detailItem}>
                  <User size={14} color={COLORS.gray} />
                  <Text style={styles.detailText}>{request.requesterName}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Mail size={14} color={COLORS.gray} />
                  <Text style={styles.detailText}>
                    {request.requesterEmail}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Calendar size={14} color={COLORS.gray} />
                  <Text style={styles.detailText}>
                    {formatDate(request.createdAt)}
                  </Text>
                </View>
              </View>

              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => {
                    setSelectedRequest(request as ApprovalRequest);
                    setShowDetailsModal(true);
                  }}
                >
                  <Eye size={16} color={COLORS.primary} />
                  <Text style={styles.viewButtonText}>عرض التفاصيل</Text>
                </TouchableOpacity>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.quickApproveButton,
                      approveMutation.isPending && { opacity: 0.6 },
                    ]}
                    onPress={() => handleApprove(request as ApprovalRequest)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle size={18} color={COLORS.white} />
                    <Text style={styles.quickButtonText}>تعيين</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.quickRejectButton,
                      rejectMutation.isPending && { opacity: 0.6 },
                    ]}
                    onPress={() => handleReject(request as ApprovalRequest)}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle size={18} color={COLORS.white} />
                    <Text style={styles.quickButtonText}>إلغاء</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <FileText size={48} color={COLORS.gray} />
            <Text style={styles.emptyText}>لا توجد طلبات موافقة</Text>
            <Text style={styles.emptySubtext}>
              {selectedType === "all"
                ? "لا توجد طلبات موافقة معلقة حالياً"
                : selectedType === "clinic_renewal"
                ? "لا توجد عيادات تحتاج تجديد حالياً"
                : selectedType === "store_renewal"
                ? "لا توجد متاجر تحتاج تجديد حالياً"
                : `لا توجد طلبات ${getRequestTypeText(selectedType)} معلقة`}
            </Text>
          </View>
        )}
      </ScrollView>

      {renderDetailsModal()}
      {renderRejectModal()}
      {renderApprovalModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingSpinner: {
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
  },
  loadingSubtext: {
    fontSize: 14,
    color: COLORS.gray,
  },
  filterContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    gap: 6,
  },
  activeFilterTab: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: "500",
  },
  activeFilterTabText: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  requestInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  requestContent: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  requestType: {
    fontSize: 14,
    color: COLORS.black,
  },
  requestMeta: {
    alignItems: "flex-end",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "500",
  },
  requestDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.black,
  },
  requestActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
    marginTop: 4,
  },
  quickApproveButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickRejectButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.gray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: "95%",
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    maxHeight: 400,
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: "500",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.black,
    flex: 2,
    textAlign: "right",
  },
  documentGroup: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.black,
    marginBottom: 4,
  },
  documentNote: {
    fontSize: 12,
    color: COLORS.black,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
  rejectModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: "90%",
    maxWidth: 400,
  },
  rejectModalBody: {
    padding: 20,
  },
  rejectLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.black,
    marginBottom: 12,
  },
  rejectInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.black,
    minHeight: 100,
    textAlign: "right",
  },
  rejectModalActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray,
  },
  paymentStatusContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentStatusInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  paymentStatusLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.black,
  },
  paymentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  paymentStatusText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "600",
  },
  paymentReceiptContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 6,
  },
  paymentReceiptText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
  documentList: {
    marginTop: 8,
    gap: 4,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  documentName: {
    fontSize: 12,
    color: COLORS.black,
    flex: 1,
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  documentBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: "auto",
  },
  documentBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: "600",
  },
  documentIcon: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentType: {
    fontSize: 10,
    color: COLORS.black,
    marginTop: 2,
  },
  paymentIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  paymentIndicator: {
    alignItems: "center",
    gap: 6,
  },
  paymentIndicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  paymentIndicatorText: {
    fontSize: 12,
    fontWeight: "500",
  },
  priceText: {
    fontWeight: "600",
    color: COLORS.primary,
  },
  transactionId: {
    fontFamily: "monospace",
    fontSize: 12,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  paymentWarningText: {
    fontSize: 12,
    color: "#856404",
    fontWeight: "500",
  },
  paymentSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: "#D4EDDA",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  paymentSuccessText: {
    fontSize: 12,
    color: "#155724",
    fontWeight: "500",
  },
  sectionHeaderWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  documentsStatusBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: "auto",
  },
  documentsStatusText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: "600",
  },
  documentIconContainer: {
    backgroundColor: "#E67E22",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  documentTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  documentSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  documentPreviewContainer: {
    marginTop: 12,
  },
  documentCount: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 8,
    fontWeight: "500",
  },
  documentImageGrid: {
    gap: 8,
  },
  documentImageItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  documentImageContainer: {
    alignItems: "center",
    marginRight: 12,
  },
  documentImageLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 4,
  },
  documentImageInfo: {
    flex: 1,
  },
  documentImageName: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: "500",
  },
  documentImageType: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 2,
  },
  viewImageButton: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 6,
  },
  documentFileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  documentFileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  documentFileInfo: {
    flex: 1,
  },
  documentFileName: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: "500",
  },
  documentFileType: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 2,
  },
  documentFileActions: {
    flexDirection: "row",
    gap: 8,
  },
  downloadButton: {
    padding: 6,
    backgroundColor: COLORS.background,
    borderRadius: 4,
  },
  viewFileButton: {
    padding: 6,
    backgroundColor: COLORS.background,
    borderRadius: 4,
  },
  paymentMainStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: "auto",
  },
  paymentMainStatusText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "600",
  },
  paymentRequirementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  paymentRequirementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  paymentRequirementIcon: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentRequirementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
  },
  paymentRequirementDetails: {
    gap: 8,
  },
  paymentRequirementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentRequirementLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  paymentRequirementAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  paymentStatusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  paymentStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  paymentStatusIndicatorText: {
    fontSize: 14,
    fontWeight: "500",
  },
  paymentDetailsCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  paymentDetailsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 12,
  },
  paymentDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  paymentDetailLabel: {
    fontSize: 12,
    color: COLORS.gray,
    flex: 1,
  },
  paymentDetailValue: {
    fontSize: 12,
    color: COLORS.black,
    flex: 2,
    textAlign: "right",
  },
  paymentReceiptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  paymentReceiptButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "500",
  },
  paymentAlert: {
    flexDirection: "row",
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.warning,
    marginTop: 12,
  },
  paymentAlertIcon: {
    marginRight: 12,
  },
  paymentAlertContent: {
    flex: 1,
  },
  paymentAlertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.warning,
    marginBottom: 4,
  },
  paymentAlertText: {
    fontSize: 12,
    color: "#856404",
    lineHeight: 16,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.black,
    textAlign: "right",
  },
  dateNote: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});
