import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Hospital,
  MapPin,
  Plus,
  Edit,
  Settings,
  Users,
  FileText,
  BarChart3,
  Bell,
  Eye,
  Trash2,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "../lib/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function HospitalsManagementDashboardScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"overview" | "hospitals" | "announcements">("overview");

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery(trpc.hospitals.getManagementDashboard.queryOptions());
  const {
    data: hospitalsData,
    isLoading: hospitalsLoading,
    error: hospitalsError,
    refetch: refetchHospitals,
  } = useQuery(trpc.hospitals.getAll.queryOptions({}));
  const {
    data: announcements,
    isLoading: announcementsLoading,
    error: announcementsError,
  } = useQuery(trpc.announcements.getManagementList.queryOptions({ limit: 10, offset: 0 }));

  const deleteHospitalMutation = useMutation(trpc.hospitals.delete.mutationOptions());

  const handleEditHospital = (hospitalId: string) => {
    router.push(`/edit-hospital?id=${hospitalId}`);
  };

  const handleAddHospital = () => {
    router.push("/add-hospital" as any);
  };

  const handleManageAnnouncements = (hospitalId: string) => {
    router.push(`/manage-hospital-announcements?hospitalId=${hospitalId}` as any);
  };

  const handleViewHospital = (hospitalId: string) => {
    router.push(`/hospital-details?id=${hospitalId}` as any);
  };

  const handleDeleteHospital = (hospitalId: string, hospitalName: string) => {
    Alert.alert("تأكيد الحذف", `هل أنت متأكد من حذف ${hospitalName}؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHospitalMutation.mutateAsync({ id: hospitalId });
            Alert.alert("تم", "تم حذف المستشفى بنجاح");
            refetchHospitals();
          } catch (error) {
            Alert.alert("خطأ", "حدث خطأ أثناء حذف المستشفى");
          }
        },
      },
    ]);
  };

  const renderOverviewTab = () => {
    if (dashboardLoading) return <ActivityIndicator />;
    if (dashboardError) return <Text>Error loading dashboard data.</Text>;

    return (
      <View style={styles.tabContent}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: "#0EA5E9" }]}>
            <Hospital size={24} color={COLORS.white} />
            <Text style={styles.statNumber}>{dashboardData?.totalHospitals || 0}</Text>
            <Text style={styles.statLabel}>إجمالي المستشفيات</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#10B981" }]}>
            <FileText size={24} color={COLORS.white} />
            <Text style={styles.statNumber}>{dashboardData?.totalAnnouncements || 0}</Text>
            <Text style={styles.statLabel}>إجمالي الإعلانات</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#F59E0B" }]}>
            <Users size={24} color={COLORS.white} />
            <Text style={styles.statNumber}>{dashboardData?.totalFollowers || 0}</Text>
            <Text style={styles.statLabel}>إجمالي المتابعين</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: "#EF4444" }]}>
            <BarChart3 size={24} color={COLORS.white} />
            <Text style={styles.statNumber}>{dashboardData?.activeHospitals || 0}</Text>
            <Text style={styles.statLabel}>مستشفى نشط</Text>
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: "#0EA5E9" }]}
              onPress={handleAddHospital}
            >
              <Plus size={20} color={COLORS.white} />
              <Text style={styles.quickActionText}>إضافة مستشفى</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: "#10B981" }]}
              onPress={() => handleManageAnnouncements("all")}
            >
              <FileText size={20} color={COLORS.white} />
              <Text style={styles.quickActionText}>إدارة الإعلانات</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: "#F59E0B" }]}
              onPress={() => router.push("/hospitals-settings" as any)}
            >
              <Settings size={20} color={COLORS.white} />
              <Text style={styles.quickActionText}>إعدادات النظام</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: "#8B5CF6" }]}
              onPress={() => router.push("/hospitals-analytics" as any)}
            >
              <BarChart3 size={20} color={COLORS.white} />
              <Text style={styles.quickActionText}>التحليلات</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderHospitalsTab = () => {
    if (hospitalsLoading) return <ActivityIndicator />;
    if (hospitalsError) return <Text>Error loading hospitals.</Text>;

    return (
      <View style={styles.tabContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>قائمة المستشفيات</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddHospital}>
            <Plus size={16} color={COLORS.white} />
            <Text style={styles.addButtonText}>إضافة</Text>
          </TouchableOpacity>
        </View>

        {hospitalsData?.hospitals?.map((hospital) => (
          <View key={hospital.id} style={styles.hospitalCard}>
            <View style={styles.hospitalHeader}>
              <View style={styles.hospitalInfo}>
                <Text style={styles.hospitalName}>{hospital.name}</Text>
                <View style={styles.hospitalMeta}>
                  <MapPin size={14} color={COLORS.darkGray} />
                  <Text style={styles.hospitalLocation}>{hospital.location}</Text>
                  {hospital.isMain && (
                    <View style={styles.mainBadge}>
                      <Text style={styles.mainBadgeText}>رئيسي</Text>
                    </View>
                  )}
                </View>
              </View>

              <View
                style={[styles.statusBadge, { backgroundColor: hospital.status === "active" ? "#10B981" : "#EF4444" }]}
              >
                <Text style={styles.statusText}>{hospital.status === "active" ? "نشط" : "غير نشط"}</Text>
              </View>
            </View>

            <View style={styles.hospitalStats}>
              <View style={styles.statItem}>
                <FileText size={16} color="#0EA5E9" />
                <Text style={styles.statItemText}>{hospital.announcementsCount} إعلان</Text>
              </View>

              <View style={styles.statItem}>
                <Users size={16} color="#10B981" />
                <Text style={styles.statItemText}>{hospital.followersCount} متابع</Text>
              </View>
            </View>

            <View style={styles.hospitalActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#0EA5E9" }]}
                onPress={() => handleViewHospital(hospital.id)}
              >
                <Eye size={16} color={COLORS.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#F59E0B" }]}
                onPress={() => handleEditHospital(hospital.id)}
              >
                <Edit size={16} color={COLORS.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#10B981" }]}
                onPress={() => handleManageAnnouncements(hospital.id)}
              >
                <FileText size={16} color={COLORS.white} />
              </TouchableOpacity>

              {!hospital.isMain && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#EF4444" }]}
                  onPress={() => handleDeleteHospital(hospital.id, hospital.name)}
                  disabled={deleteHospitalMutation.isPending}
                >
                  <Trash2 size={16} color={COLORS.white} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderAnnouncementsTab = () => {
    if (announcementsLoading) return <ActivityIndicator />;
    if (announcementsError) return <Text>Error loading announcements.</Text>;

    return (
      <View style={styles.tabContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>إدارة الإعلانات</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push("/add-hospital-announcement" as any)}>
            <Plus size={16} color={COLORS.white} />
            <Text style={styles.addButtonText}>إعلان جديد</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.announcementsList}>
          {announcements?.map((announcement) => (
            <View style={styles.announcementCard} key={announcement.id}>
              <View style={styles.announcementHeader}>
                <View style={[styles.typeBadge, { backgroundColor: "#10B981" }]}>
                  <Text style={styles.typeBadgeText}>{announcement.type}</Text>
                </View>
                <Text style={styles.announcementDate}>{new Date(announcement.createdAt).toLocaleDateString()}</Text>
              </View>

              <Text style={styles.announcementTitle}>{announcement.title}</Text>
              <Text style={styles.announcementHospital}>
                {hospitals?.find((h) => h.id === announcement.hospitalId)?.name}
              </Text>

              <View style={styles.announcementActions}>
                <TouchableOpacity style={styles.announcementActionButton}>
                  <Eye size={14} color="#0EA5E9" />
                  <Text style={styles.announcementActionText}>عرض</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.announcementActionButton}>
                  <Edit size={14} color="#F59E0B" />
                  <Text style={styles.announcementActionText}>تعديل</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowRight size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إدارة المستشفيات البيطرية</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "overview" && styles.activeTab]}
          onPress={() => setSelectedTab("overview")}
        >
          <BarChart3 size={18} color={selectedTab === "overview" ? COLORS.white : "#0EA5E9"} />
          <Text style={[styles.tabText, selectedTab === "overview" && styles.activeTabText]}>نظرة عامة</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === "hospitals" && styles.activeTab]}
          onPress={() => setSelectedTab("hospitals")}
        >
          <Hospital size={18} color={selectedTab === "hospitals" ? COLORS.white : "#0EA5E9"} />
          <Text style={[styles.tabText, selectedTab === "hospitals" && styles.activeTabText]}>المستشفيات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === "announcements" && styles.activeTab]}
          onPress={() => setSelectedTab("announcements")}
        >
          <FileText size={18} color={selectedTab === "announcements" ? COLORS.white : "#0EA5E9"} />
          <Text style={[styles.tabText, selectedTab === "announcements" && styles.activeTabText]}>الإعلانات</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === "overview" && renderOverviewTab()}
        {selectedTab === "hospitals" && renderHospitalsTab()}
        {selectedTab === "announcements" && renderAnnouncementsTab()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    flex: 1,
    textAlign: "center",
  },
  notificationButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#0EA5E9",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0EA5E9",
  },
  activeTabText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "47%",
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
    color: COLORS.white,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.white,
    textAlign: "center",
    marginTop: 4,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "right",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  hospitalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hospitalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "right",
  },
  hospitalMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  hospitalLocation: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  mainBadge: {
    backgroundColor: "#0EA5E9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  mainBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  hospitalStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statItemText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  hospitalActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  announcementsList: {
    gap: 12,
  },
  announcementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  announcementHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  announcementDate: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "right",
  },
  announcementHospital: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 12,
    textAlign: "right",
  },
  announcementActions: {
    flexDirection: "row",
    gap: 12,
  },
  announcementActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  announcementActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
