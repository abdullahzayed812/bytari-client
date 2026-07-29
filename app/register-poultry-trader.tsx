/**
 * register-poultry-trader.tsx
 * Registration form for becoming a poultry trader.
 */
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle, Clock, AlertCircle, RefreshCw, CheckSquare, Square } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { trpc } from "../lib/trpc";
import { useToastContext } from "../providers/ToastProvider";
import TermsAndConditions from "../components/TermsAndConditions";

const IRAQ_GOVERNORATES = [
  "بغداد",
  "نينوى",
  "البصرة",
  "النجف",
  "أربيل",
  "السليمانية",
  "كربلاء",
  "ديالى",
  "واسط",
  "صلاح الدين",
  "الأنبار",
  "بابل",
  "ذي قار",
  "ميسان",
  "المثنى",
  "القادسية",
  "دهوك",
  "حلبجة",
];

const TRADER_TYPES = [
  { key: "wholesaler", label: "تاجر جملة" },
  { key: "retailer", label: "تاجر مفرد" },
  { key: "exporter", label: "مصدِّر" },
  { key: "other", label: "أخرى" },
];

const TRADER_FEATURES = ["سوق الدواجن", "سوق البيض", "بورصة الدواجن اليومية", "بورصة البيض اليومية", "إحصائيات المحافظات", "ملف التاجر"];

export default function RegisterPoultryTraderScreen() {
  const router = useRouter();
  const { user } = useApp();
  const { showToast } = useToastContext();

  const traderQuery = useQuery({
    ...trpc.poultry.traders.getMyProfile.queryOptions(),
    enabled: !!user?.id,
  });

  const renewalMutation = useMutation(
    trpc.poultry.traders.requestRenewal.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم إرسال طلب التجديد. سيتم مراجعته من قبل الإدارة." });
        traderQuery.refetch();
      },
      onError: (error: any) => {
        showToast({ type: "error", message: error.message || "حدث خطأ أثناء إرسال الطلب" });
      },
    }),
  );

  // Test/dummy data (do not use in production):
  // businessName: "شركة النور لتجارة الدواجن", governorate: "بغداد", region: "الشعب",
  // phone/whatsapp: "07701234567",
  // description: "شركة متخصصة في تجارة الدواجن بالجملة والمفرد منذ أكثر من 10 سنوات في السوق العراقية",
  const [formData, setFormData] = useState({
    businessName: "",
    traderType: "wholesaler",
    governorate: "",
    region: "",
    phone: user?.phone || "",
    whatsapp: user?.phone || "",
    description: "",
    // licenseNumber: "TRD-2024-0456",
  });

  const [showGovPicker, setShowGovPicker] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsError, setTermsError] = useState("");

  const update = (key: keyof typeof formData, value: string) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setTermsError("");
    setShowTermsModal(false);
  };

  const registerMutation = useMutation(
    trpc.poultry.traders.register.mutationOptions({
      onSuccess: () => {
        showToast({ type: "success", message: "تم إرسال طلبك وهو قيد المراجعة" });
        router.back();
      },
      onError: (error: any) => {
        showToast({ type: "error", message: error.message || "حدث خطأ أثناء التسجيل" });
      },
    }),
  );

  const handleSubmit = () => {
    if (!formData.businessName || !formData.phone || !formData.governorate) {
      showToast({ type: "error", message: "يرجى ملء جميع الحقول المطلوبة" });
      return;
    }
    if (!termsAccepted) {
      setTermsError("يجب الموافقة على الشروط والأحكام للمتابعة");
      return;
    }

    registerMutation.mutate({
      businessName: formData.businessName,
      traderType: formData.traderType,
      governorate: formData.governorate,
      region: formData.region || undefined,
      phone: formData.phone,
      whatsapp: formData.whatsapp || undefined,
      description: formData.description || undefined,
      // licenseNumber: formData.licenseNumber || undefined,
    } as any);
  };

  const existingTrader = traderQuery.data?.trader;
  const traderEndDate = existingTrader?.activationEndDate ? new Date(existingTrader.activationEndDate as any) : null;
  const traderDays = traderEndDate ? Math.ceil((traderEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: "تسجيل كتاجر دواجن",
          headerStyle: { backgroundColor: "#064E3B" },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        {/* Existing trader — show status instead of registration form */}
        {existingTrader && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {existingTrader.status === "pending" && (
              <View style={styles.statusCard}>
                <Clock size={40} color="#D97706" />
                <Text style={styles.statusTitle}>طلبك قيد المراجعة</Text>
                <Text style={styles.statusDesc}>تم إرسال طلب تسجيلك كتاجر دواجن. ستحصل على إشعار عند موافقة الإدارة.</Text>
                <View style={styles.traderInfoBox}>
                  <Text style={styles.traderInfoLabel}>اسم النشاط التجاري:</Text>
                  <Text style={styles.traderInfoValue}>{existingTrader.businessName}</Text>
                </View>
              </View>
            )}

            {existingTrader.status === "active" && traderDays >= 30 && (
              <View style={[styles.statusCard, styles.statusCardActive]}>
                <CheckCircle size={40} color="#059669" />
                <Text style={[styles.statusTitle, { color: "#065F46" }]}>حسابك التجاري نشط</Text>
                <Text style={styles.statusDesc}>لديك وصول كامل لخدمات قسم الدواجن.</Text>
                <View style={styles.traderInfoBox}>
                  <Text style={styles.traderInfoLabel}>اسم النشاط:</Text>
                  <Text style={styles.traderInfoValue}>{existingTrader.businessName}</Text>
                </View>
                {traderEndDate && (
                  <View style={styles.traderInfoBox}>
                    <Text style={styles.traderInfoLabel}>صالح حتى:</Text>
                    <Text style={styles.traderInfoValue}>{traderEndDate.toLocaleDateString("ar-SA")}</Text>
                    <Text style={[styles.traderInfoValue, { color: COLORS.success }]}> ({traderDays} يوم)</Text>
                  </View>
                )}
              </View>
            )}

            {existingTrader.status === "active" && traderDays < 30 && (
              <View style={[styles.statusCard, { borderColor: traderDays < 1 ? COLORS.error : "#D97706" }]}>
                <AlertCircle size={40} color={traderDays < 1 ? COLORS.error : "#D97706"} />
                <Text style={[styles.statusTitle, { color: traderDays < 1 ? COLORS.error : "#92400E" }]}>
                  {traderDays < 1 ? "انتهى اشتراكك" : "اشتراكك على وشك الانتهاء"}
                </Text>
                <Text style={styles.statusDesc}>
                  {traderDays < 1
                    ? "انتهت صلاحية حسابك التجاري. يرجى التجديد للوصول إلى خدمات قسم الدواجن."
                    : `تبقى ${traderDays} يوم فقط. يُنصح بالتجديد مبكراً.`}
                </Text>
                {traderEndDate && (
                  <View style={styles.traderInfoBox}>
                    <Text style={styles.traderInfoLabel}>تاريخ الانتهاء:</Text>
                    <Text style={[styles.traderInfoValue, { color: COLORS.error }]}>{traderEndDate.toLocaleDateString("ar-SA")}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.renewBtn, (renewalMutation.isPending || !!existingTrader.reviewingRenewalRequest) && { opacity: 0.6 }]}
                  onPress={() => renewalMutation.mutate({ traderId: existingTrader.id })}
                  disabled={renewalMutation.isPending || !!existingTrader.reviewingRenewalRequest}
                >
                  {renewalMutation.isPending ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <RefreshCw size={16} color={COLORS.white} />
                      <Text style={styles.renewBtnText}>{existingTrader.reviewingRenewalRequest ? "طلب التجديد قيد المراجعة" : "طلب تجديد الاشتراك"}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {(existingTrader.status === "suspended" || existingTrader.status === "cancelled") && (
              <View style={[styles.statusCard, { borderColor: COLORS.error }]}>
                <AlertCircle size={40} color={COLORS.error} />
                <Text style={[styles.statusTitle, { color: COLORS.error }]}>
                  {existingTrader.status === "suspended" ? "حسابك موقوف مؤقتاً" : "تم إلغاء حسابك"}
                </Text>
                <Text style={styles.statusDesc}>يرجى التواصل مع الإدارة للاستفسار عن سبب الإجراء.</Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* No existing trader — show registration form */}
        {!existingTrader && !traderQuery.isLoading && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* Features info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>🛒 مزايا حساب التاجر</Text>
              {TRADER_FEATURES.map((f) => (
                <View key={f} style={styles.featureRow}>
                  <CheckCircle size={14} color="#059669" />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
              <View style={styles.pendingNote}>
                <Text style={styles.pendingNoteText}>📋 يتطلب موافقة الإدارة قبل التفعيل</Text>
              </View>
            </View>

            {/* Form */}
            <View style={styles.section}>
              <Text style={styles.label}>اسم الشركة / المنشأة التجارية / الاسم الشخصي *</Text>
              <TextInput
                style={styles.input}
                value={formData.businessName}
                onChangeText={(v) => update("businessName", v)}
                placeholder="مثال: شركة النور للدواجن"
                textAlign="right"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>نوع التاجر</Text>
              <View style={styles.typeGrid}>
                {TRADER_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.typeBtn, formData.traderType === t.key && styles.typeBtnActive]}
                    onPress={() => update("traderType", t.key)}
                  >
                    <Text style={[styles.typeBtnText, formData.traderType === t.key && styles.typeBtnTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>المحافظة *</Text>
              <TouchableOpacity style={styles.picker} onPress={() => setShowGovPicker(!showGovPicker)}>
                <Text style={styles.pickerText}>{formData.governorate || "اختر المحافظة"}</Text>
              </TouchableOpacity>
              {showGovPicker && (
                <View style={styles.pickerDropdown}>
                  {IRAQ_GOVERNORATES.map((gov) => (
                    <TouchableOpacity
                      key={gov}
                      style={[styles.pickerItem, formData.governorate === gov && styles.pickerItemActive]}
                      onPress={() => {
                        update("governorate", gov);
                        setShowGovPicker(false);
                      }}
                    >
                      <Text style={styles.pickerItemText}>{gov}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>المنطقة / الحي</Text>
              <TextInput style={styles.input} value={formData.region} onChangeText={(v) => update("region", v)} placeholder="اختياري" textAlign="right" />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>رقم الهاتف *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(v) => update("phone", v)}
                placeholder="+964..."
                keyboardType="phone-pad"
                textAlign="right"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>واتساب</Text>
              <TextInput
                style={styles.input}
                value={formData.whatsapp}
                onChangeText={(v) => update("whatsapp", v)}
                placeholder="+964..."
                keyboardType="phone-pad"
                textAlign="right"
              />
            </View>

            {/* <View style={styles.section}>
            <Text style={styles.label}>رقم الرخصة التجارية</Text>
            <TextInput
              style={styles.input}
              value={formData.licenseNumber}
              onChangeText={(v) => update("licenseNumber", v)}
              placeholder="اختياري"
              textAlign="right"
            />
          </View> */}

            <View style={styles.section}>
              <Text style={styles.label}>نبذة عن النشاط التجاري</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={formData.description}
                onChangeText={(v) => update("description", v)}
                placeholder="وصف مختصر عن نشاطك التجاري..."
                multiline
                numberOfLines={4}
                textAlign="right"
                textAlignVertical="top"
              />
            </View>

            {/* Terms & Conditions */}
            <TouchableOpacity
              style={[styles.termsContainer, !!termsError && styles.termsContainerError]}
              onPress={() => setShowTermsModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.termsCheckboxContainer}>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    if (termsAccepted) {
                      setTermsAccepted(false);
                      setTermsError("");
                    } else {
                      setTermsAccepted(true);
                      setTermsError("");
                    }
                  }}
                  style={styles.checkbox}
                >
                  {termsAccepted ? <CheckSquare size={24} color={COLORS.primary} /> : <Square size={24} color={COLORS.darkGray} />}
                </TouchableOpacity>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>
                    أوافق على <Text style={styles.termsLink}>شروط وأحكام قسم الدواجن</Text>
                  </Text>
                  <Text style={styles.termsHint}>(اضغط للقراءة والموافقة)</Text>
                </View>
              </View>
            </TouchableOpacity>
            {!!termsError && <Text style={styles.termsErrorText}>{termsError}</Text>}

            <TouchableOpacity
              style={[styles.submitBtn, registerMutation.isPending && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitBtnText}>إرسال طلب التسجيل</Text>}
            </TouchableOpacity>
            <View style={styles.freeTrialBadge}>
              <Text style={styles.freeTrialText}>⭐ فترة مجانية</Text>
            </View>
          </ScrollView>
        )}

        {/* Loading state */}
        {traderQuery.isLoading && <ActivityIndicator style={{ flex: 1, marginTop: 60 }} color={COLORS.primary} size="large" />}

        <TermsAndConditions visible={showTermsModal} onClose={() => setShowTermsModal(false)} onAccept={handleAcceptTerms} accountType="poultry" />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 16, paddingBottom: 40 },
  statusCard: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FCD34D",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  statusCardActive: { borderColor: "#BBF7D0" },
  statusTitle: { fontSize: 18, fontWeight: "700", color: "#92400E", textAlign: "center" },
  statusDesc: { fontSize: 14, color: COLORS.darkGray, textAlign: "center", lineHeight: 20 },
  traderInfoBox: { flexDirection: "row", gap: 6, alignItems: "center" },
  traderInfoLabel: { fontSize: 13, color: COLORS.darkGray },
  traderInfoValue: { fontSize: 13, fontWeight: "600", color: COLORS.black },
  renewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#D97706",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  renewBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
  infoCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  infoTitle: { fontSize: 15, fontWeight: "700", color: "#065F46", marginBottom: 10 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  featureText: { fontSize: 13, color: COLORS.black },
  pendingNote: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  pendingNoteText: { fontSize: 12, color: "#92400E" },
  section: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.black, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.black,
  },
  textarea: { height: 90, paddingTop: 10 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "flex-end" },
  typeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: COLORS.white,
  },
  typeBtnActive: { backgroundColor: "#064E3B", borderColor: "#064E3B" },
  typeBtnText: { fontSize: 13, color: COLORS.darkGray },
  typeBtnTextActive: { color: COLORS.white, fontWeight: "600" },
  picker: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerText: { fontSize: 14, color: COLORS.black },
  pickerDropdown: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginTop: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 10,
  },
  pickerItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pickerItemActive: { backgroundColor: "#064E3B", borderColor: "#064E3B" },
  pickerItemText: { fontSize: 12, color: COLORS.black },
  submitBtn: {
    backgroundColor: "#D97706",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  freeTrialBadge: {
    marginTop: 10,
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6EE7B7",
  },
  freeTrialText: { fontSize: 13, fontWeight: "700", color: "#065F46" },
  termsContainer: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  termsContainerError: {
    borderColor: "#f44336",
    backgroundColor: "#ffebee",
  },
  termsCheckboxContainer: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 10,
  },
  checkbox: {},
  termsTextContainer: { flex: 1 },
  termsText: {
    fontSize: 14,
    color: COLORS.black,
    textAlign: "right",
    lineHeight: 21,
  },
  termsLink: {
    color: "#064E3B",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  termsHint: {
    fontSize: 11,
    color: COLORS.darkGray,
    textAlign: "right",
    marginTop: 3,
    fontStyle: "italic",
  },
  termsErrorText: {
    fontSize: 12,
    color: "#f44336",
    textAlign: "right",
    marginBottom: 8,
  },
});
