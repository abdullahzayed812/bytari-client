import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, UserPlus, User, Mail, Phone, MapPin, GraduationCap, FileText, Send } from "lucide-react-native";
import { COLORS } from "../constants/colors";
import { trpc } from "../lib/trpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApp } from "../providers/AppProvider";

interface JobApplicationFormData {
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  location: string;
  desiredPosition: string;
  skills: string;
  expectedSalary: string;
  coverLetter: string;
  experience: string;
  education: string;
}

export default function JobApplicationScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useApp();
  const { jobId, jobTitle } = useLocalSearchParams<{ jobId?: string; jobTitle?: string }>();

  // Decode job title if it was encoded
  const decodedJobTitle = jobTitle ? decodeURIComponent(jobTitle) : "";

  // Initial form data with sample values
  const [formData, setFormData] = useState<JobApplicationFormData>({
    applicantName: "د. أحمد محمد علي",
    applicantEmail: "vet1@example.com",
    applicantPhone: "07701234567",
    location: "بغداد، العراق",
    desiredPosition: decodedJobTitle || "طبيب بيطري",
    skills:
      "خبرة في علاج الحيوانات الأليفة، مهارات تواصل ممتازة، القدرة على العمل تحت الضغط، إتقان استخدام الأجهزة الطبية البيطرية الحديثة",
    expectedSalary: "800000",
    coverLetter:
      "أتقدم بطلب للعمل في منشأتكم الموقرة. لدي خبرة واسعة في مجال الطب البيطري وأرغب في الانضمام إلى فريقكم المتميز للمساهمة في تقديم أفضل الخدمات الطبية للحيوانات.",
    experience:
      "5 سنوات خبرة في عيادة الأمل البيطرية - بغداد، متخصص في علاج القطط والكلاب والطيور، إجراء العمليات الجراحية البسيطة والمتوسطة",
    education: "بكالوريوس الطب البيطري - جامعة بغداد (2018)، دورات تدريبية في الجراحة البيطرية الحديثة",
  });

  const submitApplicationMutation = useMutation(trpc.admin.jobs.submitJobApplication.mutationOptions());

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

  const handleSubmit = () => {
    // Validate form - trim all inputs
    const trimmedData = {
      applicantName: formData.applicantName.trim(),
      applicantEmail: formData.applicantEmail.trim(),
      applicantPhone: formData.applicantPhone.trim(),
      location: formData.location.trim(),
      desiredPosition: formData.desiredPosition.trim(),
      skills: formData.skills.trim(),
      expectedSalary: formData.expectedSalary.trim(),
      coverLetter: formData.coverLetter.trim(),
      experience: formData.experience.trim(),
      education: formData.education.trim(),
    };

    // Required field validation
    if (!trimmedData.applicantName) {
      Alert.alert("خطأ", "يرجى إدخال الاسم الكامل");
      return;
    }

    if (!trimmedData.applicantEmail) {
      Alert.alert("خطأ", "يرجى إدخال البريد الإلكتروني");
      return;
    }

    if (!isValidEmail(trimmedData.applicantEmail)) {
      Alert.alert("خطأ", "يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    if (!trimmedData.applicantPhone) {
      Alert.alert("خطأ", "يرجى إدخال رقم الهاتف");
      return;
    }

    if (!isValidPhone(trimmedData.applicantPhone)) {
      Alert.alert("خطأ", "يرجى إدخال رقم هاتف صحيح (مثال: 07701234567)");
      return;
    }

    if (!trimmedData.location) {
      Alert.alert("خطأ", "يرجى إدخال الموقع");
      return;
    }

    if (!trimmedData.desiredPosition) {
      Alert.alert("خطأ", "يرجى إدخال المنصب المرغوب");
      return;
    }

    if (!trimmedData.education) {
      Alert.alert("خطأ", "يرجى إدخال المؤهل التعليمي");
      return;
    }

    if (!trimmedData.experience) {
      Alert.alert("خطأ", "يرجى إدخال معلومات الخبرة");
      return;
    }

    if (!trimmedData.skills) {
      Alert.alert("خطأ", "يرجى إدخال المهارات");
      return;
    }

    if (!trimmedData.coverLetter) {
      Alert.alert("خطأ", "يرجى كتابة رسالة تعريفية");
      return;
    }

    // Check if jobId exists (for direct applications)
    if (!jobId) {
      Alert.alert("خطأ", "معرف الوظيفة غير صحيح");
      return;
    }

    // Submit application
    submitApplicationMutation.mutate(
      {
        jobId: jobId,
        applicantName: trimmedData.applicantName,
        applicantEmail: trimmedData.applicantEmail,
        applicantPhone: trimmedData.applicantPhone,
        coverLetter: trimmedData.coverLetter,
        experience: trimmedData.experience,
        education: trimmedData.education,
        // Optional: You can add these to the router if needed
        // cv: "", // URL to uploaded CV
      } as any,
      {
        onSuccess: (data) => {
          if (data.success) {
            // Invalidate job applications queries
            queryClient.invalidateQueries(trpc.admin.jobs.getJobApplications.queryKey);

            // Show success message
            Alert.alert("تم التقديم بنجاح", data.message || "تم إرسال طلبك بنجاح. سيتم التواصل معك قريباً.", [
              {
                text: "موافق",
                onPress: () => {
                  // Reset form
                  setFormData({
                    applicantName: "",
                    applicantEmail: "",
                    applicantPhone: "",
                    location: "",
                    desiredPosition: "",
                    skills: "",
                    expectedSalary: "",
                    coverLetter: "",
                    experience: "",
                    education: "",
                  });
                  // Navigate back
                  router.back();
                },
              },
            ]);
          } else {
            Alert.alert("خطأ", data.message || "حدث خطأ أثناء تقديم الطلب");
          }
        },
        onError: (error: any) => {
          console.error("Error submitting application:", error);
          Alert.alert("خطأ", error?.message || "حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.");
        },
      }
    );
  };

  const updateFormData = (field: keyof JobApplicationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "تقديم طلب توظيف",
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
            <UserPlus size={32} color={COLORS.white} />
          </View>
          <Text style={styles.headerTitle}>تقديم طلب توظيف</Text>
          <Text style={styles.headerSubtitle}>
            {decodedJobTitle ? `للتقديم على: ${decodedJobTitle}` : "أضف معلوماتك الشخصية والمهنية"}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>الاسم الكامل *</Text>
            <View style={styles.inputWithIcon}>
              <User size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.applicantName}
                onChangeText={(text) => updateFormData("applicantName", text)}
                placeholder="الاسم الأول والأخير"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>البريد الإلكتروني *</Text>
            <View style={styles.inputWithIcon}>
              <Mail size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.applicantEmail}
                onChangeText={(text) => updateFormData("applicantEmail", text)}
                placeholder="example@email.com"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رقم الهاتف *</Text>
            <View style={styles.inputWithIcon}>
              <Phone size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.applicantPhone}
                onChangeText={(text) => updateFormData("applicantPhone", text)}
                placeholder="07xxxxxxxx"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الموقع *</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.location}
                onChangeText={(text) => updateFormData("location", text)}
                placeholder="المدينة، المنطقة"
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>المنصب المرغوب *</Text>
            <View style={styles.inputWithIcon}>
              <User size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.desiredPosition}
                onChangeText={(text) => updateFormData("desiredPosition", text)}
                placeholder="طبيب بيطري، مساعد طبيب، إداري..."
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>المؤهل التعليمي *</Text>
            <View style={styles.inputWithIcon}>
              <GraduationCap size={20} color={COLORS.darkGray} />
              <TextInput
                style={styles.inputText}
                value={formData.education}
                onChangeText={(text) => updateFormData("education", text)}
                placeholder="بكالوريوس الطب البيطري، ماجستير، دكتوراه..."
                placeholderTextColor={COLORS.lightGray}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الخبرة المهنية *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.experience}
              onChangeText={(text) => updateFormData("experience", text)}
              placeholder="اذكر خبراتك المهنية السابقة وسنوات الخبرة..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>المهارات *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.skills}
              onChangeText={(text) => updateFormData("skills", text)}
              placeholder="اذكر مهاراتك التقنية والشخصية..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>الراتب المتوقع (اختياري)</Text>
            <View style={styles.inputWithIcon}>
              <Text style={styles.currencySymbol}>د.ع</Text>
              <TextInput
                style={styles.inputText}
                value={formData.expectedSalary}
                onChangeText={(text) => updateFormData("expectedSalary", text)}
                placeholder="800000"
                placeholderTextColor={COLORS.lightGray}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رسالة تعريفية *</Text>
            <TextInput
              style={[styles.input, styles.textArea, styles.largeTextArea]}
              value={formData.coverLetter}
              onChangeText={(text) => updateFormData("coverLetter", text)}
              placeholder="اكتب رسالة تعريفية عن نفسك ولماذا تريد العمل في هذا المجال..."
              placeholderTextColor={COLORS.lightGray}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitApplicationMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitApplicationMutation.isPending}
        >
          {submitApplicationMutation.isPending ? (
            <>
              <ActivityIndicator size="small" color={COLORS.white} />
              <Text style={styles.submitButtonText}>جاري الإرسال...</Text>
            </>
          ) : (
            <>
              <Send size={20} color={COLORS.white} />
              <Text style={styles.submitButtonText}>إرسال الطلب</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          * سيتم مراجعة طلب التوظيف من قبل الإدارة وسيتم التواصل معك في حالة توفر فرصة مناسبة
        </Text>
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
    backgroundColor: "#28a745",
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
    paddingHorizontal: 20,
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
    minHeight: 80,
  },
  largeTextArea: {
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: "#28a745",
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
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: "600",
  },
});
