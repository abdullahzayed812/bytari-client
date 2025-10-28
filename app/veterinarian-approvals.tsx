import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { ArrowLeft, Calendar, Check, Eye, FileText, Mail, MapPin, Phone, X } from "lucide-react-native";
import { useApp } from "@/providers/AppProvider";

interface VeterinarianApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  gender: "male" | "female";
  veterinarianType: "student" | "veterinarian";
  idFrontImage?: string;
  idBackImage?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export default function VeterinarianApprovalsScreen() {
  const router = useRouter();
  const { user } = useApp();
  const [selectedApplication, setSelectedApplication] = useState<VeterinarianApplication | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const {
    data: applicationsData,
    isLoading,
    error,
    refetch,
  } = useQuery(trpc.admin.veterinarianApprovals.getPendingApplications.queryOptions({ adminId: user?.id ? Number(user.id) : 0 }));
  const applications = useMemo(() => (applicationsData as any)?.applications, [applicationsData]);

  const approveMutation = useMutation(trpc.admin.veterinarianApprovals.approveApplication.mutationOptions());
  const rejectMutation = useMutation(trpc.admin.veterinarianApprovals.rejectApplication.mutationOptions());

  const handleApprove = (applicationId: string) => {
    Alert.alert("تأكيد الموافقة", "هل أنت متأكد من الموافقة على هذا الطلب؟ سيتم إرسال إشعار للمستخدم.", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "موافقة",
        style: "default",
        onPress: () => {
          approveMutation.mutate(
            { applicationId: applicationId, adminId: user?.id ? Number(user.id) : 0 },
            {
              onSuccess: () => {
                Alert.alert("تم بنجاح", "تم الموافقة على الطلب وإرسال إشعار للمستخدم.");
                refetch();
                setShowDetails(false);
              },
              onError: (error) => {
                Alert.alert("خطأ", error.message || "فشل في الموافقة على الطلب");
              },
            }
          );
        },
      },
    ]);
  };

  const handleReject = (applicationId: string) => {
    Alert.prompt(
      "رفض الطلب",
      "يرجى إدخال سبب الرفض (اختياري):",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "رفض",
          style: "destructive",
          onPress: (reason) => {
            rejectMutation.mutate(
              { applicationId: applicationId, reason: reason || "", adminId: user?.id ? Number(user.id) : 0 },
              {
                onSuccess: () => {
                  Alert.alert("تم بنجاح", "تم رفض الطلب وإرسال إشعار للمستخدم.");
                  refetch();
                  setShowDetails(false);
                },
                onError: (error) => {
                  Alert.alert("خطأ", error.message || "فشل في رفض الطلب");
                },
              }
            );
          },
        },
      ],
      "plain-text",
      "",
      "default"
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FF9800";
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
        return "مُوافق عليه";
      case "rejected":
        return "مرفوض";
      default:
        return status;
    }
  };

  const getGenderIcon = (gender: "male" | "female") => {
    return gender === "female"
      ? "https://r2-pub.rork.com/generated-images/70508295-d0f9-4049-8899-830c9db0ac82.png"
      : "https://r2-pub.rork.com/generated-images/f12a7eec-1aa3-414d-a6ca-79ff1c250b2f.png";
  };

  const pendingApplications = applications?.filter((app) => app?.status === "pending");
  const processedApplications = applications?.filter((app) => app?.status !== "pending");

  if (showDetails && selectedApplication) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => setShowDetails(false)}>
            <ArrowLeft size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفاصيل الطلب</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.detailsCard}>
            <View style={styles.profileSection}>
              <Image source={{ uri: getGenderIcon(selectedApplication.gender) }} style={styles.profileImage} />
              <View style={styles.profileInfo}>
                <Text style={styles.applicantName}>{selectedApplication.name}</Text>
                <Text style={styles.applicantType}>
                  {selectedApplication.veterinarianType === "student" ? "طالب في كلية الطب البيطري" : "طبيب بيطري"}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedApplication.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(selectedApplication.status)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Mail size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>{selectedApplication.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Phone size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>{selectedApplication.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <MapPin size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>
                  {selectedApplication.province}, {selectedApplication.city}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Calendar size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>تاريخ التقديم: {formatDate(selectedApplication.submittedAt)}</Text>
              </View>
            </View>

            {selectedApplication.idFrontImage && selectedApplication.idBackImage && (
              <View style={styles.documentsSection}>
                <Text style={styles.sectionTitle}>المستندات المرفقة</Text>
                <View style={styles.documentsGrid}>
                  <View style={styles.documentItem}>
                    <Text style={styles.documentLabel}>صورة وجه الهوية</Text>
                    <Image
                      source={{ uri: selectedApplication.idFrontImage }}
                      style={styles.documentImage}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.documentItem}>
                    <Text style={styles.documentLabel}>صورة ظهر الهوية</Text>
                    <Image
                      source={{ uri: selectedApplication.idBackImage }}
                      style={styles.documentImage}
                      resizeMode="cover"
                    />
                  </View>
                </View>
              </View>
            )}

            {selectedApplication.status === "pending" && (
              <View style={styles.actionsSection}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprove(selectedApplication.id)}
                >
                  <Check size={20} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>موافقة</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleReject(selectedApplication.id)}
                >
                  <X size={20} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>رفض</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>موافقات الأطباء البيطريين</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Pending Applications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الطلبات المعلقة ({pendingApplications?.length})</Text>
          {pendingApplications?.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyStateText}>لا توجد طلبات معلقة</Text>
            </View>
          ) : (
            pendingApplications?.map((application) => (
              <TouchableOpacity
                key={application.id}
                style={styles.applicationCard}
                onPress={() => {
                  setSelectedApplication(application);
                  setShowDetails(true);
                }}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.applicantInfo}>
                    <Image source={{ uri: getGenderIcon(application.gender) }} style={styles.avatar} />
                    <View style={styles.applicantDetails}>
                      <Text style={styles.applicantName}>{application.name}</Text>
                      <Text style={styles.applicantEmail}>{application.email}</Text>
                      <Text style={styles.applicantType}>
                        {application.veterinarianType === "student" ? "طالب في كلية الطب البيطري" : "طبيب بيطري"}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(application.status)}</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.submissionDate}>تاريخ التقديم: {formatDate(application.submittedAt)}</Text>
                  <View style={styles.quickActions}>
                    <TouchableOpacity
                      style={[styles.quickActionButton, styles.approveQuickButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleApprove(application.id);
                      }}
                    >
                      <Check size={16} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.quickActionButton, styles.rejectQuickButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleReject(application.id);
                      }}
                    >
                      <X size={16} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.quickActionButton, styles.viewQuickButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        setSelectedApplication(application);
                        setShowDetails(true);
                      }}
                    >
                      <Eye size={16} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Processed Applications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الطلبات المُعالجة ({processedApplications?.length})</Text>
          {processedApplications?.map((application) => (
            <TouchableOpacity
              key={application.id}
              style={[styles.applicationCard, styles.processedCard]}
              onPress={() => {
                setSelectedApplication(application);
                setShowDetails(true);
              }}
            >
              <View style={styles.cardHeader}>
                <View style={styles.applicantInfo}>
                  <Image source={{ uri: getGenderIcon(application.gender) }} style={styles.avatar} />
                  <View style={styles.applicantDetails}>
                    <Text style={styles.applicantName}>{application.name}</Text>
                    <Text style={styles.applicantEmail}>{application.email}</Text>
                    <Text style={styles.applicantType}>
                      {application.veterinarianType === "student" ? "طالب في كلية الطب البيطري" : "طبيب بيطري"}
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(application.status)}</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.submissionDate}>تاريخ التقديم: {formatDate(application.submittedAt)}</Text>
                <TouchableOpacity
                  style={[styles.quickActionButton, styles.viewQuickButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedApplication(application);
                    setShowDetails(true);
                  }}
                >
                  <Eye size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "right",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 12,
    textAlign: "center",
  },
  applicationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  processedCard: {
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  applicantInfo: {
    flexDirection: "row",
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  applicantDetails: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 4,
  },
  applicantEmail: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "right",
    marginBottom: 2,
  },
  applicantType: {
    fontSize: 12,
    color: COLORS.primary,
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.white,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  submissionDate: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
  },
  quickActions: {
    flexDirection: "row",
    gap: 8,
  },
  quickActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  approveQuickButton: {
    backgroundColor: "#4CAF50",
  },
  rejectQuickButton: {
    backgroundColor: "#F44336",
  },
  viewQuickButton: {
    backgroundColor: COLORS.primary,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 12,
    textAlign: "right",
    flex: 1,
  },
  documentsSection: {
    marginBottom: 24,
  },
  documentsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  documentItem: {
    flex: 1,
  },
  documentLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "center",
  },
  documentImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  actionsSection: {
    flexDirection: "row",
    gap: 12,
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
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#F44336",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
});
