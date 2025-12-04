import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Save } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import Button from "../components/Button";
import { trpc } from "../lib/trpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/providers/ToastProvider";
import { ImageGalleryUploader } from "@/components/ImageGalleryUploader";

export default function EditClinicScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToastContext();
  const { id } = useLocalSearchParams();
  const clinicId = Number(id);

  // ============= TRPC HOOKS =============
  const clinicQuery = useQuery({
    ...trpc.clinics.getById.queryOptions({ clinicId: Number(clinicId) }),
    enabled: !!clinicId,
  });

  const updateClinic = useMutation(trpc.clinics.updateClinic.mutationOptions());

  // ============= FORM STATE =============
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    workingHours: "",
    services: "",
    doctors: "",
    facebook: "",
    instagram: "",
    whatsapp: "",
    website: "",
    images: [] as string[],
  });

  // Load clinic data when fetched
  useEffect(() => {
    if (clinicQuery.data?.clinic) {
      const c = clinicQuery.data.clinic;

      setFormData({
        name: c.name || "",
        address: c.address || "",
        phone: c.phone || "",
        email: c.email || "",
        description: c.description || "",
        workingHours: c.workingHours || "",
        services: c.services || "",
        doctors: c.doctors || "",
        facebook: c.facebook || "",
        instagram: c.instagram || "",
        whatsapp: c.whatsapp || "",
        website: c.website || "",
        images: typeof c.images === "string" ? JSON.parse(c.images) : c.images || [],
      });
    }
  }, [clinicQuery.data]);

  // ============= SAVE HANDLER =============
  const handleSave = () => {
    if (!formData.name || !formData.phone || !formData.address) {
      showToast({
        type: "error",
        message: "يرجى ملء الحقول المطلوبة: الاسم، الهاتف، العنوان",
      });
      return;
    }

    updateClinic.mutate(
      {
        clinicId,
        ...formData,
      },
      {
        onSuccess: (data) => {
          showToast({
            type: "success",
            message: data?.message || "تم تحديث بيانات العيادة بنجاح",
          });
          queryClient.invalidateQueries({ queryKey: [["clinics"]] });
          router.back();
        },
        onError: (error) => {
          showToast({
            type: "error",
            message: error.message || "حدث خطأ أثناء تحديث العيادة",
          });
        },
      }
    );
  };

  // ============= LOADING VIEW =============
  if (clinicQuery.isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ fontSize: 18 }}>جار تحميل بيانات العيادة...</Text>
      </SafeAreaView>
    );
  }

  if (clinicQuery.isError) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ fontSize: 18, color: "red" }}>خطأ في تحميل بيانات العيادة</Text>
      </SafeAreaView>
    );
  }

  // ====================== UI ======================
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "تعديل العيادة",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          {/* Clinic Images */}
          <ImageGalleryUploader
            images={formData.images}
            onImagesChange={(images) => setFormData({ ...formData, images })}
            maxImages={5}
            label="صور العيادة"
          />

          {/* Input Builder */}
          {renderInput("اسم العيادة", "name")}
          {renderInput("العنوان", "address")}
          {renderInput("رقم الهاتف", "phone", "phone-pad")}
          {renderInput("البريد الإلكتروني", "email", "email-address")}

          {renderInput("الوصف", "description", "default", true)}

          {renderInput("ساعات العمل", "workingHours")}
          {renderInput("الخدمات", "services")}
          {renderInput("الأطباء", "doctors")}

          {renderInput("فيسبوك", "facebook")}
          {renderInput("إنستغرام", "instagram")}
          {renderInput("واتساب", "whatsapp")}
          {renderInput("الموقع الإلكتروني", "website")}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="حفظ التغييرات"
          onPress={handleSave}
          type="primary"
          size="large"
          icon={<Save size={20} color={COLORS.white} />}
        />
      </View>
    </SafeAreaView>
  );

  // Helper: Render Input Box
  function renderInput(label, key, keyboardType = "default", multiline = false) {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.input, multiline && styles.textArea]}
          value={String(formData[key] ?? "")}
          onChangeText={(text) => setFormData((prev) => ({ ...prev, [key]: text }))}
          textAlign="right"
          placeholder={`أدخل ${label}`}
          keyboardType={keyboardType}
          multiline={multiline}
        />
      </View>
    );
  }
}

// ====================== STYLES ======================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: { padding: 8 },
  content: { flex: 1 },
  form: {
    padding: 20,
    backgroundColor: COLORS.white,
    margin: 10,
    borderRadius: 12,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  clinicImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  uploadButtonText: { color: COLORS.white, fontWeight: "600" },
  inputGroup: { marginBottom: 18 },
  label: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: COLORS.white,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
});
