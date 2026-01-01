import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import {
  ArrowLeft,
  Users,
  MessageSquare,
  FileText,
  Settings,
  Heart,
  CheckCircle,
  BarChart3,
  Store,
  Stethoscope,
  Building2,
  Package,
  BookOpen,
  Scale,
  Hospital,
  GraduationCap,
  HelpCircle,
  Database,
  Activity,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Shield,
  Bot,
  Megaphone,
  UserCog,
  Briefcase,
  Lightbulb,
  Book,
  ShoppingCart,
  MessageCircle,
} from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

const { width } = Dimensions.get("window");

export default function ModeratorQuickActionsScreen() {
  const router = useRouter();
  const { user, isSuperAdmin } = useApp();

  // Fetch data using tRPC
  const { data: rawSystemStats, isLoading: statsLoading } = useQuery(
    trpc.admin.stats.getSystemStats.queryOptions({ adminId: user?.id ? Number(user.id) : 0 })
  );
  const systemStats: any = useMemo(() => rawSystemStats, [rawSystemStats]);

  const { data: rawUserPermissions, isLoading: permissionsLoading } = useQuery(
    trpc.admin.permissions.getUserPermissions.queryOptions({ userId: Number(user?.id) })
  );
  const userPermissions: any = useMemo(() => rawUserPermissions, [rawUserPermissions]);

  const { data: rawApprovalCounts, isLoading: approvalCountsLoading } = useQuery(
    trpc.admin.stats.getPendingApprovalCounts.queryOptions({ adminId: user?.id ? Number(user.id) : 0 })
  );
  const approvalCounts: any = useMemo(() => rawApprovalCounts, [rawApprovalCounts]);

  const hasPermission = (permission: string): boolean => {
    if (isSuperAdmin) return true;
    return userPermissions?.permissions?.some((p: any) => p.permissionName === permission) ?? false;
  };

  const handleBack = () => {
    router.back();
  };

  const StatCard = ({ icon, value, label, onPress }: any) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      {icon}
      <Text style={styles.statNumber}>{value || 0}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const ActionCard = ({ icon, label, onPress, badge, color }: any) => (
    <TouchableOpacity
      style={[styles.actionCard, { borderTopColor: color || COLORS.primary }]}
      onPress={onPress}
    >
      <View style={styles.actionCardContent}>
        <View style={[styles.iconContainer, { backgroundColor: (color || COLORS.primary) + "15" }]}>
          {React.cloneElement(icon as React.ReactElement, { color: color || COLORS.primary })}
        </View>
        <Text style={styles.actionText}>{label}</Text>
        {badge && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (statsLoading || permissionsLoading || approvalCountsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>لوحة تحكم الإدارة</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Section - Only if has view_analytics permission */}
        {hasPermission("view_analytics") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>إحصائيات النظام</Text>
            <View style={styles.statsGrid}>
              <StatCard
                icon={<Users size={24} color="#4ECDC4" />}
                value={systemStats?.totalStats?.users}
                label="المستخدمين"
              />
              <StatCard
                icon={<Heart size={24} color="#FF6B6B" />}
                value={systemStats?.totalStats?.pets}
                label="الحيوانات"
              />
              <StatCard
                icon={<HelpCircle size={24} color="#45B7D1" />}
                value={systemStats?.totalStats?.inquiries}
                label="الاستفسارات"
              />
              <StatCard
                icon={<Stethoscope size={24} color="#F39C12" />}
                value={systemStats?.totalStats?.consultations}
                label="الاستشارات"
              />
            </View>
          </View>
        )}

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
          <View style={styles.actionsGrid}>
            {hasPermission("send_messages") && (
              <ActionCard
                icon={<MessageSquare size={24} />}
                label="إرسال رسالة عامة"
                onPress={() => router.push("/admin-messages")}
                color="#45B7D1"
              />
            )}

            {hasPermission("manage_ads") && (
              <ActionCard
                icon={<Megaphone size={24} />}
                label="إدارة الإعلانات"
                onPress={() => router.push("/admin-ads-management")}
                color="#96CEB4"
              />
            )}

            {hasPermission("manage_ai_settings") && (
              <ActionCard
                icon={<Bot size={24} />}
                label="إعدادات الذكاء الاصطناعي"
                onPress={() => router.push("/admin-ai-settings")}
                color="#A855F7"
              />
            )}

            {hasPermission("assign_roles") && (
              <ActionCard
                icon={<Users size={24} />}
                label="عرض جميع المستخدمين"
                onPress={() => router.push("/admin-users-list")}
                color="#FF6B6B"
              />
            )}

            {hasPermission("manage_approvals") && (
              <ActionCard
                icon={<CheckCircle size={24} />}
                label="إدارة الموافقات"
                onPress={() => router.push("/admin-approvals")}
                badge={approvalCounts?.pendingApprovals}
                color="#27AE60"
              />
            )}

            {hasPermission("manage_inquiries") && (
              <ActionCard
                icon={<HelpCircle size={24} />}
                label="الاستفسارات"
                onPress={() => router.push("/admin-inquiries-list")}
                badge={approvalCounts?.pendingInquiries}
                color="#3B82F6"
              />
            )}

            {hasPermission("manage_consultations") && (
              <ActionCard
                icon={<MessageCircle size={24} />}
                label="الاستشارات"
                onPress={() => router.push("/admin-consultations-list")}
                badge={approvalCounts?.pendingConsultations}
                color="#FF9500"
              />
            )}

            {hasPermission("manage_pets") && (
              <ActionCard
                icon={<Heart size={24} />}
                label="موافقات الحيوانات"
                onPress={() => router.push("/admin-pet-approvals")}
                badge={approvalCounts?.pendingPetApprovals}
                color="#FF6B6B"
              />
            )}

            {hasPermission("manage_approvals") && (
              <ActionCard
                icon={<UserCheck size={24} />}
                label="موافقات الأطباء"
                onPress={() => router.push("/veterinarian-approvals")}
                badge={approvalCounts?.pendingVetApprovals}
                color="#8E44AD"
              />
            )}

            {hasPermission("manage_pets") && (
              <ActionCard
                icon={<Heart size={24} />}
                label="إدارة الحيوانات"
                onPress={() => router.push("/admin-pets-management")}
                color="#E91E63"
              />
            )}

            {hasPermission("manage_clinics") && (
              <ActionCard
                icon={<Building2 size={24} />}
                label="إدارة العيادات"
                onPress={() => router.push("/admin-clinics-management")}
                color="#2196F3"
              />
            )}

            {hasPermission("manage_hospitals") && (
              <ActionCard
                icon={<Hospital size={24} />}
                label="إدارة المستشفيات"
                onPress={() => router.push("/hospitals-management-dashboard")}
                color="#DC3545"
              />
            )}

            {hasPermission("manage_unions") && (
              <ActionCard
                icon={<Scale size={24} />}
                label="إدارة النقابة"
                onPress={() => router.push("/union-management-dashboard")}
                color="#8B5CF6"
              />
            )}

            {hasPermission("manage_stores") && (
              <ActionCard
                icon={<ShoppingCart size={24} />}
                label="إدارة المتاجر"
                onPress={() => router.push("/stores-admin-management")}
                color="#9C27B0"
              />
            )}

            {hasPermission("manage_orders") && (
              <ActionCard
                icon={<Package size={24} />}
                label="إدارة الطلبات"
                onPress={() => router.push("/admin-orders-management")}
                color="#FF5722"
              />
            )}

            {hasPermission("manage_content") && (
              <ActionCard
                icon={<Book size={24} />}
                label="إدارة الكتب"
                onPress={() => router.push("/admin-content-manager?type=books")}
                color="#795548"
              />
            )}

            {hasPermission("manage_content") && (
              <ActionCard
                icon={<FileText size={24} />}
                label="إدارة المجلات"
                onPress={() => router.push("/admin-content-manager?type=magazines")}
                color="#607D8B"
              />
            )}

            {hasPermission("manage_content") && (
              <ActionCard
                icon={<Lightbulb size={24} />}
                label="إدارة النصائح"
                onPress={() => router.push("/admin-content-manager?type=tips")}
                color="#FFC107"
              />
            )}

            {hasPermission("manage_jobs") && (
              <ActionCard
                icon={<Briefcase size={24} />}
                label="إدارة الوظائف"
                onPress={() => router.push("/job-management")}
                color="#6C63FF"
              />
            )}

            {hasPermission("manage_courses") && (
              <ActionCard
                icon={<GraduationCap size={24} />}
                label="إدارة الدورات"
                onPress={() => router.push("/courses-management")}
                color="#10B981"
              />
            )}

            {hasPermission("manage_field_assignments") && (
              <ActionCard
                icon={<UserCog size={24} />}
                label="التعيين والإشراف"
                onPress={() => router.push("/field-assignments-management")}
                badge={(systemStats?.totalStats as any)?.pendingFieldAssignments}
                color="#8B5A2B"
              />
            )}
          </View>
        </View>

        {/* User Roles Section */}
        {userPermissions?.roles && userPermissions.roles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>أدوارك الحالية</Text>
            <View style={styles.rolesContainer}>
              {userPermissions.roles.map((role: any) => (
                <View key={role.roleId} style={styles.roleCard}>
                  <Shield size={20} color={COLORS.primary} />
                  <Text style={styles.roleName}>{role.roleDisplayName}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footerSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.darkGray,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  actionCard: {
    width: (width - 44) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopWidth: 4,
  },
  actionCardContent: {
    alignItems: "center",
    position: "relative",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.black,
    textAlign: "center",
    lineHeight: 18,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: 10,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  rolesContainer: {
    gap: 8,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    gap: 12,
    elevation: 1,
  },
  roleName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  footerSpace: {
    height: 40,
  },
});
