import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { COLORS } from "../constants/colors";
import { ArrowLeft, Plus } from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import Button from "@/components/Button 2";
import { useToastContext } from "@/providers/ToastProvider";
import { useApp } from "@/providers/AppProvider";
import { ImageGalleryUploader } from "@/components/ImageGalleryUploader";

export default function AddClinicScreen() {
  const { user, isSuperAdmin } = useApp();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "test clinic name",
    description: "test description",
    address: "test address",
    phone: "010000000000000000",
    email: "clinic@mail.com",
    workingHours: "3",
    licenseNumber: "191919191919191",
    licenseImages: ["http://bytari/media/img1.png"],
    identityImages: ["http://bytari/media/img1.png"],
    images: [] as string[],
  });
  const { showToast } = useToastContext();

  const mutation = useMutation(trpc.clinics.create.mutationOptions());

  const handleSave = () => {
    if (!formData.name || !formData.address || !formData.phone) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (formData.licenseImages.length === 0) {
      showToast({
        type: "error",
        message: "صور الترخيص مطلوبة.",
      });
      return;
    }
    if (formData.identityImages.length === 0) {
      showToast({
        type: "error",
        message: "صورة الهويه مطلوبة.",
      });
      return;
    }

    const payload: any = {
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      email: formData.email || undefined,
      description: formData.description || "",

      licenseNumber: formData.licenseNumber,
      licenseImages: formData.licenseImages,
      identityImages: formData.identityImages,

      latitude: 0,
      longitude: 0,
      workingHours: formData.workingHours,
      images: formData.images,
    };

    // ✅ Add adminId only if user has admin access
    if (isSuperAdmin && user?.id) {
      payload.adminId = user.id;
    }

    // Mock values for now to match the mutation input requirements
    mutation.mutate(payload, {
      onSuccess: (data) => {
        Alert.alert("نجاح", data.message || "تم إرسال الطلب بنجاح");
        router.back();
        if (isSuperAdmin) queryClient.invalidateQueries(trpc.clinics.list.queryKey);
      },
      onError: (error) => {
        Alert.alert("خطأ", error.message || "حدث خطأ أثناء إرسال الطلب");
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "إضافة عيادة جديدة",
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Clinic Images */}
          <ImageGalleryUploader
            images={formData.images}
            onImagesChange={(images) => setFormData({ ...formData, images })}
            maxImages={5}
            label="صور العيادة"
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم العيادة *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="أدخل اسم العيادة"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>العنوان *</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="أدخل عنوان العيادة"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رقم الهاتف *</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="أدخل رقم الهاتف"
              textAlign="right"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="أدخل البريد الإلكتروني"
              textAlign="right"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الوصف</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="أدخل وصف العيادة"
              textAlign="right"
              multiline
              numberOfLines={4}
            />
          </View>

          {/* License Images */}
          <ImageGalleryUploader
            images={formData.licenseImages}
            onImagesChange={(images) => setFormData({ ...formData, licenseImages: images })}
            maxImages={3}
            label="صور الترخيص *"
          />

          {/* Identity Images */}
          <ImageGalleryUploader
            images={formData.identityImages}
            onImagesChange={(images) => setFormData({ ...formData, identityImages: images })}
            maxImages={2}
            label="صور الهوية *"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="إضافة العيادة"
          onPress={handleSave}
          type="primary"
          size="large"
          icon={<Plus size={20} color={COLORS.white} />}
          disabled={mutation.isPending}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
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
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: COLORS.background,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
    marginTop: 8,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "right",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});
