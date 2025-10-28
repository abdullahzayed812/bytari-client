import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, MapPin, Phone, Mail, Clock, Camera, Upload, Building, Stethoscope } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "../lib/trpc";
import Button from "../components/Button";

export default function ClinicRegistration() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    workingHours: "",
    services: "",
    description: "",
    licenseNumber: "",
    licenseImage: "",
    clinicImages: [] as string[],
  });

  const mutation = useMutation(trpc.clinics.create.mutationOptions());

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert("خطأ", "يرجى إدخال اسم العيادة");
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert("خطأ", "يرجى إدخال عنوان العيادة");
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert("خطأ", "يرجى إدخال رقم الهاتف");
      return;
    }
    if (!formData.licenseNumber.trim()) {
      Alert.alert("خطأ", "يرجى إدخال رقم الترخيص");
      return;
    }
    // Mock values for now to match the mutation input requirements
    mutation.mutate(
      {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email || undefined,
        description: formData.description || "",

        licenseNumber: formData.licenseNumber,
        licenseImages: formData.licenseImage ? [formData.licenseImage] : [],
        identityImages: [], // TODO: Add identity images upload field

        latitude: 0,
        longitude: 0,
        workingHours: "",
        services: [],
        images: [],
        officialDocuments: [],
      },
      {
        onSuccess: (data: any) => {
          Alert.alert("نجاح", data.message || "تم إرسال الطلب بنجاح");
          router.back();
        },
        onError: (error) => {
          Alert.alert("خطأ", error.message || "حدث خطأ أثناء إرسال الطلب");
        },
      }
    );
  };

  const handleImageUpload = (type: "license" | "clinic") => {
    // Mock image upload - in real app, use image picker
    const mockImageUrl =
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";

    if (type === "license") {
      setFormData((prev) => ({ ...prev, licenseImage: mockImageUrl }));
    } else {
      setFormData((prev) => ({
        ...prev,
        clinicImages: [...prev.clinicImages, mockImageUrl],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      clinicImages: prev.clinicImages.filter((_, i) => i !== index),
    }));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تسجيل عيادة جديدة</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Building size={24} color={COLORS.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>تسجيل عيادة بيطرية</Text>
              <Text style={styles.infoText}>
                املأ البيانات المطلوبة لتسجيل عيادتك البيطرية. سيتم مراجعة الطلب من قبل الإدارة والموافقة عليه خلال
                24-48 ساعة.
              </Text>
            </View>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>اسم العيادة *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                placeholder="أدخل اسم العيادة"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>العنوان *</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color={COLORS.darkGray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.textInputWithIcon]}
                  value={formData.address}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, address: text }))}
                  placeholder="أدخل عنوان العيادة"
                  placeholderTextColor={COLORS.darkGray}
                  multiline
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>رقم الهاتف *</Text>
              <View style={styles.inputWithIcon}>
                <Phone size={20} color={COLORS.darkGray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.textInputWithIcon]}
                  value={formData.phone}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
                  placeholder="+964 770 123 4567"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
              <View style={styles.inputWithIcon}>
                <Mail size={20} color={COLORS.darkGray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.textInputWithIcon]}
                  value={formData.email}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
                  placeholder="clinic@example.com"
                  placeholderTextColor={COLORS.darkGray}
                  keyboardType="email-address"
                />
              </View>
            </View>
          </View>

          {/* Working Hours & Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ساعات العمل والخدمات</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ساعات العمل</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={20} color={COLORS.darkGray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.textInputWithIcon]}
                  value={formData.workingHours}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, workingHours: text }))}
                  placeholder="مثال: 8:00 ص - 10:00 م"
                  placeholderTextColor={COLORS.darkGray}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>الخدمات المتوفرة</Text>
              <View style={styles.inputWithIcon}>
                <Stethoscope size={20} color={COLORS.darkGray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.textInputWithIcon]}
                  value={formData.services}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, services: text }))}
                  placeholder="فحص عام، تطعيمات، جراحة، أشعة (افصل بفاصلة)"
                  placeholderTextColor={COLORS.darkGray}
                  multiline
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>وصف العيادة</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
                placeholder="اكتب وصفاً مختصراً عن العيادة وخدماتها"
                placeholderTextColor={COLORS.darkGray}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* License Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>معلومات الترخيص</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>رقم الترخيص *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.licenseNumber}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, licenseNumber: text }))}
                placeholder="أدخل رقم ترخيص العيادة"
                placeholderTextColor={COLORS.darkGray}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>صورة الترخيص</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={() => handleImageUpload("license")}>
                <Upload size={20} color={COLORS.primary} />
                <Text style={styles.uploadButtonText}>رفع صورة الترخيص</Text>
              </TouchableOpacity>

              {formData.licenseImage && (
                <View style={styles.uploadedImageContainer}>
                  <Image source={{ uri: formData.licenseImage }} style={styles.uploadedImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setFormData((prev) => ({ ...prev, licenseImage: "" }))}
                  >
                    <Text style={styles.removeImageText}>إزالة</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Clinic Images */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>صور العيادة</Text>

            <TouchableOpacity style={styles.uploadButton} onPress={() => handleImageUpload("clinic")}>
              <Camera size={20} color={COLORS.primary} />
              <Text style={styles.uploadButtonText}>إضافة صور العيادة</Text>
            </TouchableOpacity>

            {formData.clinicImages.length > 0 && (
              <View style={styles.imagesGrid}>
                {formData.clinicImages.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={styles.clinicImage} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                      <Text style={styles.removeImageText}>إزالة</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <Button
              title={mutation.isPending ? "جاري الإرسال..." : "إرسال طلب التسجيل"}
              onPress={handleSubmit}
              type="primary"
              size="large"
              disabled={mutation.isPending}
              style={styles.submitButton}
            />

            <Text style={styles.noteText}>* الحقول المطلوبة</Text>
            <Text style={styles.noteText}>سيتم مراجعة طلبك خلال 24-48 ساعة وإشعارك بالنتيجة</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    flexDirection: "row-reverse",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "right",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
    textAlign: "right",
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    textAlign: "right",
    backgroundColor: COLORS.white,
  },
  inputWithIcon: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  textInputWithIcon: {
    flex: 1,
    borderWidth: 0,
    paddingRight: 12,
    paddingLeft: 40,
  },
  inputIcon: {
    position: "absolute",
    left: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  uploadButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },
  uploadedImageContainer: {
    marginTop: 12,
    alignItems: "center",
  },
  uploadedImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  removeImageButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeImageText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  imageContainer: {
    alignItems: "center",
  },
  clinicImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
    marginBottom: 6,
  },
  submitSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  submitButton: {
    marginBottom: 16,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 4,
  },
});
