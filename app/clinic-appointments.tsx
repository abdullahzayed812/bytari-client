import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, FlatList, Alert, Platform } from "react-native";
import React, { useState, useEffect } from "react";
import { COLORS } from "../constants/colors";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Calendar, Clock, Plus, Check, X, RefreshCw, ChevronDown, ChevronUp, Bell } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useToastContext } from "@/providers/ToastProvider";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

type Appointment = {
  id: number;
  petId: string;
  ownerId: number;
  appointmentDate: string;
  type: string;
  notes?: string | null;
  status: string;
  requestedByClinic: boolean;
  counterProposedDate?: string | null;
  counterProposedNotes?: string | null;
  pet?: { id: string; name: string; type: string; breed?: string | null; image?: string | null } | null;
  owner?: { id: number; name: string; phone?: string | null } | null;
};

const TYPE_OPTIONS = ["مراجعة", "تطعيم", "فحص كامل", "جراحة", "استشارة"];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "بانتظار الموافقة", color: "#FF9800" },
  confirmed: { label: "مؤكد", color: COLORS.success },
  completed: { label: "مكتمل", color: COLORS.primary },
  cancelled: { label: "ملغى", color: COLORS.error },
  counter_proposed: { label: "موعد مقترح", color: "#9C27B0" },
};

export default function ClinicAppointments() {
  const router = useRouter();
  const { clinicId, clinicName } = useLocalSearchParams();
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [apptNotifConfirmTarget, setApptNotifConfirmTarget] = useState<null | { type: "single"; appointmentId: number; petName: string } | { type: "bulk" }>(null);

  // Create form state
  const [createPetId, setCreatePetId] = useState("");
  const [createOwnerId, setCreateOwnerId] = useState("");
  const [createType, setCreateType] = useState("مراجعة");
  const [createNotes, setCreateNotes] = useState("");
  const [createDate, setCreateDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false); // iOS only

  // Counter-propose form state
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [counterDate, setCounterDate] = useState(new Date());
  const [showCounterDatePicker, setShowCounterDatePicker] = useState(false); // iOS only
  const [counterNotes, setCounterNotes] = useState("");

  // Confirm with custom date form state
  const [showConfirmForm, setShowConfirmForm] = useState(false);
  const [confirmDate, setConfirmDate] = useState(new Date());
  const [showConfirmDatePicker, setShowConfirmDatePicker] = useState(false); // iOS only

  const openCreateDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: createDate,
        minimumDate: new Date(),
        mode: "date",
        onChange: (e, date) => {
          if (e.type === "set" && date) {
            DateTimePickerAndroid.open({
              value: date,
              mode: "time",
              onChange: (te, time) => { if (te.type === "set" && time) setCreateDate(time); },
            });
          }
        },
      });
    } else {
      setShowDatePicker(true);
    }
  };

  const openConfirmDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: confirmDate,
        minimumDate: new Date(),
        mode: "date",
        onChange: (e, date) => {
          if (e.type === "set" && date) {
            DateTimePickerAndroid.open({
              value: date,
              mode: "time",
              onChange: (te, time) => { if (te.type === "set" && time) setConfirmDate(time); },
            });
          }
        },
      });
    } else {
      setShowConfirmDatePicker(true);
    }
  };

  const openCounterDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: counterDate,
        minimumDate: new Date(),
        mode: "date",
        onChange: (e, date) => {
          if (e.type === "set" && date) {
            DateTimePickerAndroid.open({
              value: date,
              mode: "time",
              onChange: (te, time) => { if (te.type === "set" && time) setCounterDate(time); },
            });
          }
        },
      });
    } else {
      setShowCounterDatePicker(true);
    }
  };

  const queryKey = { clinicId: Number(clinicId) };

  const { data, isLoading, refetch } = useQuery({
    ...trpc.clinics.appointments.getAppointments.queryOptions(queryKey),
    enabled: !!clinicId,
  });

  const createMutation = useMutation(trpc.clinics.appointments.createAppointment.mutationOptions());
  const respondMutation = useMutation(trpc.clinics.appointments.respondToAppointment.mutationOptions());
  const completeMutation = useMutation(trpc.clinics.appointments.completeAppointment.mutationOptions());
  const deleteMutation = useMutation(trpc.clinics.appointments.deleteAppointment.mutationOptions());
  const sendNotifMutation = useMutation(trpc.clinics.appointments.sendAppointmentNotification.mutationOptions());
  const sendTodayNotifMutation = useMutation(trpc.clinics.appointments.sendTodayAppointmentsNotification.mutationOptions());

  const markAsReadMutation = useMutation(trpc.clinics.appointments.markAsRead.mutationOptions());

  useEffect(() => {
    if (clinicId) markAsReadMutation.mutate({ clinicId: Number(clinicId) });
  }, [clinicId]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: trpc.clinics.appointments.getAppointments.queryKey(queryKey) });

  const appointments: Appointment[] = (data as any)?.appointments ?? [];
  const todayCount = (data as any)?.todayCount ?? 0;
  const pendingCount = (data as any)?.pendingCount ?? 0;

  const filtered = filterStatus === "all" ? appointments : appointments.filter((a) => a.status === filterStatus);

  const formatDate = (d: string | Date) => {
    const date = new Date(d);
    return date.toLocaleDateString("ar-EG", { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const handleCreate = async () => {
    if (!createPetId.trim() || !createOwnerId.trim()) {
      showToast({ message: "يجب إدخال معرف الحيوان ومعرف المالك", type: "error" });
      return;
    }
    try {
      await createMutation.mutateAsync({
        clinicId: Number(clinicId),
        petId: createPetId.trim(),
        ownerId: Number(createOwnerId),
        appointmentDate: createDate.toISOString(),
        type: createType,
        notes: createNotes || undefined,
      });
      showToast({ message: "تم إنشاء الموعد بنجاح", type: "success" });
      setShowCreateModal(false);
      setCreatePetId(""); setCreateOwnerId(""); setCreateNotes(""); setCreateDate(new Date());
      invalidate();
    } catch {
      showToast({ message: "حدث خطأ أثناء إنشاء الموعد", type: "error" });
    }
  };

  const handleRespond = async (action: "confirm" | "cancel" | "counter_propose") => {
    if (!selectedAppointment) return;

    if (action === "counter_propose") {
      try {
        await respondMutation.mutateAsync({
          appointmentId: selectedAppointment.id,
          action,
          counterProposedDate: counterDate.toISOString(),
          counterProposedNotes: counterNotes || undefined,
        });
        showToast({ message: "Counter proposal sent", type: "success" });
        setShowRespondModal(false);
        setShowCounterForm(false);
        setCounterDate(new Date()); setCounterNotes("");
        invalidate();
      } catch {
        showToast({ message: "Error sending counter proposal", type: "error" });
      }
      return;
    }

    try {
      await respondMutation.mutateAsync({
        appointmentId: selectedAppointment.id,
        action,
        ...(action === "confirm" ? { confirmedDate: confirmDate.toISOString() } : {}),
      } as any);
      showToast({ message: action === "confirm" ? "تم تأكيد الموعد" : "تم إلغاء الموعد", type: "success" });
      setShowRespondModal(false);
      setShowConfirmForm(false);
      invalidate();
    } catch {
      showToast({ message: "حدث خطأ", type: "error" });
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await completeMutation.mutateAsync({ appointmentId: id });
      showToast({ message: "تم تحديد الموعد كمكتمل", type: "success" });
      invalidate();
    } catch {
      showToast({ message: "حدث خطأ", type: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert("حذف الموعد", "هل تريد حذف هذا الموعد نهائياً؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync({ appointmentId: id });
            showToast({ message: "تم حذف الموعد", type: "success" });
            invalidate();
          } catch {
            showToast({ message: "حدث خطأ أثناء الحذف", type: "error" });
          }
        },
      },
    ]);
  };

  const handleSendNotif = (appointmentId: number, petName: string) => {
    setApptNotifConfirmTarget({ type: "single", appointmentId, petName });
  };

  const handleSendTodayNotifications = () => {
    if (todayCount === 0) return;
    setApptNotifConfirmTarget({ type: "bulk" });
  };

  const handleConfirmApptNotif = () => {
    if (!apptNotifConfirmTarget) return;
    if (apptNotifConfirmTarget.type === "single") {
      sendNotifMutation.mutate(
        { appointmentId: apptNotifConfirmTarget.appointmentId },
        {
          onSuccess: () => { setApptNotifConfirmTarget(null); showToast({ message: "تم إرسال الإشعار", type: "success" }); },
          onError: () => { setApptNotifConfirmTarget(null); showToast({ message: "حدث خطأ", type: "error" }); },
        }
      );
    } else {
      sendTodayNotifMutation.mutate(
        { clinicId: Number(clinicId) },
        {
          onSuccess: (d) => { setApptNotifConfirmTarget(null); showToast({ message: `تم إرسال ${(d as any).count} إشعار`, type: "success" }); },
          onError: () => { setApptNotifConfirmTarget(null); showToast({ message: "حدث خطأ", type: "error" }); },
        }
      );
    }
  };

const renderAppointment = ({ item }: { item: Appointment }) => {
    const statusInfo = STATUS_LABELS[item.status] ?? { label: item.status, color: COLORS.darkGray };
    const isExpanded = expandedId === item.id;

    const openPetDetails = () => {
      router.push({
        pathname: "/(tabs)/pet-details",
        params: { petId: item.petId, clinicId: clinicId as string, fromClinic: "true" },
      });
    };

    return (
      <View style={styles.card}>
        {/* Tapping the card body opens the pet file */}
        <TouchableOpacity onPress={openPetDetails} activeOpacity={0.8}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.petName}>{item.pet?.name ?? item.petId}</Text>
              <Text style={styles.petType}>{item.pet?.type}{item.pet?.breed ? ` - ${item.pet.breed}` : ""}</Text>
            </View>
            <View style={styles.cardHeaderRight}>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                <Text style={styles.statusText}>{statusInfo.label}</Text>
              </View>
              {/* Chevron is a separate button so it doesn't trigger navigation */}
              <TouchableOpacity
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                style={styles.expandBtn}
              >
                {isExpanded ? <ChevronUp size={18} color={COLORS.primary} /> : <ChevronDown size={18} color={COLORS.primary} />}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.cardMeta}>
            <Calendar size={14} color={COLORS.darkGray} />
            <Text style={styles.cardMetaText}>{formatDate(item.appointmentDate)}</Text>
          </View>
          <View style={styles.cardMeta}>
            <Clock size={14} color={COLORS.darkGray} />
            <Text style={styles.cardMetaText}>{item.type} · {item.requestedByClinic ? "بواسطة العيادة" : "طلب من المالك"}</Text>
          </View>
          {!item.requestedByClinic && item.notes ? (
            <View style={styles.ownerNotesBox}>
              <Text style={styles.ownerNotesText}>{item.notes}</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.cardExpanded}>
            {item.owner && (
              <Text style={styles.ownerText}>المالك: {item.owner.name}{item.owner.phone ? ` · ${item.owner.phone}` : ""}</Text>
            )}
            {item.notes ? <Text style={styles.notesText}>ملاحظات: {item.notes}</Text> : null}

            <View style={styles.cardQuickActions}>
              <TouchableOpacity
                style={[styles.notifyCardBtn, sendNotifMutation.isPending && { opacity: 0.5 }]}
                onPress={() => handleSendNotif(item.id, item.pet?.name ?? item.petId)}
                disabled={sendNotifMutation.isPending}
              >
                <Bell size={14} color={COLORS.primary} />
                <Text style={styles.notifyCardBtnText}>إشعار للمالك</Text>
              </TouchableOpacity>
              {item.status !== "completed" && item.status !== "cancelled" && (
                <TouchableOpacity
                  style={[styles.completeCardBtn, completeMutation.isPending && { opacity: 0.5 }]}
                  onPress={() => handleComplete(item.id)}
                  disabled={completeMutation.isPending}
                >
                  <Check size={14} color={COLORS.success} />
                  <Text style={styles.completeCardBtnText}>اكتمل</Text>
                </TouchableOpacity>
              )}
            </View>

            {item.status === "counter_proposed" && item.counterProposedDate && (
              <View style={styles.counterProposalBox}>
                <Text style={styles.counterTitle}>موعد مقترح من العيادة:</Text>
                <Text style={styles.counterDate}>{formatDate(item.counterProposedDate)}</Text>
                {item.counterProposedNotes ? <Text style={styles.counterNotes}>{item.counterProposedNotes}</Text> : null}
                <Text style={styles.counterWaiting}>بانتظار رد صاحب الحيوان</Text>
              </View>
            )}

            {item.status === "pending" && (
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.success }]} onPress={() => { setSelectedAppointment(item); setShowRespondModal(true); }}>
                  <Check size={14} color={COLORS.white} />
                  <Text style={styles.actionBtnText}>الرد</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.status === "confirmed" && (
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.primary }]} onPress={() => handleComplete(item.id)}>
                  <Check size={14} color={COLORS.white} />
                  <Text style={styles.actionBtnText}>تحديد كمكتمل</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.error }]} onPress={() => respondMutation.mutateAsync({ appointmentId: item.id, action: "cancel" }).then(() => { showToast({ message: "تم إلغاء الموعد", type: "success" }); invalidate(); })}>
                  <X size={14} color={COLORS.white} />
                  <Text style={styles.actionBtnText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            )}

            {item.status === "completed" && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: COLORS.error }, deleteMutation.isPending && { opacity: 0.5 }]}
                  onPress={() => handleDelete(item.id)}
                  disabled={deleteMutation.isPending}
                >
                  <X size={14} color={COLORS.white} />
                  <Text style={styles.actionBtnText}>حذف الموعد</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <>
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>المواعيد</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: todayCount > 0 ? COLORS.warning : COLORS.lightGray }, sendTodayNotifMutation.isPending && { opacity: 0.5 }]}
              onPress={handleSendTodayNotifications}
              disabled={todayCount === 0 || sendTodayNotifMutation.isPending}
            >
              <Bell size={20} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
              <Plus size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary row */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: "#E3F2FD" }]}>
            <Text style={[styles.summaryNum, { color: COLORS.primary }]}>{todayCount}</Text>
            <Text style={styles.summaryLabel}>مواعيد اليوم</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#FFF3E0" }]}>
            <Text style={[styles.summaryNum, { color: "#FF9800" }]}>{pendingCount}</Text>
            <Text style={styles.summaryLabel}>بانتظار الموافقة</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#E8F5E9" }]}>
            <Text style={[styles.summaryNum, { color: COLORS.success }]}>{appointments.length}</Text>
            <Text style={styles.summaryLabel}>إجمالي المواعيد</Text>
          </View>
        </View>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {[["all", "الكل"], ["pending", "بانتظار الموافقة"], ["confirmed", "مؤكدة"], ["completed", "مكتملة"], ["cancelled", "ملغاة"], ["counter_proposed", "موعد مقترح"]].map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterChip, filterStatus === key && styles.filterChipActive]}
              onPress={() => setFilterStatus(key)}
            >
              <Text style={[styles.filterChipText, filterStatus === key && styles.filterChipTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderAppointment}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>لا توجد مواعيد</Text>
              </View>
            }
          />
        )}

        {/* Create Appointment Modal */}
        <Modal visible={showCreateModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>إنشاء موعد جديد</Text>

              <TextInput
                style={styles.input}
                placeholder="معرف الحيوان (Pet ID)"
                value={createPetId}
                onChangeText={setCreatePetId}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="معرف المالك (Owner ID)"
                value={createOwnerId}
                onChangeText={setCreateOwnerId}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>نوع الموعد</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 8 }}>
                {TYPE_OPTIONS.map((t) => (
                  <TouchableOpacity key={t} style={[styles.typeChip, createType === t && styles.typeChipActive]} onPress={() => setCreateType(t)}>
                    <Text style={[styles.typeChipText, createType === t && styles.typeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={styles.datePicker} onPress={openCreateDatePicker}>
                <Calendar size={18} color={COLORS.primary} />
                <Text style={styles.datePickerText}>{createDate.toLocaleString("ar-EG")}</Text>
              </TouchableOpacity>

              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="ملاحظات (اختياري)"
                value={createNotes}
                onChangeText={setCreateNotes}
                multiline
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: COLORS.primary }]}
                  onPress={handleCreate}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.modalBtnText}>إنشاء</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.darkGray }]} onPress={() => setShowCreateModal(false)}>
                  <Text style={styles.modalBtnText}>إلغاء</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Respond Modal (confirm / cancel / counter-propose) */}
        <Modal
          visible={showRespondModal}
          transparent
          animationType="slide"
          onRequestClose={() => { setShowRespondModal(false); setShowCounterForm(false); setShowConfirmForm(false); setCounterDate(new Date()); setCounterNotes(""); setConfirmDate(new Date()); }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>الرد على طلب الموعد</Text>
              {selectedAppointment && (
                <>
                  <Text style={styles.modalSubtitle}>
                    {selectedAppointment.pet?.name ?? selectedAppointment.petId}
                  </Text>
                  <View style={styles.fixedDateBox}>
                    <Calendar size={14} color={COLORS.primary} />
                    <Text style={styles.fixedDateText}>{formatDate(selectedAppointment.appointmentDate)}</Text>
                  </View>
                </>
              )}

              {showConfirmForm ? (
                <>
                  <Text style={styles.inputLabel}>تاريخ ووقت تأكيد الموعد</Text>
                  <TouchableOpacity style={styles.datePicker} onPress={openConfirmDatePicker}>
                    <Calendar size={18} color={COLORS.success} />
                    <Text style={styles.datePickerText}>{confirmDate.toLocaleString("ar-EG")}</Text>
                  </TouchableOpacity>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalBtn, { backgroundColor: COLORS.success }]}
                      onPress={() => handleRespond("confirm")}
                      disabled={respondMutation.isPending}
                    >
                      {respondMutation.isPending ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.modalBtnText}>تأكيد</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.darkGray }]} onPress={() => setShowConfirmForm(false)}>
                      <Text style={styles.modalBtnText}>رجوع</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : showCounterForm ? (
                <>
                  <Text style={styles.inputLabel}>الموعد البديل المقترح</Text>
                  <TouchableOpacity style={styles.datePicker} onPress={openCounterDatePicker}>
                    <Calendar size={18} color={COLORS.primary} />
                    <Text style={styles.datePickerText}>{counterDate.toLocaleString("ar-EG")}</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, { height: 70 }]}
                    placeholder="ملاحظة (اختياري)"
                    value={counterNotes}
                    onChangeText={setCounterNotes}
                    multiline
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalBtn, { backgroundColor: "#9C27B0" }]}
                      onPress={() => handleRespond("counter_propose")}
                      disabled={respondMutation.isPending}
                    >
                      {respondMutation.isPending ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.modalBtnText}>إرسال الاقتراح</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.darkGray }]} onPress={() => setShowCounterForm(false)}>
                      <Text style={styles.modalBtnText}>رجوع</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: COLORS.success }]}
                    onPress={() => { setConfirmDate(selectedAppointment ? new Date(selectedAppointment.appointmentDate) : new Date()); setShowConfirmForm(true); }}
                  >
                    <Text style={styles.modalBtnText}>تأكيد الموعد</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#9C27B0" }]} onPress={() => setShowCounterForm(true)}>
                    <Text style={styles.modalBtnText}>اقتراح بديل</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: COLORS.error }]}
                    onPress={() => handleRespond("cancel")}
                    disabled={respondMutation.isPending}
                  >
                    <Text style={styles.modalBtnText}>رفض</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={{ marginTop: 8, alignItems: "center" }}
                onPress={() => { setShowRespondModal(false); setShowCounterForm(false); setShowConfirmForm(false); setCounterDate(new Date()); setCounterNotes(""); setConfirmDate(new Date()); }}
              >
                <Text style={{ color: COLORS.darkGray }}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Notification confirm modal */}
        <Modal visible={!!apptNotifConfirmTarget} transparent animationType="fade" onRequestClose={() => setApptNotifConfirmTarget(null)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { paddingTop: 24 }]}>
              <Bell size={28} color={COLORS.primary} style={{ alignSelf: "center", marginBottom: 12 }} />
              <Text style={styles.modalTitle}>تأكيد إرسال الإشعار</Text>
              <Text style={[styles.modalSubtitle, { marginBottom: 20, lineHeight: 22 }]}>
                {apptNotifConfirmTarget?.type === "single"
                  ? `هل تريد إرسال إشعار لمالك ${apptNotifConfirmTarget.petName} بخصوص موعده؟`
                  : `هل تريد إرسال إشعارات لجميع أصحاب المواعيد اليوم (${todayCount} موعد)؟`}
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: COLORS.darkGray }]}
                  onPress={() => setApptNotifConfirmTarget(null)}
                  disabled={sendNotifMutation.isPending || sendTodayNotifMutation.isPending}
                >
                  <Text style={styles.modalBtnText}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: COLORS.primary }, (sendNotifMutation.isPending || sendTodayNotifMutation.isPending) && { opacity: 0.6 }]}
                  onPress={handleConfirmApptNotif}
                  disabled={sendNotifMutation.isPending || sendTodayNotifMutation.isPending}
                >
                  {(sendNotifMutation.isPending || sendTodayNotifMutation.isPending)
                    ? <ActivityIndicator size="small" color={COLORS.white} />
                    : <Text style={styles.modalBtnText}>إرسال</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
    </View>
    {showDatePicker && (
      <DateTimePicker
        value={createDate}
        mode="datetime"
        onChange={(_, d) => { setShowDatePicker(false); if (d) setCreateDate(d); }}
        minimumDate={new Date()}
      />
    )}
    {showConfirmDatePicker && (
      <DateTimePicker
        value={confirmDate}
        mode="datetime"
        onChange={(_, d) => { setShowConfirmDatePicker(false); if (d) setConfirmDate(d); }}
        minimumDate={new Date()}
      />
    )}
    {showCounterDatePicker && (
      <DateTimePicker
        value={counterDate}
        mode="datetime"
        onChange={(_, d) => { setShowCounterDatePicker(false); if (d) setCounterDate(d); }}
        minimumDate={new Date()}
      />
    )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray },
  safeArea: { flex: 1 },
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
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.black },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  summaryNum: { fontSize: 22, fontWeight: "bold" },
  summaryLabel: { fontSize: 11, color: COLORS.darkGray, textAlign: "center", marginTop: 2 },
  filterRow: { maxHeight: 44, marginBottom: 8 },
  filterChip: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 13, color: COLORS.darkGray },
  filterChipTextActive: { color: COLORS.white, fontWeight: "bold" },
  list: { padding: 12, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  cardHeaderLeft: { flex: 1 },
  cardHeaderRight: { alignItems: "flex-end", gap: 4 },
  petName: { fontSize: 15, fontWeight: "bold", color: COLORS.black },
  petType: { fontSize: 12, color: COLORS.darkGray, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: { color: COLORS.white, fontSize: 11, fontWeight: "bold" },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  cardMetaText: { fontSize: 13, color: COLORS.darkGray },
  cardExpanded: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  ownerText: { fontSize: 13, color: COLORS.darkGray, marginBottom: 4 },
  notesText: { fontSize: 13, color: COLORS.darkGray, marginBottom: 8 },
  ownerNotesBox: {
    marginTop: 6,
    backgroundColor: "#F0F4FF",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  ownerNotesText: { fontSize: 12, color: COLORS.darkGray },
  counterProposalBox: {
    backgroundColor: "#F3E5F5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  counterTitle: { fontSize: 13, fontWeight: "bold", color: "#9C27B0", marginBottom: 4 },
  counterDate: { fontSize: 14, color: COLORS.black, marginBottom: 2 },
  counterNotes: { fontSize: 12, color: COLORS.darkGray },
  counterWaiting: { fontSize: 12, color: "#9C27B0", fontStyle: "italic", marginTop: 6 },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: { color: COLORS.white, fontSize: 12, fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyText: { fontSize: 15, color: COLORS.darkGray, textAlign: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 10,
    color: COLORS.black,
    textAlignVertical: "top",
  },
  inputLabel: { fontSize: 13, color: COLORS.darkGray, marginBottom: 6, fontWeight: "500" },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  datePickerText: { fontSize: 14, color: COLORS.black },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  typeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeChipText: { fontSize: 13, color: COLORS.darkGray },
  typeChipTextActive: { color: COLORS.white, fontWeight: "bold" },
  modalButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  modalBtn: {
    flex: 1,
    padding: 13,
    borderRadius: 8,
    alignItems: "center",
  },
  modalBtnText: { color: COLORS.white, fontSize: 14, fontWeight: "bold" },
  expandBtn: {
    backgroundColor: COLORS.primary + "18",
    borderWidth: 1,
    borderColor: COLORS.primary + "40",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 36,
    minHeight: 36,
  },
  cardQuickActions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  notifyCardBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + "18",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  notifyCardBtnText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
  },
  completeCardBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + "18",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  completeCardBtnText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: "600",
  },
  fixedDateBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  fixedDateText: { fontSize: 13, color: COLORS.primary, fontWeight: "500", flex: 1 },
});
