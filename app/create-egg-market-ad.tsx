/**
 * create-egg-market-ad.tsx
 * Form to create an egg market ad.
 */
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useApp } from "../providers/AppProvider";
import { useEggMarket } from "../hooks/useEggMarket";
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

const EGG_TYPES = [
  { key: "white", label: "بيض أبيض" },
  { key: "brown", label: "بيض بني" },
  { key: "organic", label: "بيض عضوي" },
  { key: "local", label: "بيض بلدي" },
  { key: "turkey", label: "بيض ديك رومي" },
  { key: "other", label: "أخرى" },
];

const EGG_UNITS = [
  { key: "tray", label: "طاقة (30 بيضة)" },
  { key: "carton", label: "كرتون (360 بيضة)" },
  { key: "piece", label: "حبة" },
];

export default function CreateEggMarketAdScreen() {
  const router = useRouter();
  const { user } = useApp();
  const { createAd, isCreating } = useEggMarket();

  const [formData, setFormData] = useState({
    eggType: "white",
    quantity: "200",
    unit: "tray",
    pricePerUnit: "7500",
    governorate: "بغداد",
    region: "الكرخ",
    contactPhone: user?.phone || "07901234567",
    contactWhatsapp: user?.phone || "07901234567",
    notes: "بيض طازج يومي، إنتاج محلي عالي الجودة",
    images: [] as string[],
  });

  const [showGovPicker, setShowGovPicker] = useState(false);

  const update = (key: keyof typeof formData, value: any) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!formData.quantity || !formData.governorate) return;

    createAd(
      {
        eggType: formData.eggType,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        pricePerUnit: formData.pricePerUnit ? Number(formData.pricePerUnit) : undefined,
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
          title: "إضافة عرض بيع بيض",
          headerStyle: { backgroundColor: "#064E3B" },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: "700" },
        }}
      />
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* نوع البيض */}
          <View style={styles.section}>
            <Text style={styles.label}>نوع البيض *</Text>
            <View style={styles.typeGrid}>
              {EGG_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeBtn, formData.eggType === t.key && styles.typeBtnActive]}
                  onPress={() => update("eggType", t.key)}
                >
                  <Text style={[styles.typeBtnText, formData.eggType === t.key && styles.typeBtnTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* الوحدة */}
          <View style={styles.section}>
            <Text style={styles.label}>وحدة البيع</Text>
            <View style={styles.typeGrid}>
              {EGG_UNITS.map((u) => (
                <TouchableOpacity key={u.key} style={[styles.typeBtn, formData.unit === u.key && styles.typeBtnActive]} onPress={() => update("unit", u.key)}>
                  <Text style={[styles.typeBtnText, formData.unit === u.key && styles.typeBtnTextActive]}>{u.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* الكمية */}
          <View style={styles.section}>
            <Text style={styles.label}>الكمية *</Text>
            <TextInput
              style={styles.input}
              value={formData.quantity}
              onChangeText={(v) => update("quantity", v)}
              placeholder="أدخل الكمية"
              keyboardType="numeric"
              textAlign="right"
            />
          </View>

          {/* السعر */}
          <View style={styles.section}>
            <Text style={styles.label}>السعر لكل وحدة (د.ع)</Text>
            <TextInput
              style={styles.input}
              value={formData.pricePerUnit}
              onChangeText={(v) => update("pricePerUnit", v)}
              placeholder="أدخل السعر"
              keyboardType="numeric"
              textAlign="right"
            />
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

          {/* التواصل */}
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
            <Text style={styles.label}>ملاحظات</Text>
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
            <Text style={styles.label}>صور</Text>
            <ImageGalleryUploader images={formData.images} onImagesChange={(imgs) => update("images", imgs)} maxImages={4} />
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
