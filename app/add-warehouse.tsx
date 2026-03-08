import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { ArrowLeft, Upload, MapPin, Clock, Phone, Mail, FileText, Camera } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { COLORS } from "@/constants/colors";
import { useI18n } from "@/providers/I18nProvider";

interface WarehouseFormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  latitude?: number;
  longitude?: number;
  workingHours: string;
  licenseNumber: string;
  licenseImages: string[];
  identityImages: string[];
  officialDocuments: string[];
  images: string[];
}

export default function AddWarehousePage() {
  const { t } = useI18n();
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    workingHours: "",
    licenseNumber: "",
    licenseImages: [],
    identityImages: [],
    officialDocuments: [],
    images: [],
  });

  const createWarehouseMutation = useMutation(trpc.warehouses.create.mutationOptions());

  const handleInputChange = (field: keyof WarehouseFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (type: "licenseImages" | "identityImages" | "officialDocuments" | "images") => {
    // Mock image upload - in production, implement actual image picker
    const mockImageUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], mockImageUrl],
    }));
    Alert.alert(t("common.success"), t("addWarehouse.uploadSuccess"));
  };

  const removeImage = (type: "licenseImages" | "identityImages" | "officialDocuments" | "images", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert(t("common.error"), t("addWarehouse.nameRequiredError"));
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert(t("common.error"), t("addWarehouse.addressRequiredError"));
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert(t("common.error"), t("addWarehouse.phoneRequiredError"));
      return;
    }
    if (!formData.licenseNumber.trim()) {
      Alert.alert(t("common.error"), t("addWarehouse.licenseNumRequiredError"));
      return;
    }
    if (formData.licenseImages.length === 0) {
      Alert.alert(t("common.error"), t("addWarehouse.licenseImagesRequiredError"));
      return;
    }
    if (formData.identityImages.length === 0) {
      Alert.alert(t("common.error"), t("addWarehouse.identityImagesRequiredError"));
      return;
    }

    createWarehouseMutation.mutate(formData, {
      onSuccess: (data) => {
        console.log("Warehouse registration successful:", data);
        Alert.alert("تم بنجاح", data.message, [
          {
            text: "موافق",
            onPress: () => router.back(),
          },
        ]);
      },
      onError: (error) => {
        console.error("Warehouse registration error:", error);
        Alert.alert(t("common.error"), error.message || t("addWarehouse.registerError"));
      },
    });
  };

  const renderImageSection = (
    title: string,
    type: "licenseImages" | "identityImages" | "officialDocuments" | "images",
    required: boolean = false
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title} {required && <Text style={styles.required}>*</Text>}
      </Text>

      <TouchableOpacity style={styles.uploadButton} onPress={() => handleImageUpload(type)}>
        <Upload size={20} color={COLORS.primary} />
        <Text style={styles.uploadButtonText}>{t("addWarehouse.uploadImage")}</Text>
      </TouchableOpacity>

      {formData[type].length > 0 && (
        <View style={styles.imageGrid}>
          {formData[type].map((imageUrl, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: imageUrl }} style={styles.uploadedImage} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(type, index)}>
                <Text style={styles.removeImageText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: t("addWarehouse.screenTitle"),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.description}>
            {t("addWarehouse.description")}
          </Text>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("addWarehouse.basicInfo")} <Text style={styles.required}>*</Text>
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addWarehouse.nameRequired")}</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
                placeholder={t("addWarehouse.enterName")}
                placeholderTextColor={COLORS.gray}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("common.description")}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange("description", value)}
                placeholder={t("addWarehouse.enterDesc")}
                placeholderTextColor={COLORS.gray}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("addWarehouse.contactInfo")} <Text style={styles.required}>*</Text>
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addWarehouse.addressRequired")}</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color={COLORS.gray} />
                <TextInput
                  style={styles.inputWithIconText}
                  value={formData.address}
                  onChangeText={(value) => handleInputChange("address", value)}
                  placeholder={t("addWarehouse.enterAddress")}
                  placeholderTextColor={COLORS.gray}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addWarehouse.phoneRequired")}</Text>
              <View style={styles.inputWithIcon}>
                <Phone size={20} color={COLORS.gray} />
                <TextInput
                  style={styles.inputWithIconText}
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange("phone", value)}
                  placeholder={t("addWarehouse.phoneLabel")}
                  placeholderTextColor={COLORS.gray}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addWarehouse.emailLabel")}</Text>
              <View style={styles.inputWithIcon}>
                <Mail size={20} color={COLORS.gray} />
                <TextInput
                  style={styles.inputWithIconText}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  placeholder={t("addWarehouse.emailLabel")}
                  placeholderTextColor={COLORS.gray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addWarehouse.workingHours")}</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={20} color={COLORS.gray} />
                <TextInput
                  style={styles.inputWithIconText}
                  value={formData.workingHours}
                  onChangeText={(value) => handleInputChange("workingHours", value)}
                  placeholder={t("addWarehouse.workingHoursExample")}
                  placeholderTextColor={COLORS.gray}
                />
              </View>
            </View>
          </View>

          {/* License Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("addWarehouse.licenseInfo")} <Text style={styles.required}>*</Text>
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("addWarehouse.licenseNumberRequired")}</Text>
              <View style={styles.inputWithIcon}>
                <FileText size={20} color={COLORS.gray} />
                <TextInput
                  style={styles.inputWithIconText}
                  value={formData.licenseNumber}
                  onChangeText={(value) => handleInputChange("licenseNumber", value)}
                  placeholder={t("addWarehouse.licenseNumberPlaceholder")}
                  placeholderTextColor={COLORS.gray}
                />
              </View>
            </View>
          </View>

          {/* Document Uploads */}
          {renderImageSection(t("addWarehouse.licenseImages"), "licenseImages", true)}
          {renderImageSection(t("addWarehouse.identityImages"), "identityImages", true)}
          {renderImageSection(t("addWarehouse.officialDocs"), "officialDocuments")}
          {renderImageSection(t("addWarehouse.warehouseImages"), "images")}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, createWarehouseMutation.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={createWarehouseMutation.isPending}
          >
            <Text style={styles.submitButtonText}>
              {createWarehouseMutation.isPending ? t("common.sending") : t("addWarehouse.submit")}
            </Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            {t("addWarehouse.note")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 15,
  },
  required: {
    color: COLORS.error,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
  },
  inputWithIconText: {
    flex: 1,
    padding: 15,
    paddingLeft: 10,
    fontSize: 16,
    color: COLORS.black,
  },
  uploadButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    backgroundColor: COLORS.white,
  },
  uploadButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },
  imageGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    marginTop: 15,
    gap: 10,
  },
  imageContainer: {
    position: "relative",
    width: 100,
    height: 100,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  note: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
  },
});
