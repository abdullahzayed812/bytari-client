import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants/colors";
import { useI18n } from "../providers/I18nProvider";
import { useApp } from "../providers/AppProvider";
import Button from "../components/Button 2";
import {
  ArrowLeft,
  MapPin,
  Home,
  FileText,
  Users,
  Phone,
  Mail,
  FileCheck,
  Activity,
  Feather,
  Upload,
  X,
  Image as ImageIcon,
  Calendar,
  ShieldCheck,
  User,
} from "lucide-react-native";
import { trpc } from "../lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/providers/ToastProvider";
import { ImageGalleryUploader } from "../components/ImageGalleryUploader";

type FarmType = "broiler" | "layer" | "breeder" | "mixed";
type HealthStatus = "healthy" | "quarantine" | "sick";

export default function AddPoultryFarmScreen() {
  const { t, isRTL } = useI18n();
  const { user } = useApp();
  const router = useRouter();
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    farmType: "broiler" as FarmType,
    capacity: "",
    currentPopulation: "",
    establishedDate: "",
    licenseNumber: "",
    contactPerson: "",
    phone: "",
    email: "",
    facilities: "",
    healthStatus: "healthy" as HealthStatus,
    lastInspection: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    licenseImage: "",
    images: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Create farm mutation
  const createFarmMutation = useMutation(trpc.poultryFarms.create.mutationOptions());

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields from schema
    if (!formData.name.trim()) {
      newErrors.name = "اسم الحقل مطلوب";
    }

    if (!formData.location.trim()) {
      newErrors.location = "الموقع مطلوب";
    }

    if (!formData.farmType) {
      newErrors.farmType = "نوع المزرعة مطلوب";
    }

    // Optional validations
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح";
    }

    if (formData.capacity && (isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0)) {
      newErrors.capacity = "السعة يجب أن تكون رقم موجب";
    }

    if (
      formData.currentPopulation &&
      (isNaN(Number(formData.currentPopulation)) || Number(formData.currentPopulation) < 0)
    ) {
      newErrors.currentPopulation = "العدد الحالي يجب أن يكون رقم غير سالب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast({
        type: "error",
        message: "يرجى تصحيح الأخطاء في النموذج",
      });
      return;
    }

    if (!user?.id) {
      showToast({
        type: "error",
        message: "يجب تسجيل الدخول أولاً",
      });
      return;
    }

    try {
      // Parse facilities from comma-separated string to array
      let facilitiesJson = null;
      if (formData.facilities.trim()) {
        facilitiesJson = formData.facilities
          .split(",")
          .map((f) => f.trim())
          .filter((f) => f);
      }

      const farmData = {
        ownerId: Number(user.id),
        name: formData.name.trim(),
        location: formData.location.trim(),
        farmType: formData.farmType,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        currentPopulation: formData.currentPopulation ? parseInt(formData.currentPopulation) : undefined,
        establishedDate: formData.establishedDate || undefined,
        licenseNumber: formData.licenseNumber.trim() || undefined,
        contactPerson: formData.contactPerson.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        // facilities: facilitiesJson,
        healthStatus: formData.healthStatus,
        lastInspection: formData.lastInspection || undefined,
        // Additional fields for procedure
        description: formData.description.trim() || undefined,
        address: formData.address.trim() || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        licenseImage: formData.licenseImage || undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
      };

      createFarmMutation.mutate(farmData as any, {
        onSuccess: (data) => {
          showToast({
            type: "success",
            message: data.message || "تم إنشاء حقل الدواجن بنجاح",
          });
          router.navigate("(tabs)/pets");
          queryClient.invalidateQueries(trpc.poultryFarms.list.queryKey);
        },
        onError: (error: any) => {
          showToast({
            type: "error",
            message: error.message || "حدث خطأ أثناء إنشاء حقل الدواجن",
          });
        },
      });
    } catch (error) {
      console.error("Error creating farm:", error);
    }
  };

  const farmTypes = [
    { value: "broiler", label: "تسمين", icon: "🐔", description: "دجاج اللحم" },
    { value: "layer", label: "بياض", icon: "🥚", description: "إنتاج البيض" },
    {
      value: "breeder",
      label: "أمهات",
      icon: "🐣",
      description: "إنتاج الصيصان",
    },
    {
      value: "mixed",
      label: "مختلط",
      icon: "🏭",
      description: "متعدد الأغراض",
    },
  ];

  const healthStatuses = [
    { value: "healthy", label: "سليم", color: COLORS.success },
    { value: "quarantine", label: "حجر صحي", color: COLORS.warning },
    { value: "sick", label: "مريض", color: COLORS.error },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.black} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
        </TouchableOpacity>
        <Text style={styles.title}>إضافة حقل دواجن جديد</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Basic Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Feather size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Home size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>اسم حقل الدواجن *</Text>
              </View>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
                placeholder="مثال: مزرعة النور للدواجن"
                placeholderTextColor={COLORS.darkGray}
                textAlign={isRTL ? "right" : "left"}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <MapPin size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>الموقع *</Text>
              </View>
              <TextInput
                style={[styles.input, errors.location && styles.inputError]}
                value={formData.location}
                onChangeText={(value) => handleInputChange("location", value)}
                placeholder="مثال: بغداد - الدورة"
                placeholderTextColor={COLORS.darkGray}
                textAlign={isRTL ? "right" : "left"}
              />
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <FileText size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>الوصف</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange("description", value)}
                placeholder="وصف تفصيلي عن حقل الدواجن..."
                placeholderTextColor={COLORS.darkGray}
                textAlign={isRTL ? "right" : "left"}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <MapPin size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>العنوان التفصيلي</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(value) => handleInputChange("address", value)}
                placeholder="العنوان الكامل مع تفاصيل الوصول..."
                placeholderTextColor={COLORS.darkGray}
                textAlign={isRTL ? "right" : "left"}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <View style={styles.inputHeader}>
                  <MapPin size={20} color={COLORS.primary} />
                  <Text style={styles.inputLabel}>خط العرض</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={formData.latitude}
                  onChangeText={(value) => handleInputChange("latitude", value)}
                  placeholder="33.3152"
                  placeholderTextColor={COLORS.darkGray}
                  textAlign={isRTL ? "right" : "left"}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <View style={styles.inputHeader}>
                  <MapPin size={20} color={COLORS.primary} />
                  <Text style={styles.inputLabel}>خط الطول</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={formData.longitude}
                  onChangeText={(value) => handleInputChange("longitude", value)}
                  placeholder="44.3661"
                  placeholderTextColor={COLORS.darkGray}
                  textAlign={isRTL ? "right" : "left"}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          {/* Farm Type Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Activity size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>نوع الإنتاج *</Text>
            </View>

            <View style={styles.farmTypeGrid}>
              {farmTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.farmTypeCard, formData.farmType === type.value && styles.farmTypeCardSelected]}
                  onPress={() => handleInputChange("farmType", type.value)}
                >
                  <Text style={styles.farmTypeIcon}>{type.icon}</Text>
                  <Text
                    style={[styles.farmTypeLabel, formData.farmType === type.value && styles.farmTypeLabelSelected]}
                  >
                    {type.label}
                  </Text>
                  <Text
                    style={[
                      styles.farmTypeDescription,
                      formData.farmType === type.value && styles.farmTypeDescriptionSelected,
                    ]}
                  >
                    {type.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Capacity & Population Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>السعة والتعداد</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Users size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>السعة القصوى (عدد الطيور)</Text>
              </View>
              <TextInput
                style={[styles.input, errors.capacity && styles.inputError]}
                value={formData.capacity}
                onChangeText={(value) => handleInputChange("capacity", value)}
                placeholder="مثال: 10000"
                placeholderTextColor={COLORS.darkGray}
                textAlign={isRTL ? "right" : "left"}
                keyboardType="numeric"
              />
              {errors.capacity && <Text style={styles.errorText}>{errors.capacity}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Activity size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>التعداد الحالي (عدد الطيور)</Text>
              </View>
              <TextInput
                style={[styles.input, errors.currentPopulation && styles.inputError]}
                value={formData.currentPopulation}
                onChangeText={(value) => handleInputChange("currentPopulation", value)}
                placeholder="مثال: 8500"
                placeholderTextColor={COLORS.darkGray}
                textAlign={isRTL ? "right" : "left"}
                keyboardType="numeric"
              />
              {errors.currentPopulation && <Text style={styles.errorText}>{errors.currentPopulation}</Text>}
            </View>
          </View>

          {/* Contact Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Phone size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>معلومات التواصل</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <User size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>اسم الشخص المسؤول</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.contactPerson}
                onChangeText={(value) => handleInputChange("contactPerson", value)}
                placeholder="اسم المسؤول عن الحقل"
                placeholderTextColor={COLORS.darkGray}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Phone size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>رقم الهاتف</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleInputChange("phone", value)}
                placeholder="07XXXXXXXXX"
                placeholderTextColor={COLORS.darkGray}
                textAlign={isRTL ? "right" : "left"}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Mail size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
              </View>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(value) => handleInputChange("email", value)}
                placeholder="example@farm.com"
                placeholderTextColor={COLORS.darkGray}
                textAlign={isRTL ? "right" : "left"}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
          </View>

          {/* Dates Section */}
          {/* <View style={styles.section}> */}
          {/* <View style={styles.sectionHeader}>
              <Calendar size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>التواريخ المهمة</Text>
            </View> */}

          {/* Established Date Input */}
          {/* <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Calendar size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>تاريخ التأسيس</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.establishedDate}
                onChangeText={(value) => handleInputChange("establishedDate", value)}
                placeholder="أدخل تاريخ التأسيس"
                placeholderTextColor={COLORS.darkGray}
                textAlign="right"
              />
            </View> */}

          {/* Last Inspection Date Input */}
          {/* <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Calendar size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>تاريخ آخر فحص</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.lastInspection}
                onChangeText={(value) => handleInputChange("lastInspection", value)}
                placeholder="أدخل تاريخ آخر فحص"
                placeholderTextColor={COLORS.darkGray}
                textAlign="right"
              />
            </View> */}

          {/* License Number */}
          {/* <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <FileCheck size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>رقم الترخيص</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.licenseNumber}
                onChangeText={(value) => handleInputChange("licenseNumber", value)}
                placeholder="أدخل رقم الترخيص"
                placeholderTextColor={COLORS.darkGray}
                textAlign="right"
              />
            </View> */}
          {/* </View> */}

          {/* Health & Facilities Section */}
          {/* <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ShieldCheck size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>الصحة والمرافق</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Activity size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>الحالة الصحية</Text>
              </View>
              <View style={styles.optionsContainer}>
                {healthStatuses.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.optionButton,
                      formData.healthStatus === status.value && [
                        styles.optionButtonSelected,
                        { backgroundColor: status.color },
                      ],
                    ]}
                    onPress={() => handleInputChange("healthStatus", status.value)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        formData.healthStatus === status.value && styles.optionButtonTextSelected,
                      ]}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Home size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>المرافق المتوفرة</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.facilities}
                onChangeText={(value) => handleInputChange("facilities", value)}
                placeholder="مثال: عنبر تسمين, مخزن أعلاف, نظام تهوية, نظام سقي أوتوماتيكي"
                placeholderTextColor={COLORS.darkGray}
                textAlign={isRTL ? "right" : "left"}
                multiline
                numberOfLines={4}
              />
              <Text style={styles.helperText}>افصل المرافق بفواصل (,)</Text>
            </View>
          </View> */}

          {/* License Section */}
          {/* <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileCheck size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>معلومات الترخيص</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <FileCheck size={20} color={COLORS.primary} />
                <Text style={styles.inputLabel}>رقم الترخيص</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.licenseNumber}
                onChangeText={(value) => handleInputChange("licenseNumber", value)}
                placeholder="أدخل رقم الترخيص"
                placeholderTextColor={COLORS.darkGray}
                textAlign={isRTL ? "right" : "left"}
              />
            </View>

            <View style={styles.inputGroup}>
              <ImageGalleryUploader
                images={formData.licenseImage ? [formData.licenseImage] : []}
                onImagesChange={(images) => setFormData((prev) => ({ ...prev, licenseImage: images[0] || "" }))}
                maxImages={1}
                label="صورة الترخيص"
                aspect={[4, 3]}
              />
            </View>
          </View> */}

          {/* Images Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ImageIcon size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>صور الحقل (حتى 5 صور)</Text>
            </View>

            <ImageGalleryUploader
              images={formData.images}
              onImagesChange={(images) => setFormData((prev) => ({ ...prev, images }))}
              maxImages={5}
              label="صور الحقل"
              aspect={[4, 3]}
            />
          </View>

          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>* الحقول المطلوبة: اسم الحقل، الموقع، ونوع الإنتاج</Text>
            <Text style={styles.noteText}>سيتم مراجعة الحقل من قبل الإدارة قبل التفعيل</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="إنشاء حقل الدواجن"
          onPress={handleSubmit}
          type="primary"
          size="large"
          loading={createFarmMutation.isPending}
          disabled={createFarmMutation.isPending}
          style={styles.submitButton}
          icon={<Feather size={20} color={COLORS.white} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
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
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
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
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.black,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  inputHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.black,
  },
  input: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginTop: 4,
    textAlign: "right",
    fontStyle: "italic",
  },
  dateButton: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateButtonText: {
    fontSize: 16,
    color: COLORS.black,
  },
  farmTypeGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 12,
  },
  farmTypeCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  farmTypeCardSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: COLORS.primary,
  },
  farmTypeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  farmTypeLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 4,
  },
  farmTypeLabelSelected: {
    color: COLORS.primary,
  },
  farmTypeDescription: {
    fontSize: 12,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  farmTypeDescriptionSelected: {
    color: COLORS.primary,
  },
  optionsContainer: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  optionButtonSelected: {
    borderColor: "transparent",
  },
  optionButtonText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: "500",
  },
  optionButtonTextSelected: {
    color: COLORS.white,
    fontWeight: "600",
  },
  uploadButton: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 8,
    fontWeight: "600",
  },
  licenseImageContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
  },
  licenseImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.error,
    borderRadius: 20,
    padding: 6,
  },
  imagesGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 12,
  },
  imageContainer: {
    width: "30%",
    aspectRatio: 1,
    position: "relative",
  },
  farmImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButtonSmall: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    padding: 4,
  },
  addImageButton: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addImageText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: "600",
  },
  noteContainer: {
    backgroundColor: "#FFF9E6",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    marginTop: 8,
    gap: 4,
  },
  noteText: {
    fontSize: 13,
    color: "#856404",
    textAlign: "right",
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  submitButton: {
    width: "100%",
  },
});
