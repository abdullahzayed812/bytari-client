import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import { useRouter, Stack } from "expo-router";
import Button from "../components/Button";
import { Pet } from "../types";
import { Camera, MapPin } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { trpc } from "../lib/trpc";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/lib/hooks";

const PET_TYPES = ["dog", "cat", "rabbit", "bird", "other"] as const;
const GENDERS = ["male", "female"] as const;
const LISTING_TYPES = ["adoption", "breeding"] as const;

export default function AddAdoptionPetScreen() {
  const { t } = useI18n();
  const { user } = useApp();
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    type: "dog" as Pet["type"],
    breed: "",
    age: "",
    gender: "male" as Pet["gender"],
    weight: "",
    color: "",
    location: "",
    description: "",
    listingType: "adoption" as "adoption" | "breeding",
    contactInfo: "",
    specialRequirements: "",
    price: "",
    image:
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  });

  const createApprovalMutation = useMutation(
    trpc.pets.createApprovalRequest.mutationOptions({})
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showToast({
          type: "error",
          message: "نحتاج إلى إذن للوصول إلى الصور",
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
          type: "success",
          message: "تم اختيار الصورة بنجاح",
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showToast({
        type: "error",
        message: "حدث خطأ أثناء اختيار الصورة",
      });
    }
  };

  const handleSubmit = async () => {
    // ✅ Validate required fields
    if (!formData.name.trim()) {
      showToast({ type: "error", message: "يرجى إدخال اسم الحيوان" });
      return;
    }
    if (!formData.age.trim()) {
      showToast({ type: "error", message: "يرجى إدخال عمر الحيوان" });
      return;
    }
    if (!formData.color.trim()) {
      showToast({ type: "error", message: "يرجى إدخال لون الحيوان" });
      return;
    }
    if (!formData.location.trim()) {
      showToast({ type: "error", message: "يرجى إدخال الموقع" });
      return;
    }
    if (!formData.description.trim()) {
      showToast({ type: "error", message: "يرجى إدخال وصف الحيوان" });
      return;
    }
    if (!user) {
      showToast({ type: "error", message: "يرجى تسجيل الدخول أولاً" });
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
        image: formData.image,
        ownerId: parseInt(user.id.toString()),
        requestType: formData.listingType,
        description: formData.description.trim(),
        images: [formData.image],
        contactInfo: formData.contactInfo.trim() || undefined,
        location: formData.location.trim(),
        price: formData.price ? parseFloat(formData.price) : undefined,
        specialRequirements: formData.specialRequirements.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          showToast({
            type: "success",
            message:
              data?.message ||
              "تم إرسال الطلب بنجاح وهو الآن في انتظار موافقة الإدارة",
          });
          router.back();
          trpc.pets.getApproved.invalidate();
        },
        onError: (error) => {
          showToast({
            type: "error",
            message: error.message || "حدث خطأ أثناء إرسال الطلب",
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
          style={[
            styles.typeButton,
            formData.type === type && styles.typeButtonActive,
          ]}
          onPress={() => handleInputChange("type", type)}
        >
          <Text
            style={[
              styles.typeButtonText,
              formData.type === type && styles.typeButtonTextActive,
            ]}
          >
            {t(`pets.types.${type}`)}
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
          style={[
            styles.genderButton,
            formData.gender === gender && styles.genderButtonActive,
          ]}
          onPress={() => handleInputChange("gender", gender)}
        >
          <Text
            style={[
              styles.genderButtonText,
              formData.gender === gender && styles.genderButtonTextActive,
            ]}
          >
            {gender === "male" ? "ذكر" : "أنثى"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderListingTypeSelector = () => (
    <View style={styles.listingTypeContainer}>
      {LISTING_TYPES.map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.listingTypeButton,
            formData.listingType === type && styles.listingTypeButtonActive,
          ]}
          onPress={() => handleInputChange("listingType", type)}
        >
          <Text
            style={[
              styles.listingTypeButtonText,
              formData.listingType === type &&
                styles.listingTypeButtonTextActive,
            ]}
          >
            {type === "adoption" ? "للتبني" : "للتزاوج"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "إضافة حيوان للعرض",
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
          presentation: "modal",
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Pet Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: formData.image }} style={styles.petImage} />
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handleImageUpload}
          >
            <Camera size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Listing Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>نوع العرض *</Text>
          {renderListingTypeSelector()}
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
            <Text style={styles.label}>اللون *</Text>
            <TextInput
              style={styles.input}
              value={formData.color}
              onChangeText={(value) => handleInputChange("color", value)}
              placeholder="اللون"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>
        </View>

        {/* Location */}
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
            <MapPin
              size={20}
              color={COLORS.lightGray}
              style={styles.inputIcon}
            />
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>معلومات التواصل</Text>
          <TextInput
            style={styles.input}
            value={formData.contactInfo}
            onChangeText={(value) => handleInputChange("contactInfo", value)}
            placeholder="رقم الهاتف أو وسيلة التواصل المفضلة"
            placeholderTextColor={COLORS.lightGray}
          />
        </View>

        {/* Price (for breeding) */}
        {formData.listingType === "breeding" && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>السعر (ريال)</Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(value) => handleInputChange("price", value)}
              placeholder="السعر المطلوب (اختياري)"
              placeholderTextColor={COLORS.lightGray}
              keyboardType="numeric"
            />
          </View>
        )}

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>الوصف *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => handleInputChange("description", value)}
            placeholder={
              formData.listingType === "adoption"
                ? "اكتب وصفاً مفصلاً عن الحيوان وسبب عرضه للتبني..."
                : "اكتب وصفاً مفصلاً عن الحيوان ومعلومات التزاوج..."
            }
            placeholderTextColor={COLORS.lightGray}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Special Requirements */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>متطلبات خاصة</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.specialRequirements}
            onChangeText={(value) =>
              handleInputChange("specialRequirements", value)
            }
            placeholder={
              formData.listingType === "adoption"
                ? "أي متطلبات خاصة للمتبني (اختياري)..."
                : "أي متطلبات خاصة للتزاوج (اختياري)..."
            }
            placeholderTextColor={COLORS.lightGray}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Notice */}
        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText}>
            📋 ملاحظة: سيتم مراجعة طلبك من قبل الإدارة قبل النشر. سيتم إشعارك
            عند الموافقة على الطلب.
          </Text>
        </View>

        {/* Submit Button */}
        <Button
          title={
            formData.listingType === "adoption"
              ? "إضافة للتبني"
              : "إضافة للتزاوج"
          }
          onPress={handleSubmit}
          type="primary"
          size="large"
          style={styles.submitButton}
          disabled={createApprovalMutation.isPending}
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
    textAlign: "right",
  },
  input: {
    backgroundColor: COLORS.white,
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
    height: 100,
    paddingTop: 12,
  },
  typeContainer: {
    flexDirection: "row",
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
  listingTypeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  listingTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: "center",
  },
  listingTypeButtonActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  listingTypeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  listingTypeButtonTextActive: {
    color: COLORS.white,
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
  submitButton: {
    marginTop: 24,
  },
  noticeContainer: {
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
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
