import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { trpc } from "../lib/trpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Calendar,
  Shield,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  TestTube,
  MessageCircle,
  CreditCard,
  KeyRound,
} from "lucide-react-native";
import ImageViewerModal from "../components/ImageViewerModal";

interface UserData {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  userType: "user" | "vet" | "admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  approval?: {
    idFrontImage: string | null;
    idBackImage: string | null;
  } | null;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  expanded?: boolean;
  subOptions?: PermissionSubOption[];
}

interface PermissionSubOption {
  id: string;
  name: string;
  enabled: boolean;
}

interface PermissionCategory {
  name: string;
  permissions: Permission[];
  expanded: boolean;
}

// Permission mapping utility
const permissionTranslations: Record<string, string> = {
  // Category names
  ads: "الإعلانات",
  approvals: "الموافقات",
  assignments: "التكليفات",
  clinics: "العيادات",
  communications: "الاتصالات",
  consultations: "الاستشارات",
  content: "المحتوى",
  education: "التعليم",
  hospitals: "المستشفيات",
  inquiries: "الاستفسارات",
  jobs: "الوظائف",
  notifications: "الإشعارات",
  orders: "الطلبات",
  pets: "الحيوانات الأليفة",
  roles: "الأدوار",
  stores: "المتاجر",
  system: "النظام",
  unions: "النقابات",
  users: "المستخدمين",

  // Permission names
  manage_ads: "إدارة الإعلانات",
  manage_approvals: "إدارة الموافقات",
  manage_clinic_approvals: "إدارة موافقات العيادات",
  manage_store_approvals: "إدارة موافقات المذاخر",
  manage_vet_approvals: "إدارة موافقات تسجيل الأطباء",
  manage_adoption_approvals: "إدارة موافقات حيوانات التبني",
  manage_breeding_approvals: "إدارة موافقات حيوانات التزاوج",
  manage_assignments: "إدارة التكليفات",
  manage_clinics: "إدارة العيادات",
  manage_communications: "إدارة الاتصالات",
  manage_consultations: "إدارة الاستشارات",
  view_consultations: "عرض الاستشارات",
  manage_content: "إدارة المحتوى",
  manage_education: "إدارة التعليم",
  manage_hospitals: "إدارة المستشفيات",
  manage_inquiries: "إدارة الاستفسارات",
  view_inquiries: "عرض الاستفسارات",
  reply_inquiries: "الرد على الاستفسارات",
  manage_jobs: "إدارة الوظائف",
  manage_notifications: "إدارة الإشعارات",
  manage_orders: "إدارة الطلبات",
  manage_pets: "إدارة الحيوانات الأليفة",
  manage_roles: "إدارة الأدوار",
  manage_stores: "إدارة المتاجر",
  view_stores: "عرض المتاجر",
  manage_store_products: "إدارة منتجات المتاجر",
  manage_system: "إدارة النظام",
  view_system_logs: "عرض سجلات النظام",
  manage_system_settings: "إدارة إعدادات النظام",
  manage_poultry_farms: "إدارة حقول الدواجن",
  manage_unions: "إدارة النقابات",
  manage_users: "إدارة المستخدمين",
  view_users: "عرض المستخدمين",
};

export default function AdminUsersList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<"all" | "user" | "vet" | "admin">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentAdminId] = useState(1); // Should come from auth context
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showModeratorsSection, setShowModeratorsSection] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<UserData | null>(null);
  const [messageText, setMessageText] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [showIdImageModal, setShowIdImageModal] = useState(false);
  const [currentIdImageView, setCurrentIdImageView] = useState<"front" | "back" | null>(null);
  const [selectedIdImageUser, setSelectedIdImageUser] = useState<UserData | null>(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Fetch all users
  const {
    data: usersResponse,
    isLoading: usersLoading,
    error: usersError,
    refetch,
  } = useQuery(
    trpc.users.list.queryOptions({
      limit: 100,
      userType: selectedUserType === "all" ? undefined : selectedUserType,
      search: searchQuery.length > 2 ? searchQuery : undefined,
    }),
  );

  // Search users
  const { data: searchResponse, isLoading: searchLoading } = useQuery({
    ...trpc.admin.users.search.queryOptions({
      query: searchQuery,
      adminId: currentAdminId,
      limit: 50,
    }),
    enabled: searchQuery.length > 2,
  });

  // Get supervisors
  const {
    data: supervisorsResponse,
    isLoading: supervisorsLoading,
    refetch: refetchSupervisors,
  } = useQuery(
    trpc.admin.users.getSupervisors.queryOptions({
      limit: 20,
      offset: 0,
    }),
  );

  // Get all permissions grouped
  const { data: permissionsResponse, isLoading: permissionsLoading } = useQuery(
    trpc.admin.permissions.getAllPermissionsGrouped.queryOptions(),
  );

  // Get user permissions when modal opens
  const { data: userPermissionsData, refetch: refetchUserPermissions } = useQuery({
    ...trpc.admin.permissions.getUserPermissions.queryOptions({
      userId: selectedUser?.id || 0,
    }),
    enabled: !!selectedUser && showPermissionsModal,
  });

  // Ban/Unban user mutation
  const banUserMutation = useMutation(trpc.admin.users.ban.mutationOptions());

  // Delete user mutation
  const deleteUserMutation = useMutation(trpc.admin.users.delete.mutationOptions());

  // Assign permissions mutation
  const assignPermissionsMutation = useMutation(trpc.admin.permissions.assignPermissions.mutationOptions());

  // Send message mutation
  const sendMessageMutation = useMutation(trpc.admin.permissions.sendMessageToUser.mutationOptions());

  // Reset password mutation
  const resetPasswordMutation = useMutation(trpc.admin.users.resetPassword.mutationOptions());

  const supervisors = useMemo(() => supervisorsResponse?.supervisors || [], [supervisorsResponse]);

  // Process users data
  const displayUsers: UserData[] = useMemo(() => {
    if (searchQuery.length > 2 && searchResponse) {
      return searchResponse.map((user) => ({
        ...user,
        createdAt: user?.createdAt instanceof Date ? user?.createdAt.toISOString() : user?.createdAt,
        updatedAt: user?.updatedAt instanceof Date ? user?.updatedAt.toISOString() : user?.updatedAt,
      })) as UserData[];
    }

    if (usersResponse?.users) {
      return usersResponse.users.map((item) => ({
        ...item.user,
        createdAt: item.user.createdAt instanceof Date ? item.user.createdAt.toISOString() : item.user.createdAt,
        updatedAt: item.user.updatedAt instanceof Date ? item.user.updatedAt.toISOString() : item.user.updatedAt,
        approval: item.approval
          ? {
              idFrontImage: item.approval.idFrontImage,
              idBackImage: item.approval.idBackImage,
            }
          : null,
      })) as UserData[];
    }

    return [];
  }, [usersResponse, searchResponse, searchQuery]);

  const isLoadingData = usersLoading || searchLoading;

  // Initialize permission categories when permissions are loaded
  useEffect(() => {
    if (permissionsResponse?.grouped) {
      const categories = Object.entries(permissionsResponse.grouped).map(([categoryName, permissions]) => ({
        name: categoryName,
        permissions: (permissions as any[]).map((p) => ({
          ...p,
          enabled: false,
        })),
        expanded: false,
      }));
      setPermissionCategories(categories);
    }
  }, [permissionsResponse]);

  // Load user's existing permissions when modal opens
  useEffect(() => {
    if (userPermissionsData && showPermissionsModal) {
      const enabledPermissionNames = userPermissionsData.permissions.map((p) => p.permissionName);

      // Update categories with enabled permissions
      setPermissionCategories((prev) =>
        prev.map((category) => ({
          ...category,
          permissions: category.permissions.map((p) => ({
            ...p,
            enabled: enabledPermissionNames.includes(p.name),
          })),
        })),
      );

      // Set selected permission IDs
      if (permissionsResponse?.permissions) {
        const enabledIds = permissionsResponse.permissions
          .filter((p) => enabledPermissionNames.includes(p.name))
          .map((p) => p.id);
        setSelectedPermissions(enabledIds);
      }
    }
  }, [userPermissionsData, showPermissionsModal, permissionsResponse]);

  const handleBanUser = (user: UserData) => {
    const action = user.isActive ? "حظر" : "إلغاء حظر";
    Alert.alert(`${action} المستخدم`, `هل أنت متأكد من ${action} ${user.name}؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: action,
        style: user.isActive ? "destructive" : "default",
        onPress: () => {
          banUserMutation.mutate(
            {
              userId: user.id,
              adminId: currentAdminId,
              ban: user.isActive,
              reason: `${action} من قبل المشرف`,
            } as any,
            {
              onSuccess: () => {
                refetch();
                Alert.alert("نجح", "تم تحديث حالة المستخدم بنجاح");
              },
              onError: (error) => {
                Alert.alert("خطأ", error.message || "فشل في تحديث حالة المستخدم");
              },
            },
          );
        },
      },
    ]);
  };

  const handleDeleteUser = (user: UserData) => {
    Alert.alert("حذف المستخدم", `هل أنت متأكد من حذف ${user.name}؟ هذا الإجراء لا يمكن التراجع عنه.`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          deleteUserMutation.mutate(
            {
              userId: user.id,
              adminId: currentAdminId,
              reason: "حذف من قبل المشرف",
            } as any,
            {
              onSuccess: () => {
                refetch();
                Alert.alert("نجح", "تم حذف المستخدم بنجاح");
              },
              onError: (error) => {
                Alert.alert("خطأ", error.message || "فشل في حذف المستخدم");
              },
            },
          );
        },
      },
    ]);
  };

  const handleSendMessage = (user: UserData) => {
    setMessageRecipient(user);
    setShowMessageModal(true);
  };

  const handleSendMessageSubmit = () => {
    if (!messageRecipient || !messageText.trim()) {
      Alert.alert("خطأ", "يرجى كتابة الرسالة");
      return;
    }

    sendMessageMutation.mutate(
      {
        recipientId: messageRecipient.id,
        senderId: currentAdminId,
        title: "رسالة من الإدارة",
        content: messageText,
        type: "info" as const,
        priority: "normal" as const,
      },
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم إرسال الرسالة بنجاح");
          setShowMessageModal(false);
          setMessageRecipient(null);
          setMessageText("");
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message || "فشل في إرسال الرسالة");
        },
      },
    );
  };

  const handleViewProfile = (user: UserData) => {
    router.push({
      pathname: "/user-profile",
      params: {
        userId: user.id.toString(),
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone || "",
        userType: user.userType,
        isActive: user.isActive.toString(),
        createdAt: user.createdAt,
      },
    });
  };

  const handleOpenPermissions = (user: UserData) => {
    setSelectedUser(user);
    setSelectedPermissions([]);
    setShowPermissionsModal(true);
  };

  const handleViewIdImage = (user: UserData, side: "front" | "back") => {
    if (!user.approval) {
      Alert.alert("تنبيه", "لا توجد صور هوية لهذا المستخدم");
      return;
    }

    const imageUrl = side === "front" ? user.approval.idFrontImage : user.approval.idBackImage;

    if (!imageUrl) {
      Alert.alert("تنبيه", `لا توجد صورة ${side === "front" ? "الوجه الأمامي" : "الوجه الخلفي"} للهوية`);
      return;
    }

    setSelectedIdImageUser(user);
    setCurrentIdImageView(side);
    setShowIdImageModal(true);
  };

  const handleResetPassword = (user: UserData) => {
    setResetPasswordUser(user);
    setNewPassword("");
    setShowResetPasswordModal(true);
  };

  const handleResetPasswordSubmit = () => {
    if (!resetPasswordUser || !newPassword.trim()) {
      Alert.alert("خطأ", "يرجى إدخال كلمة المرور الجديدة");
      return;
    }
    if (newPassword.trim().length < 6) {
      Alert.alert("خطأ", "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    Alert.alert("تأكيد إعادة تعيين كلمة المرور", `هل أنت متأكد من إعادة تعيين كلمة مرور ${resetPasswordUser.name}؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تأكيد",
        style: "destructive",
        onPress: () => {
          resetPasswordMutation.mutate(
            {
              userId: resetPasswordUser.id,
              newPassword: newPassword.trim(),
            },
            {
              onSuccess: (data) => {
                Alert.alert("نجح", data.message);
                setShowResetPasswordModal(false);
                setResetPasswordUser(null);
                setNewPassword("");
              },
              onError: (error) => {
                Alert.alert("خطأ", error.message || "فشل في إعادة تعيين كلمة المرور");
              },
            },
          );
        },
      },
    ]);
  };

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });

    // Update the local state
    setPermissionCategories((prev) =>
      prev.map((category) => ({
        ...category,
        permissions: category.permissions.map((p) => (p.id === permissionId ? { ...p, enabled: !p.enabled } : p)),
      })),
    );
  };

  const handleToggleCategory = (categoryName: string) => {
    setPermissionCategories((prev) =>
      prev.map((cat) => (cat.name === categoryName ? { ...cat, expanded: !cat.expanded } : cat)),
    );
  };

  const handleSavePermissions = () => {
    if (!selectedUser) return;

    const enabledPermissions = permissionCategories.flatMap((cat) => cat.permissions.filter((p) => p.enabled));

    Alert.alert(
      "تأكيد حفظ الصلاحيات",
      `سيتم منح ${selectedUser.name} الصلاحيات التالية:\n\n${enabledPermissions
        .map((p) => `• ${p.displayName}`)
        .join("\n")}\n\nهذا سيجعله مشرفاً فعالاً.`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد وحفظ",
          style: "default",
          onPress: () => {
            assignPermissionsMutation.mutate(
              {
                userId: selectedUser.id,
                permissionIds: selectedPermissions,
                assignedBy: currentAdminId,
              } as any,
              {
                onSuccess: () => {
                  Alert.alert("تم بنجاح", `تم منح ${selectedUser.name} الصلاحيات المحددة بنجاح`);
                  setShowPermissionsModal(false);
                  setSelectedUser(null);
                  setSelectedPermissions([]);
                  refetch();
                  refetchSupervisors();
                },
                onError: (error) => {
                  Alert.alert("خطأ", error.message || "فشل في حفظ الصلاحيات");
                },
              },
            );
          },
        },
      ],
    );
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "user":
        return "مستخدم عادي";
      case "vet":
        return "طبيب بيطري";
      case "admin":
        return "مشرف";
      default:
        return "غير محدد";
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "user":
        return "#4ECDC4";
      case "vet":
        return "#45B7D1";
      case "admin":
        return "#FF6B6B";
      default:
        return "#999";
    }
  };

  const hasIdImages = (user: UserData) => {
    return user.approval && (user.approval.idFrontImage || user.approval.idBackImage);
  };

  const renderUserCard = ({ item: user }: { item: UserData }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={() => handleViewProfile(user)}>
            <Text style={styles.userName}>{user.name}</Text>
          </TouchableOpacity>
          <View style={styles.userBadgesContainer}>
            <View style={[styles.userTypeBadge, { backgroundColor: getUserTypeColor(user.userType) }]}>
              <Text style={styles.userTypeText}>{getUserTypeLabel(user.userType)}</Text>
            </View>
            {user.userType === "admin" && (
              <View style={styles.shieldBadge}>
                <Shield size={12} color="#FFD700" />
              </View>
            )}
            {hasIdImages(user) && (
              <View style={styles.idBadge}>
                <CreditCard size={12} color="#4CAF50" />
              </View>
            )}
          </View>
        </View>
        <View style={styles.userStatusContainer}>
          <TouchableOpacity style={styles.messageButton} onPress={() => handleSendMessage(user)}>
            <MessageCircle size={16} color="#4ECDC4" />
          </TouchableOpacity>
          <View style={[styles.statusIndicator, { backgroundColor: user.isActive ? "#4CAF50" : "#F44336" }]} />
        </View>
      </View>

      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Mail size={16} color="#666" />
          <Text style={styles.detailText}>{user.email}</Text>
        </View>
        {user.phone && (
          <View style={styles.detailRow}>
            <Phone size={16} color="#666" />
            <Text style={styles.detailText}>{user.phone}</Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={styles.detailText}>ID: {user.id}</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#666" />
          <Text style={styles.detailText}>انضم في: {new Date(user.createdAt).toLocaleDateString("ar-SA")}</Text>
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleViewProfile(user)}>
          <Eye size={18} color="#4ECDC4" />
        </TouchableOpacity>

        {/* ID Images Buttons */}
        {hasIdImages(user) && (
          <View style={styles.idImagesContainer}>
            {user.approval?.idFrontImage && (
              <TouchableOpacity
                style={[styles.actionButton, styles.idImageButton]}
                onPress={() => handleViewIdImage(user, "front")}
              >
                <CreditCard size={18} color="#4CAF50" />
                <Text style={styles.idImageLabel}>أمامي</Text>
              </TouchableOpacity>
            )}
            {user.approval?.idBackImage && (
              <TouchableOpacity
                style={[styles.actionButton, styles.idImageButton]}
                onPress={() => handleViewIdImage(user, "back")}
              >
                <CreditCard size={18} color="#2196F3" />
                <Text style={styles.idImageLabel}>خلفي</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenPermissions(user)}>
          <Shield size={18} color="#9C27B0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleResetPassword(user)}>
          <KeyRound size={18} color="#FF6B6B" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleBanUser(user)}
          disabled={banUserMutation.isPending}
        >
          {user.isActive ? <UserX size={18} color="#FF9800" /> : <UserCheck size={18} color="#4CAF50" />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteUser(user)}
          disabled={deleteUserMutation.isPending}
        >
          <Trash2 size={18} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.filtersTitle}>تصفية حسب نوع المستخدم:</Text>
      <View style={styles.filterButtons}>
        {[
          { key: "all", label: "الكل" },
          { key: "user", label: "مستخدمين عاديين" },
          { key: "vet", label: "أطباء بيطريين" },
          { key: "admin", label: "مشرفين" },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterButton, selectedUserType === filter.key && styles.activeFilterButton]}
            onPress={() => setSelectedUserType(filter.key as any)}
          >
            <Text style={[styles.filterButtonText, selectedUserType === filter.key && styles.activeFilterButtonText]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "إدارة المستخدمين",
          headerStyle: { backgroundColor: "#FF6B6B" },
          headerTintColor: "#fff",
        }}
      />

      <ScrollView>
        {/* Search and Filter Header */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث عن مستخدم..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterToggle} onPress={() => setShowFilters(!showFilters)}>
            <Filter size={20} color={showFilters ? "#FF6B6B" : "#666"} />
          </TouchableOpacity>
        </View>

        {showFilters && renderFilters()}

        {/* Moderators Section Toggle */}
        <TouchableOpacity
          style={styles.moderatorsSectionToggle}
          onPress={() => setShowModeratorsSection(!showModeratorsSection)}
        >
          <Shield size={20} color="#8B5CF6" />
          <Text style={styles.moderatorsSectionTitle}>المشرفون حسب صلاحياتهم</Text>
          <ChevronDown
            size={20}
            color="#666"
            style={[styles.chevron, showModeratorsSection && styles.chevronRotated]}
          />
        </TouchableOpacity>

        {showModeratorsSection && (
          <View style={styles.moderatorsSection}>
            <Text style={styles.moderatorsSectionSubtitle}>قائمة المشرفين والصلاحيات المخصصة لهم</Text>

            {supervisorsLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>جاري تحميل المشرفين...</Text>
              </View>
            ) : supervisors.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Shield size={48} color="#ccc" />
                <Text style={styles.emptyText}>لا يوجد مشرفين</Text>
              </View>
            ) : (
              supervisors.map((moderator) => (
                <View key={moderator.id} style={styles.moderatorCard}>
                  <View style={styles.moderatorHeader}>
                    <View style={styles.moderatorInfo}>
                      <Text style={styles.moderatorName}>{moderator.name}</Text>
                      <Text style={styles.moderatorEmail}>{moderator.email}</Text>
                      <Text style={styles.moderatorId}>ID: {moderator.id}</Text>
                    </View>
                    <View style={[styles.moderatorStatusBadge, { backgroundColor: "#45B7D1" }]}>
                      <Text style={styles.moderatorStatusText}>مشرف</Text>
                    </View>
                  </View>

                  <View style={styles.permissionsList}>
                    <Text style={styles.permissionsListTitle}>الصلاحيات:</Text>

                    <View style={{ flexDirection: "row-reverse", gap: 4, flexWrap: "wrap" }}>
                      {moderator.permissions?.map((permission) => (
                        <View key={permission.permissionName} style={styles.permissionTag}>
                          <Text style={styles.permissionTagText}>{permission.permissionDisplayName}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.moderatorActions}>
                    <TouchableOpacity
                      style={styles.moderatorActionButton}
                      onPress={() => handleOpenPermissions(moderator)}
                    >
                      <Edit size={16} color="#45B7D1" />
                      <Text style={styles.moderatorActionText}>تعديل الصلاحيات</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Users size={20} color="#4ECDC4" />
            <Text style={styles.statNumber}>{displayUsers.length}</Text>
            <Text style={styles.statLabel}>إجمالي المستخدمين</Text>
          </View>
          <View style={styles.statItem}>
            <UserCheck size={20} color="#4CAF50" />
            <Text style={styles.statNumber}>{displayUsers.filter((u) => u.isActive).length}</Text>
            <Text style={styles.statLabel}>نشط</Text>
          </View>
          <View style={styles.statItem}>
            <UserX size={20} color="#F44336" />
            <Text style={styles.statNumber}>{displayUsers.filter((u) => !u.isActive).length}</Text>
            <Text style={styles.statLabel}>معطل</Text>
          </View>
        </View>

        {/* Error Warning */}
        {usersError && (
          <View style={styles.demoWarning}>
            <Text style={styles.demoWarningText}>⚠️ خطأ في تحميل البيانات</Text>
            <Text style={styles.demoWarningSubtext}>{usersError.message}</Text>
          </View>
        )}

        {/* Users List */}
        {isLoadingData ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري التحميل...</Text>
          </View>
        ) : displayUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Users size={48} color="#ccc" />
            <Text style={styles.emptyText}>لا توجد مستخدمين</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? "لم يتم العثور على نتائج للبحث" : "لم يتم العثور على مستخدمين"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayUsers}
            keyExtractor={(item) => `user-${item.id}`}
            renderItem={renderUserCard}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* ID Image Viewer Modal */}
        <ImageViewerModal
          visible={showIdImageModal}
          imageUrl={
            selectedIdImageUser && currentIdImageView
              ? currentIdImageView === "front"
                ? selectedIdImageUser.approval?.idFrontImage || null
                : selectedIdImageUser.approval?.idBackImage || null
              : null
          }
          onClose={() => {
            setShowIdImageModal(false);
            setSelectedIdImageUser(null);
            setCurrentIdImageView(null);
          }}
        />

        {/* Permissions Modal */}
        <Modal
          visible={showPermissionsModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPermissionsModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowPermissionsModal(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>إدارة الصلاحيات</Text>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSavePermissions}
                disabled={assignPermissionsMutation.isPending}
              >
                <Text style={styles.modalSaveButtonText}>
                  {assignPermissionsMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                </Text>
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <View style={styles.selectedUserInfo}>
                <Text style={styles.selectedUserName}>{selectedUser.name}</Text>
                <Text style={styles.selectedUserEmail}>{selectedUser.email}</Text>
                <Text style={styles.selectedUserId}>ID: {selectedUser.id}</Text>
              </View>
            )}

            <ScrollView style={styles.permissionsContainer}>
              <Text style={styles.permissionsTitle}>اختر الصلاحيات المطلوبة:</Text>

              {permissionsLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>جاري تحميل الصلاحيات...</Text>
                </View>
              ) : (
                permissionCategories.map((category) => (
                  <View key={category.name} style={styles.categoryContainer}>
                    <TouchableOpacity style={styles.categoryHeader} onPress={() => handleToggleCategory(category.name)}>
                      <Text style={styles.categoryName}>{permissionTranslations[category.name]}</Text>
                      {category.expanded ? (
                        <ChevronDown size={20} color="#666" />
                      ) : (
                        <ChevronRight size={20} color="#666" />
                      )}
                    </TouchableOpacity>

                    {category.expanded && (
                      <View style={styles.permissionsGroup}>
                        {category.permissions.map((permission) => (
                          <TouchableOpacity
                            key={permission.id}
                            style={styles.permissionItem}
                            onPress={() => handleTogglePermission(permission.id)}
                          >
                            <View style={styles.permissionInfo}>
                              <Text style={styles.permissionName}>{permission.displayName}</Text>
                              {permission.description && (
                                <Text style={styles.permissionDescription}>{permission.description}</Text>
                              )}
                            </View>
                            <View
                              style={[styles.permissionToggle, permission.enabled && styles.permissionToggleActive]}
                            >
                              {permission.enabled && <Check size={16} color="#fff" />}
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ))
              )}

              <View style={styles.permissionsNote}>
                <Text style={styles.permissionsNoteText}>
                  ⚠️ هذه الصلاحيات يتم منحها فقط عبر تحديد من الأدمن الأساسي
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Message Modal */}
        <Modal
          visible={showMessageModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowMessageModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowMessageModal(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>إرسال رسالة</Text>
              <TouchableOpacity style={styles.modalSaveButton} onPress={handleSendMessageSubmit}>
                <Text style={styles.modalSaveButtonText}>إرسال</Text>
              </TouchableOpacity>
            </View>

            {messageRecipient && (
              <View style={styles.selectedUserInfo}>
                <Text style={styles.selectedUserName}>إلى: {messageRecipient.name}</Text>
                <Text style={styles.selectedUserEmail}>{messageRecipient.email}</Text>
                <Text style={styles.selectedUserId}>ID: {messageRecipient.id}</Text>
              </View>
            )}

            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>نص الرسالة:</Text>
              <TextInput
                style={styles.messageInput}
                placeholder="اكتب رسالتك هنا..."
                placeholderTextColor="#999"
                value={messageText}
                onChangeText={setMessageText}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </SafeAreaView>
        </Modal>

        {/* Reset Password Modal */}
        <Modal
          visible={showResetPasswordModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowResetPasswordModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowResetPasswordModal(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>إعادة تعيين كلمة المرور</Text>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleResetPasswordSubmit}
                disabled={resetPasswordMutation.isPending}
              >
                <Text style={styles.modalSaveButtonText}>{resetPasswordMutation.isPending ? "جاري..." : "تأكيد"}</Text>
              </TouchableOpacity>
            </View>

            {resetPasswordUser && (
              <View style={styles.selectedUserInfo}>
                <Text style={styles.selectedUserName}>{resetPasswordUser.name}</Text>
                <Text style={styles.selectedUserEmail}>{resetPasswordUser.email}</Text>
                {/* <Text style={styles.selectedUserId}>ID: {resetPasswordUser.id}</Text> */}
              </View>
            )}

            <View style={styles.messageContainer}>
              <Text style={styles.messageLabel}>كلمة المرور الجديدة:</Text>
              <TextInput
                style={styles.resetPasswordInput}
                placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                placeholderTextColor="#999"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={false}
                autoCapitalize="none"
              />
              <View style={styles.resetPasswordWarning}>
                <Text style={styles.resetPasswordWarningText}>
                  ⚠️ هذا الإجراء متاح فقط للمدير العام (Super Admin). سيتم تغيير كلمة مرور المستخدم فوراً.
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row-reverse",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    textAlign: "left",
    paddingVertical: 12,
    fontFamily: "System",
  },
  filterToggle: {
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "left",
    fontFamily: "System",
  },
  filterButtons: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeFilterButton: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "System",
  },
  activeFilterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row-reverse",
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "System",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontFamily: "System",
  },
  demoWarning: {
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    padding: 12,
    margin: 15,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  demoWarningText: {
    color: "#92400e",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "System",
  },
  demoWarningSubtext: {
    color: "#92400e",
    fontSize: 12,
    textAlign: "center",
    marginTop: 5,
    fontFamily: "System",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "System",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
    fontFamily: "System",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    fontFamily: "System",
  },
  listContainer: {
    padding: 15,
    gap: 12,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    marginBottom: 6,
    fontFamily: "System",
  },
  userBadgesContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  userTypeBadge: {
    alignSelf: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userTypeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "System",
  },
  shieldBadge: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  idBadge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  userStatusContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  messageButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  userDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    textAlign: "left",
    fontFamily: "System",
  },
  userActions: {
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
    gap: 12,
    flexWrap: "wrap",
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  idImagesContainer: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  idImageButton: {
    flexDirection: "column",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 2,
  },
  idImageLabel: {
    fontSize: 10,
    color: "#666",
    fontWeight: "600",
    fontFamily: "System",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "System",
  },
  modalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
  },
  modalSaveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "System",
  },
  selectedUserInfo: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedUserName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    fontFamily: "System",
  },
  selectedUserEmail: {
    fontSize: 14,
    color: "#666",
    textAlign: "left",
    marginTop: 4,
    fontFamily: "System",
  },
  selectedUserId: {
    fontSize: 12,
    color: "#999",
    textAlign: "left",
    marginTop: 2,
    fontFamily: "System",
  },
  permissionsContainer: {
    flex: 1,
    padding: 16,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "left",
    fontFamily: "System",
  },
  permissionItem: {
    flex: 1,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 16,
  },
  permissionInfo: {
    flex: 1,
    marginRight: 12,
  },
  permissionActions: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  expandButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#f8f9fa",
  },
  permissionName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    marginBottom: 4,
    fontFamily: "System",
  },
  permissionDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "left",
    lineHeight: 20,
    fontFamily: "System",
  },
  permissionToggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionToggleActive: {
    backgroundColor: "#4CAF50",
  },
  permissionsNote: {
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 70,
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  permissionsNoteText: {
    color: "#856404",
    fontSize: 14,
    textAlign: "left",
    lineHeight: 20,
    fontFamily: "System",
  },
  subOptionsContainer: {
    backgroundColor: "#f8f9fa",
    marginTop: 8,
    borderRadius: 8,
    padding: 8,
  },
  subOptionItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  subOptionName: {
    fontSize: 14,
    color: "#333",
    textAlign: "left",
    fontFamily: "System",
  },
  subOptionToggle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  subOptionToggleActive: {
    backgroundColor: "#4CAF50",
  },
  moderatorsSectionToggle: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    gap: 12,
  },
  moderatorsSectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    fontFamily: "System",
  },
  chevron: {
    transform: [{ rotate: "180deg" }],
  },
  chevronRotated: {
    transform: [{ rotate: "0deg" }],
  },
  moderatorsSection: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  moderatorsSectionSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "left",
    marginBottom: 16,
    fontFamily: "System",
  },
  moderatorCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
  },
  moderatorHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  moderatorInfo: {
    flex: 1,
  },
  moderatorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    marginBottom: 4,
    fontFamily: "System",
  },
  moderatorEmail: {
    fontSize: 14,
    color: "#666",
    textAlign: "left",
    marginBottom: 2,
    fontFamily: "System",
  },
  moderatorId: {
    fontSize: 12,
    color: "#999",
    textAlign: "left",
    fontFamily: "System",
  },
  moderatorStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moderatorStatusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "System",
  },
  permissionsList: {
    marginBottom: 12,
  },
  permissionsListTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
    marginBottom: 8,
    fontFamily: "System",
  },
  permissionTag: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
    alignSelf: "flex-end",
  },
  permissionTagText: {
    fontSize: 12,
    color: "#1976d2",
    fontWeight: "500",
    textAlign: "left",
    fontFamily: "System",
  },
  moderatorActions: {
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
  },
  moderatorActionButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  moderatorActionText: {
    fontSize: 14,
    color: "#45B7D1",
    fontWeight: "500",
    fontFamily: "System",
  },
  messageContainer: {
    flex: 1,
    padding: 16,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "left",
    fontFamily: "System",
  },
  messageInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    textAlign: "left",
    borderWidth: 1,
    borderColor: "#ddd",
    minHeight: 120,
    fontFamily: "System",
  },

  categoryContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  categoryHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    textAlign: "left",
  },

  permissionsGroup: {
    paddingTop: 6,
    paddingBottom: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  resetPasswordInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    textAlign: "right",
    borderWidth: 1,
    borderColor: "#ddd",
    fontFamily: "System",
  },
  resetPasswordWarning: {
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  resetPasswordWarningText: {
    color: "#856404",
    fontSize: 14,
    textAlign: "left",
    lineHeight: 20,
    fontFamily: "System",
  },
});
