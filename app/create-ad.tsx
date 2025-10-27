import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Image,
} from "react-native";
import { Stack, router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { COLORS } from "@/constants/colors";
import { Calendar, ImageIcon, Link, Save, Type } from "lucide-react-native";
import { trpc } from "@/lib/trpc";

const colors = {
  primary: COLORS.primary,
  white: COLORS.white,
  black: COLORS.black,
  gray: COLORS.darkGray,
  lightGray: COLORS.lightGray,
  background: COLORS.background,
  text: COLORS.black,
  error: COLORS.error,
  success: COLORS.success,
};

export default function CreateAdScreen() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    link: "",
    type: "banner" as "banner" | "popup" | "inline" | "image_only" | "image_with_link",
    position: "home",
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isActive: true,
  });

  // Create advertisement mutation
  const createAdMutation = useMutation(trpc.admin.ads.create.mutationOptions());

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert("خطأ", "يرجى إدخال عنوان الإعلان");
      return;
    }

    if (formData.endDate <= formData.startDate) {
      Alert.alert("خطأ", "تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
      return;
    }

    createAdMutation.mutate(
      {
        adminId: 1, // TODO: Get from auth context
        title: formData.title,
        content: formData.content || undefined,
        image: formData.image || undefined,
        link: formData.link || undefined,
        type: formData.type,
        position: formData.position || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم إنشاء الإعلان بنجاح", [{ text: "موافق", onPress: () => router.back() }]);
        },
        onError: (error: any) => {
          Alert.alert("خطأ", error.message || "فشل في إنشاء الإعلان");
        },
      }
    );
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    const date = new Date(value);
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "إنشاء إعلان جديد",
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Type size={20} color={colors.primary} />
              <Text style={styles.label}>عنوان الإعلان *</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, title: text }))}
              placeholder="أدخل عنوان الإعلان"
              placeholderTextColor={colors.gray}
            />
          </View>

          {/* Content */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>محتوى الإعلان</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.content}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, content: text }))}
              placeholder="أدخل محتوى الإعلان"
              placeholderTextColor={colors.gray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Image URL */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <ImageIcon size={20} color={colors.primary} />
              <Text style={styles.label}>رابط الصورة</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={formData.image}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, image: text }))}
              placeholder="أدخل رابط الصورة"
              placeholderTextColor={colors.gray}
            />
            {formData.image && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: formData.image }} style={styles.previewImage} resizeMode="cover" />
              </View>
            )}
          </View>

          {/* Link */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Link size={20} color={colors.primary} />
              <Text style={styles.label}>رابط الإعلان</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={formData.link}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, link: text }))}
              placeholder="أدخل رابط الإعلان"
              placeholderTextColor={colors.gray}
            />
          </View>

          {/* Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>نوع الإعلان</Text>
            <View style={styles.typeContainer}>
              {[
                { value: "banner", label: "بانر" },
                { value: "popup", label: "نافذة منبثقة" },
                { value: "inline", label: "مدمج" },
                { value: "image_only", label: "صورة فقط" },
                { value: "image_with_link", label: "صورة مع رابط" },
              ].map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.typeButton, formData.type === type.value && styles.typeButtonActive]}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      type: type.value as "banner" | "popup" | "inline" | "image_only" | "image_with_link",
                    }))
                  }
                >
                  <Text style={[styles.typeButtonText, formData.type === type.value && styles.typeButtonTextActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Position */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>موقع الإعلان</Text>
            <View style={styles.typeContainer}>
              {[
                { value: "home", label: "الصفحة الرئيسية" },
                { value: "profile", label: "الملف الشخصي" },
                { value: "store", label: "المتجر" },
              ].map((position) => (
                <TouchableOpacity
                  key={position.value}
                  style={[styles.typeButton, formData.position === position.value && styles.typeButtonActive]}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      position: position.value,
                    }))
                  }
                >
                  <Text
                    style={[styles.typeButtonText, formData.position === position.value && styles.typeButtonTextActive]}
                  >
                    {position.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Start Date */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.label}>تاريخ البداية</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={formatDateForInput(formData.startDate)}
              onChangeText={(text) => handleDateChange("startDate", text)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.gray}
            />
          </View>

          {/* End Date */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.label}>تاريخ النهاية</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={formatDateForInput(formData.endDate)}
              onChangeText={(text) => handleDateChange("endDate", text)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.gray}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, createAdMutation.isPending && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={createAdMutation.isPending}
          >
            <Save size={20} color={colors.white} />
            <Text style={styles.saveButtonText}>
              {createAdMutation.isPending ? "جاري الإنشاء..." : "إنشاء الإعلان"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
    textAlign: "right",
  },
  textArea: {
    height: 100,
  },
  imagePreview: {
    marginTop: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 150,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  typeButton: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  typeButtonTextActive: {
    color: colors.white,
    fontWeight: "bold",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
