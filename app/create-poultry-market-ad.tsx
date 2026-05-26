/**
 * create-poultry-market-ad.tsx
 * Form to create a poultry market ad. Inspired by UI reference image 4.
 */
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { usePoultryMarket } from "../hooks/usePoultryMarket";
import { ImageGalleryUploader } from "../components/ImageGalleryUploader";

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

const POULTRY_TYPES = [
  { key: "broiler", label: "دجاج لحم 🐔" },
  { key: "layer", label: "دجاج بياض 🥚" },
  { key: "local", label: "دجاج بلدي 🐓" },
  { key: "turkey", label: "ديك رومي 🦃" },
  { key: "rooster", label: "ديوك 🐓" },
  { key: "other", label: "أخرى 🐦" },
];

export default function CreatePoultryMarketAdScreen() {
  const router = useRouter();
  const { user } = useApp();
  const { createAd, isCreating } = usePoultryMarket();

  const [formData, setFormData] = useState({
    poultryType: "broiler",
    breed: "روس 308",
    quantity: "5000",
    pricingMethod: "per_weight" as "per_unit" | "per_weight",
    pricePerUnit: "4500",
    totalPrice: "",
    ageWeeks: "6",
    weightKg: "2.5",
    governorate: "بغداد",
    region: "الدورة",
    contactPhone: user?.phone || "07801234567",
    contactWhatsapp: user?.phone || "07801234567",
    notes: "دجاج صحي خالٍ من الأمراض، جاهز للبيع الفوري",
    images: [] as string[],
  });

  const [showGovPicker, setShowGovPicker] = useState(false);

  const update = (key: keyof typeof formData, value: any) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!formData.quantity || !formData.governorate) return;

    createAd(
      {
        poultryType: formData.poultryType,
        breed: formData.breed || undefined,
        quantity: Number(formData.quantity),
        unit: "bird",
        pricingMethod: formData.pricingMethod,
        pricePerUnit: formData.pricePerUnit ? Number(formData.pricePerUnit) : undefined,
        totalPrice: formData.totalPrice ? Number(formData.totalPrice) : undefined,
        ageWeeks: formData.ageWeeks ? Number(formData.ageWeeks) : undefined,
        weightKg: formData.weightKg ? Number(formData.weightKg) : undefined,
        governorate: formData.governorate,
        region: formData.region || undefined,
        contactPhone: formData.contactPhone || undefined,
        contactWhatsapp: formData.contactWhatsapp || undefined,
        notes: formData.notes || undefined,
        images: formData.images,
      } as any,
      {
        onSuccess: () => router.back(),
      },
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "إضافة عرض بيع دواجن",
          headerStyle: { backgroundColor: "#064E3B" },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* نوع الدواجن */}
          <View style={styles.section}>
            <Text style={styles.label}>نوع الدواجن *</Text>
            <View style={styles.typeGrid}>
              {POULTRY_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeBtn, formData.poultryType === t.key && styles.typeBtnActive]}
                  onPress={() => update("poultryType", t.key)}
                >
                  <Text style={[styles.typeBtnText, formData.poultryType === t.key && styles.typeBtnTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* السلالة */}
          <View style={styles.section}>
            <Text style={styles.label}>السلالة / الفصيلة</Text>
            <TextInput
              style={styles.input}
              value={formData.breed}
              onChangeText={(v) => update("breed", v)}
              placeholder="مثال: روس 308، كوب 500"
              textAlign="right"
            />
          </View>

          {/* الكمية */}
          <View style={styles.section}>
            <Text style={styles.label}>العدد / الكمية (طير) *</Text>
            <TextInput
              style={styles.input}
              value={formData.quantity}
              onChangeText={(v) => update("quantity", v)}
              placeholder="أدخل العدد"
              keyboardType="numeric"
              textAlign="right"
            />
          </View>

          {/* طريقة التسعير */}
          <View style={styles.section}>
            <Text style={styles.label}>طريقة التسعير</Text>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={[styles.radioBtn, formData.pricingMethod === "per_unit" && styles.radioBtnActive]}
                onPress={() => update("pricingMethod", "per_unit")}
              >
                <View style={[styles.radioCircle, formData.pricingMethod === "per_unit" && styles.radioCircleActive]} />
                <Text style={styles.radioText}>سعر الطير الواحد</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioBtn, formData.pricingMethod === "per_weight" && styles.radioBtnActive]}
                onPress={() => update("pricingMethod", "per_weight")}
              >
                <View style={[styles.radioCircle, formData.pricingMethod === "per_weight" && styles.radioCircleActive]} />
                <Text style={styles.radioText}>سعر الكيلو</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* السعر */}
          <View style={styles.section}>
            <Text style={styles.label}>{formData.pricingMethod === "per_unit" ? "سعر الطير الواحد (د.ع)" : "سعر الكيلو (د.ع)"}</Text>
            <TextInput
              style={styles.input}
              value={formData.pricePerUnit}
              onChangeText={(v) => update("pricePerUnit", v)}
              placeholder="أدخل السعر"
              keyboardType="numeric"
              textAlign="right"
            />
          </View>

          {/* العمر والوزن */}
          <View style={styles.row2}>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>العمر (أسبوع)</Text>
              <TextInput
                style={styles.input}
                value={formData.ageWeeks}
                onChangeText={(v) => update("ageWeeks", v)}
                placeholder="0"
                keyboardType="numeric"
                textAlign="right"
              />
            </View>
            <View style={[styles.section, { flex: 1 }]}>
              <Text style={styles.label}>الوزن (كغ)</Text>
              <TextInput
                style={styles.input}
                value={formData.weightKg}
                onChangeText={(v) => update("weightKg", v)}
                placeholder="0.00"
                keyboardType="numeric"
                textAlign="right"
              />
            </View>
          </View>

          {/* الموقع */}
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
            <TextInput
              style={styles.input}
              value={formData.region}
              onChangeText={(v) => update("region", v)}
              placeholder="مثال: الدورة، الكرخ"
              textAlign="right"
            />
          </View>

          {/* طريقة التواصل */}
          <View style={styles.section}>
            <Text style={styles.label}>رقم الهاتف</Text>
            <TextInput
              style={styles.input}
              value={formData.contactPhone}
              onChangeText={(v) => update("contactPhone", v)}
              placeholder="+964..."
              keyboardType="phone-pad"
              textAlign="right"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>واتساب</Text>
            <TextInput
              style={styles.input}
              value={formData.contactWhatsapp}
              onChangeText={(v) => update("contactWhatsapp", v)}
              placeholder="+964..."
              keyboardType="phone-pad"
              textAlign="right"
            />
          </View>

          {/* ملاحظات */}
          <View style={styles.section}>
            <Text style={styles.label}>ملاحظات إضافية</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={formData.notes}
              onChangeText={(v) => update("notes", v)}
              placeholder="أي تفاصيل إضافية..."
              multiline
              numberOfLines={4}
              textAlign="right"
              textAlignVertical="top"
            />
          </View>

          {/* الصور */}
          <View style={styles.section}>
            <Text style={styles.label}>صور الدواجن</Text>
            <ImageGalleryUploader images={formData.images} onImagesChange={(imgs) => update("images", imgs)} maxImages={5} />
          </View>

          <TouchableOpacity style={[styles.submitBtn, isCreating && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={isCreating}>
            {isCreating ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitBtnText}>نشر العرض</Text>}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { padding: 16, paddingBottom: 40 },
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
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: COLORS.white,
  },
  typeBtnActive: { backgroundColor: "#064E3B", borderColor: "#064E3B" },
  typeBtnText: { fontSize: 13, color: COLORS.darkGray },
  typeBtnTextActive: { color: COLORS.white, fontWeight: "600" },
  radioRow: { flexDirection: "row", gap: 16 },
  radioBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: COLORS.white,
    flex: 1,
    justifyContent: "center",
  },
  radioBtnActive: { borderColor: "#064E3B" },
  radioCircle: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: "#D1D5DB" },
  radioCircleActive: { borderColor: "#064E3B", backgroundColor: "#064E3B" },
  radioText: { fontSize: 13, color: COLORS.black },
  row2: { flexDirection: "row", gap: 12 },
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
    backgroundColor: "#064E3B",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
