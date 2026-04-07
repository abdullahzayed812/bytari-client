import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Switch,
} from "react-native";
import {
  ArrowLeft,
  Save,
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  BookOpen,
  GraduationCap,
  ExternalLink,
  Building,
} from "lucide-react-native";
import { useRouter, Stack } from "expo-router";
import { COLORS } from "../constants/colors";
import { useMutation } from "@tanstack/react-query";
import { ImageUploader } from "@/components/ImageUploader";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/providers/I18nProvider";

interface CourseFormData {
  title: string;
  organizer: string;
  date: string;
  location: string;
  type: "course" | "seminar";
  duration: string;
  capacity: string;
  price: string;
  description: string;
  courseUrl: string;
  registrationType: "link" | "internal";
  status: "active" | "inactive";
  thumbnailImage?: string;
}

export default function AddCourseScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    organizer: "",
    date: "",
    location: "",
    type: "course",
    duration: "",
    capacity: "",
    price: "",
    description: "",
    courseUrl: "",
    registrationType: "internal",
    status: "active",
    thumbnailImage: "",
  });

  const createCourseMutation = useMutation(
    trpc.courses.create.mutationOptions({
      onSuccess: () => {
        Alert.alert(t("common.success"), t("addCourse.addSuccess"), [
          { text: t("common.ok"), onPress: () => router.back() },
        ]);
      },
      onError: () => {
        Alert.alert(t("common.error"), t("addCourse.saveError"));
      },
    }),
  );

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert(t("common.error"), t("addCourse.enterTitle"));
      return;
    }
    if (!formData.organizer.trim()) {
      Alert.alert(t("common.error"), t("addCourse.enterOrganizerError"));
      return;
    }
    if (!formData.date.trim()) {
      Alert.alert(t("common.error"), t("addCourse.enterDateError"));
      return;
    }
    if (!formData?.thumbnailImage?.trim()) {
      Alert.alert(t("common.error"), t("addCourse.enterThumbnailError"));
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert(t("common.error"), t("addCourse.enterLocationError"));
      return;
    }
    if (!formData.duration.trim()) {
      Alert.alert(t("common.error"), t("addCourse.enterDurationError"));
      return;
    }
    if (!formData.capacity.trim() || isNaN(Number(formData.capacity))) {
      Alert.alert(t("common.error"), t("addCourse.enterCapacityError"));
      return;
    }
    if (!formData.price.trim()) {
      Alert.alert(t("common.error"), t("addCourse.enterPriceError"));
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert(t("common.error"), t("addCourse.enterDescError"));
      return;
    }
    if (formData.registrationType === "link") {
      if (!formData.courseUrl.trim()) {
        Alert.alert(t("common.error"), t("addCourse.enterRegLinkError"));
        return;
      }

      // Strict URL validation
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(formData.courseUrl.trim())) {
        Alert.alert(t("common.error"), t("addCourse.invalidUrlError"));
        return;
      }
    }

    try {
      await createCourseMutation.mutateAsync(formData);
    } catch (error) {
      // Error is already handled in onError
      console.error("Mutation error:", error);
    }
  };

  const updateFormData = (field: keyof CourseFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("addCourse.title")}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Save size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Uploader */}
          <ImageUploader
            imageUri={formData.thumbnailImage}
            onUploadComplete={(url) => updateFormData("thumbnailImage", url)}
            label={t("addCourse.thumbnail")}
            containerStyle={{ marginBottom: 16 }}
            aspect={[16, 9]}
            imageStyle={{ width: "100%", height: 180, borderRadius: 12 }}
          />

          {/* Course Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("addCourse.eventType")}</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeOption, formData.type === "course" && styles.selectedTypeOption]}
                onPress={() => updateFormData("type", "course")}
              >
                <BookOpen size={20} color={formData.type === "course" ? COLORS.white : COLORS.primary} />
                <Text style={[styles.typeOptionText, formData.type === "course" && styles.selectedTypeOptionText]}>
                  {t("addCourse.trainingCourse")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOption, formData.type === "seminar" && styles.selectedTypeOption]}
                onPress={() => updateFormData("type", "seminar")}
              >
                <GraduationCap size={20} color={formData.type === "seminar" ? COLORS.white : COLORS.primary} />
                <Text style={[styles.typeOptionText, formData.type === "seminar" && styles.selectedTypeOptionText]}>
                  {t("addCourse.seminar")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("addCourse.basicInfo")}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("addCourse.courseTitle")}</Text>
              <TextInput
                style={styles.textInput}
                value={formData.title}
                onChangeText={(text) => updateFormData("title", text)}
                placeholder={t("addCourse.enterTitle")}
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("addCourse.organizer")}</Text>
              <View style={styles.inputWithIcon}>
                <Building size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.textInputWithIcon}
                  value={formData.organizer}
                  onChangeText={(text) => updateFormData("organizer", text)}
                  placeholder={t("addCourse.enterOrganizer")}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("addCourse.dateRequired")}</Text>
              <View style={styles.inputWithIcon}>
                <Calendar size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.textInputWithIcon}
                  value={formData.date}
                  onChangeText={(text) => updateFormData("date", text)}
                  placeholder={t("addCourse.dateExample")}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("addCourse.locationRequired")}</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.textInputWithIcon}
                  value={formData.location}
                  onChangeText={(text) => updateFormData("location", text)}
                  placeholder={t("addCourse.enterLocation")}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("addCourse.durationRequired")}</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.textInputWithIcon}
                  value={formData.duration}
                  onChangeText={(text) => updateFormData("duration", text)}
                  placeholder={t("addCourse.durationExample")}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("addCourse.capacityRequired")}</Text>
              <View style={styles.inputWithIcon}>
                <Users size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.textInputWithIcon}
                  value={formData.capacity}
                  onChangeText={(text) => updateFormData("capacity", text)}
                  placeholder={t("addCourse.enterCapacity")}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("addCourse.priceRequired")}</Text>
              <View style={styles.inputWithIcon}>
                <DollarSign size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.textInputWithIcon}
                  value={formData.price}
                  onChangeText={(text) => updateFormData("price", text)}
                  placeholder={t("addCourse.priceExample")}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("addCourse.descRequired")}</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => updateFormData("description", text)}
                placeholder={t("addCourse.enterDesc")}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Registration Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("addCourse.registrationSettings")}</Text>

            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>{t("addCourse.regType")}</Text>
                <Text style={styles.switchDescription}>
                  {formData.registrationType === "internal"
                    ? t("addCourse.internalRegDesc")
                    : t("addCourse.linkRegDesc")}
                </Text>
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchOptionText}>{t("addCourse.internal")}</Text>
                <Switch
                  value={formData.registrationType === "link"}
                  onValueChange={(value) => updateFormData("registrationType", value ? "link" : "internal")}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
                <Text style={styles.switchOptionText}>{t("addCourse.externalLink")}</Text>
              </View>
            </View>

            {formData.registrationType === "link" && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("addCourse.regLink")}</Text>
                <View style={styles.inputWithIcon}>
                  <ExternalLink size={20} color={COLORS.darkGray} />
                  <TextInput
                    style={styles.textInputWithIcon}
                    value={formData.courseUrl}
                    onChangeText={(text) => updateFormData("courseUrl", text)}
                    placeholder="https://example.com/register"
                    keyboardType="url"
                  />
                </View>
              </View>
            )}

            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>{t("addCourse.courseStatus")}</Text>
                <Text style={styles.switchDescription}>
                  {formData.status === "active" ? t("addCourse.activeDesc") : t("addCourse.inactiveDesc")}
                </Text>
              </View>
              <Switch
                value={formData.status === "active"}
                onValueChange={(value) => updateFormData("status", value ? "active" : "inactive")}
                trackColor={{ false: COLORS.lightGray, true: COLORS.success }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButtonLarge, createCourseMutation.isPending && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={createCourseMutation.isPending}
          >
            <Save size={20} color={COLORS.white} />
            <Text style={styles.saveButtonText}>
              {createCourseMutation.isPending ? t("common.loading") : t("addCourse.saveCourse")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    flex: 1,
  },
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
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
  },
  typeSelector: {
    flexDirection: "row-reverse",
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  selectedTypeOption: {
    backgroundColor: COLORS.primary,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  selectedTypeOptionText: {
    color: COLORS.white,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  textInput: {
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
    minHeight: 100,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    gap: 12,
  },
  textInputWithIcon: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
  },
  switchContainer: {
    marginBottom: 16,
  },
  switchInfo: {
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  switchRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  switchOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkGray,
  },
  saveButtonLarge: {
    backgroundColor: COLORS.primary,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 32,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.lightGray,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
  },
});
