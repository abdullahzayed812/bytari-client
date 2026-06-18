import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Plus, Edit2, Trash2, Zap, Save } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useToastContext } from "@/providers/ToastProvider";

type Template = {
  id: number;
  name: string;
  templateType: string;
  defaultDiagnosis?: string | null;
  defaultTreatment?: string | null;
  defaultNotes?: string | null;
  intervalDays?: number | null;
};

const TEMPLATE_TYPES = [
  { key: "vaccine", label: "لقاح" },
  { key: "treatment", label: "علاج" },
  { key: "diagnosis", label: "تشخيص" },
  { key: "general", label: "فحص عام" },
] as const;

const EMPTY_FORM = { name: "", templateType: "general", defaultDiagnosis: "", defaultTreatment: "", defaultNotes: "", intervalDays: "" };

export default function ClinicQuickReviewSettings() {
  const router = useRouter();
  const { clinicId } = useLocalSearchParams();
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading, refetch } = useQuery(
    trpc.clinics.quickReview.getTemplates.queryOptions({ clinicId: Number(clinicId) })
  );

  const createMutation = useMutation(trpc.clinics.quickReview.createTemplate.mutationOptions());
  const updateMutation = useMutation(trpc.clinics.quickReview.updateTemplate.mutationOptions());
  const deleteMutation = useMutation(trpc.clinics.quickReview.deleteTemplate.mutationOptions());

  const templates: Template[] = (data as any)?.templates ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: trpc.clinics.quickReview.getTemplates.queryKey({ clinicId: Number(clinicId) }) });

  const openCreate = () => {
    setEditingTemplate(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (t: Template) => {
    setEditingTemplate(t);
    setForm({
      name: t.name,
      templateType: t.templateType ?? "general",
      defaultDiagnosis: t.defaultDiagnosis ?? "",
      defaultTreatment: t.defaultTreatment ?? "",
      defaultNotes: t.defaultNotes ?? "",
      intervalDays: t.intervalDays ? String(t.intervalDays) : "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast({ message: "يجب إدخال اسم القالب", type: "error" });
      return;
    }
    try {
      const intervalDaysNum = form.intervalDays.trim() ? parseInt(form.intervalDays.trim()) : undefined;
      if (editingTemplate) {
        await updateMutation.mutateAsync({
          templateId: editingTemplate.id,
          name: form.name.trim(),
          templateType: form.templateType as any,
          defaultDiagnosis: form.defaultDiagnosis.trim() || undefined,
          defaultTreatment: form.defaultTreatment.trim() || undefined,
          defaultNotes: form.defaultNotes.trim() || undefined,
          intervalDays: intervalDaysNum ?? null,
        });
        showToast({ message: "تم تحديث القالب", type: "success" });
      } else {
        await createMutation.mutateAsync({
          clinicId: Number(clinicId),
          name: form.name.trim(),
          templateType: form.templateType as any,
          defaultDiagnosis: form.defaultDiagnosis.trim() || undefined,
          defaultTreatment: form.defaultTreatment.trim() || undefined,
          defaultNotes: form.defaultNotes.trim() || undefined,
          intervalDays: intervalDaysNum,
        });
        showToast({ message: "تم إضافة القالب", type: "success" });
      }
      setShowModal(false);
      invalidate();
    } catch {
      showToast({ message: "حدث خطأ", type: "error" });
    }
  };

  const handleDelete = (t: Template) => {
    Alert.alert("حذف القالب", `هل تريد حذف "${t.name}"؟`, [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync({ templateId: t.id });
            showToast({ message: "تم حذف القالب", type: "success" });
            invalidate();
          } catch {
            showToast({ message: "حدث خطأ", type: "error" });
          }
        },
      },
    ]);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Zap size={20} color={COLORS.primary} />
            <Text style={styles.headerTitle}>قوالب المراجعة السريعة</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openCreate}>
            <Plus size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : templates.length === 0 ? (
          <View style={styles.center}>
            <Zap size={48} color={COLORS.lightGray} />
            <Text style={styles.emptyTitle}>لا توجد قوالب بعد</Text>
            <Text style={styles.emptySubtext}>أضف قالباً لتسريع إنشاء المراجعات السريعة</Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={openCreate}>
              <Plus size={18} color={COLORS.white} />
              <Text style={styles.emptyAddBtnText}>إضافة قالب</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.listHint}>اضغط للتعديل، أو اسحب لحذف القالب</Text>
            {templates.map((t) => (
              <View key={t.id} style={styles.card}>
                <TouchableOpacity style={styles.cardBody} onPress={() => openEdit(t)} activeOpacity={0.8}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Text style={styles.cardName}>{t.name}</Text>
                    <View style={[styles.typePill, { paddingHorizontal: 8, paddingVertical: 3 }]}>
                      <Text style={styles.typePillText}>{TEMPLATE_TYPES.find((x) => x.key === t.templateType)?.label ?? t.templateType}</Text>
                    </View>
                  </View>
                  {t.intervalDays ? (
                    <Text style={styles.cardPreview}>كل {t.intervalDays} يوم</Text>
                  ) : null}
                  {t.defaultDiagnosis ? (
                    <Text style={styles.cardPreview} numberOfLines={2}>التشخيص: {t.defaultDiagnosis}</Text>
                  ) : null}
                  {t.defaultTreatment ? (
                    <Text style={styles.cardPreview} numberOfLines={2}>العلاج: {t.defaultTreatment}</Text>
                  ) : null}
                </TouchableOpacity>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(t)}>
                    <Edit2 size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(t)}>
                    <Trash2 size={16} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Create / Edit Modal */}
        <Modal visible={showModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <ScrollView>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{editingTemplate ? "تعديل القالب" : "إضافة قالب جديد"}</Text>

                <Text style={styles.fieldLabel}>اسم القالب *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="مثال: مراجعة عامة، حالة طارئة..."
                  value={form.name}
                  onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                />

                <Text style={styles.fieldLabel}>نوع القالب</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                  {TEMPLATE_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.key}
                      style={[styles.typePill, form.templateType === t.key && styles.typePillActive]}
                      onPress={() => setForm((f) => ({ ...f, templateType: t.key }))}
                    >
                      <Text style={[styles.typePillText, form.templateType === t.key && styles.typePillTextActive]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {form.templateType === "vaccine" && (
                  <>
                    <Text style={styles.fieldLabel}>الفترة حتى الجرعة التالية (بالأيام)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="مثال: 365 للقاح سنوي"
                      value={form.intervalDays}
                      onChangeText={(v) => setForm((f) => ({ ...f, intervalDays: v.replace(/[^0-9]/g, "") }))}
                      keyboardType="numeric"
                    />
                  </>
                )}

                <Text style={styles.fieldLabel}>التشخيص الافتراضي</Text>
                <TextInput
                  style={[styles.input, { height: 90 }]}
                  placeholder="يملأ تلقائياً عند اختيار القالب..."
                  value={form.defaultDiagnosis}
                  onChangeText={(v) => setForm((f) => ({ ...f, defaultDiagnosis: v }))}
                  multiline
                  textAlignVertical="top"
                />

                <Text style={styles.fieldLabel}>العلاج الافتراضي</Text>
                <TextInput
                  style={[styles.input, { height: 90 }]}
                  placeholder="يملأ تلقائياً عند اختيار القالب..."
                  value={form.defaultTreatment}
                  onChangeText={(v) => setForm((f) => ({ ...f, defaultTreatment: v }))}
                  multiline
                  textAlignVertical="top"
                />

                <Text style={styles.fieldLabel}>الملاحظات الافتراضية</Text>
                <TextInput
                  style={[styles.input, { height: 70 }]}
                  placeholder="ملاحظات..."
                  value={form.defaultNotes}
                  onChangeText={(v) => setForm((f) => ({ ...f, defaultNotes: v }))}
                  multiline
                  textAlignVertical="top"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.saveBtn, isPending && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <>
                        <Save size={18} color={COLORS.white} />
                        <Text style={styles.saveBtnText}>حفظ</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                    <Text style={styles.cancelBtnText}>إلغاء</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
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
  headerTitle: { fontSize: 17, fontWeight: "bold", color: COLORS.black },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 8,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyTitle: { fontSize: 17, fontWeight: "bold", color: COLORS.black, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: COLORS.darkGray, textAlign: "center", marginTop: 6 },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
  },
  emptyAddBtnText: { color: COLORS.white, fontSize: 15, fontWeight: "bold" },
  listContent: { padding: 14, paddingBottom: 40 },
  listHint: { fontSize: 12, color: COLORS.darkGray, textAlign: "center", marginBottom: 12 },
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: "bold", color: COLORS.black, marginBottom: 4 },
  cardPreview: { fontSize: 12, color: COLORS.darkGray, lineHeight: 18 },
  cardActions: { flexDirection: "row", gap: 8, marginRight: 4 },
  editBtn: { padding: 8 },
  deleteBtn: { padding: 8 },
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
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 16,
  },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: COLORS.black, marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: COLORS.black,
    backgroundColor: "#FAFAFA",
  },
  modalButtons: { flexDirection: "row", gap: 10, marginTop: 18 },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 14,
  },
  saveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: "bold" },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 14,
  },
  cancelBtnText: { color: COLORS.black, fontSize: 15, fontWeight: "600" },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  typePillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typePillText: { fontSize: 13, color: COLORS.darkGray, fontWeight: "500" },
  typePillTextActive: { color: COLORS.white, fontWeight: "bold" },
});
