import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  ArrowLeft,
  Scale,
  Users,
  Bell,
  Edit3,
  Plus,
  MapPin,
  Star,
  Settings,
  BarChart3,
  FileText,
  Eye,
  Trash2,
} from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { usePermissions } from "../lib/permissions";
import { trpc } from "../lib/trpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UnionBranch {
  id: string;
  name: string;
  type: "main" | "branch";
  governorate?: string;
  region?: "central" | "northern" | "southern" | "kurdistan";
  address: string;
  phone: string;
  email: string;
  president: string;
  membersCount: number;
  announcements: number;
  rating: number;
  status: "active" | "inactive";
  canManage: boolean;
}

export default function UnionManagementDashboardScreen() {
  const router = useRouter();
  // const { moderatorPermissions, isSuperAdmin, isModerator } = useApp();
  // const { canAccessUnion } = usePermissions();
  const [selectedTab, setSelectedTab] = useState<"overview" | "unions" | "announcements">("overview");
  const queryClient = useQueryClient();

  const { data: allUnions, isLoading: isAllUnionsLoading, error } = useQuery(trpc.union.branch.list.queryOptions());
  const { data: mainUnionData } = useQuery(trpc.union.main.get.queryOptions());
  const mainUnionId = mainUnionData?.union?.id;
  const mainMembersCount = (mainUnionData?.union as any)?.membersCount ?? 0;
  const mainFollowersCount = (mainUnionData?.union as any)?.followersCount ?? 0;

  const { data: announcements, isLoading: isAnnouncementsLoading } = useQuery(
    trpc.union.announcement.list.queryOptions({})
  );

  const deleteUnionMutation = useMutation(
    trpc.union.branch.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.union.branch.list.queryKey as any);
        Alert.alert("تم", "تم حذف النقابة بنجاح");
      },
      onError: (error) => {
        Alert.alert("خطأ", "حدث خطأ أثناء حذف النقابة");
      },
    })
  );

  const filteredUnions = allUnions?.filter((union) => union) || [];

  const handleUnionPress = (union: UnionBranch) => {
    if (union.type === "main") {
      router.push("/vet-union");
    } else {
      router.push(`/union-branch-details?id=${union.id}`);
    }
  };

  const handleEditUnion = (union: UnionBranch) => {
    if (union.type === "main") {
      router.push("/edit-union-main");
    } else {
      router.push(`/edit-union-branch?id=${union.id}`);
    }
  };

  const handleAddAnnouncement = (union: UnionBranch) => {
    if (union.type === "main") {
      router.push("/add-union-announcement?branchId=main");
    } else {
      router.push(`/add-union-announcement?branchId=${union.id}`);
    }
  };

  const handleDeleteUnion = (unionId: string, unionName: string) => {
    Alert.alert("تأكيد الحذف", `هل أنت متأكد من حذف ${unionName}؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          deleteUnionMutation.mutate(parseInt(unionId));
        },
      },
    ]);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={12} color="#FFD700" fill="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={12} color="#FFD700" fill="#FFD700" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={12} color="#E5E7EB" />);
    }

    return stars;
  };

  if (isAllUnionsLoading || isAnnouncementsLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error fetching data</Text>
      </View>
    );
  }

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: COLORS.primary }]}>
          <Scale size={24} color={COLORS.white} />
          <Text style={styles.statNumber}>{filteredUnions.length}</Text>
          <Text style={styles.statLabel}>إجمالي النقابات</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#10B981" }]}>
          <FileText size={24} color={COLORS.white} />
          <Text style={styles.statNumber}>{filteredUnions.reduce((sum, u) => sum + u.announcements, 0)}</Text>
          <Text style={styles.statLabel}>إجمالي الإعلانات</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#F59E0B" }]}>
          <Users size={24} color={COLORS.white} />
          <Text style={styles.statNumber}>
            {filteredUnions.reduce((sum, u) => sum + u.membersCount, 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>إجمالي الأعضاء</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: "#EF4444" }]}>
          <BarChart3 size={24} color={COLORS.white} />
          <Text style={styles.statNumber}>98%</Text>
          <Text style={styles.statLabel}>معدل النشاط</Text>
        </View>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>

        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: COLORS.primary }]}
            onPress={() => router.push("/union-branches")}
          >
            <Plus size={20} color={COLORS.white} />
            <Text style={styles.quickActionText}>إضافة فرع</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: "#10B981" }]}
            onPress={() => router.push("/add-union-announcement")}
          >
            <FileText size={20} color={COLORS.white} />
            <Text style={styles.quickActionText}>إعلان جديد</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: "#F59E0B" }]}
            onPress={() => router.push("/union-settings")}
          >
            <Settings size={20} color={COLORS.white} />
            <Text style={styles.quickActionText}>إعدادات النظام</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: "#8B5CF6" }]}
            onPress={() => router.push("/union-analytics")}
          >
            <BarChart3 size={20} color={COLORS.white} />
            <Text style={styles.quickActionText}>التحليلات</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: COLORS.primary }]}
            onPress={() =>
              router.push({
                pathname: "/union-members-list",
                params: { type: "followers", mainUnionId: String(mainUnionId), title: "متابعو النقابة" },
              })
            }
          >
            <Bell size={20} color={COLORS.white} />
            <Text style={styles.quickActionText}>المتابعون</Text>
            {mainFollowersCount > 0 && (
              <View style={styles.quickActionBadge}>
                <Text style={styles.quickActionBadgeText}>{mainFollowersCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: COLORS.success || "#28a745" }]}
            onPress={() =>
              router.push({
                pathname: "/union-members-list",
                params: { type: "members", mainUnionId: String(mainUnionId), title: "أعضاء النقابة" },
              })
            }
          >
            <Users size={20} color={COLORS.white} />
            <Text style={styles.quickActionText}>الأعضاء المسجلون</Text>
            {mainMembersCount > 0 && (
              <View style={styles.quickActionBadge}>
                <Text style={styles.quickActionBadgeText}>{mainMembersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderUnionsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>قائمة النقابات</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push("/union-branches")}>
          <Plus size={16} color={COLORS.white} />
          <Text style={styles.addButtonText}>إضافة</Text>
        </TouchableOpacity>
      </View>

      {filteredUnions.map((union) => (
        <View key={union.id} style={styles.unionCard}>
          <View style={styles.unionHeader}>
            <View style={styles.unionInfo}>
              <Text style={styles.unionName}>{union.name}</Text>
              <View style={styles.unionMeta}>
                <MapPin size={14} color={COLORS.darkGray} />
                <Text style={styles.unionLocation}>{union.governorate || "المقر الرئيسي"}</Text>
                {union.type === "main" && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>رئيسي</Text>
                  </View>
                )}
              </View>
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>{renderStars(union.rating)}</View>
                <Text style={styles.ratingText}>({union.rating})</Text>
              </View>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: union.status === "active" ? "#10B981" : "#EF4444" }]}>
              <Text style={styles.statusText}>{union.status === "active" ? "نشط" : "غير نشط"}</Text>
            </View>
          </View>

          <View style={styles.unionStats}>
            <View style={styles.statItem}>
              <FileText size={16} color={COLORS.primary} />
              <Text style={styles.statItemText}>{union.announcements} إعلان</Text>
            </View>

            <View style={styles.statItem}>
              <Users size={16} color="#10B981" />
              <Text style={styles.statItemText}>{union.membersCount.toLocaleString()} عضو</Text>
            </View>
          </View>

          <View style={styles.unionActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              onPress={() => handleUnionPress(union)}
            >
              <Eye size={16} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#F59E0B" }]}
              onPress={() => handleEditUnion(union)}
            >
              <Edit3 size={16} color={COLORS.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#10B981" }]}
              onPress={() => handleAddAnnouncement(union)}
            >
              <FileText size={16} color={COLORS.white} />
            </TouchableOpacity>

            {union.type !== "main" && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#EF4444" }]}
                onPress={() => handleDeleteUnion(union.id, union.name)}
                disabled={deleteUnionMutation.isPending}
              >
                <Trash2 size={16} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  const renderAnnouncementsTab = (announcements: any) => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>إدارة الإعلانات</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push("/add-union-announcement")}>
            <Plus size={16} color={COLORS.white} />
            <Text style={styles.addButtonText}>إعلان جديد</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.announcementsList}>
          {announcements?.reverse()?.map((announcement) => (
            <View key={announcement.id} style={styles.announcementCard}>
              <View style={styles.announcementHeader}>
                <View style={[styles.typeBadge, { backgroundColor: "#10B981" }]}>
                  <Text style={styles.typeBadgeText}>{announcement.type}</Text>
                </View>
                <Text style={styles.announcementDate}>{new Date(announcement.createdAt).toLocaleDateString()}</Text>
              </View>

              <View style={{ flex: 1, height: 150, borderRadius: 20 }}>
                <Image
                  source={{ uri: announcement.image }}
                  style={{ width: "100%", height: 150, resizeMode: "cover", borderRadius: 10 }}
                />
              </View>
              <Text style={styles.announcementTitle}>{announcement.title}</Text>
              <Text style={styles.announcementUnion}>
                {announcement.branchId ? allUnions?.find((u) => u.id === announcement.branchId)?.name : "المقر الرئيسي"}
              </Text>

              <View style={styles.announcementActions}>
                <TouchableOpacity
                  style={styles.announcementActionButton}
                  onPress={() =>
                    router.push(
                      `/edit-union-announcement?announcementId=${announcement.id}&branchId=${
                        announcement.branchId || "main"
                      }`
                    )
                  }
                >
                  <Edit3 size={14} color="#F59E0B" />
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
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>إدارة النقابة البيطرية</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "overview" && styles.activeTab]}
            onPress={() => setSelectedTab("overview")}
          >
            <BarChart3 size={18} color={selectedTab === "overview" ? COLORS.white : COLORS.primary} />
            <Text style={[styles.tabText, selectedTab === "overview" && styles.activeTabText]}>نظرة عامة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === "unions" && styles.activeTab]}
            onPress={() => setSelectedTab("unions")}
          >
            <Scale size={18} color={selectedTab === "unions" ? COLORS.white : COLORS.primary} />
            <Text style={[styles.tabText, selectedTab === "unions" && styles.activeTabText]}>النقابات</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === "announcements" && styles.activeTab]}
            onPress={() => setSelectedTab("announcements")}
          >
            <FileText size={18} color={selectedTab === "announcements" ? COLORS.white : COLORS.primary} />
            <Text style={[styles.tabText, selectedTab === "announcements" && styles.activeTabText]}>الإعلانات</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {selectedTab === "overview" && renderOverviewTab()}
          {selectedTab === "unions" && renderUnionsTab()}
          {selectedTab === "announcements" && renderAnnouncementsTab(announcements)}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary,
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
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
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
    flexDirection: "row-reverse",
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
    textAlign: "left",
  },
  quickActionsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    width: "47%",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    position: "relative",
  },
  quickActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  quickActionBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  quickActionBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  addButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.primary,
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
  unionCard: {
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
  unionHeader: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  unionInfo: {
    flex: 1,
  },
  unionName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
    textAlign: "left",
  },
  unionMeta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  unionLocation: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  mainBadge: {
    backgroundColor: COLORS.primary,
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
  ratingContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  starsContainer: {
    flexDirection: "row-reverse",
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.darkGray,
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
  unionStats: {
    flexDirection: "row-reverse",
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  statItemText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  unionActions: {
    flexDirection: "row-reverse",
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
    flexDirection: "row-reverse",
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
    textAlign: "left",
  },
  announcementUnion: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 12,
    textAlign: "left",
  },
  announcementActions: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  announcementActionButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  announcementActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
