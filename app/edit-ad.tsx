import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Switch,
  Image,
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { COLORS } from "@/constants/colors";
import { trpc } from "@/lib/trpc";
import { Calendar, ImageIcon, Link, Save, Type } from "lucide-react-native";

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

export default function EditAdScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const adId = parseInt(id || "0");

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    link: "",
    type: "banner" as "banner" | "popup" | "inline",
    position: "",
    startDate: new Date(),
    endDate: new Date(),
    isActive: true,
  });

  // Fetch advertisement details
  const adQuery = useQuery(trpc.admin.ads.getById.queryOptions({ adId }));

  // Update advertisement mutation
  const updateAdMutation = useMutation(trpc.admin.ads.update.mutationOptions());

  useEffect(() => {
    if (adQuery.data) {
      const ad = adQuery.data;
      setFormData({
        title: ad.title,
        content: ad.content || "",
        image: ad.image || "",
        link: ad.link || "",
        type: ad.type as "banner" | "popup" | "inline",
        position: ad.position || "",
        startDate: new Date(ad.startDate),
        endDate: new Date(ad.endDate),
        isActive: ad.isActive,
      });
    }
  }, [adQuery.data]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert("خطأ", "يرجى إدخال عنوان الإعلان");
      return;
    }

    if (formData.endDate <= formData.startDate) {
      Alert.alert("خطأ", "تاريخ النهاية يجب أن يكون بعد تاريخ البداية");
      return;
    }

    updateAdMutation.mutate(
      {
        adminId: 1, // TODO: Get from auth context
        adId,
        title: formData.title,
        content: formData.content || undefined,
        image: formData.image || undefined,
        link: formData.link || undefined,
        type: formData.type,
        position: formData.position || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
      },
      {
        onSuccess: () => {
          Alert.alert("نجح", "تم تحديث الإعلان بنجاح", [{ text: "موافق", onPress: () => router.back() }]);
        },
        onError: (error: any) => {
          Alert.alert("خطأ", error.message || "فشل في تحديث الإعلان");
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

  if (adQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "تعديل الإعلان",
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (adQuery.isError || !adQuery.data) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: "تعديل الإعلان",
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: "bold" },
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>لم يتم العثور على الإعلان</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "تعديل الإعلان",
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
              ].map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.typeButton, formData.type === type.value && styles.typeButtonActive]}
                  onPress={() =>
                    setFormData((prev) => ({
                      ...prev,
                      type: type.value as "banner" | "popup" | "inline",
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
            <TextInput
              style={styles.textInput}
              value={formData.position}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, position: text }))}
              placeholder="أدخل موقع الإعلان (مثل: home, profile)"
              placeholderTextColor={colors.gray}
            />
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

          {/* Active Status */}
          <View style={styles.inputGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>الإعلان نشط</Text>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, isActive: value }))}
                trackColor={{ false: colors.lightGray, true: colors.primary }}
                thumbColor={formData.isActive ? colors.white : colors.gray}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, updateAdMutation.isPending && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={updateAdMutation.isPending}
          >
            <Save size={20} color={colors.white} />
            <Text style={styles.saveButtonText}>{updateAdMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
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
  },
  typeButton: {
    flex: 1,
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
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
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
