import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, FlatList, Image, Platform } from "react-native";
import React, { useState, useMemo } from "react";
import { COLORS } from "../constants/colors";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Search, ChevronDown, ChevronRight, Syringe, Stethoscope, Pill, Heart, Calendar, Check } from "lucide-react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useToastContext } from "@/providers/ToastProvider";
import DateTimePicker from "@react-native-community/datetimepicker";

type Pet = {
  id: string;
  name: string;
  type: string;
  breed?: string | null;
  image?: string | null;
  ownerName: string;
  ownerPhone?: string | null;
};

type Template = {
  id: number;
  name: string;
  templateType: string;
  defaultDiagnosis?: string | null;
  defaultTreatment?: string | null;
  defaultNotes?: string | null;
  intervalDays?: number | null;
};

const CATEGORIES = [
  { key: "vaccine", label: "لقاح", Icon: Syringe, color: "#4CAF50", bg: "#E8F5E9" },
  { key: "treatment", label: "علاج", Icon: Pill, color: "#FF9800", bg: "#FFF3E0" },
  { key: "diagnosis", label: "تشخيص", Icon: Stethoscope, color: "#2196F3", bg: "#E3F2FD" },
  { key: "general", label: "فحص عام", Icon: Heart, color: "#9C27B0", bg: "#F3E5F5" },
] as const;

type Step = "pet" | "select" | "detail";

export default function ClinicQuickReview() {
  const router = useRouter();
  const { clinicId, petId: paramPetId } = useLocalSearchParams<{ clinicId: string; petId?: string }>();
  const { showToast } = useToastContext();

  const [step, setStep] = useState<Step>(paramPetId ? "select" : "pet");
  const [petSearch, setPetSearch] = useState("");
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Detail step fields
  const [actionDate, setActionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dose, setDose] = useState("");
  const [nextDueDate, setNextDueDate] = useState<Date | null>(null);
  const [showNextDuePicker, setShowNextDuePicker] = useState(false);
  const [notes, setNotes] = useState("");

  const { data: petsData, isLoading: petsLoading } = useQuery(trpc.clinics.quickReview.getAccessedPets.queryOptions({ clinicId: Number(clinicId) }));
  const { data: templatesData } = useQuery(trpc.clinics.quickReview.getTemplates.queryOptions({ clinicId: Number(clinicId) }));

  const createMutation = useMutation(trpc.clinics.quickReview.createQuickReview.mutationOptions());

  const pets: Pet[] = (petsData as any)?.pets ?? [];
  const allTemplates: Template[] = (templatesData as any)?.templates ?? [];

  const filteredTemplates = useMemo(() => {
    if (!activeCategory) return allTemplates;
    return allTemplates.filter((t) => t.templateType === activeCategory);
  }, [allTemplates, activeCategory]);

  const displayedTemplates = showAll ? filteredTemplates : filteredTemplates.slice(0, 4);

  const filteredPets = pets.filter((p) => {
    const q = petSearch.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q) || p.ownerName.toLowerCase().includes(q);
  });

  const resolvedPetId = paramPetId ?? selectedPet?.id ?? "";

  const openTemplate = (t: Template) => {
    setSelectedTemplate(t);
    setNotes(t.defaultNotes ?? "");
    if (t.intervalDays) {
      const due = new Date(actionDate);
      due.setDate(due.getDate() + t.intervalDays);
      setNextDueDate(due);
      setDose(t.intervalDays >= 365 ? "سنوي" : t.intervalDays >= 180 ? "كل 6 أشهر" : `كل ${t.intervalDays} يوم`);
    } else {
      setNextDueDate(null);
      setDose("");
    }
    setStep("detail");
  };

  const handleSave = async () => {
    if (!resolvedPetId) return;
    const diagnosis = selectedTemplate?.defaultDiagnosis ?? notes.trim();
    const treatment = (selectedTemplate?.defaultTreatment ?? notes.trim()) || "—";
    if (!diagnosis) {
      showToast({ message: "يجب إدخال ملاحظات أو اختيار قالب", type: "error" });
      return;
    }
    try {
      await createMutation.mutateAsync({
        clinicId: Number(clinicId),
        petId: resolvedPetId,
        templateId: selectedTemplate?.id,
        diagnosis,
        treatment,
        notes: notes.trim() || undefined,
        date: actionDate.toISOString(),
      });
      showToast({ message: "تم حفظ الإجراء السريع بنجاح", type: "success" });
      router.back();
    } catch {
      showToast({ message: "حدث خطأ أثناء الحفظ", type: "error" });
    }
  };

  const goBack = () => {
    if (step === "detail") {
      setStep("select");
      return;
    }
    if (step === "select" && !paramPetId) {
      setStep("pet");
      return;
    }
    router.back();
  };

  const getCategoryIcon = (type: string, size = 18, color?: string) => {
    const cat = CATEGORIES.find((c) => c.key === type);
    if (!cat) return null;
    const IconComp = cat.Icon;
    return <IconComp size={size} color={color ?? cat.color} />;
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.headerBtn}>
            <ArrowLeft size={22} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{step === "pet" ? "اختر الحيوان" : step === "detail" ? "تفاصيل الإجراء السريع" : "مراجعة سريعة"}</Text>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <ChevronRight size={22} color={COLORS.darkGray} />
          </TouchableOpacity>
        </View>

        {/* ── STEP: Pet selection ─────────────────────────────────── */}
        {step === "pet" && (
          <>
            <View style={styles.searchBar}>
              <Search size={17} color={COLORS.darkGray} />
              <TextInput
                style={styles.searchInput}
                placeholder="ابحث عن حيوان بالاسم أو المالك..."
                placeholderTextColor={COLORS.darkGray}
                value={petSearch}
                onChangeText={setPetSearch}
              />
            </View>
            {petsLoading ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : (
              <FlatList
                data={filteredPets}
                keyExtractor={(p) => p.id}
                contentContainerStyle={styles.listPad}
                renderItem={({ item: p }) => (
                  <TouchableOpacity
                    style={styles.petCard}
                    onPress={() => {
                      setSelectedPet(p);
                      setStep("select");
                    }}
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
                      <Text style={styles.petMeta}>
                        {p.type}
                        {p.breed ? ` · ${p.breed}` : ""}
                      </Text>
                      <Text style={styles.petOwner}>{p.ownerName}</Text>
                    </View>
                    <ChevronRight size={18} color={COLORS.darkGray} />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.center}>
                    <Text style={styles.emptyText}>لا توجد حيوانات مسجلة في العيادة</Text>
                  </View>
                }
              />
            )}
          </>
        )}

        {/* ── STEP: Category selection + Template list ────────────── */}
        {step === "select" && (
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Pet context pill (if selected) */}
            {(selectedPet || paramPetId) && (
              <View style={styles.petContextPill}>
                <Text style={styles.petContextText}>{selectedPet ? `${selectedPet.name} · ${selectedPet.ownerName}` : `الحيوان: ${paramPetId}`}</Text>
              </View>
            )}

            {/* إجراءات سريعة */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
              <View style={styles.categoriesRow}>
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      style={[styles.categoryCard, { backgroundColor: isActive ? cat.color : cat.bg }]}
                      onPress={() => setActiveCategory(isActive ? null : cat.key)}
                      activeOpacity={0.8}
                    >
                      <cat.Icon size={26} color={isActive ? "#fff" : cat.color} />
                      <Text style={[styles.categoryLabel, { color: isActive ? "#fff" : cat.color }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* الأكثر استخداماً */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>الأكثر استخداماً</Text>
              {filteredTemplates.length === 0 ? (
                <View style={styles.emptyTemplates}>
                  <Text style={styles.emptyText}>لا توجد قوالب{activeCategory ? " لهذا النوع" : ""}</Text>
                </View>
              ) : (
                <>
                  {displayedTemplates.map((t) => {
                    const cat = CATEGORIES.find((c) => c.key === t.templateType);
                    return (
                      <TouchableOpacity key={t.id} style={styles.templateRow} onPress={() => openTemplate(t)} activeOpacity={0.75}>
                        <View style={[styles.templateIconBox, { backgroundColor: cat?.bg ?? "#F5F5F5" }]}>{getCategoryIcon(t.templateType, 18)}</View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.templateName}>{t.name}</Text>
                          {t.defaultDiagnosis ? (
                            <Text style={styles.templateSub} numberOfLines={1}>
                              {t.defaultDiagnosis}
                            </Text>
                          ) : null}
                          {t.intervalDays ? (
                            <Text style={[styles.templateSub, { color: COLORS.success }]}>
                              الجرعة {t.intervalDays >= 365 ? "سنوية" : `كل ${t.intervalDays} يوم`}
                            </Text>
                          ) : null}
                        </View>
                        <ChevronRight size={16} color={COLORS.darkGray} />
                      </TouchableOpacity>
                    );
                  })}

                  {filteredTemplates.length > 4 && (
                    <TouchableOpacity style={styles.showMoreRow} onPress={() => setShowAll(!showAll)}>
                      <Text style={styles.showMoreText}>{showAll ? "عرض أقل" : "عرض المزيد"}</Text>
                      <ChevronDown size={16} color={COLORS.primary} style={{ transform: [{ rotate: showAll ? "180deg" : "0deg" }] }} />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        )}

        {/* ── STEP: Template detail ───────────────────────────────── */}
        {step === "detail" && (
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Template title pill — only when a template was selected */}
            {selectedTemplate ? (
              <View style={styles.templateTitleBox}>
                <View style={styles.templateTitleLeft}>
                  {getCategoryIcon(selectedTemplate.templateType, 20)}
                  <Text style={styles.templateTitleText}>{selectedTemplate.name}</Text>
                </View>
                <Text style={styles.templateTypeSub}>{CATEGORIES.find((c) => c.key === selectedTemplate.templateType)?.label ?? ""}</Text>
              </View>
            ) : null}

            {/* تاريخ الإجراء */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>تاريخ الإجراء</Text>
              <TouchableOpacity style={styles.fieldRow} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.fieldValue}>{actionDate.toLocaleDateString("ar-SA")}</Text>
                <Calendar size={18} color={COLORS.darkGray} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={actionDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(_, d) => {
                    setShowDatePicker(false);
                    if (d) {
                      setActionDate(d);
                      if (selectedTemplate.intervalDays) {
                        const due = new Date(d);
                        due.setDate(due.getDate() + selectedTemplate.intervalDays);
                        setNextDueDate(due);
                      }
                    }
                  }}
                />
              )}
            </View>

            {/* الجرعة (vaccine only) */}
            {selectedTemplate?.templateType === "vaccine" && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>الجرعة</Text>
                <View style={[styles.fieldRow, { justifyContent: "space-between" }]}>
                  <Text style={[styles.fieldValue, !dose && { color: COLORS.darkGray }]}>{dose || "—"}</Text>
                  <ChevronDown size={18} color={COLORS.darkGray} />
                </View>
              </View>
            )}

            {/* الجرعة القادمة */}
            {selectedTemplate?.templateType === "vaccine" && nextDueDate && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>الجرعة القادمة</Text>
                <TouchableOpacity style={styles.fieldRow} onPress={() => setShowNextDuePicker(true)}>
                  <Text style={[styles.fieldValue, { color: COLORS.success }]}>{nextDueDate.toLocaleDateString("ar-SA")}</Text>
                  <Calendar size={18} color={COLORS.success} />
                </TouchableOpacity>
                {showNextDuePicker && (
                  <DateTimePicker
                    value={nextDueDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(_, d) => {
                      setShowNextDuePicker(false);
                      if (d) setNextDueDate(d);
                    }}
                    minimumDate={new Date()}
                  />
                )}
              </View>
            )}

            {/* For manual entry: notes act as diagnosis */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{selectedTemplate ? "ملاحظات (اختياري)" : "التشخيص / الملاحظات *"}</Text>
              <TextInput
                style={styles.notesInput}
                placeholder={selectedTemplate ? "اكتب ملاحظات..." : "اكتب التشخيص أو الملاحظات..."}
                placeholderTextColor={COLORS.darkGray}
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        )}

        {/* ── Bottom CTA ─────────────────────────────────────────── */}
        {step === "select" && (
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => {
                if (!resolvedPetId) {
                  showToast({ message: "يرجى اختيار الحيوان أولاً", type: "error" });
                  return;
                }
                // Manual entry without template
                setSelectedTemplate(null);
                setStep("detail");
              }}
              activeOpacity={0.85}
            >
              <Check size={20} color={COLORS.white} />
              <Text style={styles.ctaBtnText}>سجل إجراء سريع جديد</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "detail" && (
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={[styles.ctaBtn, createMutation.isPending && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={createMutation.isPending}
              activeOpacity={0.85}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Check size={20} color={COLORS.white} />
                  <Text style={styles.ctaBtnText}>حفظ السجل</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
  headerBtn: { padding: 6 },
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
  petOwner: { fontSize: 12, color: COLORS.primary, marginTop: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyText: { fontSize: 14, color: COLORS.darkGray, textAlign: "center" },
  scrollArea: { flex: 1 },
  petContextPill: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  petContextText: { color: COLORS.white, fontSize: 14, fontWeight: "600" },
  sectionBox: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    margin: 14,
    marginBottom: 0,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: "bold", color: COLORS.black, marginBottom: 14 },
  categoriesRow: { flexDirection: "row", gap: 10 },
  categoryCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  categoryLabel: { fontSize: 12, fontWeight: "bold" },
  templateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    gap: 12,
  },
  templateIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  templateName: { fontSize: 14, fontWeight: "600", color: COLORS.black },
  templateSub: { fontSize: 12, color: COLORS.darkGray, marginTop: 2 },
  showMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 14,
    gap: 4,
  },
  showMoreText: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  emptyTemplates: { paddingVertical: 24, alignItems: "center" },
  // Detail step
  templateTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    margin: 14,
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  templateTitleLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  templateTitleText: { fontSize: 16, fontWeight: "bold", color: COLORS.black },
  templateTypeSub: { fontSize: 12, color: COLORS.darkGray },
  fieldGroup: {
    backgroundColor: COLORS.white,
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  fieldLabel: { fontSize: 12, color: COLORS.darkGray, marginBottom: 8, fontWeight: "500" },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
    paddingBottom: 8,
  },
  fieldValue: { fontSize: 15, color: COLORS.black },
  notesInput: {
    fontSize: 14,
    color: COLORS.black,
    minHeight: 90,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    borderRadius: 8,
    padding: 10,
  },
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  ctaBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "bold" },
});
