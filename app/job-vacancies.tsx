import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Edit3,
  FileText,
  UserPlus,
  Shield,
} from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { trpc } from "../lib/trpc";
import { useQuery } from "@tanstack/react-query";

interface JobVacancy {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  postedDate: string;
  description: string;
  applicationsCount: number;
}

export default function JobVacanciesScreen() {
  const { isSuperAdmin, user } = useApp();
  const router = useRouter();

  // Fetch jobs using tRPC
  const {
    data: jobsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    trpc.admin.jobs.getAllJobs.queryOptions({
      adminId: Number(user?.id),
      limit: 50,
      offset: 0,
      status: "active",
    })
  );

  const handleApplyNow = (job: JobVacancy) => {
    // Navigate to job application page with job details
    router.push({
      pathname: "/job-application",
      params: {
        jobId: job.id.toString(),
        jobTitle: encodeURIComponent(job.title),
      },
    });
  };

  const renderJobCard = (job: any) => {
    // Format posted date
    const postedDate = new Date(job.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const postedText =
      diffDays === 0
        ? "اليوم"
        : diffDays === 1
        ? "منذ يوم"
        : diffDays < 7
        ? `منذ ${diffDays} أيام`
        : diffDays < 30
        ? `منذ ${Math.floor(diffDays / 7)} أسابيع`
        : `منذ ${Math.floor(diffDays / 30)} شهور`;

    // Map jobType to Arabic
    const jobTypeMap: Record<string, string> = {
      "full-time": "دوام كامل",
      "part-time": "دوام جزئي",
      contract: "عقد",
      internship: "تدريب",
    };

    return (
      <TouchableOpacity key={job.id} style={styles.jobCard} activeOpacity={0.8}>
        <View style={styles.jobHeader}>
          <View style={styles.jobTitleContainer}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.companyName}>{job.postedBy}</Text>
          </View>
          <View style={styles.jobIcon}>
            <Briefcase size={24} color={COLORS.primary} />
          </View>
        </View>

        <View style={styles.jobDetails}>
          <View style={styles.detailRow}>
            <MapPin size={16} color={COLORS.darkGray} />
            <Text style={styles.detailText}>{job.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={16} color={COLORS.darkGray} />
            <Text style={styles.detailText}>{jobTypeMap[job.jobType] || job.jobType}</Text>
          </View>
          {job.salary && (
            <View style={styles.detailRow}>
              <DollarSign size={16} color={COLORS.darkGray} />
              <Text style={styles.detailText}>{job.salary}</Text>
            </View>
          )}
        </View>

        <Text style={styles.jobDescription} numberOfLines={3}>
          {job.description}
        </Text>

        <View style={styles.jobFooter}>
          <Text style={styles.postedDate}>{postedText}</Text>
          <View style={styles.footerRight}>
            {job.applicationsCount > 0 && <Text style={styles.applicationsCount}>{job.applicationsCount} متقدم</Text>}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() =>
                handleApplyNow({
                  id: job.id,
                  title: job.title,
                  company: job.postedBy,
                  location: job.location,
                  type: job.jobType,
                  salary: job.salary || "",
                  postedDate: postedText,
                  description: job.description,
                  applicationsCount: job.applicationsCount,
                })
              }
            >
              <Text style={styles.applyButtonText}>تقدم الآن</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "الوظائف الشاغرة",
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
          // headerRight: () =>
          //   isSuperAdmin ? (
          //     <View style={styles.headerActions}>
          //       <TouchableOpacity
          //         onPress={() => {
          //           router.push("/admin-content-manager?type=jobs");
          //         }}
          //         style={[styles.headerButton, styles.addButton]}
          //       >
          //         <Plus size={20} color={COLORS.white} />
          //       </TouchableOpacity>
          //       <TouchableOpacity
          //         onPress={() => {
          //           router.push("/admin-content-manager?type=jobs");
          //         }}
          //         style={[styles.headerButton, styles.editButton]}
          //       >
          //         <Edit3 size={20} color={COLORS.white} />
          //       </TouchableOpacity>
          //     </View>
          //   ) : null,
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>الوظائف المتاحة</Text>
          <Text style={styles.headerSubtitle}>اكتشف الفرص الوظيفية في المجال البيطري</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/post-job-vacancy")}>
            <FileText size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>إعلان وظيفة</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={[styles.actionButton, styles.applicationButton]}
            onPress={() => router.push("/job-application")}
          >
            <UserPlus size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>تقديم طلب توظيف</Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={[styles.actionButton, styles.supervisionButton]}
            onPress={() => router.push("/field-supervision-request")}
          >
            <Shield size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>طلب إشراف حقول</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>جاري تحميل الوظائف...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>حدث خطأ في تحميل الوظائف</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
            </TouchableOpacity>
          </View>
        ) : jobsData?.jobs && jobsData.jobs.length > 0 ? (
          <View style={styles.jobsList}>{jobsData.jobs.map(renderJobCard)}</View>
        ) : (
          <View style={styles.emptyContainer}>
            <Briefcase size={64} color={COLORS.darkGray} />
            <Text style={styles.emptyText}>لا توجد وظائف متاحة حالياً</Text>
            <Text style={styles.emptySubtext}>تحقق مرة أخرى قريباً</Text>
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
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  jobsList: {
    gap: 16,
  },
  jobCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  jobTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  jobIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  jobDetails: {
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  jobDescription: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
    marginBottom: 16,
  },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postedDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  applicationsCount: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: 14,
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
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  applicationButton: {
    backgroundColor: "#28a745",
  },
  supervisionButton: {
    backgroundColor: "#6f42c1",
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
});
