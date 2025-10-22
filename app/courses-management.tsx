import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  Switch,
} from "react-native";
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Clock,
  Eye,
  Search,
  Filter,
  BookOpen,
  GraduationCap,
  ExternalLink,
  UserCheck,
} from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import { COLORS } from "../constants/colors";
import { trpc } from "../lib/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApp } from "@/providers/AppProvider";

interface CourseRegistration {
  id: string;
  courseId: string;
  courseName: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  registrationDate: string;
  status: "pending" | "approved" | "rejected";
}

interface Course {
  id: string;
  title: string;
  organizer: string;
  date: string;
  location: string;
  type: "course" | "seminar";
  duration: string;
  capacity: number;
  registered: number;
  price: string;
  description: string;
  courseUrl?: string;
  registrationType: "link" | "internal";
  status: "active" | "inactive" | "completed";
  createdAt: string;
}

export default function CoursesManagementScreen() {
  const router = useRouter();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<"courses" | "registrations">("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "course" | "seminar">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive" | "completed">("all");

  const {
    data: rawCourses,
    isLoading: coursesLoading,
    refetch: refetchCourses,
  } = useQuery(trpc.admin.courses.getList.queryOptions({ adminId: user?.id }));
  const {
    data: rawRegistrations,
    isLoading: registrationsLoading,
    refetch: refetchRegistrations,
  } = useQuery(trpc.admin.courses.getRegistrations.queryOptions({ adminId: user?.id }));

  const courses = useMemo(() => (rawCourses as any)?.courses, [rawCourses]);
  const registrations = useMemo(() => (rawRegistrations as any)?.courses, [rawRegistrations]);

  const deleteCourseMutation = useMutation(
    trpc.courses.delete.mutationOptions({
      onSuccess: () => {
        refetchCourses();
        Alert.alert("تم الحذف", "تم حذف الدورة بنجاح");
      },
      onError: () => {
        Alert.alert("خطأ", "حدث خطأ أثناء حذف الدورة");
      },
    })
  );

  const updateRegistrationStatusMutation = useMutation(
    trpc.courses.updateRegistrationStatus.mutationOptions({
      onSuccess: () => {
        refetchRegistrations();
        Alert.alert("تم التحديث", "تم تحديث حالة التسجيل بنجاح");
      },
      onError: () => {
        Alert.alert("خطأ", "تعذر تحديث حالة التسجيل");
      },
    })
  );

  const handleBack = () => {
    router.back();
  };

  const handleAddCourse = () => {
    router.push("/add-course");
  };

  const handleEditCourse = (courseId: string) => {
    router.push(`/edit-course?id=${courseId}`);
  };

  const handleDeleteCourse = (courseId: string) => {
    Alert.alert("حذف الدورة", "هل أنت متأكد من حذف هذه الدورة؟ لا يمكن التراجع عن هذا الإجراء.", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          deleteCourseMutation.mutate(courseId);
        },
      },
    ]);
  };

  const handleRegistrationAction = (registrationId: string, action: "approve" | "reject") => {
    updateRegistrationStatusMutation.mutate({ id: registrationId, status: action });
  };

  const filteredCourses = courses?.filter((course: any) => {
    const matchesSearch =
      course?.title?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      course?.organizer?.toLowerCase()?.includes(searchQuery.toLowerCase());
    const matchesType = selectedFilter === "all" || course?.type === selectedFilter;
    const matchesStatus = selectedStatus === "all" || course?.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredRegistrations = registrations?.filter(
    (reg) =>
      reg.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10B981";
      case "inactive":
        return "#6B7280";
      case "completed":
        return "#3B82F6";
      case "approved":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "rejected":
        return "#EF4444";
      default:
        return COLORS.darkGray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "نشط";
      case "inactive":
        return "غير نشط";
      case "completed":
        return "مكتمل";
      case "approved":
        return "مقبول";
      case "pending":
        return "في الانتظار";
      case "rejected":
        return "مرفوض";
      default:
        return status;
    }
  };

  const renderCourseCard = (course: Course) => {
    const availableSpots = course.capacity - course.registered;

    return (
      <View key={course.id} style={styles.courseCard}>
        <View style={styles.courseHeader}>
          <View style={styles.courseTitleContainer}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.courseOrganizer}>{course.organizer}</Text>
          </View>
          <View style={styles.courseActions}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(course.status) }]}>
              <Text style={styles.statusText}>{getStatusText(course.status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.courseDetails}>
          <View style={styles.detailRow}>
            {course.type === "course" ? (
              <BookOpen size={16} color={COLORS.primary} />
            ) : (
              <GraduationCap size={16} color={COLORS.primary} />
            )}
            <Text style={styles.detailText}>{course.type === "course" ? "دورة" : "ندوة"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Calendar size={16} color={COLORS.darkGray} />
            <Text style={styles.detailText}>{course.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={16} color={COLORS.darkGray} />
            <Text style={styles.detailText}>{course.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={16} color={COLORS.darkGray} />
            <Text style={styles.detailText}>{course.duration}</Text>
          </View>
          <View style={styles.detailRow}>
            <Users size={16} color={COLORS.darkGray} />
            <Text style={styles.detailText}>
              {course.registered}/{course.capacity} مسجل ({availableSpots} متبقي)
            </Text>
          </View>
        </View>

        <View style={styles.courseFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>السعر:</Text>
            <Text style={[styles.priceText, { color: course.price === "مجاني" ? "#10B981" : COLORS.primary }]}>
              {course.price}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditCourse(course.id)}
            >
              <Edit3 size={16} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteCourse(course.id)}
            >
              <Trash2 size={16} color={COLORS.white} />
            </TouchableOpacity>
            {course.registrationType === "internal" && (
              <TouchableOpacity
                style={[styles.actionButton, styles.viewButton]}
                onPress={() => {
                  setActiveTab("registrations");
                  setSearchQuery(course.title);
                }}
              >
                <Eye size={16} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderRegistrationCard = (registration: CourseRegistration) => {
    return (
      <View key={registration.id} style={styles.registrationCard}>
        <View style={styles.registrationHeader}>
          <View style={styles.participantInfo}>
            <Text style={styles.participantName}>{registration.participantName}</Text>
            <Text style={styles.courseName}>{registration.courseName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(registration.status) }]}>
            <Text style={styles.statusText}>{getStatusText(registration.status)}</Text>
          </View>
        </View>

        <View style={styles.registrationDetails}>
          <Text style={styles.detailText}>البريد الإلكتروني: {registration.participantEmail}</Text>
          <Text style={styles.detailText}>رقم الهاتف: {registration.participantPhone}</Text>
          <Text style={styles.detailText}>تاريخ التسجيل: {registration.registrationDate}</Text>
        </View>

        {registration.status === "pending" && (
          <View style={styles.registrationActions}>
            <TouchableOpacity
              disabled={updateRegistrationStatusMutation.isPending}
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleRegistrationAction(registration.id, "approve")}
            >
              <UserCheck size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>{updateRegistrationStatusMutation.isPending ? "..." : "قبول"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={updateRegistrationStatusMutation.isPending}
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRegistrationAction(registration.id, "reject")}
            >
              <Trash2 size={16} color={COLORS.white} />
              <Text style={styles.actionButtonText}>{updateRegistrationStatusMutation.isPending ? "..." : "رفض"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderFilterModal = () => {
    return (
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تصفية النتائج</Text>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>نوع الفعالية:</Text>
              <View style={styles.filterOptions}>
                {[
                  { key: "all", label: "الكل" },
                  { key: "course", label: "دورة" },
                  { key: "seminar", label: "ندوة" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.filterOption, selectedFilter === option.key && styles.selectedFilterOption]}
                    onPress={() => setSelectedFilter(option.key as any)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedFilter === option.key && styles.selectedFilterOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>الحالة:</Text>
              <View style={styles.filterOptions}>
                {[
                  { key: "all", label: "الكل" },
                  { key: "active", label: "نشط" },
                  { key: "inactive", label: "غير نشط" },
                  { key: "completed", label: "مكتمل" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.filterOption, selectedStatus === option.key && styles.selectedFilterOption]}
                    onPress={() => setSelectedStatus(option.key as any)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selectedStatus === option.key && styles.selectedFilterOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>تطبيق</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>إدارة الدورات والندوات</Text>
          <TouchableOpacity onPress={handleAddCourse} style={styles.addButton}>
            <Plus size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "courses" && styles.activeTab]}
            onPress={() => setActiveTab("courses")}
          >
            <BookOpen size={20} color={activeTab === "courses" ? COLORS.white : COLORS.primary} />
            <Text style={[styles.tabText, activeTab === "courses" && styles.activeTabText]}>
              الدورات والندوات ({filteredCourses?.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "registrations" && styles.activeTab]}
            onPress={() => setActiveTab("registrations")}
          >
            <Users size={20} color={activeTab === "registrations" ? COLORS.white : COLORS.primary} />
            <Text style={[styles.tabText, activeTab === "registrations" && styles.activeTabText]}>
              التسجيلات ({filteredRegistrations?.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={COLORS.darkGray} />
            <TextInput
              style={styles.searchInput}
              placeholder={activeTab === "courses" ? "البحث في الدورات..." : "البحث في التسجيلات..."}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {activeTab === "courses" && (
            <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
              <Filter size={20} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === "courses" ? (
            <View style={styles.coursesList}>
              {filteredCourses?.length === 0 ? (
                <View style={styles.emptyState}>
                  <BookOpen size={48} color={COLORS.lightGray} />
                  <Text style={styles.emptyStateText}>لا توجد دورات متاحة</Text>
                  <Text style={styles.emptyStateSubText}>قم بإضافة دورة جديدة للبدء</Text>
                </View>
              ) : (
                filteredCourses?.map(renderCourseCard)
              )}
            </View>
          ) : (
            <View style={styles.registrationsList}>
              {filteredRegistrations?.length === 0 ? (
                <View style={styles.emptyState}>
                  <Users size={48} color={COLORS.lightGray} />
                  <Text style={styles.emptyStateText}>لا توجد تسجيلات</Text>
                  <Text style={styles.emptyStateSubText}>ستظهر التسجيلات هنا عند توفرها</Text>
                </View>
              ) : (
                filteredRegistrations?.map(renderRegistrationCard)
              )}
            </View>
          )}
        </ScrollView>

        {renderFilterModal()}
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
    flex: 1,
  },
  addButton: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    gap: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  activeTabText: {
    color: COLORS.white,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
  },
  filterButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  coursesList: {
    gap: 16,
  },
  registrationsList: {
    gap: 12,
  },
  courseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  courseTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  courseOrganizer: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  courseActions: {
    alignItems: "flex-end",
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
  courseDetails: {
    marginBottom: 16,
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
  courseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  viewButton: {
    backgroundColor: "#6366F1",
  },
  approveButton: {
    backgroundColor: "#10B981",
  },
  rejectButton: {
    backgroundColor: "#EF4444",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  registrationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  registrationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  participantInfo: {
    flex: 1,
    marginRight: 12,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  registrationDetails: {
    marginBottom: 12,
    gap: 4,
  },
  registrationActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.darkGray,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: COLORS.lightGray,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 24,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  selectedFilterOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  selectedFilterOptionText: {
    color: COLORS.white,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  applyButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
});
