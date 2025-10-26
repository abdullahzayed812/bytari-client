import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import {
  Users,
  Heart,
  HelpCircle,
  Stethoscope,
  Store,
  Database,
  Activity,
  BookOpen,
  Building2,
  AlertTriangle,
  UserCheck,
  CheckCircle,
  Shield,
  MessageSquare,
  Megaphone,
  BarChart3,
  Bot,
  Package,
  GraduationCap,
  TrendingUp,
  X,
  Send,
  Image as ImageIcon,
  UserCog,
  Briefcase,
  Hospital,
  Scale,
  Lightbulb,
  FileText,
  Book,
  ShoppingCart,
  MessageCircle,
} from "lucide-react-native";
import { useApp } from "@/providers/AppProvider";

interface NewMessage {
  title: string;
  content: string;
  type: "announcement" | "maintenance" | "update" | "warning";
  priority: "low" | "normal" | "high" | "urgent";
  targetAudience: string;
  targetCategories: string[];
  imageUrl?: string;
  linkUrl?: string;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  userType: string;
  roles: any[];
  permissions: any[];
}

interface Permission {
  permissionName?: string;
  permissionDisplayName: string;
  permissionDescription: string | null;
  permissionCategory: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useApp();
  const [selectedTab, setSelectedTab] = useState<string>("dashboard");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [sendMessageModalVisible, setSendMessageModalVisible] = useState(false);
  const [newMessage, setNewMessage] = useState<NewMessage>({
    title: "",
    content: "",
    type: "announcement",
    priority: "normal",
    targetAudience: "all",
    targetCategories: [],
    imageUrl: "",
    linkUrl: "",
  });

  // Fetch data using tRPC
  const { data: rawSystemStats, isLoading: statsLoading } = useQuery(
    trpc.admin.stats.getSystemStats.queryOptions({ adminId: user?.id })
  );

  const systemStats: any = useMemo(() => rawSystemStats, [rawSystemStats]);

  const { data: rawUserPermissions, isLoading: permissionsLoading } = useQuery(
    trpc.admin.permissions.getUserPermissions.queryOptions({ userId: user?.id })
  );

  const userPermissions: any = useMemo(() => rawUserPermissions, [rawUserPermissions]);

  const { data: rawApprovalCounts, isLoading: approvalCountsLoading } = useQuery(
    trpc.admin.stats.getPendingApprovalCounts.queryOptions({ adminId: user?.id })
  );

  const approvalCounts: any = useMemo(() => rawApprovalCounts, [rawApprovalCounts]);

  const { data: rawAllUsersData, isLoading: allUsersLoading } = useQuery(
    trpc.admin.users.listAll.queryOptions({ adminId: user?.id, limit: 50 })
  );

  const allUsersData: any = useMemo(() => rawAllUsersData, [rawAllUsersData]);

  const { data: rawDetailedStats, isLoading: detailedStatsLoading } = useQuery({
    ...trpc.admin.stats.getDetailedStats.queryOptions({
      adminId: user?.id,
      category: selectedCategory as "users" | "pets" | "inquiries" | "consultations" | "stores",
    }),
    enabled: !!selectedCategory,
  });

  const detailedStats: any = useMemo(() => rawDetailedStats, [rawDetailedStats]);

  const { data: supervisorsData, isLoading: supervisorsLoading } = useQuery(
    trpc.admin.users.getSupervisors.queryOptions({ limit: 20 })
  );

  const supervisors = useMemo(() => (supervisorsData as any)?.supervisors, [supervisorsData]);

  const sendMessageMutation = useMutation({
    mutationFn: trpc.admin.messages.sendSystemMessage.mutate,
    onSuccess: () => {
      Alert.alert("تم الإرسال", "تم إرسال الرسالة بنجاح");
      setSendMessageModalVisible(false);
      resetMessageForm();
    },
    onError: () => {
      Alert.alert("خطأ", "حدث خطأ أثناء إرسال الرسالة");
    },
  });

  const hasPermission = (permission: string): boolean => {
    return userPermissions?.permissions?.some((p: any) => p.permissionName === permission) ?? false;
  };

  const resetMessageForm = () => {
    setNewMessage({
      title: "",
      content: "",
      type: "announcement",
      priority: "normal",
      targetAudience: "all",
      targetCategories: [],
      imageUrl: "",
      linkUrl: "",
    });
  };

  const handleSendNewMessage = async () => {
    if (!newMessage.title.trim() || !newMessage.content.trim()) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (newMessage.targetAudience === "multiple" && newMessage.targetCategories.length === 0) {
      Alert.alert("خطأ", "يرجى اختيار فئة واحدة على الأقل");
      return;
    }

    sendMessageMutation.mutate({
      senderId: currentUserId,
      title: newMessage.title,
      content: newMessage.content,
      type: newMessage.type,
      targetAudience: newMessage.targetAudience,
      targetCategories: newMessage.targetAudience === "multiple" ? newMessage.targetCategories : undefined,
      priority: newMessage.priority,
      imageUrl: newMessage.imageUrl,
      linkUrl: newMessage.linkUrl,
    });
  };

  const toggleCategory = (category: string) => {
    setNewMessage((prev) => ({
      ...prev,
      targetCategories: prev.targetCategories.includes(category)
        ? prev.targetCategories.filter((c) => c !== category)
        : [...prev.targetCategories, category],
    }));
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      users: "أصحاب الحيوانات",
      vets: "الأطباء البيطريين",
      students: "الطلاب",
      clinics: "أصحاب العيادات",
      stores: "أصحاب المذاخر",
      poultry_owners: "أصحاب الدواجن",
      poultry_vets: "أطباء الدواجن",
      union_officials: "مسؤولين النقابة",
      hospital_officials: "مسؤولين المستشفيات",
    };
    return labels[category] || category;
  };

  const StatCard = ({ icon, color, value, label, onPress }: any) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      {icon}
      <Text style={styles.statNumber}>{value || 0}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const ActionCard = ({ icon, color, label, onPress, badge }: any) => (
    <TouchableOpacity style={[styles.actionCard, badge && styles.actionCardWithBadge]} onPress={onPress}>
      <View style={styles.actionCardContent}>
        <Text>{icon}</Text>
        <Text style={styles.actionText}>{label}</Text>
        {badge && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (
    statsLoading ||
    permissionsLoading ||
    approvalCountsLoading ||
    allUsersLoading ||
    detailedStatsLoading ||
    supervisorsLoading
  ) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
      </View>
    );
  }

  const getPermissionColor = (category: string) => {
    switch (category) {
      case "consultations":
        return "#4ECDC4";
      case "inquiries":
        return "#45B7D1";
      case "content":
        return "#96CEB4";
      case "users":
        return "#FFEAA7";
      case "messages":
        return "#FF6B6B";
      case "ads":
        return "#A855F7";
      case "sections":
        return "#F39C12";
      case "homepage":
        return "#17A2B8";
      case "vet_stores":
        return "#28A745";
      case "user_stores":
        return "#6F42C1";
      case "vet_approvals":
        return "#FD7E14";
      case "clinic_approvals":
        return "#20C997";
      case "store_approvals":
        return "#E83E8C";
      case "adoption_approvals":
        return "#6610F2";
      case "breeding_approvals":
        return "#DC3545";
      case "hospitals":
        return "#DC3545";
      case "super":
        return "#E74C3C";
      default:
        return "#666";
    }
  };

  const renderDashboard = () => (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>لوحة تحكم الإدارة</Text>
        <Text style={styles.subtitle}>مرحباً بك</Text>
      </View>

      {/* Main Statistics */}
      <View style={styles.statsContainer}>
        <StatCard
          icon={<Users size={24} color="#4ECDC4" />}
          value={systemStats?.totalStats?.users}
          label="المستخدمين"
          onPress={() => {
            setSelectedCategory("users");
            setShowDetailModal(true);
          }}
        />
        <StatCard
          icon={<Heart size={24} color="#45B7D1" />}
          value={systemStats?.totalStats?.pets}
          label="الحيوانات"
          onPress={() => {
            setSelectedCategory("pets");
            setShowDetailModal(true);
          }}
        />
        <StatCard
          icon={<HelpCircle size={24} color="#96CEB4" />}
          value={systemStats?.totalStats?.inquiries}
          label="الاستفسارات"
          onPress={() => {
            setSelectedCategory("inquiries");
            setShowDetailModal(true);
          }}
        />
        <StatCard
          icon={<Stethoscope size={24} color="#FFEAA7" />}
          value={systemStats?.totalStats?.consultations}
          label="الاستشارات"
          onPress={() => {
            setSelectedCategory("consultations");
            setShowDetailModal(true);
          }}
        />
      </View>

      {/* Secondary Statistics */}
      <View style={styles.statsContainer}>
        <StatCard icon={<Store size={24} color="#FF6B6B" />} value={systemStats?.totalStats?.stores} label="المتاجر" />
        <StatCard
          icon={<Database size={24} color="#A8E6CF" />}
          value={systemStats?.totalStats?.products}
          label="المنتجات"
        />
        <StatCard
          icon={<Activity size={24} color="#FFD93D" />}
          value={systemStats?.totalStats?.clinics}
          label="العيادات"
        />
        <StatCard icon={<BookOpen size={24} color="#6BCF7F" />} value={systemStats?.totalStats?.books} label="الكتب" />
      </View>

      {/* Pending Approvals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الموافقات المعلقة</Text>
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[styles.statCard, styles.pendingCard]}
            onPress={() => router.push("/admin-approvals?type=clinics")}
          >
            <Building2 size={24} color="#FF6B6B" />
            <Text style={styles.statNumber}>{(systemStats?.totalStats as any)?.pendingClinics || 0}</Text>
            <Text style={styles.statLabel}>عيادات معلقة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.pendingCard]}
            onPress={() => router.push("/admin-approvals?type=stores")}
          >
            <Store size={24} color="#FFA500" />
            <Text style={styles.statNumber}>{(systemStats?.totalStats as any)?.pendingStores || 0}</Text>
            <Text style={styles.statLabel}>متاجر معلقة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.pendingCard]}
            onPress={() => router.push("/admin-approvals?type=lost-pets")}
          >
            <AlertTriangle size={24} color="#E74C3C" />
            <Text style={styles.statNumber}>{(systemStats?.totalStats as any)?.pendingLostPets || 0}</Text>
            <Text style={styles.statLabel}>حيوانات مفقودة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.pendingCard]}
            onPress={() => router.push("/admin-approvals?type=breeding-pets")}
          >
            <Heart size={24} color="#9B59B6" />
            <Text style={styles.statNumber}>{(systemStats?.totalStats as any)?.pendingBreedingPets || 0}</Text>
            <Text style={styles.statLabel}>حيوانات تزاوج</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={[styles.statCard, styles.pendingCard]}
            onPress={() => router.push("/admin-approvals?type=vet-registrations")}
          >
            <UserCheck size={24} color="#3498DB" />
            <Text style={styles.statNumber}>{(systemStats?.totalStats as any)?.pendingVetRegistrations || 0}</Text>
            <Text style={styles.statLabel}>أطباء معلقين</Text>
          </TouchableOpacity>

          <View style={[styles.statCard, styles.totalPendingCard]}>
            <CheckCircle size={24} color="#27AE60" />
            <Text style={styles.statNumber}>
              {((systemStats?.totalStats as any)?.pendingClinics || 0) +
                ((systemStats?.totalStats as any)?.pendingStores || 0) +
                ((systemStats?.totalStats as any)?.pendingLostPets || 0) +
                ((systemStats?.totalStats as any)?.pendingBreedingPets || 0) +
                ((systemStats?.totalStats as any)?.pendingVetRegistrations || 0)}
            </Text>
            <Text style={styles.statLabel}>إجمالي المعلق</Text>
          </View>
        </View>
      </View>

      {/* User Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>تصنيف المستخدمين</Text>
        <View style={styles.userBreakdownContainer}>
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownNumber}>{systemStats?.userBreakdown?.petOwners || 0}</Text>
            <Text style={styles.breakdownLabel}>أصحاب الحيوانات</Text>
          </View>
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownNumber}>{systemStats?.userBreakdown?.vets || 0}</Text>
            <Text style={styles.breakdownLabel}>الأطباء البيطريين</Text>
          </View>
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownNumber}>{systemStats?.userBreakdown?.admins || 0}</Text>
            <Text style={styles.breakdownLabel}>المشرفين</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>النشاط الأخير (30 يوم)</Text>
        <View style={styles.activityContainer}>
          <View style={styles.activityItem}>
            <TrendingUp size={16} color="#4ECDC4" />
            <Text style={styles.activityText}>مستخدمين جدد: {systemStats?.recentActivity?.users || 0}</Text>
          </View>
          <View style={styles.activityItem}>
            <TrendingUp size={16} color="#45B7D1" />
            <Text style={styles.activityText}>حيوانات جديدة: {systemStats?.recentActivity?.pets || 0}</Text>
          </View>
          <View style={styles.activityItem}>
            <TrendingUp size={16} color="#96CEB4" />
            <Text style={styles.activityText}>استفسارات جديدة: {systemStats?.recentActivity?.inquiries || 0}</Text>
          </View>
          <View style={styles.activityItem}>
            <TrendingUp size={16} color="#FFEAA7" />
            <Text style={styles.activityText}>استشارات جديدة: {systemStats?.recentActivity?.consultations || 0}</Text>
          </View>
        </View>
      </View>

      {/* System Health */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>حالة النظام</Text>
        <View style={styles.healthContainer}>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>الحالة:</Text>
            <Text style={[styles.healthValue, { color: "#4CAF50" }]}>صحي</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>وقت التشغيل:</Text>
            <Text style={styles.healthValue}>{systemStats?.systemHealth?.uptime || "99.9%"}</Text>
          </View>
          <View style={styles.healthItem}>
            <Text style={styles.healthLabel}>آخر نسخة احتياطية:</Text>
            <Text style={styles.healthValue}>اليوم</Text>
          </View>
        </View>
      </View>

      {/* User Roles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>أدوارك الحالية</Text>
        {userPermissions?.roles?.map((role: any) => (
          <View key={role.roleId} style={styles.roleCard}>
            <Shield size={20} color="#FF6B6B" />
            <Text style={styles.roleName}>{role.roleDisplayName}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
        <View style={styles.actionsGrid}>
          {hasPermission("assign_roles") && (
            <TouchableOpacity style={styles.actionCard} onPress={() => setShowRoleModal(true)}>
              <Users size={24} color="#4ECDC4" />
              <Text style={styles.actionText}>إدارة الأدوار</Text>
            </TouchableOpacity>
          )}

          {hasPermission("send_messages") && (
            <TouchableOpacity style={styles.actionCard} onPress={() => setSendMessageModalVisible(true)}>
              <MessageSquare size={24} color="#45B7D1" />
              <Text style={styles.actionText}>إرسال رسالة عامة</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_ads") && (
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin-ads-management")}>
              <Megaphone size={24} color="#96CEB4" />
              <Text style={styles.actionText}>إدارة الإعلانات</Text>
            </TouchableOpacity>
          )}

          {hasPermission("view_analytics") && (
            <TouchableOpacity style={styles.actionCard}>
              <BarChart3 size={24} color="#FFEAA7" />
              <Text style={styles.actionText}>الإحصائيات</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_ai_settings") && (
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin-ai-settings")}>
              <Bot size={24} color="#A855F7" />
              <Text style={styles.actionText}>إعدادات الذكاء الاصطناعي</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin-users-list")}>
            <Users size={24} color="#FF6B6B" />
            <Text style={styles.actionText}>عرض جميع المستخدمين</Text>
          </TouchableOpacity>

          {hasPermission("manage_approvals") && (
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardWithBadge]}
              onPress={() => {
                console.log("Navigating to admin-approvals");
                router.push("/admin-approvals");
              }}
            >
              <View style={styles.actionCardContent}>
                <CheckCircle size={24} color="#27AE60" />
                <Text style={styles.actionText}>إدارة الموافقات</Text>
                {(approvalCounts?.pendingApprovals || 0) > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{approvalCounts?.pendingApprovals}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

          {hasPermission("manage_inquiries") && (
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardWithBadge]}
              onPress={() => router.push("/admin-inquiries-list")}
            >
              <View style={styles.actionCardContent}>
                <HelpCircle size={24} color="#3B82F6" />
                <Text style={styles.actionText}>الاستفسارات</Text>
                {(approvalCounts?.pendingInquiries || 0) > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{approvalCounts?.pendingInquiries}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

          {hasPermission("manage_consultations") && (
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardWithBadge]}
              onPress={() => router.push("/admin-consultations-list")}
            >
              <View style={styles.actionCardContent}>
                <MessageCircle size={24} color="#FF9500" />
                <Text style={styles.actionText}>الاستشارات</Text>
                {(approvalCounts?.pendingConsultations || 0) > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{approvalCounts?.pendingConsultations}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

          {hasPermission("manage_pets") && (
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardWithBadge]}
              onPress={() => {
                console.log("Navigating to admin-pet-approvals");
                router.push("/admin-pet-approvals");
              }}
            >
              <View style={styles.actionCardContent}>
                <Heart size={24} color="#FF6B6B" />
                <Text style={styles.actionText}>إدارة موافقات الحيوانات</Text>
                {(approvalCounts?.pendingPetApprovals || 0) > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{approvalCounts?.pendingPetApprovals}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

          {hasPermission("manage_approvals") && (
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardWithBadge]}
              onPress={() => {
                console.log("Navigating to veterinarian-approvals");
                router.push("/veterinarian-approvals");
              }}
            >
              <View style={styles.actionCardContent}>
                <UserCheck size={24} color="#8E44AD" />
                <Text style={styles.actionText}>موافقات الأطباء البيطريين</Text>
                {(approvalCounts?.pendingVetApprovals || 0) > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{approvalCounts?.pendingVetApprovals}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

          {hasPermission("manage_pets") && (
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin-pets-management")}>
              <Heart size={24} color="#E91E63" />
              <Text style={styles.actionText}>إدارة الحيوانات</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_clinics") && (
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin-clinics-management")}>
              <Building2 size={24} color="#2196F3" />
              <Text style={styles.actionText}>إدارة العيادات</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_stores") && (
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin-stores-management")}>
              <Store size={24} color="#FF9800" />
              <Text style={styles.actionText}>إدارة المتاجر</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_hospitals") && (
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/hospitals-management-dashboard")}>
              <Hospital size={24} color="#0EA5E9" />
              <Text style={styles.actionText}>إدارة المستشفيات</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_union") && (
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/union-management-dashboard")}>
              <Scale size={24} color="#8B5CF6" />
              <Text style={styles.actionText}>إدارة النقابة</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_stores") && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => {
                // Show modal to choose between vet stores and pet owner stores
                alert("اختر نوع المتجر:\n1. متاجر الأطباء\n2. متاجر أصحاب الحيوانات");
                // For now, navigate to stores management
                router.push("/stores-admin-management");
              }}
            >
              <ShoppingCart size={24} color="#9C27B0" />
              <Text style={styles.actionText}>إدارة المتاجر</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_orders") && (
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin-orders-management")}>
              <Package size={24} color="#FF5722" />
              <Text style={styles.actionText}>إدارة الطلبات</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_field_assignments") && (
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardWithBadge]}
              onPress={() => {
                console.log("Navigating to field-assignments-management");
                router.push("/field-assignments-management");
              }}
            >
              <View style={styles.actionCardContent}>
                <UserCog size={24} color="#3F51B5" />
                <Text style={styles.actionText}>إدارة التعيين والإشراف</Text>
                {(approvalCounts?.pendingFieldAssignments || 0) > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{approvalCounts?.pendingFieldAssignments}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}

          {hasPermission("manage_content") && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/admin-content-manager?type=books")}
            >
              <Book size={24} color="#795548" />
              <Text style={styles.actionText}>إدارة الكتب</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_content") && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push("/admin-content-manager?type=magazines")}
            >
              <FileText size={24} color="#607D8B" />
              <Text style={styles.actionText}>إدارة المجلات</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_content") && (
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/admin-content-manager?type=tips")}>
              <Lightbulb size={24} color="#FFC107" />
              <Text style={styles.actionText}>إدارة النصائح</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_unions") && (
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/union-management-dashboard")}>
              <Scale size={24} color="#17A2B8" />
              <Text style={styles.actionText}>إدارة النقابة</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_hospitals") && (
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/hospitals-management-dashboard")}>
              <Hospital size={24} color="#DC3545" />
              <Text style={styles.actionText}>إدارة المستشفيات</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_jobs") && (
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/job-management")}>
              <Briefcase size={24} color="#6C63FF" />
              <Text style={styles.actionText}>إدارة الوظائف</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_courses") && (
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/courses-management")}>
              <GraduationCap size={24} color="#10B981" />
              <Text style={styles.actionText}>إدارة الدورات والندوات</Text>
            </TouchableOpacity>
          )}

          {hasPermission("manage_field_assignments") && (
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardWithBadge]}
              onPress={() => router.push("/field-assignments-management")}
            >
              <View style={styles.actionCardContent}>
                <UserCog size={24} color="#8B5A2B" />
                <Text style={styles.actionText}>إدارة التعيين والإشراف</Text>
                {(systemStats?.totalStats as any)?.pendingFieldAssignments > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{(systemStats?.totalStats as any)?.pendingFieldAssignments}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderRoleModal = () => (
    <Modal visible={showRoleModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.supervisorModalContent}>
          <View style={styles.supervisorModalHeader}>
            <Text style={styles.modalTitle}>المشرفين وصلاحياتهم</Text>
            <TouchableOpacity style={styles.closeDetailButton} onPress={() => setShowRoleModal(false)}>
              <Text style={styles.closeDetailButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.supervisorModalScroll}>
            {supervisors.map((supervisor) => (
              <View key={supervisor.id} style={styles.supervisorCard}>
                <View style={styles.supervisorHeader}>
                  <View style={styles.supervisorInfo}>
                    <Text style={styles.supervisorName}>{supervisor.name}</Text>
                    <Text style={styles.supervisorEmail}>{supervisor.email}</Text>
                  </View>
                  <View style={styles.supervisorIdBadge}>
                    <Text style={styles.supervisorIdText}>#{supervisor.id}</Text>
                  </View>
                </View>

                <View style={styles.permissionsContainer}>
                  <Text style={styles.permissionsTitle}>الصلاحيات:</Text>
                  {supervisor.permissions.map((permission, index) => (
                    <View key={index} style={styles.permissionItem}>
                      <View
                        style={[
                          styles.permissionBadge,
                          { backgroundColor: getPermissionColor(permission.permissionCategory) },
                        ]}
                      >
                        <Text style={styles.permissionBadgeText}>{permission.permissionDisplayName}</Text>
                      </View>
                      <View style={styles.permissionDetails}>
                        <Text style={styles.permissionDetailText}>• {permission.permissionDescription}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.supervisorActions}>
                  <TouchableOpacity style={styles.editPermissionsButton}>
                    <Text style={styles.editPermissionsButtonText}>تعديل الصلاحيات</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeSupervisorButton}>
                    <Text style={styles.removeSupervisorButtonText}>إزالة المشرف</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addSupervisorButton}>
              <Text style={styles.addSupervisorButtonText}>+ إضافة مشرف جديد</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={() => setShowRoleModal(false)}>
            <Text style={styles.closeButtonText}>إغلاق</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPermissions = () => (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>الصلاحيات</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>صلاحياتك الحالية</Text>
        {userPermissions?.permissions?.map((permission: any, index: number) => (
          <View key={index} style={styles.permissionCard}>
            <Text style={styles.permissionName}>{permission.permissionDisplayName}</Text>
            <Text style={styles.permissionDescription}>{permission.permissionDescription || ""}</Text>
            <Text style={styles.permissionCategory}>الفئة: {permission.permissionCategory}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderDetailModal = () => (
    <Modal visible={showDetailModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.detailModalContent}>
          <View style={styles.detailModalHeader}>
            <Text style={styles.modalTitle}>
              {selectedCategory === "users" && "تفاصيل المستخدمين"}
              {selectedCategory === "pets" && "تفاصيل الحيوانات"}
              {selectedCategory === "inquiries" && "تفاصيل الاستفسارات"}
              {selectedCategory === "consultations" && "تفاصيل الاستشارات"}
              {selectedCategory === "stores" && "تفاصيل المتاجر"}
            </Text>
            <TouchableOpacity
              style={styles.closeDetailButton}
              onPress={() => {
                setShowDetailModal(false);
                setSelectedCategory(null);
              }}
            >
              <Text style={styles.closeDetailButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.detailModalScroll}>
            {selectedCategory === "users" && allUsersData?.users ? (
              <FlatList
                data={allUsersData.users.slice(0, 20)}
                keyExtractor={(item: any) => `user-${item.id}`}
                renderItem={({ item }: { item: any }) => (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemTitle}>{item.name || item.email || "مستخدم"}</Text>
                    <Text style={styles.detailItemSubtitle}>
                      النوع:{" "}
                      {item.userType === "user" ? "مستخدم عادي" : item.userType === "vet" ? "طبيب بيطري" : "مشرف"}
                    </Text>
                    <Text style={styles.detailItemSubtitle}>البريد: {item.email}</Text>
                    <Text style={styles.detailItemDate}>
                      تاريخ الإنشاء: {new Date(item.createdAt).toLocaleDateString("ar-SA")}
                    </Text>
                  </View>
                )}
                scrollEnabled={false}
              />
            ) : detailedStats?.data ? (
              <FlatList
                data={detailedStats.data.slice(0, 20)}
                keyExtractor={(item: any, index) => `${selectedCategory}-${index}`}
                renderItem={({ item }: { item: any }) => (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemTitle}>{item.name || item.title || "عنصر"}</Text>
                    <Text style={styles.detailItemSubtitle}>الحالة: {item.status || "نشط"}</Text>
                    <Text style={styles.detailItemDate}>
                      تاريخ الإنشاء:{" "}
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("ar-SA") : "غير محدد"}
                    </Text>
                  </View>
                )}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>لا توجد بيانات متاحة</Text>
              </View>
            )}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setShowDetailModal(false);
              setSelectedCategory(null);
            }}
          >
            <Text style={styles.closeButtonText}>إغلاق</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderMessageModal = () => (
    <Modal visible={sendMessageModalVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: "90%" }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>إرسال رسالة جديدة</Text>
              <TouchableOpacity onPress={() => setSendMessageModalVisible(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>عنوان الرسالة *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="أدخل عنوان الرسالة"
                value={newMessage.title}
                onChangeText={(text) => setNewMessage((prev) => ({ ...prev, title: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>محتوى الرسالة *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="أدخل محتوى الرسالة"
                value={newMessage.content}
                onChangeText={(text) => setNewMessage((prev) => ({ ...prev, content: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>نوع الرسالة</Text>
              <View style={styles.optionsContainer}>
                {[
                  { key: "announcement", label: "إعلان" },
                  { key: "maintenance", label: "صيانة" },
                  { key: "update", label: "تحديث" },
                  { key: "warning", label: "تحذير" },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[styles.optionButton, newMessage.type === type.key && styles.selectedOption]}
                    onPress={() => setNewMessage((prev) => ({ ...prev, type: type.key as any }))}
                  >
                    <Text style={[styles.optionText, newMessage.type === type.key && styles.selectedOptionText]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الأولوية</Text>
              <View style={styles.optionsContainer}>
                {[
                  { key: "low", label: "منخفضة" },
                  { key: "normal", label: "عادية" },
                  { key: "high", label: "عالية" },
                  { key: "urgent", label: "عاجلة" },
                ].map((priority) => (
                  <TouchableOpacity
                    key={priority.key}
                    style={[styles.optionButton, newMessage.priority === priority.key && styles.selectedOption]}
                    onPress={() => setNewMessage((prev) => ({ ...prev, priority: priority.key as any }))}
                  >
                    <Text
                      style={[styles.optionText, newMessage.priority === priority.key && styles.selectedOptionText]}
                    >
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الفئة المستهدفة *</Text>
              <View style={styles.optionsContainer}>
                {[
                  { key: "all", label: "الكل" },
                  { key: "users", label: "أصحاب الحيوانات" },
                  { key: "vets", label: "الأطباء" },
                  { key: "students", label: "الطلاب" },
                  { key: "multiple", label: "فئات متعددة" },
                ].map((audience) => (
                  <TouchableOpacity
                    key={audience.key}
                    style={[styles.optionButton, newMessage.targetAudience === audience.key && styles.selectedOption]}
                    onPress={() =>
                      setNewMessage((prev) => ({
                        ...prev,
                        targetAudience: audience.key,
                        targetCategories: audience.key !== "multiple" ? [] : prev.targetCategories,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        newMessage.targetAudience === audience.key && styles.selectedOptionText,
                      ]}
                    >
                      {audience.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {newMessage.targetAudience === "multiple" && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>اختر الفئات *</Text>
                <View style={styles.categoriesContainer}>
                  {["users", "vets", "students", "clinics", "stores"].map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={styles.categoryItem}
                      onPress={() => toggleCategory(category)}
                    >
                      <View
                        style={[styles.checkbox, newMessage.targetCategories.includes(category) && styles.checkedBox]}
                      >
                        {newMessage.targetCategories.includes(category) && <CheckCircle size={16} color="#fff" />}
                      </View>
                      <Text style={styles.categoryLabel}>{getCategoryLabel(category)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setSendMessageModalVisible(false)}>
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendButton, sendMessageMutation.isPending && styles.disabledButton]}
                onPress={handleSendNewMessage}
                disabled={sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Send size={16} color="#fff" />
                    <Text style={styles.sendButtonText}>إرسال الرسالة</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {selectedTab === "dashboard" ? renderDashboard() : renderPermissions()}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, selectedTab === "dashboard" && styles.activeNavItem]}
          onPress={() => setSelectedTab("dashboard")}
        >
          <BarChart3 size={20} color={selectedTab === "dashboard" ? "#FF6B6B" : "#666"} />
          <Text style={[styles.navText, selectedTab === "dashboard" && styles.activeNavText]}>الرئيسية</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, selectedTab === "permissions" && styles.activeNavItem]}
          onPress={() => setSelectedTab("permissions")}
        >
          <Shield size={20} color={selectedTab === "permissions" ? "#FF6B6B" : "#666"} />
          <Text style={[styles.navText, selectedTab === "permissions" && styles.activeNavText]}>الصلاحيات</Text>
        </TouchableOpacity>
      </View>

      {renderRoleModal()}
      {renderDetailModal()}
      {renderMessageModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  contentContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "System",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "System",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
    fontFamily: "System",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: "#fff",
    padding: 15,
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
    fontFamily: "System",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
    fontFamily: "System",
  },
  section: {
    margin: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    fontFamily: "System",
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 8,
  },
  roleName: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
    fontFamily: "System",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginTop: 8,
    fontFamily: "System",
  },
  permissionCard: {
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 10,
  },
  permissionName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    fontFamily: "System",
  },
  permissionDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
    fontFamily: "System",
  },
  permissionCategory: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
    fontFamily: "System",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingVertical: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: "#fff2f2",
  },
  navText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontFamily: "System",
  },
  activeNavText: {
    color: "#FF6B6B",
    fontWeight: "bold",
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
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "System",
  },
  modalScroll: {
    maxHeight: 300,
  },
  roleModalCard: {
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 10,
  },
  roleModalName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    fontFamily: "System",
  },
  roleModalDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
    marginTop: 5,
    fontFamily: "System",
  },
  roleModalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  assignButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  assignButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "System",
  },

  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "System",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    textAlign: "right",
    fontFamily: "System",
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  sendButton: {
    flex: 1,
    backgroundColor: "#4ECDC4",
    paddingVertical: 12,
    borderRadius: 8,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "System",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#666",
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "System",
  },

  loadingSubtext: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
    fontFamily: "System",
  },
  userBreakdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  breakdownNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "System",
  },
  breakdownLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
    fontFamily: "System",
  },
  activityContainer: {
    gap: 8,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activityText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "System",
  },
  healthContainer: {
    gap: 8,
  },
  healthItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  healthLabel: {
    fontSize: 14,
    color: "#666",
    fontFamily: "System",
  },
  healthValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "System",
  },
  detailModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "95%",
    maxHeight: "90%",
  },
  detailModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeDetailButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeDetailButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
  detailModalScroll: {
    maxHeight: 400,
    padding: 20,
  },
  detailItem: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  detailItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    fontFamily: "System",
  },
  detailItemSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
    fontFamily: "System",
  },
  detailItemDate: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
    fontFamily: "System",
  },
  noDataContainer: {
    padding: 40,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontFamily: "System",
  },
  moreDataText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
    fontFamily: "System",
  },
  supervisorModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "95%",
    maxHeight: "90%",
  },
  supervisorModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  supervisorModalScroll: {
    maxHeight: 500,
    padding: 15,
  },
  supervisorCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  supervisorHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  supervisorInfo: {
    flex: 1,
  },
  supervisorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    fontFamily: "System",
  },
  supervisorEmail: {
    fontSize: 14,
    color: "#666",
    textAlign: "left",
    marginTop: 2,
    fontFamily: "System",
  },
  supervisorIdBadge: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  supervisorIdText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "System",
  },
  permissionsContainer: {
    marginBottom: 15,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    marginBottom: 8,
    fontFamily: "System",
  },
  permissionItem: {
    marginBottom: 10,
  },
  permissionBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 5,
  },
  permissionBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "System",
  },
  permissionDetails: {
    paddingLeft: 15,
  },
  permissionDetailText: {
    fontSize: 13,
    color: "#666",
    textAlign: "left",
    marginBottom: 2,
    fontFamily: "System",
  },
  supervisorActions: {
    flexDirection: "row",
    gap: 10,
  },
  editPermissionsButton: {
    flex: 1,
    backgroundColor: "#4ECDC4",
    paddingVertical: 10,
    borderRadius: 8,
  },
  editPermissionsButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "System",
  },
  removeSupervisorButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    paddingVertical: 10,
    borderRadius: 8,
  },
  removeSupervisorButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "System",
  },
  addSupervisorButton: {
    backgroundColor: "#28a745",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  addSupervisorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "System",
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
  },
  totalPendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#27AE60",
    backgroundColor: "#f8fff8",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: "#666",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    padding: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    fontFamily: "System",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    fontFamily: "System",
  },
  textArea: {
    height: 100,
    minHeight: 100,
    textAlignVertical: "top",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedOption: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  optionText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    fontFamily: "System",
  },
  selectedOptionText: {
    color: "#fff",
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  categoryLabel: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    fontFamily: "System",
  },
  mediaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mediaButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePreview: {
    marginTop: 8,
    position: "relative",
    alignSelf: "flex-start",
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  linkPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  linkText: {
    flex: 1,
    fontSize: 12,
    color: "#FF6B6B",
    textDecorationLine: "underline",
    fontFamily: "System",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  actionCardWithBadge: {
    position: "relative",
  },
  actionCardContent: {
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "System",
  },
});
