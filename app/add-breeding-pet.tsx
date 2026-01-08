import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import Button from "../components/Button";
import { Pet } from "../types";
import { MapPin, Heart } from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useMutation } from "@tanstack/react-query";
import { ImageGalleryUploader } from "../components/ImageGalleryUploader";

export default function AddBreedingPetScreen() {
  const { t } = useI18n();
  const { user, pets } = useApp();
  const router = useRouter();
  const { petId } = useLocalSearchParams<{ petId?: string }>();

  const [formData, setFormData] = useState({
    // Basic pet info (pre-filled from existing pet)
    name: "",
    type: "",
    breed: "",
    age: "",
    gender: "" as Pet["gender"],
    weight: "",
    color: "",
    images: [] as string[],

    // Additional breeding-specific info
    location: "",
    description: "",
    breedingHistory: "",
    healthCertificates: "",
    studFee: "",
    availabilityPeriod: "",
    contactPreference: "" as "phone" | "message" | "both",
    specialRequirements: "",
  });

  const createApprovalMutation = useMutation(trpc.pets.createApprovalRequest.mutationOptions());

  // Pre-fill form with existing pet data if petId is provided
  useEffect(() => {
    if (petId) {
      const existingPet = pets.find((p: Pet) => p.id === petId);
      if (existingPet) {
        setFormData((prev) => ({
          ...prev,
          name: existingPet.name || "",
          type: existingPet.type || "dog",
          breed: existingPet.breed || "",
          age: existingPet.age?.toString() || "",
          gender: existingPet.gender || "male",
          weight: existingPet.weight?.toString() || "",
          color: existingPet.color || "",
          images: existingPet.images || [],
        }));
      }
    }
  }, [petId, pets]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.location.trim() || !formData.description.trim()) {
      Alert.alert("خطأ", "يرجى ملء الحقول المطلوبة: الاسم، الموقع، والوصف");
      return;
    }
    if (!user) {
      Alert.alert("خطأ", "يرجى تسجيل الدخول أولاً");
      return;
    }

    createApprovalMutation.mutate(
      {
        name: formData.name.trim(),
        type: formData.type,
        breed: formData.breed.trim() || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        color: formData.color.trim() || undefined,
        image: formData.images[0] || "https://images.unsplash.com/photo-1601758228041-f3b2795255f1",
        images: formData.images,
        ownerId: parseInt(user.id.toString()),
        requestType: "breeding",
        description: `${formData.description}\n\nتاريخ التزاوج السابق: ${formData.breedingHistory}\nالشهادات الصحية: ${formData.healthCertificates}\nرسوم التزاوج: ${formData.studFee}\nفترة التوفر: ${formData.availabilityPeriod}\nطريقة التواصل المفضلة: ${formData.contactPreference}\nمتطلبات خاصة: ${formData.specialRequirements}`,
        images: [formData.image],
        contactInfo: `طريقة التواصل المفضلة: ${formData.contactPreference}`,
        location: formData.location.trim(),
        price: formData.studFee ? parseFloat(formData.studFee) : undefined,
        specialRequirements: formData.specialRequirements.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert("تم إرسال الطلب", "تم إرسال طلبك بنجاح وهو الآن في انتظار موافقة الإدارة.", [
            { text: "موافق", onPress: () => router.back() },
          ]);
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message || "حدث خطأ أثناء إرسال الطلب");
        },
      }
    );
  };

  const renderGenderSelector = () => (
    <View style={styles.genderContainer}>
      <TouchableOpacity
        style={[styles.genderButton, formData.gender === "male" && styles.genderButtonActive]}
        onPress={() => handleInputChange("gender", "male")}
      >
        <Text style={[styles.genderButtonText, formData.gender === "male" && styles.genderButtonTextActive]}>ذكر</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.genderButton, formData.gender === "female" && styles.genderButtonActive]}
        onPress={() => handleInputChange("gender", "female")}
      >
        <Text style={[styles.genderButtonText, formData.gender === "female" && styles.genderButtonTextActive]}>
          أنثى
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderContactPreferenceSelector = () => (
    <View style={styles.contactContainer}>
      <TouchableOpacity
        style={[styles.contactButton, formData.contactPreference === "phone" && styles.contactButtonActive]}
        onPress={() => handleInputChange("contactPreference", "phone")}
      >
        <Text
          style={[styles.contactButtonText, formData.contactPreference === "phone" && styles.contactButtonTextActive]}
        >
          هاتف
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.contactButton, formData.contactPreference === "message" && styles.contactButtonActive]}
        onPress={() => handleInputChange("contactPreference", "message")}
      >
        <Text
          style={[styles.contactButtonText, formData.contactPreference === "message" && styles.contactButtonTextActive]}
        >
          رسائل
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.contactButton, formData.contactPreference === "both" && styles.contactButtonActive]}
        onPress={() => handleInputChange("contactPreference", "both")}
      >
        <Text
          style={[styles.contactButtonText, formData.contactPreference === "both" && styles.contactButtonTextActive]}
        >
          كلاهما
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "عرض للتزاوج",
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
          presentation: "modal",
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header with icon */}
        <View style={styles.headerContainer}>
          <Heart size={32} color="#8B5CF6" />
          <Text style={styles.headerTitle}>عرض حيوان للتزاوج</Text>
          <Text style={styles.headerSubtitle}>أضف معلومات إضافية لعرض حيوانك للتزاوج</Text>
        </View>

        {/* Pet Images */}
        <View style={styles.inputGroup}>
          <ImageGalleryUploader
            images={formData.images}
            onImagesChange={(images) => setFormData({ ...formData, images })}
            maxImages={5}
            label="صور الحيوان"
          />
        </View>

        {/* Basic Pet Info Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>معلومات الحيوان الأساسية</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم الحيوان *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange("name", value)}
              placeholder="أدخل اسم الحيوان"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>السلالة *</Text>
            <TextInput
              style={styles.input}
              value={formData.breed}
              onChangeText={(value) => handleInputChange("breed", value)}
              placeholder="أدخل السلالة"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>العمر (بالسنوات) *</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(value) => handleInputChange("age", value)}
                placeholder="العمر"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>الجنس *</Text>
              {renderGenderSelector()}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>الوزن (كيلو)</Text>
              <TextInput
                style={styles.input}
                value={formData.weight}
                onChangeText={(value) => handleInputChange("weight", value)}
                placeholder="الوزن"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>اللون</Text>
              <TextInput
                style={styles.input}
                value={formData.color}
                onChangeText={(value) => handleInputChange("color", value)}
                placeholder="اللون"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>
        </View>

        {/* Breeding Specific Info Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>معلومات التزاوج</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الموقع *</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.input, styles.inputWithIconText]}
                value={formData.location}
                onChangeText={(value) => handleInputChange("location", value)}
                placeholder="أدخل الموقع (المدينة، المنطقة)"
                placeholderTextColor={COLORS.lightGray}
              />
              <MapPin size={20} color={COLORS.lightGray} style={styles.inputIcon} />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>تاريخ التزاوج السابق</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.breedingHistory}
              onChangeText={(value) => handleInputChange("breedingHistory", value)}
              placeholder="اكتب تاريخ التزاوج السابق إن وجد، عدد المرات، نتائج التزاوج..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الشهادات الصحية</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.healthCertificates}
              onChangeText={(value) => handleInputChange("healthCertificates", value)}
              placeholder="اذكر الشهادات الصحية المتوفرة، التطعيمات، الفحوصات الطبية..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رسوم التزاوج</Text>
            <TextInput
              style={styles.input}
              value={formData.studFee}
              onChangeText={(value) => handleInputChange("studFee", value)}
              placeholder="أدخل رسوم التزاوج أو اكتب 'مجاني' (اختياري)"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>فترة التوفر</Text>
            <TextInput
              style={styles.input}
              value={formData.availabilityPeriod}
              onChangeText={(value) => handleInputChange("availabilityPeriod", value)}
              placeholder="متى يكون الحيوان متاحاً للتزاوج؟"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>طريقة التواصل المفضلة</Text>
            {renderContactPreferenceSelector()}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>متطلبات خاصة</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.specialRequirements}
              onChangeText={(value) => handleInputChange("specialRequirements", value)}
              placeholder="أي متطلبات خاصة للتزاوج، شروط معينة، أو ملاحظات إضافية..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الوصف العام *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              placeholder="اكتب وصفاً شاملاً عن الحيوان، شخصيته، سلوكه، وأي معلومات مهمة للتزاوج..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Notice */}
        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText}>
            📋 ملاحظة: سيتم مراجعة طلبك من قبل الإدارة قبل النشر. سيتم إشعارك عند الموافقة على الطلب.
          </Text>
        </View>

        {/* Submit Button */}
        <Button
          title="إضافة للتزاوج"
          onPress={handleSubmit}
          type="primary"
          size="large"
          style={styles.submitButton}
          disabled={isLoading || createApprovalMutation.isPending}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    marginTop: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightGray,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  sectionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "right",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  input: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "right",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  inputWithIcon: {
    position: "relative",
  },
  inputWithIconText: {
    paddingLeft: 40,
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    top: 12,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  genderContainer: {
    flexDirection: "row",
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: "center",
  },
  genderButtonActive: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  genderButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  genderButtonTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
  contactContainer: {
    flexDirection: "row",
    gap: 8,
  },
  contactButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.gray,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: "center",
  },
  contactButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  contactButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  contactButtonTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: "#8B5CF6",
  },
  noticeContainer: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  noticeText: {
    fontSize: 14,
    color: "#1976D2",
    textAlign: "right",
    lineHeight: 20,
  },
});
