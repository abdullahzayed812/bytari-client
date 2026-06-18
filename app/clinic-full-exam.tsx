import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Search,
  Stethoscope,
  FlaskConical,
  Folder,
  Pill,
  FileText,
  Check,
  Plus,
  Calendar,
  ChevronRight,
  Trash2,
} from "lucide-react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useToastContext } from "@/providers/ToastProvider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ImageUploader } from "@/components/ImageUploader";

type Pet = {
  id: string;
  name: string;
  type: string;
  breed?: string | null;
  image?: string | null;
  ownerName: string;
};

type Medication = { id: number; name: string; dosage: string; duration: string };

const TABS = [
  { key: "diagnosis", label: "التشخيص", Icon: Stethoscope },
  { key: "treatment", label: "العلاج", Icon: Pill },
  { key: "lab", label: "التحاليل", Icon: FlaskConical },
  { key: "files", label: "الملفات", Icon: Folder },
  { key: "notes", label: "الملاحظات", Icon: FileText },
] as const;

const SEVERITY_OPTIONS = [
  { label: "شديدة", color: COLORS.error, bg: "#FFEBEE" },
  { label: "متوسطة", color: COLORS.warning, bg: "#FFF8E1" },
  { label: "خفيفة", color: COLORS.success, bg: "#E8F5E9" },
] as const;

export default function ClinicFullExam() {
  const router = useRouter();
  const { clinicId, petId: paramPetId } = useLocalSearchParams<{ clinicId: string; petId?: string }>();
  const { showToast } = useToastContext();

  const [step, setStep] = useState<"pet" | "form">(paramPetId ? "form" : "pet");
  const [petSearch, setPetSearch] = useState("");
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [activeTab, setActiveTab] = useState<string>("diagnosis");

  // Diagnosis
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [diagNotes, setDiagNotes] = useState("");
  const [severity, setSeverity] = useState("");

  // Treatment
  const [treatment, setTreatment] = useState("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedDuration, setNewMedDuration] = useState("");
  const [showAddMed, setShowAddMed] = useState(false);
  const [treatmentDuration, setTreatmentDuration] = useState("");
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [durationDate, setDurationDate] = useState<Date | null>(null);
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  // Lab
  const [labNotes, setLabNotes] = useState("");

  // Files
  const [prescriptionImage, setPrescriptionImage] = useState("");
  const [fileUrls, setFileUrls] = useState<string[]>([]);

  // Notes
  const [generalNotes, setGeneralNotes] = useState("");

  const { data: petsData, isLoading: petsLoading } = useQuery(
    trpc.clinics.quickReview.getAccessedPets.queryOptions({ clinicId: Number(clinicId) }),
  );
  const createMutation = useMutation(trpc.clinics.quickReview.createFullExam.mutationOptions());

  const pets: Pet[] = (petsData as any)?.pets ?? [];
  const filteredPets = pets.filter((p) => {
    const q = petSearch.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.ownerName.toLowerCase().includes(q);
  });

  const resolvedPetId = paramPetId ?? selectedPet?.id ?? "";

  const addMedication = () => {
    if (!newMedName.trim()) return;
    setMedications((prev) => [
      ...prev,
      { id: Date.now(), name: newMedName.trim(), dosage: newMedDosage.trim(), duration: newMedDuration.trim() },
    ]);
    setNewMedName("");
    setNewMedDosage("");
    setNewMedDuration("");
    setShowAddMed(false);
  };

  const handleSave = async (isDraft: boolean) => {
    if (!resolvedPetId) return;
    if (!diagnosis.trim()) {
      showToast({ message: "يجب إدخال التشخيص", type: "error" });
      setActiveTab("diagnosis");
      return;
    }
    if (!isDraft && !treatment.trim() && medications.length === 0) {
      showToast({ message: "يجب إدخال خطة العلاج", type: "error" });
      setActiveTab("treatment");
      return;
    }
    const treatmentText = [
      treatment.trim(),
      medications.map((m) => `${m.name}${m.dosage ? ` - ${m.dosage}` : ""}${m.duration ? ` - ${m.duration}` : ""}`).join("\n"),
      additionalInstructions.trim(),
    ]
      .filter(Boolean)
      .join("\n") || "—";

    try {
      await createMutation.mutateAsync({
        clinicId: Number(clinicId),
        petId: resolvedPetId,
        diagnosis: diagnosis.trim(),
        symptoms: symptoms.trim() || undefined,
        severity: (severity as any) || undefined,
        treatment: treatmentText,
        notes: [diagNotes.trim(), generalNotes.trim()].filter(Boolean).join("\n") || undefined,
        labNotes: labNotes.trim() || undefined,
        fileUrls: fileUrls.length > 0 ? fileUrls : undefined,
        prescriptionImage: prescriptionImage || undefined,
        isDraft,
      });
      showToast({ message: isDraft ? "تم الحفظ كمسودة" : "تم حفظ الفحص الكامل بنجاح", type: "success" });
      router.back();
    } catch {
      showToast({ message: "حدث خطأ أثناء الحفظ", type: "error" });
    }
  };

  const tabLabel = TABS.find((t) => t.key === activeTab)?.label ?? "";

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { if (step === "pet") router.back(); else if (step === "form" && !paramPetId) setStep("pet"); else router.back(); }} style={styles.headerBtn}>
            <ArrowLeft size={22} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === "pet" ? "اختر الحيوان" : activeTab === "treatment" ? "فحص كامل - العلاج" : "فحص كامل"}
          </Text>
          <View style={styles.headerBtn} />
        </View>

        {/* ── Pet selection ─────────────────────────────────────── */}
        {step === "pet" && (
          <>
            <View style={styles.searchBar}>
              <Search size={17} color={COLORS.darkGray} />
              <TextInput
                style={styles.searchInput}
                placeholder="ابحث عن الحيوان..."
                placeholderTextColor={COLORS.darkGray}
                value={petSearch}
                onChangeText={setPetSearch}
              />
            </View>
            {petsLoading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.success} />
              </View>
            ) : (
              <FlatList
                data={filteredPets}
                keyExtractor={(p) => p.id}
                contentContainerStyle={styles.listPad}
                renderItem={({ item: p }) => (
                  <TouchableOpacity
                    style={styles.petCard}
                    onPress={() => { setSelectedPet(p); setStep("form"); }}
                    activeOpacity={0.8}
                  >
                    {p.image ? (
                      <Image source={{ uri: p.image }} style={styles.petImg} />
                    ) : (
                      <View style={[styles.petImg, { backgroundColor: "#EEF2F7", justifyContent: "center", alignItems: "center" }]}>
                        <Text style={{ fontSize: 22 }}>🐾</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.petName}>{p.name}</Text>
                      <Text style={styles.petMeta}>{p.type}{p.breed ? ` · ${p.breed}` : ""}</Text>
                      <Text style={styles.petOwner}>{p.ownerName}</Text>
                    </View>
                    <ChevronRight size={18} color={COLORS.darkGray} />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.center}>
                    <Text style={styles.emptyText}>لا توجد حيوانات مسجلة</Text>
                  </View>
                }
              />
            )}
          </>
        )}

        {/* ── Exam form ─────────────────────────────────────────── */}
        {step === "form" && (
          <>
            {/* Pet context */}
            {(selectedPet || paramPetId) && (
              <View style={styles.petBanner}>
                <Text style={styles.petBannerText}>
                  {selectedPet ? `${selectedPet.name} · ${selectedPet.ownerName}` : `الحيوان: ${paramPetId}`}
                </Text>
              </View>
            )}

            {/* Tab bar with icons */}
            <View style={styles.tabBarWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
                {TABS.map(({ key, label, Icon }) => {
                  const isActive = activeTab === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.tab, isActive && styles.tabActive]}
                      onPress={() => setActiveTab(key)}
                    >
                      <Icon size={18} color={isActive ? COLORS.success : COLORS.darkGray} />
                      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* ── التشخيص ─────────────────────────────────────── */}
              {activeTab === "diagnosis" && (
                <View style={styles.tabContent}>
                  <Text style={styles.fieldLabel}>التشخيص</Text>
                  <TextInput
                    style={styles.inputBox}
                    placeholder="اكتب التشخيص..."
                    placeholderTextColor={COLORS.darkGray}
                    value={diagnosis}
                    onChangeText={setDiagnosis}
                    multiline
                    textAlignVertical="top"
                  />

                  <Text style={styles.fieldLabel}>الأعراض</Text>
                  <TextInput
                    style={styles.inputBox}
                    placeholder="اكتب الأعراض..."
                    placeholderTextColor={COLORS.darkGray}
                    value={symptoms}
                    onChangeText={setSymptoms}
                    multiline
                    textAlignVertical="top"
                  />

                  <Text style={styles.fieldLabel}>الملاحظات</Text>
                  <TextInput
                    style={styles.inputBox}
                    placeholder="اكتب ملاحظات إضافية"
                    placeholderTextColor={COLORS.darkGray}
                    value={diagNotes}
                    onChangeText={setDiagNotes}
                    multiline
                    textAlignVertical="top"
                  />

                  <Text style={styles.fieldLabel}>درجة الحالة</Text>
                  <View style={styles.severityRow}>
                    {SEVERITY_OPTIONS.map((s) => {
                      const isActive = severity === s.label;
                      return (
                        <TouchableOpacity
                          key={s.label}
                          style={[
                            styles.severityPill,
                            { borderColor: s.color },
                            isActive && { backgroundColor: s.color },
                          ]}
                          onPress={() => setSeverity(isActive ? "" : s.label)}
                        >
                          <Text style={[styles.severityText, { color: isActive ? COLORS.white : s.color }]}>
                            {s.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Diagnosis CTAs */}
                  <View style={styles.diagCtas}>
                    <TouchableOpacity
                      style={styles.draftBtn}
                      onPress={() => handleSave(true)}
                      disabled={createMutation.isPending}
                    >
                      <Text style={styles.draftBtnText}>حفظ كمسودة</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.nextBtn}
                      onPress={() => setActiveTab("treatment")}
                    >
                      <Check size={17} color={COLORS.white} />
                      <Text style={styles.nextBtnText}>حفظ وإضافة علاج</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ── العلاج ──────────────────────────────────────── */}
              {activeTab === "treatment" && (
                <View style={styles.tabContent}>
                  <Text style={styles.fieldLabel}>خطة العلاج</Text>
                  <TextInput
                    style={styles.inputBox}
                    placeholder="اكتب خطة العلاج..."
                    placeholderTextColor={COLORS.darkGray}
                    value={treatment}
                    onChangeText={setTreatment}
                    multiline
                    textAlignVertical="top"
                  />

                  {/* Medications */}
                  <View style={styles.medsSection}>
                    <Text style={styles.fieldLabel}>الأدوية</Text>
                    {medications.map((m) => (
                      <View key={m.id} style={styles.medItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.medName}>{m.name}</Text>
                          {m.dosage ? <Text style={styles.medSub}>{m.dosage}</Text> : null}
                          {m.duration ? <Text style={styles.medSub}>{m.duration}</Text> : null}
                        </View>
                        <TouchableOpacity onPress={() => setMedications((prev) => prev.filter((x) => x.id !== m.id))}>
                          <Trash2 size={16} color={COLORS.error} />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {showAddMed ? (
                      <View style={styles.addMedForm}>
                        <TextInput style={styles.addMedInput} placeholder="اسم الدواء *" value={newMedName} onChangeText={setNewMedName} />
                        <TextInput style={styles.addMedInput} placeholder="الجرعة" value={newMedDosage} onChangeText={setNewMedDosage} />
                        <TextInput style={styles.addMedInput} placeholder="المدة" value={newMedDuration} onChangeText={setNewMedDuration} />
                        <View style={styles.addMedActions}>
                          <TouchableOpacity style={styles.addMedCancelBtn} onPress={() => setShowAddMed(false)}>
                            <Text style={styles.addMedCancelText}>إلغاء</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.addMedSaveBtn} onPress={addMedication}>
                            <Text style={styles.addMedSaveText}>إضافة</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.addMedBtn} onPress={() => setShowAddMed(true)}>
                        <Plus size={16} color={COLORS.primary} />
                        <Text style={styles.addMedBtnText}>إضافة دواء</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Duration */}
                  <Text style={styles.fieldLabel}>المدة</Text>
                  <TouchableOpacity style={styles.dateFieldRow} onPress={() => setShowDurationPicker(true)}>
                    <Text style={[styles.dateFieldText, !durationDate && { color: COLORS.darkGray }]}>
                      {durationDate ? durationDate.toLocaleDateString("ar-SA") : "حدد مدة العلاج"}
                    </Text>
                    <Calendar size={18} color={COLORS.darkGray} />
                  </TouchableOpacity>
                  {showDurationPicker && (
                    <DateTimePicker
                      value={durationDate ?? new Date()}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(_, d) => { setShowDurationPicker(false); if (d) setDurationDate(d); }}
                      minimumDate={new Date()}
                    />
                  )}

                  {/* Additional instructions */}
                  <Text style={styles.fieldLabel}>تعليمات إضافية</Text>
                  <TextInput
                    style={styles.inputBox}
                    placeholder="اكتب تعليمات إضافية..."
                    placeholderTextColor={COLORS.darkGray}
                    value={additionalInstructions}
                    onChangeText={setAdditionalInstructions}
                    multiline
                    textAlignVertical="top"
                  />

                  {/* Final CTA */}
                  <TouchableOpacity
                    style={[styles.saveFinalBtn, createMutation.isPending && { opacity: 0.6 }]}
                    onPress={() => handleSave(false)}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <>
                        <Check size={19} color={COLORS.white} />
                        <Text style={styles.saveFinalBtnText}>حفظ وإضافة الملف الطبي</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* ── التحاليل ─────────────────────────────────────── */}
              {activeTab === "lab" && (
                <View style={styles.tabContent}>
                  <Text style={styles.fieldLabel}>نتائج التحاليل والفحوصات</Text>
                  <TextInput
                    style={[styles.inputBox, { minHeight: 180 }]}
                    placeholder="أدخل نتائج التحاليل..."
                    placeholderTextColor={COLORS.darkGray}
                    value={labNotes}
                    onChangeText={setLabNotes}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              )}

              {/* ── الملفات ──────────────────────────────────────── */}
              {activeTab === "files" && (
                <View style={styles.tabContent}>
                  <Text style={styles.fieldLabel}>صورة الوصفة</Text>
                  <ImageUploader
                    imageUri={prescriptionImage}
                    onUploadComplete={setPrescriptionImage}
                    label="إضافة صورة الوصفة (اختياري)"
                    aspect={[4, 3]}
                  />
                  <Text style={[styles.fieldLabel, { marginTop: 16 }]}>ملفات إضافية</Text>
                  <ImageUploader
                    imageUri={fileUrls[0] ?? ""}
                    onUploadComplete={(url) => setFileUrls((prev) => [...prev.filter(Boolean), url])}
                    label="إضافة ملف أو صورة"
                    aspect={[4, 3]}
                  />
                  {fileUrls.length > 0 && (
                    <Text style={{ fontSize: 12, color: COLORS.success, marginTop: 6 }}>{fileUrls.length} ملف مرفق</Text>
                  )}
                </View>
              )}

              {/* ── الملاحظات ────────────────────────────────────── */}
              {activeTab === "notes" && (
                <View style={styles.tabContent}>
                  <Text style={styles.fieldLabel}>ملاحظات عامة</Text>
                  <TextInput
                    style={[styles.inputBox, { minHeight: 160 }]}
                    placeholder="أي ملاحظات إضافية..."
                    placeholderTextColor={COLORS.darkGray}
                    value={generalNotes}
                    onChangeText={setGeneralNotes}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              )}

              <View style={{ height: 80 }} />
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FA" },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
  },
  headerBtn: { padding: 6, minWidth: 34 },
  headerTitle: { fontSize: 17, fontWeight: "bold", color: COLORS.black },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    margin: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.black },
  listPad: { padding: 14, paddingBottom: 40 },
  petCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  petImg: { width: 48, height: 48, borderRadius: 24 },
  petName: { fontSize: 15, fontWeight: "bold", color: COLORS.black },
  petMeta: { fontSize: 12, color: COLORS.darkGray, marginTop: 1 },
  petOwner: { fontSize: 12, color: COLORS.success, marginTop: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyText: { fontSize: 14, color: COLORS.darkGray },
  petBanner: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  petBannerText: { color: COLORS.white, fontSize: 14, fontWeight: "600" },
  tabBarWrap: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
  },
  tabBar: { flexDirection: "row", paddingHorizontal: 4 },
  tab: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: COLORS.success },
  tabText: { fontSize: 11, color: COLORS.darkGray, fontWeight: "500" },
  tabTextActive: { color: COLORS.success, fontWeight: "bold" },
  scrollArea: { flex: 1 },
  tabContent: { padding: 16 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginTop: 12,
    marginBottom: 6,
  },
  inputBox: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    padding: 12,
    fontSize: 14,
    color: COLORS.black,
    minHeight: 80,
    marginBottom: 4,
  },
  severityRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  severityPill: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
  },
  severityText: { fontSize: 14, fontWeight: "bold" },
  diagCtas: { flexDirection: "row", gap: 10, marginTop: 20 },
  draftBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#BDBDBD",
    alignItems: "center",
    justifyContent: "center",
  },
  draftBtnText: { fontSize: 14, color: COLORS.darkGray, fontWeight: "600" },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  nextBtnText: { fontSize: 14, color: COLORS.white, fontWeight: "bold" },
  // Treatment
  medsSection: { marginTop: 4 },
  medItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EBEBEB",
  },
  medName: { fontSize: 14, fontWeight: "600", color: COLORS.black },
  medSub: { fontSize: 12, color: COLORS.darkGray, marginTop: 2 },
  addMedBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  addMedBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: "600" },
  addMedForm: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 8,
  },
  addMedInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: COLORS.black,
  },
  addMedActions: { flexDirection: "row", gap: 8 },
  addMedCancelBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "#CCC", alignItems: "center" },
  addMedCancelText: { color: COLORS.darkGray, fontWeight: "600" },
  addMedSaveBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: "center" },
  addMedSaveText: { color: COLORS.white, fontWeight: "bold" },
  dateFieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    padding: 13,
    marginBottom: 4,
  },
  dateFieldText: { fontSize: 14, color: COLORS.black },
  saveFinalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  saveFinalBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },
});
