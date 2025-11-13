import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Modal, TextInput } from "react-native";
import React, { useState, useMemo } from "react";
import { COLORS } from "../constants/colors";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Heart,
  Calendar,
  Clock,
  User,
  X,
  CheckCircle,
  AlertCircle,
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
    case "approved":
      return COLORS.success;
    case "rejected":
      return COLORS.error;
    default:
      return COLORS.darkGray;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "معلق";
    case "approved":
      return "موافق";
    case "rejected":
      return "مرفوض";
    default:
      return "غير محدد";
  }
};

const getFollowupTypeText = (type: string) => {
  switch (type) {
    case "post-surgery":
      return "بعد العملية";
    case "medication":
      return "علاج دوائي";
    case "chronic-condition":
      return "حالة مزمنة";
    case "recovery":
      return "تعافي";
    case "checkup":
      return "فحص دوري";
    default:
      return "متابعة";
  }
};

const getFollowupTypeIcon = (type: string) => {
  switch (type) {
    case "post-surgery":
      return "🏥";
    case "medication":
      return "💊";
    case "chronic-condition":
      return "🩺";
    case "recovery":
      return "💚";
    case "checkup":
      return "📋";
    default:
      return "❤️";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return COLORS.error;
    case "high":
      return COLORS.warning;
    case "normal":
      return COLORS.success;
    default:
      return COLORS.darkGray;
  }
};

const getPriorityText = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "عاجل";
    case "high":
      return "مهم";
    case "normal":
      return "عادي";
    default:
      return "غير محدد";
  }
};

// Modal Components
const FollowupDetailsModal = ({ visible, onClose, followup, onApprove, onReject, onReschedule, onDelete }: any) => {
  if (!followup) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>تفاصيل طلب المتابعة</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>نوع المتابعة</Text>
            <Text style={styles.detailValue}>{getFollowupTypeText(followup.followupType)}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>الحيوان</Text>
            <Text style={styles.detailValue}>
              {followup.petName} ({followup.petType})
            </Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>المالك</Text>
            <Text style={styles.detailValue}>{followup.ownerName}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>هاتف المالك</Text>
            <Text style={styles.detailValue}>{followup.ownerPhone}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>الموعد المطلوب</Text>
            <Text style={styles.detailValue}>
              {followup.scheduledDate} في {followup.scheduledTime}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>الطبيب</Text>
            <Text style={styles.detailValue}>{followup.veterinarian}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>سبب المتابعة</Text>
            <Text style={styles.detailValue}>{followup.description}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>الحالة</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(followup.status) }]}>
              <Text style={styles.statusText}>{getStatusText(followup.status)}</Text>
            </View>
          </View>

          {followup.status === "rejected" && followup.notes && (
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>سبب الرفض</Text>
              <Text style={[styles.detailValue, { color: COLORS.error }]}>{followup.notes}</Text>
            </View>
          )}

          {followup.isToday && followup.status === "pending" && (
            <View style={styles.todayAlert}>
              <AlertCircle size={20} color={COLORS.warning} />
              <Text style={styles.todayAlertText}>متابعة مقترحة اليوم!</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.modalActions}>
          {/* {followup.status === "pending" && (
            <>
              <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={onApprove}>
                <CheckCircle size={18} color={COLORS.success} />
                <Text style={[styles.actionButtonText, styles.approveButtonText]}>موافقة</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={onReject}>
                <X size={18} color={COLORS.error} />
                <Text style={[styles.actionButtonText, styles.rejectButtonText]}>رفض</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, styles.rescheduleButton]} onPress={onReschedule}>
                <CalendarIcon size={18} color={COLORS.warning} />
                <Text style={[styles.actionButtonText, styles.rescheduleButtonText]}>تأجيل</Text>
              </TouchableOpacity>
            </>
          )} */}

          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
            <Trash2 size={18} color={COLORS.error} />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>حذف</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const RejectFollowupModal = ({ visible, onClose, followup, onConfirm }: any) => {
  const { showToast } = useToastContext();
  const [rejectionReason, setRejectionReason] = useState("");

  const handleConfirm = () => {
    if (!rejectionReason.trim()) {
      showToast({
        type: "error",
        message: "يرجى إدخال سبب الرفض",
      });
      return;
    }
    onConfirm(rejectionReason);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.centeredModal}>
        <View style={styles.rejectModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>رفض طلب المتابعة</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.rejectContent}>
            <Text style={styles.rejectText}>
              رفض طلب متابعة "{followup?.title}" للحيوان {followup?.petName}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>سبب الرفض *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                placeholder="أدخل سبب رفض طلب المتابعة"
                placeholderTextColor={COLORS.darkGray}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={onClose}>
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={handleConfirm}>
              <Text style={[styles.actionButtonText, styles.rejectButtonText]}>تأكيد الرفض</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const RescheduleModal = ({ visible, onClose, followup, onConfirm }: any) => {
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
            <Text style={styles.modalTitle}>تأجيل المتابعة</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.rescheduleContent}>
            <Text style={styles.rescheduleText}>
              تأجيل متابعة "{followup?.title}" للحيوان {followup?.petName}
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

const DeleteFollowupModal = ({ visible, onClose, followup, onConfirm }: any) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.centeredModal}>
        <View style={styles.deleteModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>حذف طلب المتابعة</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.deleteContent}>
            <Text style={styles.deleteText}>هل أنت متأكد من حذف طلب المتابعة "{followup?.title}"؟</Text>
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

export default function ClinicFollowups() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const { clinicId } = useLocalSearchParams();

  // Modal states
  const [selectedFollowup, setSelectedFollowup] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Fetch followups using tRPC
  const { data: followupsData, isLoading } = useQuery({
    ...trpc.clinics.followups.getClinicFollowups.queryOptions({
      clinicId: Number(clinicId),
      status: selectedFilter as any,
    }),
    enabled: !!clinicId,
  });

  const followups = useMemo(() => (followupsData as any)?.followups || [], [followupsData]);

  const updateStatusMutation = useMutation(trpc.clinics.followups.updateFollowupStatus.mutationOptions());
  const rescheduleMutation = useMutation(trpc.clinics.followups.rescheduleFollowup.mutationOptions());
  const deleteMutation = useMutation(trpc.clinics.followups.deleteFollowup.mutationOptions());

  // Handler functions
  const handleFollowupPress = (followup: any) => {
    setSelectedFollowup(followup);
    setDetailsModalVisible(true);
  };

  const handleApprove = () => {
    if (!selectedFollowup) return;

    updateStatusMutation.mutate(
      {
        followupId: Number(selectedFollowup.id),
        status: "approved",
      } as any,
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries(trpc.clinics.followups.getClinicFollowups.queryKey);
          showToast({
            type: "success",
            message: data.message,
          });
        },
        onError: (error) => {
          showToast({
            type: "error",
            message: error.message || "فشل في تحديث حالة المتابعة",
          });
        },
      }
    );

    setDetailsModalVisible(false);
    setSelectedFollowup(null);
  };

  const handleReject = () => {
    setDetailsModalVisible(false);
    setRejectModalVisible(true);
  };

  const handleReschedule = () => {
    setDetailsModalVisible(false);
    setRescheduleModalVisible(true);
  };

  const handleDelete = () => {
    setDetailsModalVisible(false);
    setDeleteModalVisible(true);
  };

  const handleConfirmReject = (rejectionReason: string) => {
    if (!selectedFollowup) return;

    updateStatusMutation.mutate(
      {
        followupId: Number(selectedFollowup.id),
        status: "rejected",
        rejectionReason: rejectionReason,
      } as any,
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries(trpc.clinics.followups.getClinicFollowups.queryKey);
          showToast({
            type: "success",
            message: data.message,
          });
        },
        onError: (error) => {
          showToast({
            type: "error",
            message: error.message || "فشل في تحديث حالة المتابعة",
          });
        },
      }
    );

    setSelectedFollowup(null);
  };

  const handleConfirmReschedule = (newDate: Date) => {
    if (!selectedFollowup) return;

    rescheduleMutation.mutate(
      {
        followupId: Number(selectedFollowup.id),
        newDate: newDate,
      } as any,
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries(trpc.clinics.followups.getClinicFollowups.queryKey);
          showToast({
            type: "success",
            message: data.message,
          });
        },
        onError: (error) => {
          showToast({
            type: "error",
            message: error.message || "فشل في تأجيل المتابعة",
          });
        },
      }
    );

    setSelectedFollowup(null);
  };

  const handleConfirmDelete = () => {
    if (!selectedFollowup) return;

    deleteMutation.mutate(
      {
        followupId: Number(selectedFollowup.id),
      } as any,
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries(trpc.clinics.followups.getClinicFollowups.queryKey);
          showToast({
            type: "success",
            message: data.message,
          });
        },
        onError: (error) => {
          showToast({
            type: "error",
            message: error.message || "فشل في حذف المتابعة",
          });
        },
      }
    );

    setSelectedFollowup(null);
  };

  const closeModals = () => {
    setDetailsModalVisible(false);
    setRejectModalVisible(false);
    setRescheduleModalVisible(false);
    setDeleteModalVisible(false);
    setSelectedFollowup(null);
  };

  const renderFollowupItem = ({ item }: { item: any }) => {
    const isToday = item.isToday;
    const isApproved = item.status === "approved";
    const isRejected = item.status === "rejected";

    return (
      <TouchableOpacity
        style={[
          styles.followupCard,
          isRejected && styles.rejectedCard,
          isToday && styles.todayCard,
          isApproved && styles.approvedCard,
        ]}
        activeOpacity={0.8}
        onPress={() => handleFollowupPress(item)}
      >
        <View style={styles.followupHeader}>
          <View style={styles.followupInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.followupIcon}>{getFollowupTypeIcon(item.followupType)}</Text>
              <Text style={[styles.followupTitle, isRejected && styles.rejectedText]}>{item.title}</Text>
            </View>
            <Text style={styles.followupType}>{getFollowupTypeText(item.followupType)}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
              <Text style={styles.priorityText}>{getPriorityText(item.priority)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.petInfo}>
          <View style={styles.petRow}>
            <Text style={[styles.petName, isRejected && styles.rejectedText]}>
              {item.petName} ({item.petType})
            </Text>
          </View>
          <View style={styles.ownerRow}>
            <User size={14} color={COLORS.darkGray} />
            <Text style={[styles.ownerName, isRejected && styles.rejectedText]}>{item.ownerName}</Text>
          </View>
        </View>

        <View style={styles.dateTimeContainer}>
          <View style={styles.dateRow}>
            <Calendar size={14} color={isRejected ? COLORS.error : isApproved ? COLORS.success : COLORS.primary} />
            <Text style={[styles.dateText, isRejected && styles.rejectedText]}>{item.scheduledDate}</Text>
          </View>
          <View style={styles.timeRow}>
            <Clock size={14} color={isRejected ? COLORS.error : isApproved ? COLORS.success : COLORS.primary} />
            <Text style={[styles.timeText, isRejected && styles.rejectedText]}>{item.scheduledTime}</Text>
          </View>
        </View>

        <Text style={[styles.description, isRejected && styles.rejectedText]}>{item.description}</Text>
        <Text style={[styles.veterinarian, isRejected && styles.rejectedText]}>الطبيب: {item.veterinarian}</Text>

        {isToday && item.status === "pending" && (
          <View style={styles.todayIndicator}>
            <Heart size={16} color={COLORS.warning} />
            <Text style={styles.todayIndicatorText}>متابعة مقترحة اليوم</Text>
          </View>
        )}

        {isApproved && (
          <View style={styles.approvedIndicator}>
            <CheckCircle size={16} color={COLORS.success} />
            <Text style={styles.approvedIndicatorText}>موافق</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const filterButtons = [
    { key: "all", label: "الكل", count: followups.length },
    { key: "pending", label: "معلق", count: followups.filter((f) => f.status === "pending").length },
    { key: "approved", label: "موافق", count: followups.filter((f) => f.status === "approved").length },
    { key: "rejected", label: "مرفوض", count: followups.filter((f) => f.status === "rejected").length },
  ];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري تحميل طلبات المتابعة...</Text>
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
          <Text style={styles.headerTitle}>طلبات المتابعة</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: COLORS.warning + "20" }]}>
              <Heart size={24} color={COLORS.warning} />
              <Text style={styles.statNumber}>{followups.filter((f) => f.status === "pending").length}</Text>
              <Text style={styles.statLabel}>طلبات معلقة</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.success + "20" }]}>
              <CheckCircle size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>{followups.filter((f) => f.status === "approved").length}</Text>
              <Text style={styles.statLabel}>طلبات موافق عليها</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.error + "20" }]}>
              <AlertCircle size={24} color={COLORS.error} />
              <Text style={styles.statNumber}>{followups.filter((f) => f.status === "rejected").length}</Text>
              <Text style={styles.statLabel}>طلبات مرفوضة</Text>
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

          {/* Followups List */}
          <View style={styles.followupsSection}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === "all"
                ? "جميع طلبات المتابعة"
                : `طلبات ${filterButtons.find((f) => f.key === selectedFilter)?.label}`}
            </Text>

            <FlatList
              data={followups}
              renderItem={renderFollowupItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Heart size={48} color={COLORS.darkGray} />
                  <Text style={styles.emptyText}>لا توجد طلبات متابعة</Text>
                </View>
              }
            />
          </View>
        </ScrollView>

        {/* Modals */}
        <FollowupDetailsModal
          visible={detailsModalVisible}
          onClose={closeModals}
          followup={selectedFollowup}
          onApprove={handleApprove}
          onReject={handleReject}
          onReschedule={handleReschedule}
          onDelete={handleDelete}
        />

        <RejectFollowupModal
          visible={rejectModalVisible}
          onClose={closeModals}
          followup={selectedFollowup}
          onConfirm={handleConfirmReject}
        />

        <RescheduleModal
          visible={rescheduleModalVisible}
          onClose={closeModals}
          followup={selectedFollowup}
          onConfirm={handleConfirmReschedule}
        />

        <DeleteFollowupModal
          visible={deleteModalVisible}
          onClose={closeModals}
          followup={selectedFollowup}
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
  header: {
    flexDirection: "row",
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
    flexDirection: "row",
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
    flexDirection: "row",
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
  followupsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "right",
  },
  followupCard: {
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
  cancelledCard: {
    opacity: 0.6,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  todayCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  followupHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  followupInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  followupIcon: {
    fontSize: 20,
  },
  followupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  followupType: {
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
  description: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
    marginBottom: 4,
  },
  veterinarian: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  modalBody: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.black,
    textAlign: "right",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  typeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  activeTypeButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  activeTypeButtonText: {
    color: COLORS.white,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.gray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.darkGray,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },

  // New styles for approved/rejected states
  approvedCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  rejectedCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    opacity: 0.7,
  },
  rejectedText: {
    textDecorationLine: "line-through",
    color: COLORS.darkGray,
  },
  approvedIndicator: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.success + "20",
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  approvedIndicatorText: {
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
  rejectModal: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  rescheduleModal: {
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

  // Button variants
  approveButton: {
    backgroundColor: COLORS.success + "20",
    borderColor: COLORS.success,
  },
  approveButtonText: {
    color: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error + "20",
    borderColor: COLORS.error,
  },
  rejectButtonText: {
    color: COLORS.error,
  },
  rescheduleButton: {
    backgroundColor: COLORS.warning + "20",
    borderColor: COLORS.warning,
  },
  rescheduleButtonText: {
    color: COLORS.warning,
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
  todayAlert: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: COLORS.warning + "20",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
  },
  todayAlertText: {
    color: COLORS.warning,
    fontWeight: "bold",
  },
  // Reject modal content
  rejectContent: {
    marginBottom: 20,
  },
  rejectText: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "right",
  },

  // Reschedule modal content
  rescheduleContent: {
    marginBottom: 20,
  },
  rescheduleText: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "right",
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
  // Delete modal content
  deleteContent: {
    marginBottom: 20,
  },
  deleteText: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  deleteSubtext: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "right",
  },

  closeButton: {
    padding: 4,
  },

  modalActions: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    gap: 12,
    marginTop: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.gray,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 16,
  },
});
