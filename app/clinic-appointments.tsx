import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, FlatList, Alert } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Calendar, Clock, Plus, Check, X, RefreshCw, ChevronDown, ChevronUp } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useToastContext } from "@/providers/ToastProvider";
import DateTimePicker from "@react-native-community/datetimepicker";

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

  // Create form state
  const [createPetId, setCreatePetId] = useState("");
  const [createOwnerId, setCreateOwnerId] = useState("");
  const [createType, setCreateType] = useState("مراجعة");
  const [createNotes, setCreateNotes] = useState("");
  const [createDate, setCreateDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Counter-propose form state
  const [counterDate, setCounterDate] = useState(new Date());
  const [counterNotes, setCounterNotes] = useState("");
  const [showCounterDatePicker, setShowCounterDatePicker] = useState(false);

  const queryKey = { clinicId: Number(clinicId) };

  const { data, isLoading, refetch } = useQuery({
    ...trpc.clinics.appointments.getAppointments.queryOptions(queryKey),
    enabled: !!clinicId,
  });

  const createMutation = useMutation(trpc.clinics.appointments.createAppointment.mutationOptions());
  const respondMutation = useMutation(trpc.clinics.appointments.respondToAppointment.mutationOptions());
  const completeMutation = useMutation(trpc.clinics.appointments.completeAppointment.mutationOptions());
  const counterRespondMutation = useMutation(trpc.clinics.appointments.respondToCounterProposal.mutationOptions());

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
    try {
      await respondMutation.mutateAsync({
        appointmentId: selectedAppointment.id,
        action,
        counterProposedDate: action === "counter_propose" ? counterDate.toISOString() : undefined,
        counterProposedNotes: action === "counter_propose" ? counterNotes || undefined : undefined,
      });
      showToast({ message: action === "confirm" ? "تم تأكيد الموعد" : action === "cancel" ? "تم إلغاء الموعد" : "تم إرسال الاقتراح البديل", type: "success" });
      setShowRespondModal(false);
      setCounterNotes("");
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

  const handleCounterRespond = async (appointment: Appointment, accept: boolean) => {
    try {
      await counterRespondMutation.mutateAsync({ appointmentId: appointment.id, accept });
      showToast({ message: accept ? "تم قبول الموعد المقترح" : "تم رفض الموعد المقترح", type: accept ? "success" : "error" });
      invalidate();
    } catch {
      showToast({ message: "حدث خطأ", type: "error" });
    }
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const statusInfo = STATUS_LABELS[item.status] ?? { label: item.status, color: COLORS.darkGray };
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => setExpandedId(isExpanded ? null : item.id)} activeOpacity={0.8}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.petName}>{item.pet?.name ?? item.petId}</Text>
              <Text style={styles.petType}>{item.pet?.type}{item.pet?.breed ? ` - ${item.pet.breed}` : ""}</Text>
            </View>
            <View style={styles.cardHeaderRight}>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                <Text style={styles.statusText}>{statusInfo.label}</Text>
              </View>
              {isExpanded ? <ChevronUp size={16} color={COLORS.darkGray} /> : <ChevronDown size={16} color={COLORS.darkGray} />}
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
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.cardExpanded}>
            {item.owner && (
              <Text style={styles.ownerText}>المالك: {item.owner.name}{item.owner.phone ? ` · ${item.owner.phone}` : ""}</Text>
            )}
            {item.notes ? <Text style={styles.notesText}>ملاحظات: {item.notes}</Text> : null}

            {item.status === "counter_proposed" && item.counterProposedDate && (
              <View style={styles.counterProposalBox}>
                <Text style={styles.counterTitle}>موعد مقترح من العيادة:</Text>
                <Text style={styles.counterDate}>{formatDate(item.counterProposedDate)}</Text>
                {item.counterProposedNotes ? <Text style={styles.counterNotes}>{item.counterProposedNotes}</Text> : null}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.success }]} onPress={() => handleCounterRespond(item, true)}>
                    <Check size={14} color={COLORS.white} />
                    <Text style={styles.actionBtnText}>قبول</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.error }]} onPress={() => handleCounterRespond(item, false)}>
                    <X size={14} color={COLORS.white} />
                    <Text style={styles.actionBtnText}>رفض</Text>
                  </TouchableOpacity>
                </View>
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
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>المواعيد</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
            <Plus size={22} color={COLORS.white} />
          </TouchableOpacity>
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

              <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
                <Calendar size={18} color={COLORS.primary} />
                <Text style={styles.datePickerText}>{createDate.toLocaleString("ar-EG")}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={createDate}
                  mode="datetime"
                  onChange={(_, d) => { setShowDatePicker(false); if (d) setCreateDate(d); }}
                  minimumDate={new Date()}
                />
              )}

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
        <Modal visible={showRespondModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>الرد على طلب الموعد</Text>
              {selectedAppointment && (
                <Text style={styles.modalSubtitle}>
                  {selectedAppointment.pet?.name ?? selectedAppointment.petId} · {formatDate(selectedAppointment.appointmentDate)}
                </Text>
              )}

              <Text style={styles.inputLabel}>تاريخ مقترح بديل (إذا كنت تريد اقتراح موعد آخر)</Text>
              <TouchableOpacity style={styles.datePicker} onPress={() => setShowCounterDatePicker(true)}>
                <Calendar size={18} color={COLORS.primary} />
                <Text style={styles.datePickerText}>{counterDate.toLocaleString("ar-EG")}</Text>
              </TouchableOpacity>
              {showCounterDatePicker && (
                <DateTimePicker
                  value={counterDate}
                  mode="datetime"
                  onChange={(_, d) => { setShowCounterDatePicker(false); if (d) setCounterDate(d); }}
                  minimumDate={new Date()}
                />
              )}
              <TextInput
                style={[styles.input, { height: 70 }]}
                placeholder="ملاحظة على الموعد المقترح (اختياري)"
                value={counterNotes}
                onChangeText={setCounterNotes}
                multiline
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.success }]} onPress={() => handleRespond("confirm")} disabled={respondMutation.isPending}>
                  <Text style={styles.modalBtnText}>تأكيد</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#9C27B0" }]} onPress={() => handleRespond("counter_propose")} disabled={respondMutation.isPending}>
                  <Text style={styles.modalBtnText}>اقتراح بديل</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.error }]} onPress={() => handleRespond("cancel")} disabled={respondMutation.isPending}>
                  <Text style={styles.modalBtnText}>رفض</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={{ marginTop: 8, alignItems: "center" }} onPress={() => setShowRespondModal(false)}>
                <Text style={{ color: COLORS.darkGray }}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
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
  counterProposalBox: {
    backgroundColor: "#F3E5F5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  counterTitle: { fontSize: 13, fontWeight: "bold", color: "#9C27B0", marginBottom: 4 },
  counterDate: { fontSize: 14, color: COLORS.black, marginBottom: 2 },
  counterNotes: { fontSize: 12, color: COLORS.darkGray },
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
});
