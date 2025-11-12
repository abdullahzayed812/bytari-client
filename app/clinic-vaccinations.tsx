import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Modal } from "react-native";
import React, { useState, useMemo } from "react";
import { COLORS } from "../constants/colors";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Syringe,
  Calendar,
  Clock,
  Shield,
  User,
  CheckCircle,
  AlertCircle,
  X,
  Calendar as CalendarIcon,
} from "lucide-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import { useToastContext } from "@/providers/ToastProvider";
import DateTimePicker from "@react-native-community/datetimepicker";

// Modal Components
const VaccinationDetailsModal = ({ visible, onClose, vaccination, onReschedule, onComplete, onCancel }: any) => {
  if (!vaccination) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>تفاصيل التطعيم</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>التطعيم</Text>
            <Text style={styles.detailValue}>{vaccination.vaccineName}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>الحيوان</Text>
            <Text style={styles.detailValue}>
              {vaccination.petName} ({vaccination.petType})
            </Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>المالك</Text>
            <Text style={styles.detailValue}>{vaccination.ownerName}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>الموعد</Text>
            <Text style={styles.detailValue}>
              {vaccination.scheduledDate} في {vaccination.scheduledTime}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>الجرعة</Text>
            <Text style={styles.detailValue}>
              {vaccination.doseNumber} من {vaccination.totalDoses}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>الطبيب</Text>
            <Text style={styles.detailValue}>{vaccination.veterinarian}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>ملاحظات</Text>
            <Text style={styles.detailValue}>{vaccination.notes}</Text>
          </View>

          {vaccination.status === "overdue" && (
            <View style={styles.overdueAlert}>
              <AlertCircle size={20} color={COLORS.error} />
              <Text style={styles.overdueAlertText}>هذا التطعيم متأخر!</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.modalActions}>
          {vaccination.status !== "completed" && vaccination.status !== "cancelled" && (
            <>
              <TouchableOpacity style={[styles.actionButton, styles.rescheduleButton]} onPress={onReschedule}>
                <CalendarIcon size={18} color={COLORS.warning} />
                <Text style={[styles.actionButtonText, styles.rescheduleButtonText]}>تأجيل</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, styles.completeButton]} onPress={onComplete}>
                <CheckCircle size={18} color={COLORS.success} />
                <Text style={[styles.actionButtonText, styles.completeButtonText]}>إكمال</Text>
              </TouchableOpacity>

              {vaccination.status !== "cancelled" && (
                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={onCancel}>
                  <X size={18} color={COLORS.error} />
                  <Text style={[styles.actionButtonText, styles.cancelButtonText]}>إلغاء</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const RescheduleModal = ({ visible, onClose, vaccination, onConfirm }: any) => {
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
            <Text style={styles.modalTitle}>تأجيل التطعيم</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.rescheduleContent}>
            <Text style={styles.rescheduleText}>
              تأجيل تطعيم {vaccination?.vaccineName} للحيوان {vaccination?.petName}
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

const CompleteVaccinationModal = ({ visible, onClose, vaccination, onConfirm }: any) => {
  const [nextDate, setNextDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setNextDate(date);
    }
  };

  const handleConfirm = () => {
    onConfirm(nextDate);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.centeredModal}>
        <View style={styles.completeModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>إكمال التطعيم</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.completeContent}>
            <Text style={styles.completeText}>
              تأكيد إعطاء تطعيم {vaccination?.vaccineName} للحيوان {vaccination?.petName}
            </Text>

            <View style={styles.nextDateSection}>
              <Text style={styles.nextDateLabel}>موعد الجرعة التالية</Text>
              <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                <Calendar size={20} color={COLORS.primary} />
                <Text style={styles.datePickerText}>{nextDate.toLocaleDateString("ar-EG")}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={nextDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
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

export default function ClinicVaccinations() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const { clinicId } = useLocalSearchParams();

  // Modal states
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);

  // Fetch vaccinations using tRPC
  const { data: vaccinationsData, isLoading } = useQuery(
    trpc.clinics.vaccinations.getClinicVaccinations.queryOptions(
      {
        clinicId: Number(clinicId),
        status: selectedFilter as any,
      },
      {
        enabled: !!clinicId,
      }
    )
  );

  const vaccinations = useMemo(() => (vaccinationsData as any)?.vaccinations || [], [vaccinationsData]);

  // tRPC mutations
  const updateStatusMutation = useMutation(trpc.clinics.vaccinations.updateVaccinationStatus.mutationOptions());
  const rescheduleMutation = useMutation(trpc.clinics.vaccinations.rescheduleVaccination.mutationOptions());

  // Handler functions
  const handleVaccinationPress = (vaccination: any) => {
    setSelectedVaccination(vaccination);
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

  const handleCancelVaccination = () => {
    if (!selectedVaccination) return;

    updateStatusMutation.mutate(
      {
        vaccinationId: Number(selectedVaccination.id),
        status: "cancelled",
      } as any,
      {
        onSuccess: () => {
          queryClient.invalidateQueries(trpc.clinics.vaccinations.getClinicVaccinations.queryKey);
          showToast({
            type: "success",
            message: "تم تحديث حالة التطعيم بنجاح",
          });
        },
        onError: (error) => {
          showToast({
            type: "error",
            message: error.message || "فشل في تحديث حالة التطعيم",
          });
        },
      }
    );

    setDetailsModalVisible(false);
    setSelectedVaccination(null);
  };

  const handleConfirmReschedule = (newDate: Date) => {
    if (!selectedVaccination) return;

    rescheduleMutation.mutate(
      {
        vaccinationId: Number(selectedVaccination.id),
        newDate: newDate,
      } as any,
      {
        onSuccess: () => {
          queryClient.invalidateQueries(trpc.clinics.vaccinations.getClinicVaccinations.queryKey);
          showToast({
            type: "success",
            message: "تم تأجيل موعد التطعيم بنجاح",
          });
        },
        onError: (error) => {
          showToast({
            type: "error",
            message: error.message || "فشل في تأجيل موعد التطعيم",
          });
        },
      }
    );

    setSelectedVaccination(null);
  };

  const handleConfirmComplete = (nextDate: Date) => {
    if (!selectedVaccination) return;

    updateStatusMutation.mutate(
      {
        vaccinationId: Number(selectedVaccination.id),
        status: "completed",
        nextDate: nextDate,
      } as any,
      {
        onSuccess: () => {
          queryClient.invalidateQueries(trpc.clinics.vaccinations.getClinicVaccinations.queryKey);
          showToast({
            type: "success",
            message: "تم تحديث حالة التطعيم بنجاح",
          });
        },
        onError: (error) => {
          showToast({
            type: "error",
            message: error.message || "فشل في تحديث حالة التطعيم",
          });
        },
      }
    );

    setSelectedVaccination(null);
  };

  const closeModals = () => {
    setDetailsModalVisible(false);
    setRescheduleModalVisible(false);
    setCompleteModalVisible(false);
    setSelectedVaccination(null);
  };

  // Rest of your existing helper functions (getStatusColor, getStatusText, getVaccineIcon, etc.)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return COLORS.primary;
      case "completed":
        return COLORS.success;
      case "overdue":
        return COLORS.error;
      case "cancelled":
        return COLORS.darkGray;
      default:
        return COLORS.darkGray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "مجدول";
      case "completed":
        return "مكتمل";
      case "overdue":
        return "متأخر";
      case "cancelled":
        return "ملغي";
      default:
        return "غير محدد";
    }
  };

  const getVaccineIcon = (type: string) => {
    switch (type) {
      case "FVRCP":
        return "🐱";
      case "DHPP":
        return "🐕";
      case "RHD":
        return "🐰";
      case "Avian Pox":
        return "🐦";
      case "Rabies":
        return "💉";
      default:
        return "🩹";
    }
  };

  // Rest of your existing renderVaccinationItem function remains the same...
  const renderVaccinationItem = ({ item }: { item: any }) => {
    const isOverdue = item.status === "overdue";
    const isToday = item.scheduledDate === new Date().toISOString().split("T")[0];
    const progressPercentage = (item.doseNumber / item.totalDoses) * 100;

    return (
      <TouchableOpacity
        style={[styles.vaccinationCard, isOverdue && styles.overdueCard, isToday && styles.todayCard]}
        activeOpacity={0.8}
        onPress={() => handleVaccinationPress(item)}
      >
        {/* ... rest of your existing renderVaccinationItem JSX ... */}
        <View style={styles.vaccinationHeader}>
          <View style={styles.vaccinationInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.vaccineIcon}>{getVaccineIcon(item.vaccineType)}</Text>
              <View style={styles.titleContainer}>
                <Text style={styles.vaccineName}>{item.vaccineName}</Text>
                <Text style={styles.vaccineType}>({item.vaccineType})</Text>
              </View>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.petInfo}>
          <View style={styles.petRow}>
            <Text style={styles.petName}>
              {item.petName} ({item.petType})
            </Text>
          </View>
          <View style={styles.ownerRow}>
            <User size={14} color={COLORS.darkGray} />
            <Text style={styles.ownerName}>{item.ownerName}</Text>
          </View>
        </View>

        <View style={styles.dateTimeContainer}>
          <View style={styles.dateRow}>
            <Calendar size={14} color={isOverdue ? COLORS.error : COLORS.primary} />
            <Text style={[styles.dateText, isOverdue && styles.overdueText]}>{item.scheduledDate}</Text>
          </View>
          <View style={styles.timeRow}>
            <Clock size={14} color={isOverdue ? COLORS.error : COLORS.primary} />
            <Text style={[styles.timeText, isOverdue && styles.overdueText]}>{item.scheduledTime}</Text>
          </View>
        </View>

        {/* Dose Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>تقدم الجرعات</Text>
            <Text style={styles.progressText}>
              {item.doseNumber}/{item.totalDoses}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: item.status === "completed" ? COLORS.success : COLORS.primary,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.veterinarian}>الطبيب: {item.veterinarian}</Text>
          <Text style={styles.nextDue}>الجرعة التالية: {item.nextDueDate}</Text>
        </View>

        <Text style={styles.notes}>{item.notes}</Text>

        {isOverdue && (
          <View style={styles.overdueWarning}>
            <AlertCircle size={16} color={COLORS.error} />
            <Text style={styles.overdueWarningText}>هذا التطعيم متأخر!</Text>
          </View>
        )}

        {isToday && (
          <View style={styles.todayIndicator}>
            <Syringe size={16} color={COLORS.warning} />
            <Text style={styles.todayIndicatorText}>موعد اليوم</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Rest of your existing component JSX remains the same...
  const filterButtons = [
    { key: "all", label: "الكل", count: vaccinations.length },
    { key: "scheduled", label: "مجدول", count: vaccinations.filter((v: any) => v.status === "scheduled").length },
    { key: "completed", label: "مكتمل", count: vaccinations.filter((v: any) => v.status === "completed").length },
    { key: "overdue", label: "متأخر", count: vaccinations.filter((v: any) => v.status === "overdue").length },
  ];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>جاري تحميل التطعيمات...</Text>
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
          <Text style={styles.headerTitle}>التطعيمات</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: COLORS.primary + "20" }]}>
              <Syringe size={24} color={COLORS.primary} />
              <Text style={styles.statNumber}>{vaccinations.filter((v: any) => v.status === "scheduled").length}</Text>
              <Text style={styles.statLabel}>تطعيمات مجدولة</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.success + "20" }]}>
              <CheckCircle size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>{vaccinations.filter((v: any) => v.status === "completed").length}</Text>
              <Text style={styles.statLabel}>تطعيمات مكتملة</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: COLORS.error + "20" }]}>
              <AlertCircle size={24} color={COLORS.error} />
              <Text style={styles.statNumber}>{vaccinations.filter((v: any) => v.status === "overdue").length}</Text>
              <Text style={styles.statLabel}>تطعيمات متأخرة</Text>
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

          {/* Vaccinations List */}
          <View style={styles.vaccinationsSection}>
            <Text style={styles.sectionTitle}>
              {selectedFilter === "all"
                ? "جميع التطعيمات"
                : `تطعيمات ${filterButtons.find((f) => f.key === selectedFilter)?.label}`}
            </Text>

            <FlatList
              data={vaccinations}
              renderItem={renderVaccinationItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Shield size={48} color={COLORS.darkGray} />
                  <Text style={styles.emptyText}>لا توجد تطعيمات</Text>
                </View>
              }
            />
          </View>
        </ScrollView>

        {/* Modals */}
        <VaccinationDetailsModal
          visible={detailsModalVisible}
          onClose={closeModals}
          vaccination={selectedVaccination}
          onReschedule={handleReschedule}
          onComplete={handleComplete}
          onCancel={handleCancelVaccination}
        />

        <RescheduleModal
          visible={rescheduleModalVisible}
          onClose={closeModals}
          vaccination={selectedVaccination}
          onConfirm={handleConfirmReschedule}
        />

        <CompleteVaccinationModal
          visible={completeModalVisible}
          onClose={closeModals}
          vaccination={selectedVaccination}
          onConfirm={handleConfirmComplete}
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
  vaccinationsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 12,
    textAlign: "right",
  },
  vaccinationCard: {
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
  vaccinationHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  vaccinationInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  vaccineIcon: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
  },
  vaccineType: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  statusContainer: {
    alignItems: "flex-end",
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
    marginBottom: 12,
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
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
  progressText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  detailsContainer: {
    marginBottom: 8,
  },
  veterinarian: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginBottom: 2,
  },
  nextDue: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  notes: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "right",
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
  cancelButton: {
    backgroundColor: COLORS.error + "20",
    borderColor: COLORS.error,
  },
  cancelButtonText: {
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
  // Complete modal content
  completeContent: {
    marginBottom: 20,
  },
  completeText: {
    fontSize: 16,
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "right",
  },
  nextDateSection: {
    marginTop: 16,
  },
  nextDateLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: "right",
  },
});
