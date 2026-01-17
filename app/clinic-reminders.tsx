import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Modal } from "react-native";
import React, { useState, useMemo } from "react";
import { COLORS } from "../constants/colors";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  X,
  Calendar as CalendarIcon,
  Trash2,
} from "lucide-react-native";
import { trpc } from "../lib/trpc";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useToastContext } from "@/providers/ToastProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return COLORS.warning;
    case "overdue":
      return COLORS.error;
    case "completed":
      return COLORS.success;
    default:
      return COLORS.darkGray;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "معلق";
    case "overdue":
      return "متأخر";
    case "completed":
      return "مكتمل";
    default:
      return "غير محدد";
  }
};

const getReminderTypeText = (type: string) => {
  switch (type) {
    case "vaccination":
      return "تطعيم";
    case "medication":
      return "دواء";
    case "checkup":
      return "فحص";
    case "other":
      return "أخرى";
    default:
      return "تذكير";
  }
};

const getReminderTypeIcon = (type: string) => {
  switch (type) {
    case "vaccination":
      return "💉";
    case "medication":
      return "💊";
    case "checkup":
      return "🩺";
    case "other":
      return "📅";
    default:
      return "📅";
  }
};

// Modal Components
const ReminderDetailsModal = ({ visible, onClose, reminder, onReschedule, onComplete, onDelete }: any) => {
  if (!reminder) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>تفاصيل التذكير</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>العنوان</Text>
            <Text style={styles.detailValue}>{reminder.title}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>نوع التذكير</Text>
            <Text style={styles.detailValue}>{getReminderTypeText(reminder.reminderType)}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>الحيوان</Text>
            <Text style={styles.detailValue}>
              {reminder.petName} ({reminder.petType})
            </Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>المالك</Text>
            <Text style={styles.detailValue}>{reminder.ownerName}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>الموعد</Text>
            <Text style={styles.detailValue}>
              {reminder.reminderDate} في {reminder.reminderTime}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>الحالة</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reminder.status) }]}>
              <Text style={styles.statusText}>{getStatusText(reminder.status)}</Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>الوصف</Text>
            <Text style={styles.detailValue}>{reminder.description}</Text>
          </View>

          {reminder.status === "overdue" && (
            <View style={styles.overdueAlert}>
              <AlertTriangle size={20} color={COLORS.error} />
              <Text style={styles.overdueAlertText}>هذا التذكير متأخر!</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
            <Trash2 size={18} color={COLORS.error} />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>حذف</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const RescheduleModal = ({ visible, onClose, reminder, onConfirm }: any) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedDate);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.centeredModal}>
        <View style={styles.rescheduleModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>تأجيل التذكير</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.rescheduleContent}>
            <Text style={styles.rescheduleText}>
              تأجيل تذكير "{reminder?.title}" للحيوان {reminder?.petName}
            </Text>

            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
              <Calendar size={20} color={COLORS.primary} />
              <Text style={styles.datePickerText}>{selectedDate.toLocaleDateString("ar-EG")}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={onClose}>
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={handleConfirm}>
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>تأكيد التأجيل</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CompleteReminderModal = ({ visible, onClose, reminder, onConfirm }: any) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.centeredModal}>
        <View style={styles.completeModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>إكمال التذكير</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.completeContent}>
            <Text style={styles.completeText}>
              تأكيد إكمال تذكير "{reminder?.title}" للحيوان {reminder?.petName}
            </Text>
            <Text style={styles.completeSubtext}>سيتم نقل هذا التذكير إلى القائمة المكتملة</Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={onClose}>
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={handleConfirm}>
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>تأكيد الإكمال</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DeleteReminderModal = ({ visible, onClose, reminder, onConfirm }: any) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.centeredModal}>
        <View style={styles.deleteModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>حذف التذكير</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.deleteContent}>
            <Text style={styles.deleteText}>هل أنت متأكد من حذف تذكير "{reminder?.title}"؟</Text>
            <Text style={styles.deleteSubtext}>هذه العملية لا يمكن التراجع عنها</Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={onClose}>
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleConfirm}>
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>حذف</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function ClinicReminders() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const { clinicId } = useLocalSearchParams();

  // Modal states
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Fetch reminders using tRPC
  const { data: remindersData, isLoading } = useQuery(
    trpc.clinics.reminders.getClinicReminders.queryOptions(
      {
        clinicId: Number(clinicId),
        status: selectedFilter as any,
      },
      {
        enabled: !!clinicId,
      }
    )
  );

  const reminders = useMemo(() => (remindersData as any)?.reminders || [], [remindersData]);

  const updateStatusMutation = useMutation(trpc.clinics.reminders.updateReminderStatus.mutationOptions());
  const rescheduleMutation = useMutation(trpc.clinics.reminders.rescheduleReminder.mutationOptions());
  const deleteMutation = useMutation(trpc.clinics.reminders.deleteReminder.mutationOptions());

  // Handler functions
  const handleReminderPress = (reminder: any) => {
    setSelectedReminder(reminder);
    setDetailsModalVisible(true);
  };

  const handleReschedule = () => {
    setDetailsModalVisible(false);
    setRescheduleModalVisible(true);
  };

  const handleComplete = () => {
    setDetailsModalVisible(false);
    setCompleteModalVisible(true);
  };

  const handleDelete = () => {
    setDetailsModalVisible(false);
    setDeleteModalVisible(true);
  };

  const handleConfirmReschedule = (newDate: Date) => {
    if (!selectedReminder) return;

    rescheduleMutation.mutate(
      {
        reminderId: Number(selectedReminder.id),
        newDate: newDate,
      } as any,
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries(trpc.clinics.reminders.getClinicReminders.queryKey);
          showToast({
            type: "success",
            message: data.message,
          });
        },
        onError: (error) => {
          showToast({
            type: "error",
            message: error.message || "فشل في تأجيل التذكير",
          });
        },
      }
    );

    setSelectedReminder(null);
  };

  const handleConfirmComplete = () => {
    if (!selectedReminder) return;

    updateStatusMutation.mutate(
      {
        reminderId: Number(selectedReminder.id),
        isCompleted: true,
      } as any,
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries(trpc.clinics.reminders.getClinicReminders.queryKey);
          showToast({
            type: "success",
            message: data.message,
          });
        },
        onError: (error) => {
          showToast({
            type: "error",
            message: error.message || "فشل في تحديث حالة التذكير",
          });
        },
      }
    );

    setSelectedReminder(null);
  };

  const handleConfirmDelete = () => {
    if (!selectedReminder) return;

    deleteMutation.mutate(
      {
        reminderId: Number(selectedReminder.id),
      } as any,
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries(trpc.clinics.reminders.getClinicReminders.queryKey);
          showToast({
            type: "success",
            message: data.message,
          });
        },
        onError: (error) => {
          showToast({
            type: "error",
            message: error.message || "فشل في حذف التذكير",
          });
        },
      }
    );

    setSelectedReminder(null);
  };

  const closeModals = () => {
    setDetailsModalVisible(false);
    setRescheduleModalVisible(false);
    setCompleteModalVisible(false);
    setDeleteModalVisible(false);
    setSelectedReminder(null);
  };

  const renderReminderItem = ({ item }: { item: any }) => {
    const isOverdue = item.status === "overdue";
    const isToday = item.reminderDate === new Date().toISOString().split("T")[0];
    const isCompleted = item.isCompleted;

    return (
      <TouchableOpacity
        style={[
          styles.reminderCard,
          isOverdue && styles.overdueCard,
          isToday && styles.todayCard,
          isCompleted && styles.completedCard,
        ]}
        activeOpacity={0.8}
        onPress={() => handleReminderPress(item)}
      >
        <View style={styles.reminderHeader}>
          <View style={styles.reminderInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.reminderIcon}>{getReminderTypeIcon(item.reminderType)}</Text>
              <Text style={[styles.reminderTitle, isCompleted && styles.completedText]}>{item.title}</Text>
            </View>
            <Text style={styles.reminderType}>{getReminderTypeText(item.reminderType)}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.petInfo}>
          <View style={styles.petRow}>
            <Text style={[styles.petName, isCompleted && styles.completedText]}>
              {item.petName} ({item.petType})
            </Text>
          </View>
          <View style={styles.ownerRow}>
            <User size={14} color={COLORS.darkGray} />
            <Text style={[styles.ownerName, isCompleted && styles.completedText]}>{item.ownerName}</Text>
          </View>
        </View>

        <View style={styles.dateTimeContainer}>
          <View style={styles.dateRow}>
            <Calendar size={14} color={isOverdue ? COLORS.error : isCompleted ? COLORS.success : COLORS.primary} />
            <Text style={[styles.dateText, isOverdue && styles.overdueText, isCompleted && styles.completedText]}>
              {item.reminderDate}
            </Text>
          </View>
          <View style={styles.timeRow}>
            <Clock size={14} color={isOverdue ? COLORS.error : isCompleted ? COLORS.success : COLORS.primary} />
            <Text style={[styles.timeText, isOverdue && styles.overdueText, isCompleted && styles.completedText]}>
              {item.reminderTime}
            </Text>
          </View>
        </View>

        <Text style={[styles.description, isCompleted && styles.completedText]}>{item.description}</Text>

        {isOverdue && (
          <View style={styles.overdueWarning}>
            <AlertTriangle size={16} color={COLORS.error} />
            <Text style={styles.overdueWarningText}>هذا التذكير متأخر!</Text>
          </View>
        )}

        {isToday && !isCompleted && (
          <View style={styles.todayIndicator}>
            <Bell size={16} color={COLORS.warning} />
            <Text style={styles.todayIndicatorText}>موعد اليوم</Text>
          </View>
        )}

        {isCompleted && (
          <View style={styles.completedIndicator}>
            <CheckCircle size={16} color={COLORS.success} />
            <Text style={styles.completedIndicatorText}>مكتمل</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const filterButtons = [
    { key: "all", label: "الكل", count: reminders.length },
    { key: "pending", label: "معلق", count: reminders.filter((r: any) => r.status === "pending").length },
    { key: "overdue", label: "متأخر", count: reminders.filter((r: any) => r.status === "overdue").length },
    { key: "completed", label: "مكتمل", count: reminders.filter((r: any) => r.status === "completed").length },
  ];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري تحميل التذكيرات...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تذكيرات الحيوانات</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: COLORS.warning + "20" }]}>
              <Bell size={24} color={COLORS.warning} />
              <Text style={styles.statNumber}>{reminders.filter((r: any) => r.status === "pending").length}</Text>
              <Text style={styles.statLabel}>تذكيرات معلقة</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.error + "20" }]}>
              <AlertTriangle size={24} color={COLORS.error} />
              <Text style={styles.statNumber}>{reminders.filter((r: any) => r.status === "overdue").length}</Text>
              <Text style={styles.statLabel}>تذكيرات متأخرة</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.success + "20" }]}>
              <CheckCircle size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>{reminders.filter((r: any) => r.status === "completed").length}</Text>
              <Text style={styles.statLabel}>تذكيرات مكتملة</Text>
            </View>
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterButtons}>
                {filterButtons.map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[styles.filterButton, selectedFilter === filter.key && styles.activeFilterButton]}
                    onPress={() => setSelectedFilter(filter.key)}
                  >
                    <Text
                      style={[styles.filterButtonText, selectedFilter === filter.key && styles.activeFilterButtonText]}
                    >
                      {filter.label} ({filter.count})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Reminders List */}
          <View style={styles.remindersSection}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === "all"
                ? "جميع التذكيرات"
                : `تذكيرات ${filterButtons.find((f) => f.key === selectedFilter)?.label}`}
            </Text>

            <FlatList
              data={reminders}
              renderItem={renderReminderItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Bell size={48} color={COLORS.darkGray} />
                  <Text style={styles.emptyText}>لا توجد تذكيرات</Text>
                </View>
              }
            />
          </View>
        </ScrollView>

        {/* Modals */}
        <ReminderDetailsModal
          visible={detailsModalVisible}
          onClose={closeModals}
          reminder={selectedReminder}
          onReschedule={handleReschedule}
          onComplete={handleComplete}
          onDelete={handleDelete}
        />

        <RescheduleModal
          visible={rescheduleModalVisible}
          onClose={closeModals}
          reminder={selectedReminder}
          onConfirm={handleConfirmReschedule}
        />

        <CompleteReminderModal
          visible={completeModalVisible}
          onClose={closeModals}
          reminder={selectedReminder}
          onConfirm={handleConfirmComplete}
        />

        <DeleteReminderModal
          visible={deleteModalVisible}
          onClose={closeModals}
          reminder={selectedReminder}
          onConfirm={handleConfirmDelete}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButtons: {
    flexDirection: "row-reverse",
    gap: 8,
    paddingHorizontal: 4,
  },
  filterButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  activeFilterButtonText: {
    color: COLORS.white,
  },
  remindersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "left",
  },
  reminderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  todayCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  reminderHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  reminderIcon: {
    fontSize: 20,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  reminderType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  statusContainer: {
    alignItems: "flex-end",
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  petInfo: {
    marginBottom: 8,
  },
  petRow: {
    marginBottom: 4,
  },
  petName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  ownerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  ownerName: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  dateTimeContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  timeRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  overdueText: {
    color: COLORS.error,
  },
  description: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "left",
    marginBottom: 8,
  },
  overdueWarning: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.error + "20",
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  overdueWarningText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: "bold",
  },
  todayIndicator: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.warning + "20",
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  todayIndicatorText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 12,
  },

  // New styles for completed state
  completedCard: {
    opacity: 0.7,
    backgroundColor: COLORS.lightGray,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: COLORS.darkGray,
  },
  completedIndicator: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.success + "20",
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  completedIndicatorText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: "bold",
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  centeredModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  rescheduleModal: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  completeModal: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  deleteModal: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  modalActions: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Button variants
  rescheduleButton: {
    backgroundColor: COLORS.warning + "20",
    borderColor: COLORS.warning,
  },
  rescheduleButtonText: {
    color: COLORS.warning,
  },
  completeButton: {
    backgroundColor: COLORS.success + "20",
    borderColor: COLORS.success,
  },
  completeButtonText: {
    color: COLORS.success,
  },
  deleteButton: {
    backgroundColor: COLORS.error + "20",
    borderColor: COLORS.error,
  },
  deleteButtonText: {
    color: COLORS.error,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  primaryButtonText: {
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.lightGray,
  },
  secondaryButtonText: {
    color: COLORS.darkGray,
  },
  // Detail sections
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: "600",
  },
  overdueAlert: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.error + "20",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
  },
  overdueAlertText: {
    color: COLORS.error,
    fontWeight: "bold",
  },
  // Reschedule modal content
  rescheduleContent: {
    marginBottom: 20,
  },
  rescheduleText: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "left",
  },
  datePickerButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  datePickerText: {
    fontSize: 16,
    color: COLORS.black,
  },
  // Complete modal content
  completeContent: {
    marginBottom: 20,
  },
  completeText: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
  },
  completeSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "left",
  },
  // Delete modal content
  deleteContent: {
    marginBottom: 20,
  },
  deleteText: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
  },
  deleteSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "left",
  },
});
