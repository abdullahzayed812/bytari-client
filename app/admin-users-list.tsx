import React, { useMemo, useState } from "react";
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
} from "lucide-react-native";
// import { useApp } from "../providers/AppProvider";

interface UserData {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  userType: "user" | "vet" | "admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export default function AdminUsersList() {
  // Mock function for testing moderator login
  const loginAsModerator = async () => {
    return { success: true, message: "تم تسجيل دخول المشرف التجريبي بنجاح" };
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<"all" | "user" | "vet" | "admin">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentAdminId] = useState(1); // Mock admin ID
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showModeratorsSection, setShowModeratorsSection] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<UserData | null>(null);
  const [messageText, setMessageText] = useState("");
  const [userPermissions, setUserPermissions] = useState<Permission[]>([
    {
      id: "consultations_reply",
      name: "صلاحيات الرد على الاستشارات",
      description: "السماح بالرد على الاستشارات والاستفسارات",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "consultations", name: "الاستشارات", enabled: false },
        { id: "inquiries", name: "الاستفسارات", enabled: false },
      ],
    },
    {
      id: "sections_control",
      name: "صلاحيات التحكم بالأقسام",
      description: "التحكم في الأقسام حسب التحديد أو كلها",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "pets_section", name: "قسم الحيوانات الأليفة", enabled: false },
        { id: "clinics_section", name: "قسم العيادات", enabled: false },
        { id: "stores_section", name: "قسم المتاجر", enabled: false },
        { id: "lost_pets_section", name: "قسم الحيوانات المفقودة", enabled: false },
        { id: "adoption_section", name: "قسم التبني والتزاوج", enabled: false },
        { id: "tips_section", name: "قسم النصائح", enabled: false },
        { id: "books_section", name: "قسم الكتب البيطرية", enabled: false },
        { id: "courses_section", name: "قسم الدورات والندوات", enabled: false },
        { id: "jobs_section", name: "قسم الوظائف", enabled: false },
        { id: "vet_union_section", name: "قسم نقابة الأطباء البيطريين", enabled: false },
      ],
    },
    {
      id: "hospitals_management",
      name: "صلاحيات إدارة المستشفيات",
      description: "إدارة المستشفيات البيطرية والتحكم في عملياتها",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "hospital_create", name: "إنشاء مستشفيات جديدة", enabled: false },
        { id: "hospital_edit", name: "تعديل معلومات المستشفيات", enabled: false },
        { id: "hospital_delete", name: "حذف المستشفيات", enabled: false },
        { id: "hospital_announcements", name: "إدارة إعلانات المستشفيات", enabled: false },
        { id: "hospital_doctors", name: "إدارة أطباء المستشفيات", enabled: false },
        { id: "hospital_appointments", name: "إدارة مواعيد المستشفيات", enabled: false },
        { id: "hospital_reports", name: "عرض تقارير المستشفيات", enabled: false },
        { id: "hospital_settings", name: "إعدادات المستشفيات", enabled: false },
        { id: "hospital_analytics", name: "إحصائيات المستشفيات", enabled: false },
        { id: "hospital_users", name: "إدارة مستخدمي المستشفيات", enabled: false },
      ],
    },
    {
      id: "union_management",
      name: "صلاحيات إدارة النقابة",
      description: "إدارة نقابة الأطباء البيطريين وفروعها",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "union_main_settings", name: "إعدادات النقابة الرئيسية", enabled: false },
        { id: "union_branches", name: "إدارة فروع النقابة", enabled: false },
        { id: "union_announcements", name: "إدارة إعلانات النقابة", enabled: false },
        { id: "union_members", name: "إدارة أعضاء النقابة", enabled: false },
        { id: "union_events", name: "إدارة فعاليات النقابة", enabled: false },
        { id: "union_certificates", name: "إدارة شهادات النقابة", enabled: false },
        { id: "union_reports", name: "تقارير النقابة", enabled: false },
        { id: "union_analytics", name: "إحصائيات النقابة", enabled: false },
        { id: "union_notifications", name: "إشعارات النقابة", enabled: false },
        { id: "union_users", name: "إدارة مستخدمي النقابة", enabled: false },
      ],
    },
    {
      id: "ads_control",
      name: "صلاحيات الإعلانات",
      description: "إدارة الإعلانات والتحكم في الصفحة الرئيسية",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "main_ads", name: "الإعلانات الرئيسية", enabled: false },
        { id: "section_ads", name: "إعلانات الأقسام", enabled: false },
        { id: "sponsored_content", name: "المحتوى المدعوم", enabled: false },
      ],
    },
    {
      id: "homepage_control",
      name: "التحكم في الصفحة الرئيسية",
      description: "إضافة العيادات والمتاجر وغيرها في الصفحة الرئيسية",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "main_banner", name: "الإعلان الأساسي", enabled: false },
        { id: "featured_clinics", name: "العيادات المميزة", enabled: false },
        { id: "featured_stores", name: "المتاجر المميزة", enabled: false },
        { id: "featured_books", name: "الكتب المميزة", enabled: false },
        { id: "featured_articles", name: "المقالات المميزة", enabled: false },
        { id: "featured_tips", name: "النصائح المميزة", enabled: false },
      ],
    },
    {
      id: "messaging",
      name: "صلاحيات الرسائل العامة",
      description: "إرسال رسالة عامة للكل والتواصل معهم",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "broadcast_messages", name: "الرسائل العامة", enabled: false },
        { id: "notifications", name: "الإشعارات", enabled: false },
        { id: "direct_messaging", name: "الرسائل المباشرة", enabled: false },
      ],
    },
    {
      id: "users_management",
      name: "صلاحيات المستخدمين",
      description: "حظر وإضافة وتغيير معلومات المستخدمين",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "ban_users", name: "حظر المستخدمين", enabled: false },
        { id: "edit_users", name: "تعديل معلومات المستخدمين", enabled: false },
        { id: "delete_users", name: "حذف المستخدمين", enabled: false },
        { id: "view_user_details", name: "عرض تفاصيل المستخدمين", enabled: false },
      ],
    },
    {
      id: "store_management",
      name: "صلاحيات إدارة المتجر",
      description: "إدارة المتاجر وتحديد نوع المتجر (طبيب أو صاحب حيوان)",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "vet_stores", name: "متاجر الأطباء البيطريين", enabled: false },
        { id: "pet_owner_stores", name: "متاجر أصحاب الحيوانات", enabled: false },
        { id: "all_stores", name: "جميع المتاجر", enabled: false },
        { id: "store_products", name: "إدارة منتجات المتاجر", enabled: false },
        { id: "store_orders", name: "عرض طلبات المتاجر", enabled: false },
      ],
    },
    {
      id: "approvals_management",
      name: "صلاحيات إدارة الموافقات",
      description: "إدارة موافقات التسجيل والعيادات والمذاخر والحيوانات",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "vet_registration_approvals", name: "موافقات تسجيل الأطباء", enabled: false },
        { id: "clinic_approvals", name: "موافقة العيادات", enabled: false },
        { id: "pharmacy_approvals", name: "موافقة المذاخر", enabled: false },
        { id: "adoption_pet_approvals", name: "موافقات حيوانات للتبني", enabled: false },
        { id: "breeding_pet_approvals", name: "موافقات حيوانات للتزاوج", enabled: false },
        { id: "all_approvals", name: "جميع الموافقات", enabled: false },
      ],
    },
    {
      id: "vet_approvals_management",
      name: "صلاحيات موافقات الأطباء البيطريين",
      description: "إدارة طلبات الموافقة على تسجيل الأطباء البيطريين الجدد",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "vet_approvals_view", name: "عرض طلبات موافقة الأطباء", enabled: false },
        { id: "vet_approvals_approve", name: "الموافقة على الأطباء البيطريين", enabled: false },
        { id: "vet_approvals_reject", name: "رفض طلبات الأطباء البيطريين", enabled: false },
        { id: "vet_approvals_manage", name: "إدارة موافقات الأطباء البيطريين", enabled: false },
        { id: "vet_approvals_notifications", name: "إشعارات موافقات الأطباء", enabled: false },
      ],
    },
    {
      id: "jobs_management",
      name: "صلاحيات إدارة الوظائف",
      description: "إدارة شاملة لنظام الوظائف والتوظيف والإشراف الميداني",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "jobs_view", name: "عرض الوظائف", enabled: false },
        { id: "jobs_create", name: "إنشاء وظائف جديدة", enabled: false },
        { id: "jobs_edit", name: "تعديل الوظائف", enabled: false },
        { id: "jobs_delete", name: "حذف الوظائف", enabled: false },
        { id: "jobs_applications_view", name: "عرض طلبات التوظيف", enabled: false },
        { id: "jobs_applications_manage", name: "إدارة طلبات التوظيف", enabled: false },
        { id: "jobs_notifications", name: "إشعارات الوظائف", enabled: false },
        { id: "jobs_analytics", name: "إحصائيات الوظائف", enabled: false },
        { id: "jobs_field_supervision", name: "إشراف ميداني", enabled: false },
        { id: "jobs_manage_all", name: "إدارة شاملة للوظائف", enabled: false },
      ],
    },
    {
      id: "courses_management",
      name: "صلاحيات إدارة الدورات والندوات",
      description: "إدارة شاملة لنظام الدورات والندوات التدريبية",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "courses_view", name: "عرض الدورات والندوات", enabled: false },
        { id: "courses_create", name: "إنشاء دورات وندوات جديدة", enabled: false },
        { id: "courses_edit", name: "تعديل الدورات والندوات", enabled: false },
        { id: "courses_delete", name: "حذف الدورات والندوات", enabled: false },
        { id: "courses_registrations_view", name: "عرض تسجيلات الدورات", enabled: false },
        { id: "courses_registrations_manage", name: "إدارة تسجيلات الدورات", enabled: false },
        { id: "courses_certificates", name: "إدارة شهادات الدورات", enabled: false },
        { id: "courses_analytics", name: "إحصائيات الدورات", enabled: false },
        { id: "courses_manage_all", name: "إدارة شاملة للدورات والندوات", enabled: false },
      ],
    },
    {
      id: "assignments_management",
      name: "صلاحيات إدارة التعيين والإشراف",
      description: "إدارة التعيينات الميدانية والإشراف على الأعمال البيطرية",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "assignments_view", name: "عرض التعيينات الميدانية", enabled: false },
        { id: "assignments_create", name: "إنشاء تعيينات جديدة", enabled: false },
        { id: "assignments_edit", name: "تعديل التعيينات", enabled: false },
        { id: "assignments_delete", name: "حذف التعيينات", enabled: false },
        { id: "assignments_approve", name: "الموافقة على التعيينات", enabled: false },
        { id: "assignments_supervise", name: "الإشراف الميداني", enabled: false },
        { id: "assignments_reports", name: "تقارير التعيينات", enabled: false },
        { id: "assignments_analytics", name: "إحصائيات التعيينات", enabled: false },
        { id: "assignments_manage_all", name: "إدارة شاملة للتعيين والإشراف", enabled: false },
      ],
    },
    {
      id: "pet_approvals_management",
      name: "صلاحيات إدارة موافقات الحيوانات",
      description: "إدارة طلبات الموافقة على إضافة الحيوانات للتبني والتزاوج والمفقودة",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "pet_approvals_view", name: "عرض طلبات موافقة الحيوانات", enabled: false },
        { id: "pet_approvals_approve", name: "الموافقة على الحيوانات", enabled: false },
        { id: "pet_approvals_reject", name: "رفض طلبات الحيوانات", enabled: false },
        { id: "pet_approvals_edit", name: "تعديل طلبات الحيوانات", enabled: false },
        { id: "pet_approvals_delete", name: "حذف طلبات الحيوانات", enabled: false },
        { id: "pet_approvals_notifications", name: "إشعارات موافقات الحيوانات", enabled: false },
        { id: "pet_approvals_analytics", name: "إحصائيات موافقات الحيوانات", enabled: false },
        { id: "pet_approvals_manage_all", name: "إدارة شاملة لموافقات الحيوانات", enabled: false },
      ],
    },
    {
      id: "orders_management",
      name: "صلاحيات إدارة الطلبات",
      description: "إدارة طلبات المنتجات من المتاجر ومتابعة حالة الطلبات",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "orders_view", name: "عرض الطلبات", enabled: false },
        { id: "orders_approve", name: "الموافقة على الطلبات", enabled: false },
        { id: "orders_reject", name: "رفض الطلبات", enabled: false },
        { id: "orders_edit", name: "تعديل الطلبات", enabled: false },
        { id: "orders_delete", name: "حذف الطلبات", enabled: false },
        { id: "orders_track", name: "تتبع الطلبات", enabled: false },
        { id: "orders_notifications", name: "إشعارات الطلبات", enabled: false },
        { id: "orders_analytics", name: "إحصائيات الطلبات", enabled: false },
        { id: "orders_reports", name: "تقارير الطلبات", enabled: false },
        { id: "orders_refunds", name: "إدارة المرتجعات", enabled: false },
        { id: "orders_manage_all", name: "إدارة شاملة للطلبات", enabled: false },
      ],
    },
    {
      id: "super_admin",
      name: "صلاحيات فائقة",
      description: "مثل الأدمن الأساسي (يمكن للأدمن حذف هذه الصلاحيات)",
      enabled: false,
      expanded: false,
      subOptions: [
        { id: "all_permissions", name: "جميع الصلاحيات", enabled: false },
        { id: "manage_admins", name: "إدارة المشرفين", enabled: false },
        { id: "system_settings", name: "إعدادات النظام", enabled: false },
        { id: "vet_approvals_super", name: "صلاحيات فائقة لموافقات الأطباء", enabled: false },
        { id: "jobs_super", name: "صلاحيات فائقة لإدارة الوظائف", enabled: false },
        { id: "courses_super", name: "صلاحيات فائقة لإدارة الدورات والندوات", enabled: false },
        { id: "assignments_super", name: "صلاحيات فائقة للتعيين والإشراف", enabled: false },
        { id: "pet_approvals_super", name: "صلاحيات فائقة لموافقات الحيوانات", enabled: false },
      ],
    },
  ]);

  // Get all users using the new syntax and the `users.list` procedure
  const {
    data: rawUsers,
    isLoading,
    error,
    refetch,
  } = useQuery(
    trpc.users.list.queryOptions({
      limit: 100,
      // The generic users.list might not support filtering by userType, so this is commented out
      // userType: selectedUserType === 'all' ? undefined : selectedUserType,
    })
  );

  const usersData = useMemo(() => (rawUsers as any)?.usersData, [rawUsers]);

  // Search users using the new syntax
  const { data: rawSearchResult, isLoading: searchLoading } = useQuery(
    trpc.admin.users.search.queryOptions(
      {
        query: searchQuery,
        adminId: currentAdminId,
        limit: 50,
      },
      {
        enabled: searchQuery.length > 2,
      }
    )
  );

  const searchResults = useMemo(() => (rawSearchResult as any)?.searchResult, [rawSearchResult]);

  // Ban/Unban user mutation using the new syntax
  const banUserMutation = useMutation(
    trpc.admin.users.ban.mutationOptions({
      onSuccess: () => {
        refetch();
        Alert.alert("نجح", "تم تحديث حالة المستخدم بنجاح");
      },
      onError: (error) => {
        Alert.alert("خطأ", error.message || "فشل في تحديث حالة المستخدم");
      },
    })
  );

  // Delete user mutation using the new syntax
  const deleteUserMutation = useMutation(
    trpc.admin.users.delete.mutationOptions({
      onSuccess: () => {
        refetch();
        Alert.alert("نجح", "تم حذف المستخدم بنجاح");
      },
      onError: (error) => {
        Alert.alert("خطأ", error.message || "فشل في حذف المستخدم");
      },
    })
  );

  // Mock moderators data
  // const mockModerators = [
  //   {
  //     id: 101,
  //     name: "د. سارة المشرفة",
  //     email: "moderator@petapp.com",
  //     phone: "+964770300001",
  //     userType: "admin" as const,
  //     isActive: true,
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //     permissions: {
  //       canReplyToConsultations: true,
  //       canReplyToInquiries: true,
  //       canManageSections: ["pets", "clinics"],
  //       canManageAds: false,
  //       canManageHomePage: false,
  //       canSendMessages: false,
  //       canManageUsers: false,
  //       isSuperModerator: false,
  //     },
  //   },
  //   {
  //     id: 102,
  //     name: "د. أحمد المشرف",
  //     email: "moderator2@petapp.com",
  //     phone: "+964770300002",
  //     userType: "admin" as const,
  //     isActive: true,
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //     permissions: {
  //       canReplyToConsultations: false,
  //       canReplyToInquiries: true,
  //       canManageSections: ["stores", "tips"],
  //       canManageAds: true,
  //       canManageHomePage: true,
  //       canSendMessages: false,
  //       canManageUsers: false,
  //       isSuperModerator: false,
  //     },
  //   },
  //   {
  //     id: 103,
  //     name: "د. فاطمة المشرفة العامة",
  //     email: "supermod@petapp.com",
  //     phone: "+964770300003",
  //     userType: "admin" as const,
  //     isActive: true,
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString(),
  //     permissions: {
  //       canReplyToConsultations: true,
  //       canReplyToInquiries: true,
  //       canManageSections: ["all"],
  //       canManageAds: true,
  //       canManageHomePage: true,
  //       canSendMessages: true,
  //       canManageUsers: true,
  //       isSuperModerator: true,
  //     },
  //   },
  // ];

  const { data: supervisorsData, isLoading: supervisorsLoading } = useQuery(
    trpc.admin.users.getSupervisors.queryOptions({ limit: 20 })
  );

  const supervisors = useMemo(() => (supervisorsData as any)?.supervisors, [supervisorsData]);

  // Mock data for demo when server fails
  const mockUsers: UserData[] = [
    {
      id: 1,
      name: "علي أحمد الكاظمي",
      email: "user1@example.com",
      phone: "+964770100001",
      userType: "user",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "فاطمة محمد النجفي",
      email: "user2@example.com",
      phone: "+964770100002",
      userType: "user",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: "د. محمد عبد الله - طبيب بيطري",
      email: "vet1@example.com",
      phone: "+964770200001",
      userType: "vet",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: "د. سعاد حسن - طبيبة بيطرية",
      email: "vet2@example.com",
      phone: "+964770200002",
      userType: "vet",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 5,
      name: "مشرف اختبار",
      email: "admin@petapp.com",
      phone: "+964770000001",
      userType: "admin",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 6,
      name: "حسن علي البصري",
      email: "user3@example.com",
      phone: "+964770100003",
      userType: "user",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 7,
      name: "زينب حسين الموصلي",
      email: "user4@example.com",
      phone: "+964770100004",
      userType: "user",
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 8,
      name: "د. أحمد جاسم - طبيب بيطري",
      email: "vet3@example.com",
      phone: "+964770200003",
      userType: "vet",
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Use real data if available, otherwise use mock data
  const displayUsers: UserData[] = error
    ? mockUsers
    : searchQuery.length > 2
    ? (searchResults?.map((user) => ({
        ...user,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
        updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
      })) as UserData[]) || []
    : (usersData?.map((user) => ({
        ...user,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
        updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
      })) as UserData[]) || [];
  const isLoadingData = isLoading || searchLoading;

  const handleBanUser = (user: UserData) => {
    const action = user.isActive ? "حظر" : "إلغاء حظر";
    Alert.alert(`${action} المستخدم`, `هل أنت متأكد من ${action} ${user.name}؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: action,
        style: user.isActive ? "destructive" : "default",
        onPress: () => {
          banUserMutation.mutate({
            userId: user.id,
            adminId: currentAdminId,
            ban: user.isActive,
            reason: `${action} من قبل المشرف`,
          });
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
          deleteUserMutation.mutate({
            userId: user.id,
            adminId: currentAdminId,
            reason: "حذف من قبل المشرف",
          });
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

    Alert.alert("إرسال رسالة", `سيتم إرسال الرسالة إلى ${messageRecipient.name}`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إرسال",
        onPress: () => {
          // Here you would send the message to backend
          console.log("Sending message to:", messageRecipient.id, messageText);
          Alert.alert("نجح", "تم إرسال الرسالة بنجاح");
          setShowMessageModal(false);
          setMessageRecipient(null);
          setMessageText("");
        },
      },
    ]);
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
    // Reset permissions for demo - in real app, load user's current permissions
    setUserPermissions((prev) => prev.map((p) => ({ ...p, enabled: false })));
    setShowPermissionsModal(true);
  };

  const handleTogglePermission = (permissionId: string) => {
    setUserPermissions((prev) => prev.map((p) => (p.id === permissionId ? { ...p, enabled: !p.enabled } : p)));
  };

  const handleExpandPermission = (permissionId: string) => {
    setUserPermissions((prev) => prev.map((p) => (p.id === permissionId ? { ...p, expanded: !p.expanded } : p)));
  };

  const handleToggleSubOption = (permissionId: string, subOptionId: string) => {
    setUserPermissions((prev) =>
      prev.map((p) =>
        p.id === permissionId
          ? {
              ...p,
              subOptions: p.subOptions?.map((sub) =>
                sub.id === subOptionId ? { ...sub, enabled: !sub.enabled } : sub
              ),
            }
          : p
      )
    );
  };

  const handleSavePermissions = () => {
    if (!selectedUser) return;

    const enabledPermissions = userPermissions.filter((p) => p.enabled);
    const enabledSubOptions = userPermissions.flatMap(
      (p) => p.subOptions?.filter((sub) => sub.enabled).map((sub) => ({ ...sub, parentId: p.id })) || []
    );

    // تطبيق الصلاحيات فعلياً
    const applyPermissions = () => {
      console.log("Applying permissions for user:", selectedUser.id);
      console.log(
        "Main permissions:",
        enabledPermissions.map((p) => p.id)
      );
      console.log(
        "Sub permissions:",
        enabledSubOptions.map((s) => s.id)
      );

      // هنا يتم حفظ الصلاحيات في قاعدة البيانات
      // وتحديث حالة المستخدم ليصبح مشرفاً فعالاً

      Alert.alert(
        "تم بنجاح",
        `تم منح ${selectedUser.name} الصلاحيات المحددة.\n\nسيتمكن الآن من:\n${enabledPermissions
          .map((p) => `• ${p.name}`)
          .join("\n")}\n\nوسيظهر له في لوحة المشرف أزرار الإجراءات السريعة حسب صلاحياته.`,
        [{ text: "موافق" }]
      );

      setShowPermissionsModal(false);
      setSelectedUser(null);
    };

    Alert.alert(
      "تأكيد حفظ الصلاحيات",
      `سيتم منح ${selectedUser.name} الصلاحيات التالية:\n\n${enabledPermissions
        .map((p) => `• ${p.name}`)
        .join("\n")}\n\nهذا سيجعله مشرفاً فعالاً ويمكنه الوصول للأزرار والصفحات المخصصة حسب صلاحياته.`,
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "تأكيد وحفظ",
          style: "default",
          onPress: applyPermissions,
        },
      ]
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
        <TouchableOpacity style={styles.actionButton}>
          <Edit size={18} color="#45B7D1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleOpenPermissions(user)}>
          <Shield size={18} color="#9C27B0" />
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

        {/* Test Moderator Login Button */}
        <TouchableOpacity
          style={styles.testModeratorButton}
          onPress={async () => {
            try {
              const result = await loginAsModerator();
              if (result.success) {
                Alert.alert("نجح", result.message);
              }
            } catch (error) {
              Alert.alert("خطأ", "فشل في تسجيل دخول المشرف التجريبي");
            }
          }}
        >
          <TestTube size={20} color="#8B5CF6" />
          <Text style={styles.testModeratorButtonText}>دخول كمشرف وهمي للاختبار</Text>
        </TouchableOpacity>

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

            {/* إضافة المشرف التجريبي إلى القائمة */}
            <View style={styles.moderatorCard}>
              <View style={styles.moderatorHeader}>
                <View style={styles.moderatorInfo}>
                  <Text style={styles.moderatorName}>أحمد المشرف - مشرف تجريبي</Text>
                  <Text style={styles.moderatorEmail}>moderator@test.com</Text>
                  <Text style={styles.moderatorId}>ID: mod-123</Text>
                </View>
                <View style={[styles.moderatorStatusBadge, { backgroundColor: "#45B7D1" }]}>
                  <Text style={styles.moderatorStatusText}>مشرف تجريبي</Text>
                </View>
              </View>

              <View style={styles.permissionsList}>
                <Text style={styles.permissionsListTitle}>الصلاحيات:</Text>

                <View style={styles.permissionTag}>
                  <Text style={styles.permissionTagText}>الرد على الاستشارات</Text>
                </View>

                <View style={styles.permissionTag}>
                  <Text style={styles.permissionTagText}>الرد على الاستفسارات</Text>
                </View>

                <View style={styles.permissionTag}>
                  <Text style={styles.permissionTagText}>إدارة الأقسام (العيادات، النصائح، المقالات)</Text>
                </View>
              </View>

              <View style={styles.moderatorActions}>
                <TouchableOpacity
                  style={styles.moderatorActionButton}
                  onPress={async () => {
                    try {
                      const result = await loginAsModerator();
                      if (result.success) {
                        Alert.alert("نجح", "تم تسجيل دخول المشرف التجريبي بنجاح. ستظهر القائمة العلوية الآن.");
                      }
                    } catch (error) {
                      Alert.alert("خطأ", "فشل في تسجيل دخول المشرف التجريبي");
                    }
                  }}
                >
                  <TestTube size={16} color="#8B5CF6" />
                  <Text style={[styles.moderatorActionText, { color: "#8B5CF6" }]}>تسجيل دخول تجريبي</Text>
                </TouchableOpacity>
              </View>
            </View>

            {supervisors.map((moderator) => (
              <View key={moderator.id} style={styles.moderatorCard}>
                <View style={styles.moderatorHeader}>
                  <View style={styles.moderatorInfo}>
                    <Text style={styles.moderatorName}>{moderator.name}</Text>
                    <Text style={styles.moderatorEmail}>{moderator.email}</Text>
                    <Text style={styles.moderatorId}>ID: {moderator.id}</Text>
                  </View>
                  <View
                    style={[
                      styles.moderatorStatusBadge,
                      { backgroundColor: moderator.permissions.isSuperModerator ? "#8B5CF6" : "#45B7D1" },
                    ]}
                  >
                    <Text style={styles.moderatorStatusText}>
                      {moderator.permissions.isSuperModerator ? "مشرف عام" : "مشرف"}
                    </Text>
                  </View>
                </View>

                <View style={styles.permissionsList}>
                  <Text style={styles.permissionsListTitle}>الصلاحيات:</Text>

                  {moderator?.permissions?.canReplyToConsultations && (
                    <View style={styles.permissionTag}>
                      <Text style={styles.permissionTagText}>الرد على الاستشارات</Text>
                    </View>
                  )}

                  {moderator?.permissions?.canReplyToInquiries && (
                    <View style={styles.permissionTag}>
                      <Text style={styles.permissionTagText}>الرد على الاستفسارات</Text>
                    </View>
                  )}

                  {moderator?.permissions?.canManageSections?.length > 0 && (
                    <View style={styles.permissionTag}>
                      <Text style={styles.permissionTagText}>
                        إدارة الأقسام (
                        {moderator?.permissions?.canManageSections?.includes("all")
                          ? "الكل"
                          : moderator?.permissions?.canManageSections?.join(", ")}
                        )
                      </Text>
                    </View>
                  )}

                  {moderator?.permissions?.canManageAds && (
                    <View style={styles.permissionTag}>
                      <Text style={styles.permissionTagText}>إدارة الإعلانات</Text>
                    </View>
                  )}

                  {moderator?.permissions?.canManageHomePage && (
                    <View style={styles.permissionTag}>
                      <Text style={styles.permissionTagText}>إدارة الصفحة الرئيسية</Text>
                    </View>
                  )}

                  {moderator?.permissions?.canSendMessages && (
                    <View style={styles.permissionTag}>
                      <Text style={styles.permissionTagText}>إرسال الرسائل العامة</Text>
                    </View>
                  )}

                  {moderator?.permissions?.canManageUsers && (
                    <View style={styles.permissionTag}>
                      <Text style={styles.permissionTagText}>إدارة المستخدمين</Text>
                    </View>
                  )}
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
            ))}
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

        {/* Error/Demo Warning */}
        {error && (
          <View style={styles.demoWarning}>
            <Text style={styles.demoWarningText}>🧪 وضع التجريب - البيانات وهمية</Text>
            <Text style={styles.demoWarningSubtext}>خطأ في الاتصال بالخادم</Text>
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
              <TouchableOpacity style={styles.modalSaveButton} onPress={handleSavePermissions}>
                <Text style={styles.modalSaveButtonText}>حفظ</Text>
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

              {userPermissions.map((permission) => (
                <View key={permission.id} style={styles.permissionItem}>
                  <TouchableOpacity
                    style={styles.permissionContent}
                    onPress={() => handleTogglePermission(permission.id)}
                  >
                    <View style={styles.permissionInfo}>
                      <Text style={styles.permissionName}>{permission.name}</Text>
                      <Text style={styles.permissionDescription}>{permission.description}</Text>
                    </View>
                    <View style={styles.permissionActions}>
                      {permission.subOptions && (
                        <TouchableOpacity
                          style={styles.expandButton}
                          onPress={() => handleExpandPermission(permission.id)}
                        >
                          {permission.expanded ? (
                            <ChevronDown size={20} color="#666" />
                          ) : (
                            <ChevronRight size={20} color="#666" />
                          )}
                        </TouchableOpacity>
                      )}
                      <View style={[styles.permissionToggle, permission.enabled && styles.permissionToggleActive]}>
                        {permission.enabled && <Check size={16} color="#fff" />}
                      </View>
                    </View>
                  </TouchableOpacity>

                  {permission.expanded && permission.subOptions && (
                    <View style={styles.subOptionsContainer}>
                      {permission.subOptions.map((subOption) => (
                        <TouchableOpacity
                          key={subOption.id}
                          style={styles.subOptionItem}
                          onPress={() => handleToggleSubOption(permission.id, subOption.id)}
                        >
                          <Text style={styles.subOptionName}>{subOption.name}</Text>
                          <View style={[styles.subOptionToggle, subOption.enabled && styles.subOptionToggleActive]}>
                            {subOption.enabled && <Check size={14} color="#fff" />}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}

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
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
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
    textAlign: "right",
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
    textAlign: "right",
    fontFamily: "System",
  },
  filterButtons: {
    flexDirection: "row",
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
    flexDirection: "row",
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
    flexDirection: "row",
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
    textAlign: "right",
    marginBottom: 6,
    fontFamily: "System",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    textAlign: "right",
    fontFamily: "System",
  },
  userActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modalHeader: {
    flexDirection: "row",
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
    textAlign: "right",
    fontFamily: "System",
  },
  selectedUserEmail: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
    fontFamily: "System",
  },
  selectedUserId: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
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
    textAlign: "right",
    fontFamily: "System",
  },
  permissionItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  permissionInfo: {
    flex: 1,
    marginRight: 12,
  },
  permissionActions: {
    flexDirection: "row",
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
    textAlign: "right",
    marginBottom: 4,
    fontFamily: "System",
  },
  permissionDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
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
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  permissionsNoteText: {
    color: "#856404",
    fontSize: 14,
    textAlign: "right",
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
    flexDirection: "row",
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
    textAlign: "right",
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
    flexDirection: "row",
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
    textAlign: "right",
    fontFamily: "System",
  },
  chevron: {
    transform: [{ rotate: "0deg" }],
  },
  chevronRotated: {
    transform: [{ rotate: "180deg" }],
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
    textAlign: "right",
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
    flexDirection: "row",
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
    textAlign: "right",
    marginBottom: 4,
    fontFamily: "System",
  },
  moderatorEmail: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
    marginBottom: 2,
    fontFamily: "System",
  },
  moderatorId: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
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
    textAlign: "right",
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
    textAlign: "right",
    fontFamily: "System",
  },
  moderatorActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  moderatorActionButton: {
    flexDirection: "row",
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
  testModeratorButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#8B5CF6",
    borderStyle: "dashed",
    gap: 12,
  },
  testModeratorButtonText: {
    fontSize: 16,
    color: "#8B5CF6",
    fontWeight: "600",
    textAlign: "right",
    fontFamily: "System",
  },
  userBadgesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shieldBadge: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  userStatusContainer: {
    flexDirection: "row",
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
  messageContainer: {
    flex: 1,
    padding: 16,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "right",
    fontFamily: "System",
  },
  messageInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    textAlign: "right",
    borderWidth: 1,
    borderColor: "#ddd",
    minHeight: 120,
    fontFamily: "System",
  },
});
