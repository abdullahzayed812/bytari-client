import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
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
} from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

interface QuickActionItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  permission?: string;
  subPermissions?: string[];
}

// Permission mapping from backend to frontend format
const BACKEND_TO_FRONTEND_PERMISSION_MAP: Record<string, string> = {
  manage_ads: "advertisements",
  manage_content: "content",
  send_notifications: "generalMessages",
  view_analytics: "stats",
  manage_users: "userManagement",
  view_users: "userManagement",
  reply_consultations: "consultations",
  reply_inquiries: "inquiries",
  manage_pets: "pets",
  manage_clinics: "clinics",
  manage_stores: "storeManagement",
  manage_vet_stores: "vetStores",
  manage_user_stores: "petOwnerStores",
  manage_hospitals: "hospitalsManagement",
  manage_unions: "unionManagement",
  manage_courses: "coursesManagement",
  manage_approvals: "approvals",
  manage_vet_approvals: "doctorRegistration",
  manage_clinic_approvals: "clinicApprovals",
  manage_store_approvals: "warehouses",
  manage_adoption_approvals: "adoptionPets",
  manage_breeding_approvals: "breedingPets",
  manage_ai_settings: "aiSettings",
  assign_roles: "superPermissions",
  manage_settings: "homePageManagement",
  manage_orders: "products",
};

export default function ModeratorQuickActionsScreen() {
  const router = useRouter();
  const { user, isSuperAdmin } = useApp();

  // Fetch user permissions from backend
  const { data: rawUserPermissions, isLoading: permissionsLoading } = useQuery(
    trpc.admin.permissions.getUserPermissions.queryOptions({ userId: user?.id })
  );

  // Transform backend permissions to frontend format
  const userPermissions = useMemo(() => {
    if (!rawUserPermissions?.permissions) return null;

    const permissionMap: Record<string, boolean> = {};
    const subPermissionsMap: Record<string, string[]> = {};

    // Map each backend permission to frontend format
    rawUserPermissions.permissions.forEach((perm: any) => {
      const frontendKey = BACKEND_TO_FRONTEND_PERMISSION_MAP[perm.permissionName];
      if (frontendKey) {
        permissionMap[frontendKey] = true;

        // Handle sub-permissions for specific categories
        if (perm.permissionCategory === "approvals") {
          if (!subPermissionsMap.approvalsSubPermissions) {
            subPermissionsMap.approvalsSubPermissions = [];
          }
          // Map approval sub-permissions
          const subPermKey = BACKEND_TO_FRONTEND_PERMISSION_MAP[perm.permissionName];
          if (subPermKey && subPermKey !== "approvals") {
            subPermissionsMap.approvalsSubPermissions.push(subPermKey);
          }
        }

        if (perm.permissionCategory === "stores") {
          if (!subPermissionsMap.storeManagementSubPermissions) {
            subPermissionsMap.storeManagementSubPermissions = [];
          }
          const subPermKey = BACKEND_TO_FRONTEND_PERMISSION_MAP[perm.permissionName];
          if (subPermKey && subPermKey !== "storeManagement") {
            subPermissionsMap.storeManagementSubPermissions.push(subPermKey);
          }
        }
      }
    });

    console.log("Mapped permissions:", permissionMap);
    console.log("Sub-permissions:", subPermissionsMap);

    return { ...permissionMap, ...subPermissionsMap };
  }, [rawUserPermissions]);

  // Define all available quick actions
  const allQuickActions: QuickActionItem[] = [
    {
      id: "users",
      title: "إدارة الأعضاء",
      icon: <Users size={24} color={COLORS.white} />,
      route: "/admin-users-list",
      color: "#00C896",
      permission: "userManagement",
    },
    {
      id: "messages",
      title: "إرسال رسالة عامة",
      icon: <MessageSquare size={24} color={COLORS.white} />,
      route: "/admin-messages",
      color: "#007AFF",
      permission: "generalMessages",
    },
    {
      id: "ads",
      title: "إدارة الإعلانات",
      icon: <FileText size={24} color={COLORS.white} />,
      route: "/admin-ads-management",
      color: "#FF6B6B",
      permission: "advertisements",
    },
    {
      id: "consultations",
      title: "الاستشارات",
      icon: <Stethoscope size={24} color={COLORS.white} />,
      route: "/consultations-list",
      color: "#FF9500",
      permission: "consultations",
    },
    {
      id: "ai-settings",
      title: "إعدادات الذكاء الاصطناعي",
      icon: <Settings size={24} color={COLORS.white} />,
      route: "/admin-ai-settings",
      color: "#8E44AD",
      permission: "aiSettings",
    },
    {
      id: "approvals",
      title: "إدارة الموافقات",
      icon: <CheckCircle size={24} color={COLORS.white} />,
      route: "/admin-approvals",
      color: "#27AE60",
      permission: "approvals",
      subPermissions: ["doctorRegistration", "clinicApprovals", "warehouses", "adoptionPets", "breedingPets"],
    },
    {
      id: "pets",
      title: "إدارة الحيوانات",
      icon: <Heart size={24} color={COLORS.white} />,
      route: "/admin-pets-management",
      color: "#E91E63",
      permission: "pets",
    },
    {
      id: "stats",
      title: "الإحصائيات",
      icon: <BarChart3 size={24} color={COLORS.white} />,
      route: "/admin-dashboard",
      color: "#FF5722",
      permission: "stats",
    },
    {
      id: "stores",
      title: "إدارة المتاجر",
      icon: <Store size={24} color={COLORS.white} />,
      route: "/admin-stores-management",
      color: "#FF9800",
      permission: "storeManagement",
      subPermissions: ["vetStores", "petOwnerStores"],
    },
    {
      id: "clinics",
      title: "إدارة العيادات",
      icon: <Building2 size={24} color={COLORS.white} />,
      route: "/admin-clinics-management",
      color: "#2196F3",
      permission: "clinics",
    },
    {
      id: "products",
      title: "إدارة المنتجات",
      icon: <Package size={24} color={COLORS.white} />,
      route: "/stores-admin-management",
      color: "#4CAF50",
      permission: "products",
    },
    {
      id: "content",
      title: "إدارة الكتب",
      icon: <BookOpen size={24} color={COLORS.white} />,
      route: "/admin-content-manager",
      color: "#9C27B0",
      permission: "content",
    },
    {
      id: "union-management",
      title: "إدارة النقابة",
      icon: <Scale size={24} color={COLORS.white} />,
      route: "/union-management-dashboard",
      color: "#6366F1",
      permission: "unionManagement",
    },
    {
      id: "hospitals-management",
      title: "إدارة المستشفيات",
      icon: <Hospital size={24} color={COLORS.white} />,
      route: "/hospitals-management-dashboard",
      color: "#0EA5E9",
      permission: "hospitalsManagement",
    },
    {
      id: "courses-management",
      title: "إدارة الدورات والندوات",
      icon: <GraduationCap size={24} color={COLORS.white} />,
      route: "/courses-management",
      color: "#8B5CF6",
      permission: "coursesManagement",
    },
  ];

  // Filter actions based on user permissions
  const filteredActions = useMemo(() => {
    // Super admin sees all actions
    if (isSuperAdmin) {
      return allQuickActions;
    }

    // No permissions loaded yet or no permissions at all
    if (!userPermissions) {
      console.log("No permissions available");
      return [];
    }

    // Filter actions based on permissions
    return allQuickActions.filter((action) => {
      // Actions without permission requirements are always visible
      if (!action.permission) return true;

      const hasMainPermission = userPermissions[action.permission];

      // Check main permission
      if (hasMainPermission) {
        // If action has sub-permissions, verify them
        if (action.subPermissions && action.subPermissions.length > 0) {
          const subPermsKey = `${action.permission}SubPermissions`;
          const userSubPerms = userPermissions[subPermsKey] as string[] | undefined;

          // User must have at least one of the required sub-permissions
          return userSubPerms && userSubPerms.some((perm) => action.subPermissions!.includes(perm));
        }
        return true;
      }

      return false;
    });
  }, [userPermissions, isSuperAdmin, allQuickActions]);

  console.log(
    "Filtered actions:",
    filteredActions.map((a) => a.title)
  );

  const handleActionPress = (route: string) => {
    console.log("Navigating to:", route);
    router.push(route as any);
  };

  const handleBack = () => {
    router.back();
  };

  // Show loading state
  if (permissionsLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>لوحة تحكم الإدارة</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري تحميل الصلاحيات...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>لوحة تحكم الإدارة</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>

          {filteredActions.length === 0 ? (
            <View style={styles.noPermissionsContainer}>
              <Text style={styles.noPermissionsText}>لا توجد صلاحيات متاحة لك حالياً</Text>
              <Text style={styles.noPermissionsSubText}>
                يرجى التواصل مع الإدارة العامة لمنحك الصلاحيات المناسبة. بعد منحك الصلاحيات ستظهر هنا الأزرار المناسبة
                لصلاحياتك.
              </Text>
              <Text style={styles.permissionsHelpText}>
                الصلاحيات المتاحة: • إدارة المستشفيات البيطرية • إدارة نقابة الأطباء البيطريين • إدارة الأقسام والمحتوى
                • الرد على الاستشارات والاستفسارات • إدارة المستخدمين والموافقات
              </Text>
            </View>
          ) : (
            <View style={styles.actionsGrid}>
              {filteredActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.actionCard, { backgroundColor: action.color }]}
                  onPress={() => handleActionPress(action.route)}
                  testID={`quick-action-${action.id}`}
                >
                  <View style={styles.actionIcon}>{action.icon}</View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* User role and permissions info */}
          {rawUserPermissions?.roles && rawUserPermissions.roles.length > 0 && (
            <View style={styles.roleSection}>
              <Text style={styles.roleTitle}>دورك الحالي</Text>
              {rawUserPermissions.roles.map((role: any) => (
                <View key={role.roleId} style={styles.roleCard}>
                  <Text style={styles.roleName}>{role.roleDisplayName}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Additional info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>معلومات هامة</Text>
            <Text style={styles.infoText}>• يمكنك الوصول فقط للأقسام التي منحك إياها المدير العام</Text>
            <Text style={styles.infoText}>• في حالة الحاجة لصلاحيات إضافية، يرجى التواصل مع الإدارة</Text>
            <Text style={styles.infoText}>• جميع العمليات التي تقوم بها مسجلة ومراقبة</Text>
            <Text style={styles.infoText}>• الصلاحيات الجديدة: إدارة المستشفيات والنقابة متاحة الآن</Text>
            <Text style={styles.infoText}>• يتم تطبيق الصلاحيات فوراً بعد منحها من قبل الإدارة</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
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
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 20,
    textAlign: "center",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  actionCard: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 20,
  },
  noPermissionsContainer: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 40,
  },
  noPermissionsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 8,
  },
  noPermissionsSubText: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  permissionsHelpText: {
    fontSize: 13,
    color: "#666",
    textAlign: "right",
    lineHeight: 18,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  roleSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
  },
  roleCard: {
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },
  roleName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  infoSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
    marginBottom: 4,
  },
});
