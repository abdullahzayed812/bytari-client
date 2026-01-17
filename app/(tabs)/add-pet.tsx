import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Image } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../../constants/colors";
import { useI18n } from "../../providers/I18nProvider";
import { useApp } from "../../providers/AppProvider";
import { trpc } from "../../lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useLocalSearchParams } from "expo-router";
import Button from "../../components/Button";
import { Pet } from "../../types";
import { Camera, Calendar } from "lucide-react-native";
import { Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useToast } from "@/lib/hooks";
import { useToastContext } from "@/providers/ToastProvider";

const PET_TYPES = ["dog", "cat", "rabbit", "bird", "other"] as const;
const GENDERS = ["male", "female"] as const;

export default function AddPetScreen() {
  const { t } = useI18n();
  const { user } = useApp();
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useLocalSearchParams<{ editMode?: string; petId?: string }>();
  const isEditMode = params.editMode === "true";

  const [formData, setFormData] = useState({
    name: "",
    type: "" as Pet["type"],
    breed: "",
    age: "",
    gender: "" as Pet["gender"],
    weight: "",
    color: "",
    birthDate: "",
    image: "",
    medicalHistory: "",
    vaccinations: "",
  });

  const createPetMutation = useMutation(trpc.pets.create.mutationOptions({}));
  const isLoading = createPetMutation.isPending;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /** 🖼️ Handle Image Upload **/
  const handleImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showToast({
          message: "نحتاج إلى إذن للوصول إلى الصور",
          type: "error",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setFormData((prev) => ({ ...prev, image: result.assets[0].uri }));
        showToast({
          message: "تم اختيار الصورة بنجاح",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showToast({
        message: "حدث خطأ أثناء اختيار الصورة",
        type: "error",
      });
    }
  };

  /** 🐶 Handle Form Submission **/
  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      showToast({
        message: "يرجى إدخال اسم الحيوان",
        type: "error",
      });
      return;
    }

    if (!user) {
      showToast({
        message: "يرجى تسجيل الدخول أولاً",
        type: "error",
      });
      return;
    }

    if (isEditMode && params.petId) {
      showToast({
        message: "ميزة التعديل قيد التطوير",
        type: "info",
      });
      return;
    }

    // Add new pet
    createPetMutation.mutate(
      {
        ownerId: user.id,
        name: formData.name.trim(),
        type: formData.type,
        breed: formData.breed.trim() || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        color: formData.color.trim() || undefined,
        image: formData.image,
        medicalHistory: formData.medicalHistory.trim() || undefined,
        vaccinations: formData.vaccinations.trim() || undefined,
      },
      {
        onSuccess: () => {
          showToast({
            message: "تم إضافة الحيوان بنجاح",
            type: "success",
          });
          router.navigate("/(tabs)/pets");
          queryClient.invalidateQueries(trpc.pets.getUserPets.queryKey);
        },
        onError: (error) => {
          showToast({
            message: error.message || "حدث خطأ أثناء إضافة الحيوان",
            type: "error",
          });
        },
      }
    );
  };

  const renderTypeSelector = () => (
    <View style={styles.typeContainer}>
      {PET_TYPES.map((type) => (
        <TouchableOpacity
          key={type}
          style={[styles.typeButton, formData.type === type && styles.typeButtonActive]}
          onPress={() => handleInputChange("type", type)}
        >
          <Text style={[styles.typeButtonText, formData.type === type && styles.typeButtonTextActive]}>
            {`${type}`}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderGenderSelector = () => (
    <View style={styles.genderContainer}>
      {GENDERS.map((gender) => (
        <TouchableOpacity
          key={gender}
          style={[styles.genderButton, formData.gender === gender && styles.genderButtonActive]}
          onPress={() => handleInputChange("gender", gender)}
        >
          <Text style={[styles.genderButtonText, formData.gender === gender && styles.genderButtonTextActive]}>
            {gender === "male" ? "ذكر" : "أنثى"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditMode ? "تعديل معلومات الحيوان" : "إضافة حيوان جديد",
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
          presentation: "modal",
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Pet Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: formData.image }} style={styles.petImage} />
          <TouchableOpacity style={styles.cameraButton} onPress={handleImageUpload}>
            <Camera size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Pet Name */}
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

        {/* Pet Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>نوع الحيوان *</Text>
          {renderTypeSelector()}
        </View>

        {/* Breed */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>السلالة</Text>
          <TextInput
            style={styles.input}
            value={formData.breed}
            onChangeText={(value) => handleInputChange("breed", value)}
            placeholder="أدخل السلالة (اختياري)"
            placeholderTextColor={COLORS.lightGray}
          />
        </View>

        {/* Age and Gender Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>العمر (بالسنوات)</Text>
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
            <Text style={styles.label}>الجنس</Text>
            {renderGenderSelector()}
          </View>
        </View>

        {/* Weight and Color Row */}
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

        {/* Birth Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>تاريخ الميلاد</Text>
          <TouchableOpacity style={styles.dateInput}>
            <Text style={[styles.dateText, !formData.birthDate && styles.placeholder]}>
              {formData.birthDate || "اختر تاريخ الميلاد (اختياري)"}
            </Text>
            <Calendar size={20} color={COLORS.lightGray} />
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <Button
          title={isEditMode ? "حفظ التغييرات" : "إضافة الحيوان"}
          onPress={handleSubmit}
          type="primary"
          size="large"
          style={styles.submitButton}
          disabled={isLoading}
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "left",
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: "left",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  typeContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  typeButtonTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  genderContainer: {
    flexDirection: "row-reverse",
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: "center",
  },
  genderButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  genderButtonTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
  dateInput: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.black,
  },
  placeholder: {
    color: COLORS.lightGray,
  },
  submitButton: {
    marginTop: 24,
  },
});
