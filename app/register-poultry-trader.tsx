/**
 * register-poultry-trader.tsx
 * Registration form for becoming a poultry trader.
 */
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { trpc } from "../lib/trpc";
import { useToastContext } from "../providers/ToastProvider";

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

  const [formData, setFormData] = useState({
    businessName: "شركة النور لتجارة الدواجن",
    traderType: "wholesaler",
    governorate: "بغداد",
    region: "الشعب",
    phone: user?.phone || "07701234567",
    whatsapp: user?.phone || "07701234567",
    description: "شركة متخصصة في تجارة الدواجن بالجملة والمفرد منذ أكثر من 10 سنوات في السوق العراقية",
    licenseNumber: "TRD-2024-0456",
  });

  const [showGovPicker, setShowGovPicker] = useState(false);

  const update = (key: keyof typeof formData, value: string) => setFormData((prev) => ({ ...prev, [key]: value }));

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

    registerMutation.mutate({
      businessName: formData.businessName,
      traderType: formData.traderType,
      governorate: formData.governorate,
      region: formData.region || undefined,
      phone: formData.phone,
      whatsapp: formData.whatsapp || undefined,
      description: formData.description || undefined,
      licenseNumber: formData.licenseNumber || undefined,
    } as any);
  };

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
            <Text style={styles.label}>اسم الشركة / المنشأة التجارية *</Text>
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

          <View style={styles.section}>
            <Text style={styles.label}>رقم الرخصة التجارية</Text>
            <TextInput
              style={styles.input}
              value={formData.licenseNumber}
              onChangeText={(v) => update("licenseNumber", v)}
              placeholder="اختياري"
              textAlign="right"
            />
          </View>

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

          <TouchableOpacity
            style={[styles.submitBtn, registerMutation.isPending && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitBtnText}>إرسال طلب التسجيل</Text>}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 16, paddingBottom: 40 },
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
});
