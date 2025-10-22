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
import { trpc } from "@/lib/trpc";

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
}

export default function AddCourseScreen() {
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
  });

  const createCourseMutation = useMutation(
    trpc.courses.create.mutationOptions({
      onSuccess: () => {
        Alert.alert("تم الحفظ", "تم إضافة الدورة بنجاح", [{ text: "موافق", onPress: () => router.back() }]);
      },
      onError: () => {
        Alert.alert("خطأ", "حدث خطأ أثناء حفظ الدورة");
      },
    })
  );

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert("خطأ", "يرجى إدخال عنوان الدورة");
      return;
    }
    if (!formData.organizer.trim()) {
      Alert.alert("خطأ", "يرجى إدخال اسم المنظم");
      return;
    }
    if (!formData.date.trim()) {
      Alert.alert("خطأ", "يرجى إدخال تاريخ الدورة");
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert("خطأ", "يرجى إدخال مكان الدورة");
      return;
    }
    if (!formData.duration.trim()) {
      Alert.alert("خطأ", "يرجى إدخال مدة الدورة");
      return;
    }
    if (!formData.capacity.trim() || isNaN(Number(formData.capacity))) {
      Alert.alert("خطأ", "يرجى إدخال عدد المقاعد المتاحة (رقم صحيح)");
      return;
    }
    if (!formData.price.trim()) {
      Alert.alert("خطأ", "يرجى إدخال سعر الدورة");
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert("خطأ", "يرجى إدخال وصف الدورة");
      return;
    }
    if (formData.registrationType === "link" && !formData.courseUrl.trim()) {
      Alert.alert("خطأ", "يرجى إدخال رابط التسجيل");
      return;
    }

    try {
      await createCourseMutation.mutateAsync(formData);
    } catch (error) {
      // Error is already handled in onError
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
          <Text style={styles.headerTitle}>إضافة دورة جديدة</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isLoading}>
            <Save size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Course Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نوع الفعالية</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeOption, formData.type === "course" && styles.selectedTypeOption]}
                onPress={() => updateFormData("type", "course")}
              >
                <BookOpen size={20} color={formData.type === "course" ? COLORS.white : COLORS.primary} />
                <Text style={[styles.typeOptionText, formData.type === "course" && styles.selectedTypeOptionText]}>
                  دورة تدريبية
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOption, formData.type === "seminar" && styles.selectedTypeOption]}
                onPress={() => updateFormData("type", "seminar")}
              >
                <GraduationCap size={20} color={formData.type === "seminar" ? COLORS.white : COLORS.primary} />
                <Text style={[styles.typeOptionText, formData.type === "seminar" && styles.selectedTypeOptionText]}>
                  ندوة علمية
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المعلومات الأساسية</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>عنوان الدورة *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.title}
                onChangeText={(text) => updateFormData("title", text)}
                placeholder="أدخل عنوان الدورة"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>المنظم *</Text>
              <View style={styles.inputWithIcon}>
                <Building size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.textInputWithIcon}
                  value={formData.organizer}
                  onChangeText={(text) => updateFormData("organizer", text)}
                  placeholder="اسم الجهة المنظمة"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>التاريخ *</Text>
              <View style={styles.inputWithIcon}>
                <Calendar size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.textInputWithIcon}
                  value={formData.date}
                  onChangeText={(text) => updateFormData("date", text)}
                  placeholder="مثال: 15 أغسطس 2024"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>المكان *</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.textInputWithIcon}
                  value={formData.location}
                  onChangeText={(text) => updateFormData("location", text)}
                  placeholder="مكان انعقاد الدورة"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>المدة *</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.textInputWithIcon}
                  value={formData.duration}
                  onChangeText={(text) => updateFormData("duration", text)}
                  placeholder="مثال: 3 أيام أو يوم واحد"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>عدد المقاعد المتاحة *</Text>
              <View style={styles.inputWithIcon}>
                <Users size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.textInputWithIcon}
                  value={formData.capacity}
                  onChangeText={(text) => updateFormData("capacity", text)}
                  placeholder="عدد المشاركين المسموح"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>السعر *</Text>
              <View style={styles.inputWithIcon}>
                <DollarSign size={20} color={COLORS.darkGray} />
                <TextInput
                  style={styles.textInputWithIcon}
                  value={formData.price}
                  onChangeText={(text) => updateFormData("price", text)}
                  placeholder="مثال: 1500 ريال أو مجاني"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>الوصف *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => updateFormData("description", text)}
                placeholder="وصف مفصل عن محتوى الدورة وأهدافها"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Registration Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>إعدادات التسجيل</Text>

            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>نوع التسجيل</Text>
                <Text style={styles.switchDescription}>
                  {formData.registrationType === "internal"
                    ? "التسجيل داخل التطبيق - سيتم إرسال طلبات التسجيل إلى الإدارة"
                    : "التسجيل عبر رابط خارجي - سيتم توجيه المستخدمين إلى رابط التسجيل"}
                </Text>
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchOptionText}>داخلي</Text>
                <Switch
                  value={formData.registrationType === "link"}
                  onValueChange={(value) => updateFormData("registrationType", value ? "link" : "internal")}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
                <Text style={styles.switchOptionText}>رابط خارجي</Text>
              </View>
            </View>

            {formData.registrationType === "link" && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>رابط التسجيل *</Text>
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
                <Text style={styles.switchLabel}>حالة الدورة</Text>
                <Text style={styles.switchDescription}>
                  {formData.status === "active" ? "الدورة نشطة ومتاحة للتسجيل" : "الدورة غير نشطة ولا تظهر للمستخدمين"}
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
            <Text style={styles.saveButtonText}>{createCourseMutation.isPending ? "جاري الحفظ..." : "حفظ الدورة"}</Text>
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
    flexDirection: "row",
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
    flexDirection: "row",
    gap: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: "row",
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
    flexDirection: "row",
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
    flexDirection: "row",
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
