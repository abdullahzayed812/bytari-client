import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useMemo, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { ArrowLeft, Briefcase, Check, Clock, Eye, MapPin, Search, Shield, UserPlus, X } from "lucide-react-native";
import { COLORS } from "@/constants/colors";
import { useApp } from "@/providers/AppProvider";

interface JobRequest {
  id: string;
  type: "job_posting" | "job_application" | "field_supervision";
  title: string;
  applicantName: string;
  submittedDate: string;
  status: "pending" | "approved" | "rejected";
  location: string;
  details: any;
}

export default function JobManagementScreen() {
  const router = useRouter();
  const { user } = useApp();
  const [selectedTab, setSelectedTab] = useState<"all" | "job_posting" | "job_application" | "field_supervision">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data, isLoading, error, refetch } = useQuery(trpc.admin.jobs.getAllJobs.queryOptions({ adminId: user?.id ? Number(user.id) : 0 }));
  const requests = useMemo(() => (data as any)?.jobs, [data]);

  const approveMutation = useMutation(trpc.admin.jobs.approve.mutationOptions());
  const rejectMutation = useMutation(trpc.admin.jobs.reject.mutationOptions());

  const handleApprove = (id: string) => {
    Alert.alert("تأكيد الموافقة", "هل أنت متأكد من الموافقة على هذا الطلب؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "موافق",
        onPress: () => {
          approveMutation.mutate(
            { id },
            {
              onSuccess: () => {
                Alert.alert("تم", "تم الموافقة على الطلب بنجاح");
                refetch();
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

  const handleReject = (id: string) => {
    Alert.alert("تأكيد الرفض", "هل أنت متأكد من رفض هذا الطلب؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "رفض",
        style: "destructive",
        onPress: () => {
          rejectMutation.mutate(
            { id },
            {
              onSuccess: () => {
                Alert.alert("تم", "تم رفض الطلب");
                refetch();
              },
              onError: (error) => {
                Alert.alert("خطأ", error.message || "فشل في رفض الطلب");
              },
            }
          );
        },
      },
    ]);
  };

  const getFilteredRequests = () => {
    let filtered = selectedTab === "all" ? requests : requests.filter((req) => req.type === selectedTab);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.title.toLowerCase().includes(query) ||
          req.applicantName.toLowerCase().includes(query) ||
          req.location.toLowerCase().includes(query) ||
          (req.details.company && req.details.company.toLowerCase().includes(query)) ||
          (req.details.position && req.details.position.toLowerCase().includes(query)) ||
          (req.details.farmType && req.details.farmType.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "job_posting":
        return <Briefcase size={20} color={COLORS.primary} />;
      case "job_application":
        return <UserPlus size={20} color={"#28a745"} />;
      case "field_supervision":
        return <Shield size={20} color={"#6f42c1"} />;
      default:
        return <Briefcase size={20} color={COLORS.primary} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "job_posting":
        return "إعلان وظيفة";
      case "job_application":
        return "طلب توظيف";
      case "field_supervision":
        return "إشراف حقول";
      default:
        return "غير محدد";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#ffc107";
      case "approved":
        return "#28a745";
      case "rejected":
        return "#dc3545";
      default:
        return COLORS.darkGray;
    }
  };

  const getStatusLabel = (status: string, type: string) => {
    if (type === "job_posting") {
      switch (status) {
        case "pending":
          return "قيد المراجعة";
        case "approved":
          return "منشور";
        case "rejected":
          return "مرفوض";
        default:
          return "غير محدد";
      }
    } else {
      switch (status) {
        case "pending":
          return "قيد المراجعة";
        case "approved":
          return "تم التوظيف";
        case "rejected":
          return "لم نجد له وظيفة";
        default:
          return "غير محدد";
      }
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "إدارة الوظائف",
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.darkGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث في الطلبات والمواقع..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.lightGray}
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "all" && styles.activeTab]}
            onPress={() => setSelectedTab("all")}
          >
            <Text style={[styles.tabText, selectedTab === "all" && styles.activeTabText]}>الكل</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === "job_posting" && styles.activeTab]}
            onPress={() => setSelectedTab("job_posting")}
          >
            <Briefcase size={16} color={selectedTab === "job_posting" ? COLORS.white : COLORS.darkGray} />
            <Text style={[styles.tabText, selectedTab === "job_posting" && styles.activeTabText]}>إعلانات الوظائف</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === "job_application" && styles.activeTab]}
            onPress={() => setSelectedTab("job_application")}
          >
            <UserPlus size={16} color={selectedTab === "job_application" ? COLORS.white : COLORS.darkGray} />
            <Text style={[styles.tabText, selectedTab === "job_application" && styles.activeTabText]}>
              طلبات التوظيف
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === "field_supervision" && styles.activeTab]}
            onPress={() => setSelectedTab("field_supervision")}
          >
            <Shield size={16} color={selectedTab === "field_supervision" ? COLORS.white : COLORS.darkGray} />
            <Text style={[styles.tabText, selectedTab === "field_supervision" && styles.activeTabText]}>
              إشراف الحقول
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {getFilteredRequests()?.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={styles.requestInfo}>
                <View style={styles.typeContainer}>
                  {getTypeIcon(request.type)}
                  <Text style={styles.typeLabel}>{getTypeLabel(request.type)}</Text>
                </View>
                <Text style={styles.requestTitle}>{request.title}</Text>
                <TouchableOpacity
                  onPress={() => router.push(`/user-profile?userName=${encodeURIComponent(request.applicantName)}`)}
                >
                  {" "}
                  <Text style={styles.applicantNameClickable}>المتقدم: {request.applicantName}</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                <Text style={styles.statusText}>{getStatusLabel(request.status, request.type)}</Text>
              </View>
            </View>

            <View style={styles.locationContainer}>
              <MapPin size={16} color={COLORS.primary} />
              <Text style={styles.locationText}>{request.location}</Text>
            </View>

            <View style={styles.requestDetails}>
              {request.type === "job_posting" && (
                <>
                  <Text style={styles.detailText}>الشركة: {request.details.company}</Text>
                  <Text style={styles.detailText}>الراتب: {request.details.salary}</Text>
                  {request.details.description && (
                    <Text style={styles.detailText}>الوصف: {request.details.description}</Text>
                  )}
                </>
              )}

              {request.type === "job_application" && (
                <>
                  <Text style={styles.detailText}>الوظيفة: {request.details.position}</Text>
                  <Text style={styles.detailText}>الخبرة: {request.details.experience}</Text>
                  <Text style={styles.detailText}>التعليم: {request.details.education}</Text>
                  {request.status !== "pending" && request.details.employmentStatus && (
                    <Text
                      style={[
                        styles.detailText,
                        { fontWeight: "bold", color: request.status === "approved" ? "#28a745" : "#dc3545" },
                      ]}
                    >
                      الحالة: {request.details.employmentStatus}
                    </Text>
                  )}
                </>
              )}

              {request.type === "field_supervision" && (
                <>
                  <Text style={styles.detailText}>نوع المزرعة: {request.details.farmType}</Text>
                  <Text style={styles.detailText}>عدد الحيوانات: {request.details.animalCount}</Text>
                  {request.status !== "pending" && request.details.employmentStatus && (
                    <Text
                      style={[
                        styles.detailText,
                        { fontWeight: "bold", color: request.status === "approved" ? "#28a745" : "#dc3545" },
                      ]}
                    >
                      الحالة: {request.details.employmentStatus}
                    </Text>
                  )}
                </>
              )}
            </View>

            <View style={styles.requestFooter}>
              <View style={styles.dateContainer}>
                <Clock size={14} color={COLORS.darkGray} />
                <Text style={styles.dateText}>{request.submittedDate}</Text>
              </View>

              {request.status === "pending" && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => Alert.alert("عرض التفاصيل", "سيتم فتح صفحة التفاصيل الكاملة")}
                  >
                    <Eye size={16} color={COLORS.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.approveButton} onPress={() => handleApprove(request.id)}>
                    <Check size={16} color={COLORS.white} />
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(request.id)}>
                    <X size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}

        {getFilteredRequests()?.length === 0 && (
          <View style={styles.emptyState}>
            <Briefcase size={48} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>لا توجد طلبات في هذا القسم</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
    textAlign: "right",
  },
  backButton: {
    padding: 8,
  },
  tabsContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    gap: 6,
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
  },
  scrollContent: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    marginRight: 12,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  applicantName: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  applicantNameClickable: {
    fontSize: 14,
    color: COLORS.primary,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  requestDetails: {
    marginBottom: 12,
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.black,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  viewButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#F0F9FF",
  },
  approveButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#28a745",
  },
  rejectButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#dc3545",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.lightGray,
    marginTop: 16,
  },
});
