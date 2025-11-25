import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, Briefcase, MapPin, DollarSign, Clock, FileText } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useApp } from "../providers/AppProvider";

// Job type options
const JOB_TYPES = [
  { value: "full-time", label: "دوام كامل" },
  { value: "part-time", label: "دوام جزئي" },
  { value: "contract", label: "عقد" },
  { value: "internship", label: "تدريب" },
];

export default function PostJobVacancyScreen() {
  const { user } = useApp();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Initial form data with sample values
  const [formData, setFormData] = useState({
    title: "طبيب بيطري - عيادة الحيوانات الأليفة",
    company: "عيادة الرحمة البيطرية",
    location: "بغداد، العراق",
    type: "full-time", // Changed to match enum
    salary: "800000 - 1200000 دينار",
    description:
      "نبحث عن طبيب بيطري مؤهل وذو خبرة للانضمام إلى فريقنا في عيادة الرحمة البيطرية. المسؤوليات تشمل فحص وعلاج الحيوانات الأليفة، إجراء العمليات الجراحية البسيطة، وتقديم الاستشارات الطبية لأصحاب الحيوانات.",
    requirements:
      "شهادة بكالوريوس في الطب البيطري، خبرة لا تقل عن سنتين في مجال العيادات البيطرية، مهارات تواصل جيدة، القدرة على التعامل مع الحيوانات بلطف ومهنية",
    contactEmail: "info@alrahma-vet.com",
    contactPhone: "07701234567",
  });

  const [selectedJobType, setSelectedJobType] = useState<string>("full-time");

  const createJobMutation = useMutation(trpc.admin.jobs.createJob.mutationOptions());

  const handleSubmit = () => {
    // Validation
    if (
      !formData.title.trim() ||
      !formData.company.trim() ||
      !formData.location.trim() ||
      !formData.description.trim()
    ) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة (المعلمة بـ *)");
      return;
    }

    if (!selectedJobType) {
      Alert.alert("خطأ", "يرجى اختيار نوع الوظيفة");
      return;
    }

    // Validate email format if provided
    if (formData.contactEmail && !isValidEmail(formData.contactEmail)) {
      Alert.alert("خطأ", "يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    // Validate phone format if provided
    if (formData.contactPhone && !isValidPhone(formData.contactPhone)) {
      Alert.alert("خطأ", "يرجى إدخال رقم هاتف صحيح");
      return;
    }

    // Build contact info string
    const contactParts = [];
    if (formData.contactEmail) {
      contactParts.push(`البريد: ${formData.contactEmail}`);
    }
    if (formData.contactPhone) {
      contactParts.push(`الهاتف: ${formData.contactPhone}`);
    }
    const contactInfo = contactParts.length > 0 ? contactParts.join(" | ") : "للتواصل: يرجى التواصل عبر المنصة";

    createJobMutation.mutate(
      {
        adminId: user?.id ? Number(user.id) : 1,
        title: formData.title.trim(),
        postedBy: formData.company.trim(),
        location: formData.location.trim(),
        jobType: selectedJobType as "full-time" | "part-time" | "contract" | "internship",
        salary: formData.salary.trim() || undefined,
        description: formData.description.trim(),
        requirements: formData.requirements.trim() || "لا توجد متطلبات محددة",
        contactInfo: contactInfo,
      } as any,
      {
        onSuccess: (data) => {
          // Invalidate jobs queries to refresh the list
          queryClient.invalidateQueries(trpc.admin.jobs.getAllJobs.queryKey);

          // Show success message
          Alert.alert("نجح الإرسال", "تم إرسال إعلان الوظيفة بنجاح وسيظهر في قائمة الوظائف المتاحة", [
            {
              text: "موافق",
              onPress: () => {
                // Reset form
                setFormData({
                  title: "",
                  company: "",
                  location: "",
                  type: "",
                  salary: "",
                  description: "",
                  requirements: "",
                  contactEmail: "",
                  contactPhone: "",
                });
                setSelectedJobType("full-time");
                // Navigate back
                router.back();
              },
            },
          ]);
        },
        onError: (error: any) => {
          console.error("Error creating job:", error);
          Alert.alert("فشل الإرسال", error?.message || "حدث خطأ أثناء إنشاء الوظيفة. يرجى المحاولة مرة أخرى.");
        },
      }
    );
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation helper (Iraqi phone numbers)
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^(07[3-9]\d{8}|(\+964|00964)7[3-9]\d{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "إعلان وظيفة",
          headerStyle: { backgroundColor: COLORS.white },
          headerTintColor: COLORS.black,
          headerTitleStyle: { fontWeight: "bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.black} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Briefcase size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>إعلان وظيفة جديدة</Text>
          <Text style={styles.headerSubtitle}>أضف تفاصيل الوظيفة المطلوبة</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>عنوان الوظيفة *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="مثال: طبيب بيطري - عيادة الحيوانات الأليفة"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>اسم الشركة/العيادة *</Text>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(text) => setFormData({ ...formData, company: text })}
              placeholder="مثال: عيادة الرحمة البيطرية"
              placeholderTextColor={COLORS.lightGray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الموقع *</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="المدينة، البلد"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نوع الوظيفة *</Text>
            <View style={styles.jobTypeContainer}>
              {JOB_TYPES.map((jobType) => (
                <TouchableOpacity
                  key={jobType.value}
                  style={[styles.jobTypeButton, selectedJobType === jobType.value && styles.jobTypeButtonActive]}
                  onPress={() => setSelectedJobType(jobType.value)}
                >
                  <Text style={[styles.jobTypeText, selectedJobType === jobType.value && styles.jobTypeTextActive]}>
                    {jobType.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الراتب المتوقع</Text>
            <View style={styles.inputWithIcon}>
              <DollarSign size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.salary}
                onChangeText={(text) => setFormData({ ...formData, salary: text })}
                placeholder="مثال: 800000 - 1200000 دينار"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>وصف الوظيفة *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="اكتب وصفاً مفصلاً عن الوظيفة والمهام المطلوبة..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>المتطلبات والمؤهلات</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.requirements}
              onChangeText={(text) => setFormData({ ...formData, requirements: text })}
              placeholder="اذكر المؤهلات والخبرات المطلوبة..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>البريد الإلكتروني للتواصل</Text>
            <TextInput
              style={styles.input}
              value={formData.contactEmail}
              onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
              placeholder="example@company.com"
              placeholderTextColor={COLORS.lightGray}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رقم الهاتف للتواصل</Text>
            <TextInput
              style={styles.input}
              value={formData.contactPhone}
              onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
              placeholder="07xxxxxxxx"
              placeholderTextColor={COLORS.lightGray}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, createJobMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={createJobMutation.isPending}
        >
          <FileText size={20} color={COLORS.white} />
          <Text style={styles.submitButtonText}>{createJobMutation.isPending ? "جاري الإرسال..." : "نشر الوظيفة"}</Text>
        </TouchableOpacity>

        <Text style={styles.note}>* سيتم نشر الوظيفة مباشرة في قائمة الوظائف المتاحة</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.black,
    textAlign: "center",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    gap: 8,
  },
  inputText: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: COLORS.black,
  },
  textArea: {
    minHeight: 100,
  },
  jobTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  jobTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: COLORS.white,
  },
  jobTypeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  jobTypeText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: "500",
  },
  jobTypeTextActive: {
    color: COLORS.white,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  note: {
    fontSize: 14,
    color: COLORS.darkGray,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 20,
  },
});
